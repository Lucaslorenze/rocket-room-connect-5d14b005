# Base44 App


This app was created automatically by Base44.
It's a Vite+React app that communicates with the Base44 API.

## Running the app

```bash
npm install
npm run dev
```

## Building the app

```bash
npm run build
```

For more information and support, please contact Base44 support at app@base44.com.
## Local API

To run the application without the Base44 SDK you can start the included local API server. This server keeps data in `server/data.json` and exposes endpoints that mimic the SDK.

```
cd server
npm install
node index.js
```

Then start the front‑end with the `VITE_USE_LOCAL_API` environment variable so it uses the local API instead of the SDK:

```
VITE_USE_LOCAL_API=true npm run dev
```
