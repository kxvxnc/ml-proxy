# ML-proxy

A small CORS proxy for the [MapleLegends](https://legends.ml) character API. It exists to serve the [Leech Calculator mirror](https://github.com/kxvxnc/leech-calculator-mirror).

## Why it exists

Browsers won't let a web page read a response from `legends.ml` unless that server sends a matching CORS header, and the MapleLegends API doesn't. A page can't call it directly.

The original [leechcalculator.com](https://leechcalculator.com/) got around this with a proxy hosted on Google Cloud Functions:

```
https://us-central1-maplelegendscorsproxy.cloudfunctions.net/app/playerdata/<ign>
```

That proxy broke, and the original site stopped working with it. This repo is its replacement, deployed on Vercel.

## How it relates to the UI

The [leech-calculator-mirror](https://github.com/kxvxnc/leech-calculator-mirror) UI is a static site. It calls this proxy from the browser through `infoUrl` in `calcscript.js`:

```js
const infoUrl = "https://ml-proxy.vercel.app/api/character";
```

The proxy forwards each lookup to `legends.ml`, then returns the JSON with CORS headers added.

## API

### `GET /api/character?name=<ign>`

Fetches `https://legends.ml/api/character?name=<ign>` and returns the result unchanged.

```json
{
  "guild": "string",
  "name": "string",
  "level": 0,
  "gender": "male | female",
  "job": "string",
  "exp": "string",
  "quests": 0,
  "cards": 0,
  "donor": false,
  "fame": 0
}
```

| Status | Meaning |
| --- | --- |
| 200 | Character data |
| 400 | `name` is missing, or isn't 1–16 letters or numbers |
| 403 | The request's `Origin` isn't the allowed origin |
| 500 | The request to `legends.ml` failed |

Responses are not cached, so every lookup returns fresh data.

## Access restriction

The proxy only serves `https://leech-calculator-mirror.vercel.app`. A request whose `Origin` header doesn't match gets a 403, and allowed requests get `Access-Control-Allow-Origin` set to that origin. This keeps other sites from using it in a browser and running up Vercel usage.

This does not stop scripts or `curl`, because they can send any `Origin` header. To cap usage, add a rate limit with Vercel's Firewall.

To serve a different site, change `ALLOWED_ORIGIN` in `api/character.ts`.

## Development

```sh
npm install
npx vercel dev
```

Requests need the allowed `Origin` header, so test with:

```sh
curl -H "Origin: https://leech-calculator-mirror.vercel.app" \
  "http://localhost:3000/api/character?name=oldkev"
```

Deploy by importing the repo into Vercel. The `api/` directory is deployed as serverless functions.
