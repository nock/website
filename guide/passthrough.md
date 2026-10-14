---
title: "Passthrough Requests"
description: "Allow selected requests to reach the network while mocking others."
---

# Passthrough Requests

## Allow Unmocked Requests on a Mocked Hostname

If you need some request on the same host name to be mocked and some others to **really** go through the HTTP stack, you can use the `allowUnmocked` option like this:

```js
const scope = nock('http://my.existing.service.com', { allowUnmocked: true })
  .get('/my/url')
  .reply(200, 'OK!')

// GET /my/url => receives the mocked response
// GET /other/url => actually makes request to the server
```

::: info
When `{ allowUnmocked: true }` lets a request reach the real server, no interceptor is removed.
:::

## Pass Through Selected Requests

For more granular control over which requests should hit the real server, you can use `passthrough()`. While `allowUnmocked` lets through any request that doesn't match an interceptor, `passthrough()` lets you specify exactly which requests go through the HTTP stack.

```js
const scope = nock('http://my.existing.service.com')
  .get('/mock')
  .reply(200, { users: ['fake'] })
  .post('/live')
  .passthrough()

// GET /mock => receives the mocked response
// POST /live => actually makes request to the server
```

You can use `passthrough()` with query strings, header matching, and other interceptor features:

```js
nock('http://my.existing.service.com')
  .get('/api/data')
  .query({ live: 'true' })
  .matchHeader('authorization', /^Bearer /)
  .passthrough()
```

Like other interceptors, passthrough interceptors are consumed when matched. They work with modifiers like `times()`, `persist()`, and `optionally()`:

```js
// Passthrough the first 3 requests, then fail
nock('http://example.com').get('/').times(3).passthrough()

// Passthrough indefinitely
nock('http://example.com').persist().get('/').passthrough()

// Don't fail scope.done() if this is never called
nock('http://example.com').get('/maybe').optionally().passthrough()
```
