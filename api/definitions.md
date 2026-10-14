---
title: "Definitions and Fixtures"
description: "Load, customize, and define serialized Nock request and response definitions."
---

# Definitions and Fixtures

Recorded interactions can be saved as JSON and loaded later. A definition describes a request matcher and its mocked response. Nock Back also stores definitions in fixture files; see the [Nock Back guide](/api/nock-back) for recording modes and fixture lifecycle.

## Definition Format

A definition requires `scope`, `method`, and `path`. Common optional fields include `body`, `status`, `response`, `rawHeaders`, `reqheaders`, `badheaders`, and `options`:

```js
const definitions = [
  {
    scope: 'https://api.example.test',
    method: 'GET',
    path: '/users',
    status: 200,
    response: [{ id: 1 }],
    rawHeaders: { 'content-type': 'application/json' },
  },
]
```

When using `nock.define()`, `method` is required. `response` can be JSON-compatible data, a string, or binary data encoded as hex with `responseIsBinary: true`. The older `reply` field is accepted as a numeric status string for compatibility; prefer `status`.

## Load Definitions

`nock.load(path)` reads a JSON file, creates its interceptors, and returns the created scopes:

```js
const scopes = nock.load('./fixtures/api.json')
```

You can post-process loaded scopes before using them. For example, this normalizes timestamps in a recorded request body:

```js
const scopes = nock.load('./fixtures/api.json')
scopes.forEach(scope => {
  scope.filteringRequestBody((body, recordedBody) => {
    if (typeof body !== 'string' || typeof recordedBody !== 'string') {
      return body
    }

    const timestamp = /timestamp:([0-9]+)/.exec(recordedBody)?.[1]
    return timestamp ? body.replace(/(timestamp):([0-9]+)/g, `$1:${timestamp}`) : body
  })
})
```

Use `nock.loadDefs(path)` when definitions must be edited before their interceptors are created, then pass them to `nock.define()`:

```js
const definitions = nock.loadDefs('./fixtures/api.json')
definitions.forEach(definition => {
  definition.options = {
    ...definition.options,
    filteringScope: scope => /^https:\/\/api[0-9]*\.example\.test/.test(scope),
  }
})

const scopes = nock.define(definitions)
```

`nock.define(definitions)` accepts definition objects directly and returns the created scopes. Definitions loaded from JSON cannot represent JavaScript functions or regular expressions; add those programmatically before calling `define()`.

## Nock Back Fixture Content

Nock Back fixture files contain a JSON array of recorded definitions. Each entry stores request details (`scope`, `method`, `path`, and optionally `body` and `reqheaders`) alongside response details (`status`, `response`, `rawHeaders`, and optionally `responseIsBinary`). Fixture options can transform definitions through `before` and `afterRecord`; `afterRecord` may also return a string when writing a custom fixture format. See [Nock Back](/api/nock-back) for the available hooks and modes.