# Liftlyst

A gym training log. Record each set as you lift it and follow your progress over
time — in a basement gym with no signal just as well as anywhere else. Every
entry is written to a local SQLite database first, then synchronised with the
Laravel API once a connection is available.

> **Status:** bootstrapping. The project foundation is being set up in
> [issue #1](https://github.com/ThornenSan/Liftlyst/issues/1). Setup instructions
> below are a stub and will be completed before that issue closes.

## Tech stack

| Area | Technology |
| ---- | ---------- |
| Mobile | React Native, TypeScript, SQLite, Storybook |
| Backend | Laravel, PHP |
| Database | PostgreSQL (server), SQLite (mobile) |
| Cache / queue | Redis |
| Local environment | Docker, Docker Compose, Nginx, Mailpit |
| Backend quality | Pest, Laravel Pint, Larastan |
| Mobile quality | ESLint, Prettier, TypeScript, Jest |
| CI | GitHub Actions |

## Repository layout

```text
liftlyst/
├── backend/            Laravel API
├── mobile/             React Native application
├── docker/             Dockerfiles and service configuration
├── docs/               Architecture and development documentation
├── .github/workflows/  CI pipelines
├── docker-compose.yml
└── Makefile
```

## Prerequisites

_To be documented._

## Getting started

_To be documented._

## Documentation

- `docs/architecture.md` — system architecture and data-layer roles
- `docs/development.md` — development workflow and conventions
