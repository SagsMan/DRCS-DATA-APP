# DRCS DATA Mobile

DRCS DATA is a mobile VTU services app that helps customers stay connected with
convenient airtime and data services. The app opens with a branded splash
screen, then introduces the service through a four-slide onboarding experience
before stopping at the Sign Up and Login actions.

## Current App Experience

- Branded DRCS DATA splash screen.
- Four onboarding slides with two illustrations per slide.
- VTU-focused messaging for connectivity, reliability, security, and support.
- Skip action available through the first three slides.
- Next action for progressing through onboarding.
- Progress indicators for all four slides.
- Final Sign Up and Login actions.
- Blue-and-white fintech visual system with royal blue brand actions, white
  surfaces, charcoal primary text, soft gray supporting text and borders, and
  restrained green status accents.
- USSD code VTU service — coming soon.
- WhatsApp bot VTU service — coming soon.

## App Structure

```text
.
├── app/
│   ├── _layout.tsx       # Root Expo Router layout, fonts, splash gating
│   ├── index.tsx         # Four-slide onboarding screen
│   └── +not-found.tsx    # Fallback route
├── assets/images/
│   ├── splash.png        # Native splash artwork
│   ├── icon.png          # App icon
│   ├── logo-icon.png     # In-app brand mark
│   └── onboarding-*.png  # Eight onboarding illustrations
├── components/
│   ├── ErrorBoundary.tsx
│   ├── ErrorFallback.tsx
│   └── KeyboardAwareScrollViewCompat.tsx
├── constants/colors.ts   # Light/dark fintech color tokens
├── hooks/useColors.ts    # Active color-scheme hook
├── metro.config.js       # Metro configuration and watcher exclusions
├── app.json              # Expo app configuration
├── package.json          # Scripts and dependencies
└── server/               # Static build serving support
```

## Stack

- Expo SDK 54
- React Native 0.81
- React 19
- Expo Router for file-based navigation
- TypeScript with strict checking
- React Native Web for browser previews
- React Native Gesture Handler
- React Native Keyboard Controller
- React Native Safe Area Context
- Expo Haptics for tactile onboarding feedback
- Expo Splash Screen for startup branding
- React Query provider for future server state
- Google Fonts for Inter, Poppins, IBM Plex Sans, and Roboto
- pnpm package management

## Run

```bash
pnpm install
pnpm run dev
```

For a phone-accessible Expo preview:

```bash
pnpm exec expo start --tunnel --clear --port ${PORT:-8081}
```

Scan the QR code with Expo Go on Android or the Camera app on iOS.

## Validation

```bash
pnpm run typecheck
pnpm run build
```

## Onboarding Screenshots

Phone-sized captures of the live onboarding states are stored in
[`docs/screenshots/`](docs/screenshots/):

| Slide | Preview |
| --- | --- |
| 1 — Stay connected everywhere | [Open screenshot](docs/screenshots/onboarding-1.png) |
| 2 — Power your digital life | [Open screenshot](docs/screenshots/onboarding-2.png) |
| 3 — Fast, secure and reliable | [Open screenshot](docs/screenshots/onboarding-3.png) |
| 4 — Everything you need, always available | [Open screenshot](docs/screenshots/onboarding-4.png) |