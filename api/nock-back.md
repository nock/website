---
title: "Nock Back"
description: "Record and replay HTTP fixtures with Nock Back."
---

# Nock Back

Nock Back records HTTP interactions to fixture files and replays them in later test runs.

## Setup

Set the fixture directory and mode before loading fixtures. Nock Back defaults to `dryrun` mode.

```js
import nock from 'nock'

const nockBack = nock.back
nockBack.fixtures = './nockFixtures'
nockBack.setMode('record')
```

### Setup Properties

- `nockBack.fixtures` : path to fixture directory
- `nockBack.setMode()` : the mode to use

## Record and Replay a Fixture

In `record` mode, a missing fixture is recorded and written when `nockDone()` is called. In the default `dryrun` mode, an existing fixture is replayed, but a missing fixture is not recorded; unmatched requests are allowed to reach the network.

The promise API returns `nockDone` and a context with the loaded scopes:

```js
const { nockDone, context } = await nockBack('example.json')

try {
  await fetch('https://api.example.test/users')
  context.assertScopesFinished()
} finally {
  nockDone()
}
```

The callback API is also available. Inside a regular (non-arrow) callback, `this` is the same `context` object:

```js
nockBack('example.json', function (nockDone) {
  fetch('https://api.example.test/users').finally(() => {
    this.assertScopesFinished()
    nockDone()
  })
})
```

### Context

The `context` has these members:

- `scopes`: the Nock scopes loaded from the fixture (empty when the fixture is being recorded)
- `isLoaded`: whether an existing fixture was loaded
- `assertScopesFinished()`: throws if any loaded interceptor was not used
- `query()`: returns a description of every loaded interceptor (see [Inspecting and Verifying Fixtures](#inspecting-and-verifying-fixtures))

### Per-Fixture Options

Pass an options object as the second argument:

- `before`: called for each fixture definition before it is converted to a scope
- `after`: called for each scope after it is created
- `afterRecord`: receives recorded definitions and returns the definitions to write, or a string containing custom fixture content
- `recorder`: options passed to the recorder

### Example: Normalize a Request Body

```js
function normalizeScope(scope) {
  scope.filteringRequestBody((body, aRecordedBody) => {
    if (typeof body !== 'string' || typeof aRecordedBody !== 'string') {
      return body
    }

    const recordedBodyResult = /timestamp:([0-9]+)/.exec(aRecordedBody)
    if (recordedBodyResult) {
      const recordedTimestamp = recordedBodyResult[1]
      return body.replace(
        /(timestamp):([0-9]+)/g,
        (match, key, value) => `${key}:${recordedTimestamp}`,
      )
    } else {
      return body
    }
  })
}

nockBack('exampleFixture.json', {
  after: normalizeScope,
})
```

## Modes

To set the mode call `nockBack.setMode(mode)` or run the tests with the `NOCK_BACK_MODE` environment variable set before loading nock. If the mode needs to be changed programmatically, the following is valid: `nockBack.setMode(nockBack.currentMode)`

- `wild`: send requests to the network without replaying or recording fixtures

- `dryrun`: the default; replay an existing fixture, allow network requests, and do not record

- `record`: replay an existing fixture, or record requests to create it when it is missing

- `update`: remove the existing fixture and record a replacement

- `lockdown`: replay a fixture and block unmatched network requests without recording

## Inspecting and Verifying Fixtures

`context.query()` returns the interceptor definitions loaded from a fixture. Each entry has `method`, `uri`, `basePath`, `path`, `queries`, `counter`, `body`, `statusCode`, and `optional`. It shows what the fixture contains; it does not by itself verify which requests your code made. `context.assertScopesFinished()` checks that all required interceptors from the loaded fixture were used.

::: info
`context.query()` is only populated for fixtures that were loaded for playback.
:::

Use fixture inspection alongside normal assertions on the code under test:

```js
import assert from 'node:assert/strict'
import nock from 'nock'

const { nockDone, context } = await nock.back('http-interaction.json')
try {
  const response = await fetch('https://api.example.test/create/thing', {
    method: 'POST',
  })
  assert.equal(response.status, 201)
  context.assertScopesFinished()

  const definitions = context.query()
  assert.ok(definitions.some(({ method, path }) => method === 'POST' && path === '/create/thing'))
} finally {
  nockDone()
}
```
