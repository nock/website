---
title: "Repeating, Persisting, and Optional Interceptors"
description: "Control how often interceptors respond and whether they are required."
---

# Repeating, Persisting, and Optional Interceptors

By default, an interceptor matches one request. Choose an exact repeat count, persist it across requests, or mark it optional when the request may not happen.

## Repeat a Mock

Use `.times(n)` to repeat the same response an exact number of times:

```js
const scope = nock('http://example.test')
  .get('/resource')
  .times(2)
  .reply(200, 'ok')

await fetch('http://example.test/resource')
await fetch('http://example.test/resource')
scope.done()
```

The `.once()`, `.twice()`, and `.thrice()` methods are shorthand for `.times(1)`, `.times(2)`, and `.times(3)`:

```js
nock('http://example.test').get('/one').once().reply(200)
nock('http://example.test').get('/two').twice().reply(200)
nock('http://example.test').get('/three').thrice().reply(200)
```

Once the configured number of requests is matched, the interceptor is consumed. A further unmatched request to the mocked origin receives a `501` response with code `ERR_NOCK_NO_MATCH`.

## Persist Across Requests

Call `.persist()` on a scope to keep its interceptors active for repeated requests:

```js
const scope = nock('http://example.test')
  .persist()
  .get('/health')
  .reply(200, 'ok')

await fetch('http://example.test/health')
await fetch('http://example.test/health')
scope.done()
```

A persisted scope is considered done after its first matching request. Call `.persist(false)` to stop persisting; use `nock.cleanAll()` to remove all interceptors, including persisted ones.

## Make a Mock Optional

Use `.optionally()` when a request may or may not occur. An unconsumed optional interceptor does not appear in `pendingMocks()` and does not prevent `scope.isDone()` or `scope.done()` from succeeding:

```js
const scope = nock('http://example.test')
  .get('/optional')
  .optionally()
  .reply(200, 'ok')

scope.done()
```

Pass a boolean to toggle optional behavior dynamically:

```js
const addOptionalMock = optional =>
  nock('http://example.test')
    .get('/conditional')
    .optionally(optional)
    .reply(200)

addOptionalMock(true)
addOptionalMock(false)
```

For pending and active interceptor inspection, see [Expectations](/api/expectations).