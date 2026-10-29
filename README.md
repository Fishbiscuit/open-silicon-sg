# Open Silicon SG

Source for [opensilicon.sg](https://opensilicon.sg/), Singapore’s open silicon hub.

## Edit and preview

Page content lives in `content/`, colours in `design/`, and rendering and animation code in `src/`. To build the public source locally with Node.js:

```sh
node src/build.mjs
python3 -m http.server 8814 --directory out
```

Open `http://localhost:8814/site-preview.html`. Without the separately held production assets, this local preview uses system fonts and omits the two exhibit images. The `/ite3/` companion and its carousel also require a companion build.

## Production builds

The Vercel project builds this repository. Production builds retrieve a pinned revision of the private production asset bundle, including the existing scoped `/ite3/` companion and its notices. They fail if the bundle, the font, a referenced image, the companion or the observability configuration is missing. The private bundle is not licensed under this repository's Apache licence.

The bundle is accessed with a read-only deploy key held as a Vercel secret. To release a changed companion or production asset, update the private bundle after checking its rights, test it, and update the revision pin in `scripts/vercel-build.mjs`. A local maintainer can test with `LOCAL_RELEASE_ASSETS` pointing to the private bundle checkout. Changes to the public source and asset pin should be reviewed before they reach the production branch.

## Licence

Open Silicon SG's original code is licensed under Apache License 2.0; see `LICENSE`. The vendored Anatomy kit under `src/kit/` has its own MIT licence. Third-party trademarks and assets are not covered by the Apache licence.
