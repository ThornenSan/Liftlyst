# Liftlyst — backend

Laravel API for [Liftlyst](../README.md). Project-wide setup is in the root
README; this covers what is specific to the API.

## Running

The backend runs in Docker. From the repo root:

```sh
make up
```

Nginx serves it on **<http://localhost:8080>**.

Run every PHP command **inside the container**, not on the host — the container
is where the PHP version and extensions are defined:

```sh
docker compose exec app php artisan migrate
docker compose exec app composer require ...
```

## The API

- Interactive docs: **<http://localhost:8080/docs/api>**
- OpenAPI 3.1 spec: `backend/api.json` (committed) and `/docs/api.json`

## Conventions worth knowing

**The OpenAPI spec is generated and committed.** Scramble reads the routes, the
FormRequest rules and the controller return types. Status codes decided at
runtime cannot be inferred, so they are declared with `#[Response]` attributes.
Regenerate after any endpoint change, or CI fails on the drift:

```sh
docker compose exec app php artisan scramble:export
```

**Tests run against PostgreSQL, not SQLite in-memory**. `phpunit.xml` targets a separate `liftlyst_testing` database, created by `make setup`.

## Quality checks

All three must pass before a PR:

```sh
docker compose exec app ./vendor/bin/pest            # tests
docker compose exec app ./vendor/bin/pint --test     # formatting
docker compose exec app ./vendor/bin/phpstan analyse # static analysis
```

Pint applies `declare(strict_types=1)` to every file. Larastan runs at level
`max`; when it complains, add an annotation rather than lowering the level.
