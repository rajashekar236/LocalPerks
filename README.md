# LocalPerks

A consumer mobile app that rewards people for shopping at local businesses. Discover nearby shops, scan a QR code at checkout to earn city points, and redeem them for rewards.

Built with **React Native (Expo SDK 58)**, **TypeScript**, and **Expo Router**. Runs on iOS, Android, and web.

## Features

- **Discover**: nearby businesses sorted by distance (live GPS via `expo-location`, with a downtown fallback when permission is denied), instant search, category filters, and sort by points.
- **Scan to earn**: QR scanning with `expo-camera`. Each checkout code is validated (business, amount, receipt ID), and duplicate receipts are rejected. A demo mode simulates purchases without a real code.
- **City boosts**: per-business point multipliers and promo badges (for example "3x weekend boost").
- **Wallet**: available and lifetime points, progress bars toward each reward, redemption with confirmation, a one-time checkout code, and full activity history.
- **Offline persistence**: wallet state is saved on device with AsyncStorage and restored on launch.
- **UX polish**: skeleton loaders while location resolves, haptic feedback on scan results, deferred search for responsive typing, memoized list rows, accessibility labels and roles, and camera paused when the tab is not visible to save battery.

## Getting started

```bash
npm install
npx expo start
```

Scan the QR code in the terminal with the **Expo Go** app on your phone, or press `w` to open the web version.

### Checkout QR format

```
localperks://earn?b=<businessId>&amt=<dollars>&tx=<receiptId>
```

Example you can turn into a QR code to test the scanner:

```
localperks://earn?b=riverbend-coffee&amt=12.50&tx=test-001
```

## Project structure

```
src/
  app/                 Expo Router screens
    (tabs)/            Discover, Scan, Wallet tabs
    business/[id].tsx  Business detail
  components/          BusinessCard, Skeleton loaders
  data/                Demo businesses and rewards
  hooks/               useUserLocation
  lib/                 Distance math, receipt parsing and points rules
  state/               PerksContext (wallet state and persistence)
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm start` | Start the Expo dev server |
| `npm run web` | Run in the browser |
| `npm run lint` | ESLint (expo config) |
| `npm run typecheck` | TypeScript check |

## Roadmap

- Map view of nearby businesses
- Push notifications for city boosts
- AI "deals for you" recommendations
- Serverless AWS backend (Lambda, DynamoDB, Cognito) for accounts and merchant-issued receipts
