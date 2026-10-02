# Command Promotion

Command Promotion is a browser-based ordering tool for SAP Business One. Sales users can sign in to SAP, choose a customer, select stocked items, find eligible promotions, add the free promotional items, and submit the resulting sales order.

The frontend is built with React, Vite, Axios, and SAP UI5 Web Components. It communicates with the SAP Business One Service Layer using the `/b1s/v2` API.

## What It Does

- Signs in to SAP Business One with a user's SAP account.
- Lists customers and allows searching by customer code.
- Lists in-stock items for the configured warehouse and shows customer-specific prices.
- Finds promotions based on item family and quantity requirements.
- Tracks free promotional quantities as items are selected.
- Creates an SAP sales order containing the selected paid and promotional items.

## Requirements

- Node.js and npm.
- Access to an SAP Business One Service Layer instance.
- A SAP Business One account with permission to read customers, items, prices, and promotions, and to create sales orders.
- A browser that can reach the app and the SAP Service Layer (or a configured development proxy).

## Development Setup

1. Install dependencies:

   ```sh
   npm install
   ```

2. Create a local environment file from the example:

   ```sh
   cp .env.example .env
   ```

   On PowerShell, use:

   ```powershell
   Copy-Item .env.example .env
   ```

3. Edit `.env` for the environment you are using. `VITE_SAP_API_URL` is the API path used by the browser. For local development, configure `VITE_SAP_API_TARGET` with the SAP Service Layer origin, such as `https://your-sap-server:50000`. Do not commit `.env` or put usernames, passwords, tokens, or other secrets in Vite variables.

4. Start the development server:

   ```sh
   npm run dev
   ```

   Vite serves the app at `http://localhost:3000`. When `VITE_SAP_API_TARGET` is set, requests to `/b1s` are proxied to that SAP server. The proxy is for local development; it is not included in the production build.

5. Sign in using your SAP company database, username, and password. Client and item requests begin only after SAP login succeeds.

## Configuration Notes

- `.env.example` contains placeholders only. Keep real server addresses in your ignored local `.env` or your deployment environment.
- `VITE_` variables are included in the browser build. They are configuration, not a secure place to store credentials.
- In production, host the app where `/b1s/v2` resolves to the SAP Service Layer, or provide an appropriately secured server-side proxy. A browser request to a different origin may require SAP server CORS configuration.
- The item availability query currently uses warehouse code `SC061` in the application source. Update that setting for your SAP environment if needed.
- Promotion lookup expects a Service Layer entity named `PROMOTIONS` with fields such as `U_ArticleFamily`, `U_PromoFamily`, `U_QtyRequired`, and `U_QtyFree`.

## Available Scripts

- `npm run dev` starts the Vite development server.
- `npm run build` creates a production build in `dist/`.
- `npm run preview` serves the production build locally.
- `npm run lint` runs ESLint.

## Deployment

The repository includes an MTA descriptor configured for deployment to the SAP Business One Web Client. Build the frontend before packaging it for deployment. The SAP Web Client and Service Layer must be configured so the built app can access `/b1s/v2` on the intended SAP system.
