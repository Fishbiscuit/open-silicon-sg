// POST /api/sanctuary-reply
// Validates guest RSVPs, saves a private backup, and forwards them to the organiser sheet.
//
// Where replies go is set by environment variables (see HANDOFF.md):
//   SANCTUARY_REPLY_WEBHOOK   URL that receives each reply as JSON: the Google Apps Script web
//                             app in google-apps-script/Code.gs, which adds a row to the
//                             coordination sheet
//   SANCTUARY_REPLY_SECRET    shared token; sent as "Authorization: Bearer <secret>" and, because
//                             Apps Script cannot read headers, as "token" in the body
//   BLOB_READ_WRITE_TOKEN     token for the private Vercel RSVP backup store
//   SANCTUARY_REPLY_FILE      local testing only: append each reply as a line of JSON
// With none of these set, the function answers 503 and the page offers the copy fallback.

import { randomUUID } from 'node:crypto';
import { appendFile } from 'node:fs/promises';
import { put } from '@vercel/blob';

const APPS = ['', 'telegram', 'whatsapp', 'signal'];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_BODY = 16 * 1024;

function text(value, max) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export function validate(input) {
  const body = input && typeof input === 'object' ? input : {};
  const reply = {
    attendance: body.attendance === 'request' ? 'yes' : '',
    name: text(body.name, 120),
    organisation: text(body.organisation, 160),
    role: text(body.role, 160),
    email: text(body.email, 200),
    messagingApp: APPS.includes(body.messagingApp) ? body.messagingApp : '',
    messagingHandle: text(body.messagingHandle, 80),
    note: text(body.note, 1500),
  };
  if (!reply.messagingApp) reply.messagingHandle = '';
  const errors = {};
  if (!reply.attendance) errors.attendance = 'Please reopen the invitation to request a place.';
  if (!reply.name) errors.name = 'Please enter your name.';
  if (!reply.organisation) errors.organisation = 'Enter the organisation you represent, or Independent.';
  if (!reply.role) errors.role = 'Please enter your job title or role.';
  if (!reply.email) errors.email = 'Please enter an email address we can reach you at.';
  else if (!EMAIL.test(reply.email)) errors.email = 'This email address looks incomplete.';
  if (reply.messagingApp && !reply.messagingHandle) errors.messagingHandle = 'Add your messaging details, or choose None.';
  return { reply, errors };
}

// The page sends JSON. Without JavaScript the browser posts the form itself, urlencoded.
function isForm(req) {
  return String(req.headers['content-type'] || '').startsWith('application/x-www-form-urlencoded');
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;          // Vercel parses JSON and form bodies
  let raw = typeof req.body === 'string' ? req.body : '';
  if (!raw) {
    for await (const chunk of req) {
      raw += chunk;
      if (raw.length > MAX_BODY) throw Object.assign(new Error('Body too large'), { status: 413 });
    }
  }
  if (isForm(req)) return Object.fromEntries(new URLSearchParams(raw));
  return JSON.parse(raw || '{}');
}

// A plain page for form posts made without JavaScript.
function page(res, status, message) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Sanctuary as Care Symposium</title><body style="margin:0;padding:12vh max(20px,8vw);background:#DAD7D0;color:#202123;font:18px/1.55 Georgia,serif"><p style="max-width:32em">${message}</p><p><a href="/symposium/" style="color:#843B70">Back to the invitation</a></p></body></html>`);
}

async function deliverToSheet(reply) {
  const webhook = process.env.SANCTUARY_REPLY_WEBHOOK;
  if (webhook) {
    const secret = process.env.SANCTUARY_REPLY_SECRET;
    const headers = { 'Content-Type': 'application/json' };
    if (secret) headers.Authorization = `Bearer ${secret}`;
    const payload = secret ? { ...reply, token: secret } : reply;
    // Apps Script answers through a redirect; fetch follows it and reads the JSON.
    const res = await fetch(webhook, { method: 'POST', headers, body: JSON.stringify(payload), redirect: 'follow', signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`Reply destination answered ${res.status}`);
    // Apps Script always answers 200, so a refusal shows up as {"ok": false} in the body.
    const answer = await res.json().catch(() => null);
    if (answer?.ok !== true) throw new Error('Reply destination did not confirm storage');
    return;
  }
  if (!process.env.VERCEL && process.env.SANCTUARY_REPLY_FILE) {
    await appendFile(process.env.SANCTUARY_REPLY_FILE, JSON.stringify(reply) + '\n');
    return;
  }
  throw Object.assign(new Error('No reply destination is configured'), { status: 503 });
}

async function saveBackup(reply, token) {
  const id = randomUUID();
  const timestamp = reply.receivedAt.replaceAll(':', '-');
  await put(`rsvps/${timestamp}-${id}.json`, JSON.stringify({ id, ...reply }), {
    access: 'private',
    contentType: 'application/json',
    token,
    abortSignal: AbortSignal.timeout(8000),
  });
  return id;
}

async function storeReply(reply) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return deliverToSheet(reply);

  // The providers are independent. Confirm receipt if either has durably saved the reply.
  const [backup, sheet] = await Promise.allSettled([
    saveBackup(reply, token),
    deliverToSheet(reply),
  ]);
  if (backup.status === 'rejected') console.error('sanctuary-reply: private backup write failed');
  if (sheet.status === 'rejected' && backup.status === 'fulfilled') {
    console.error('sanctuary-reply: saved backup without organiser sheet acknowledgement', backup.value);
  }
  if (backup.status === 'rejected' && sheet.status === 'rejected') throw sheet.reason;
}

function send(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return send(res, 405, { ok: false });
  }
  const plain = isForm(req);
  let body;
  try {
    body = await readBody(req);
  } catch (err) {
    return plain ? page(res, err.status || 400, 'We couldn’t read your reply. Please go back and try again.') : send(res, err.status || 400, { ok: false });
  }
  // A filled hidden field means a bot; answer as if accepted and keep nothing.
  if (text(body && body.website, 200)) return plain ? page(res, 200, 'Thank you. We’ve received your reply.') : send(res, 200, { ok: true });
  // An older invitation tab would show “attendance confirmed” after a successful reply.
  if (body?.attendance === 'yes') {
    const message = 'The RSVP form has changed. Please reopen the invitation to request a place.';
    return plain ? page(res, 409, message) : send(res, 409, { ok: false, errors: { attendance: message } });
  }
  const { reply, errors } = validate(body);
  if (Object.keys(errors).length) {
    const status = body?.attendance === 'no' || body?.attendance === 'ask' ? 409 : 400;
    return plain ? page(res, status, Object.values(errors).join(' ') + ' Please go back and check your reply.') : send(res, status, { ok: false, errors });
  }
  reply.receivedAt = new Date().toISOString();
  reply.source = 'sanctuary-as-care-attendance-request';
  reply.reviewStatus = 'Pending review';
  try {
    await storeReply(reply);
  } catch (err) {
    console.error('sanctuary-reply: reply could not be stored');
    return plain
      ? page(res, err.status || 502, 'We couldn’t send your reply just now. Please reply in the thread where you received this invitation.')
      : send(res, err.status || 502, { ok: false });
  }
  return plain ? page(res, 200, 'Thank you. We’ve received your request. We’ll review it and email you separately to confirm your place.') : send(res, 200, { ok: true });
}
