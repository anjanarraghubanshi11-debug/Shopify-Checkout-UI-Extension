# Checkout Custom UI for Shopify

This repository contains a Shopify checkout UI extension app designed to improve the checkout experience for a store by enforcing custom business rules and collecting required information before an order can be placed.

The app is built as a Shopify app extension using Preact and Vite, and it customizes the checkout flow with targeted validation and user prompts.

## What this app does

This app adds three checkout behaviors:

- Express shipping policy acknowledgement
  - If the selected shipping method is express or 1–2 day shipping, the customer must acknowledge the express shipping policy before checkout can continue.

- Prescription product information
  - If the cart includes prescription items, a form appears asking for the pet name, veterinarian name, and veterinarian phone number.
  - The form must be completed and saved before the order can proceed.
  - The values are stored as checkout attributes for later use.

- Signature requirement acknowledgement
  - For orders over $200, the customer must confirm that a signature will be required upon delivery.

These rules are enforced during checkout with Shopify buyer journey interception, which allows the app to block progress when required actions have not been completed.

## Project structure

- [extensions/checkout-ui/src/Checkout.jsx](extensions/checkout-ui/src/Checkout.jsx) - Main checkout UI entry point that renders all custom checkout components.
- [extensions/checkout-ui/src/ExpressShippingPolicy.jsx](extensions/checkout-ui/src/ExpressShippingPolicy.jsx) - Handles the express shipping policy checkbox and validation.
- [extensions/checkout-ui/src/RxCheckoutForm.jsx](extensions/checkout-ui/src/RxCheckoutForm.jsx) - Handles the prescription form and required validation.
- [extensions/checkout-ui/src/SignatureRequired.jsx](extensions/checkout-ui/src/SignatureRequired.jsx) - Handles the signature acknowledgement prompt for high-value orders.

## Quick start

### Prerequisites

Before you begin, make sure you have the Shopify CLI installed:

- [Install Shopify CLI](https://shopify.dev/docs/apps/tools/cli/getting-started)

### Install dependencies

```shell
pnpm install
```

### Local development

Run the app locally with:

```shell
pnpm dev
```

Press P in the terminal to open the local app URL. Once installed, you can start testing the checkout extension.

## Build

Build the app with:

```shell
pnpm build
```

## Deploy

Deploy the app to Shopify with:

```shell
pnpm deploy
```

## How it works

This app uses Shopify checkout UI extensions and Preact to render custom UI directly in checkout.

It relies on Shopify APIs such as:

- buyer journey interception to control whether checkout can continue
- attribute changes to persist customer acknowledgements and required form values
- extension-based UI components for banners, checkboxes, text fields, and buttons

## Useful commands

```shell
pnpm dev
pnpm build
pnpm deploy
pnpm info
```

## Resources

- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli)
- [Shopify checkout UI extensions](https://shopify.dev/docs/apps/checkout)
- [Preact](https://preactjs.com/)
- [Vite](https://vite.dev/)
