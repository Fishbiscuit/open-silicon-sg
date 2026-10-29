# Open Silicon SG

Source for [opensilicon.sg](https://opensilicon.sg/), Singapore’s open silicon hub.

## Run locally

With Node.js installed, run:

```sh
node src/build.mjs
python3 -m http.server 8814 --directory out
```

Open http://localhost:8814/site-preview.html. Page content is in `content/`, colours in `design/`, and rendering and animation code in `src/`.

## Assets and companion

This public source release uses system-font fallbacks and omits third-party exhibit images whose redistribution rights are being checked. The production site embeds the separately maintained In the Ether 3 companion at `/ite3/`; that companion is not included in this repository, so the carousel and companion links require the deployed site or a separately supplied companion build.

## Licence

Open Silicon SG's original code is licensed under Apache License 2.0; see `LICENSE`. The vendored Anatomy kit under `src/kit/` has its own MIT licence. Third-party trademarks and assets are not covered by the Apache licence.
