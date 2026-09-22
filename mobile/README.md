# Liftlyst — mobile

React Native client for [Liftlyst](../README.md). Project-wide setup is in the
root README; this covers what is specific to the app.

## Running

The backend must be up first — the app calls it on launch:

```sh
make up          # from the repo root
```

Then, from `mobile/`:

```sh
npm start        # Metro — leave this running
npm run ios      # iOS simulator
npm run android  # Android emulator
```

## Connecting to the backend

The API base URL is resolved in `src/config/env.ts`:

| Running on       | Base URL                            | Why                                                                                                                       |
| ---------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| iOS simulator    | `http://localhost:8080/api/v1`      | Shares the host's network stack                                                                                           |
| Android emulator | `http://10.0.2.2:8080/api/v1`       | The emulator is a VM, so its own `localhost` is the emulator. `10.0.2.2` is the alias it maps to the host's loopback.      |
| Physical device  | `http://<your-LAN-IP>:8080/api/v1`  | Neither default works. The device and your machine must be on the same network.                                            |

**Both simulators work with no configuration.** Only set `API_BASE_URL` when
neither default applies — a physical device, or a remote host. Copy
`.env.example` to `.env` and fill it in:

```sh
# macOS
ipconfig getifaddr en0

# Linux
hostname -I | awk '{print $1}'

# Windows (PowerShell)
(Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias 'Wi-Fi').IPAddress
```

Only iOS builds require macOS — the Android side works on Windows and Linux too.

`react-native-config` reads `.env` at **build time, not runtime**. Editing it and
reloading does nothing; you need a rebuild:

```sh
npm start -- --reset-cache
npm run ios
```

The resolved base URL is displayed on the home screen, which is the quickest way
to confirm which one the app actually picked.

## Layout

```text
src/
├── api/       client.ts plus one module per resource
├── config/    env.ts — base URL resolution
└── screens/
```

Every network call goes through `src/api/client.ts`. It adds JSON headers and a
request timeout, and it distinguishes two failure kinds that callers must treat
differently:

- **`NetworkError`** — the request never reached the server (offline, DNS, or
  timed out). Retryable.
- **`ApiError`** — the server answered with a failure status. Retry only on 5xx;
  a 4xx will never succeed.

The offline sync layer depends on that distinction to decide what to retry.

## Scripts

| Command                           | Does             |
| --------------------------------- | ---------------- |
| `npm start`                       | Metro bundler    |
| `npm run ios` / `npm run android` | Build and run    |
| `npm run lint`                    | ESLint           |
| `npm test`                        | Jest             |
