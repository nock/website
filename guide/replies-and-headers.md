---
title: "Replies and Headers"
description: "Configure response bodies, status codes, headers, errors, and delays."
---

# Replies and Headers

## Specifying Replies

You can specify the return status code for a path on the first argument of reply like this:

```js
const scope = nock('http://myapp.iriscouch.com').get('/users/1').reply(404)
```

You can also specify the reply body as a string:

```js
const scope = nock('http://www.google.com')
  .get('/')
  .reply(200, 'Hello from Google!')
```

or as a JSON-encoded object:

```js
const scope = nock('http://myapp.iriscouch.com').get('/').reply(200, {
  username: 'pgte',
  email: 'pedro.teixeira@gmail.com',
  _id: '4324243fsd',
})
```

or even as a file:

```js
import path from 'node:path'

const scope = nock('http://myapp.iriscouch.com')
  .get('/')
  .replyWithFile(200, path.join(import.meta.dirname, 'replies/user.json'), {
    'Content-Type': 'application/json',
  })
```

::: tip
Object bodies are serialized as JSON and a `Content-Type: application/json` header is added automatically unless you set your own.
:::

Instead of a body value, pass a callback as the second argument. It receives the matching Web `Request` and can return a response body or a promise for one:

```js
const scope = nock('http://www.google.com')
  .post('/echo')
  .reply(201, async request => await request.text())
```

::: warning
`.reply(fn)` with a single function is the "full reply" form and must return a `[status, body, headers]` array. Returning a plain body from it throws `A single function provided to .reply MUST return an array`. To return only a body from a callback, pass the status first: `.reply(200, fn)`.
:::

For a dynamic status, body, or headers, pass a single function that returns a tuple. The headers element is optional:

```js
const scope = nock('http://www.google.com')
  .post('/echo')
  .reply(request => [201, 'THIS IS THE REPLY BODY', { header: 'value' }])
```

An asynchronous reply callback can read the request body before returning:

```js
const scope = nock('http://www.google.com')
  .post('/echo')
  .reply(async request => {
    const requestBody = await request.text()
    return [201, requestBody]
  })
```

A Stream works too:

```js
const scope = nock('http://www.google.com')
  .get('/cat-poems')
  .reply(200, request => {
    return fs.createReadStream('cat-poems.txt')
  })
```

### Error-First Callbacks

A reply callback declared with exactly two parameters, `(request, callback)`, is treated as an error-first callback. Pass the body (or the full reply tuple) to `callback`. An error passed to `callback` is propagated to the request.

```js
nock('http://www.google.com')
  .post('/echo')
  .reply(201, (request, callback) => {
    fs.readFile('cat-poems.txt', callback)
  })

nock('http://www.google.com')
  .post('/echo')
  .reply((request, callback) => {
    setTimeout(() => callback(null, [201, 'THIS IS THE REPLY BODY']), 1000)
  })
```

### Access the Request and Headers

Reply callbacks receive the matched Web `Request`. Read its URL, headers, or body from that object:

```js
const scope = nock('http://www.google.com')
  .get('/cat-poems')
  .reply(200, request => {
    console.log('url:', request.url)
    console.log('headers:', Object.fromEntries(request.headers.entries()))
    return 'poem'
  })
```

### Replying with Errors

You can reply with an error like this:

```js
nock('http://www.google.com')
  .get('/cat-poems')
  .replyWithError('something awful happened')
```

Error objects are allowed too:

```js
nock('http://www.google.com')
  .get('/cat-poems')
  .replyWithError(
    Object.assign(new Error('Connection refused'), { code: 'ECONNREFUSED' }),
  )
```

::: info
This emits an `error` event on the `request` object, not the reply.
:::

## Specifying Headers

### Header Field Names Are Case-Insensitive

HTTP header field names are case-insensitive. Nock normalizes names internally, regardless of the casing used in the mock or request.

### Request Headers

Request header matching is configured on a scope or interceptor. See [Match Request Headers](/guide/request-matching#match-request-headers).

### Specifying Reply Headers

You can specify the reply headers like this:

```js
const scope = nock('https://api.github.com')
  .get('/repos/atom/atom/license')
  .reply(200, { license: 'MIT' }, { 'X-RateLimit-Remaining': 4999 })
```

Or use a function to generate a header value. In Nock 15, it receives the request and response body; it does not receive a response object. The function may be asynchronous.

```js
const scope = nock('http://www.headdy.com')
  .get('/')
  .reply(200, 'Hello World!', {
    'Content-Length': (request, body) => body.length,
    ETag: () => `${Date.now()}`,
  })
```

### Default Reply Headers

You can also specify default reply headers for all responses like this:

```js
const scope = nock('http://www.headdy.com')
  .defaultReplyHeaders({
    'X-Powered-By': 'Rails',
    'Content-Type': 'application/json',
  })
  .get('/')
  .reply(200, 'The default headers should come too')
```

Or you can use a function to generate the default headers values:

```js
const scope = nock('http://www.headdy.com')
  .defaultReplyHeaders({
    'Content-Length': (request, body) => body.length,
  })
  .get('/')
  .reply(200, 'The default headers should come too')
```

### Including Content-Length Automatically

When using `interceptor.reply()` to set a response body manually, you can have the
`Content-Length` header calculated automatically.

```js
const scope = nock('http://www.headdy.com')
  .replyContentLength()
  .get('/')
  .reply(200, { hello: 'world' })
```

::: warning
This does not work with streams or other advanced means of specifying the reply body.
:::

### Including Date Automatically

You can automatically append a `Date` header to your mock reply:

```js
const scope = nock('http://www.headdy.com')
  .replyDate()
  .get('/')
  .reply(200, { hello: 'world' })
```

Or provide your own `Date` object:

```js
const scope = nock('http://www.headdy.com')
  .replyDate(new Date(2015, 0, 1))
  .get('/')
  .reply(200, { hello: 'world' })
```

## Delay a Response

Use `.delay(ms)` to delay completion of a mocked response body. This is useful for testing timeouts and other timing-sensitive behavior:

```js
nock('http://example.test')
  .get('/slow')
  .delay(200)
  .reply(200, 'delayed response')
```

Nock 15 removed `.delayBody()` and `.delayConnection()`; `.delay(ms)` is the supported API. See the [14.x to 15.x migration guide](/migrations/14-to-15#delay-api) for the upgrade note.
