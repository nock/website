---
title: "Matching Requests"
description: "Match hosts, paths, request bodies, and query strings."
---

# Matching Requests

## Specifying Hostname and Base Path

The request hostname can be a string, URL, or a RegExp.

```js
const scope = nock('http://www.example.com')
  .get('/resource')
  .reply(200, 'domain matched')
```

```js
const scope = nock(new URL('http://www.example.com'))
  .get('/resource')
  .reply(200, 'domain matched')
```

```js
const scope = nock(/example\.com/)
  .get('/resource')
  .reply(200, 'domain regex matched')
```

::: info
A string must include the protocol (`http://` or `https://`); otherwise Nock throws `TypeError: Invalid URL`. A RegExp is tested against the origin including protocol and port, for example `http://www.example.com:80`. A string can include a base path, such as `http://www.example.com/api/v1`; that base path is prepended to every interceptor path in the scope.
:::

## HTTP Methods

Nock has convenience methods for `GET`, `POST`, `PUT`, `HEAD`, `DELETE`, `PATCH`, `OPTIONS`, and `MERGE`. Use `.intercept(path, method)` for any other method:

```js
nock('http://example.test').intercept('/resource', 'PURGE').reply(204)
```

### Protocols and Ports

The scope protocol must match the request protocol. The default port is `80` for `http://` and `443` for `https://`; specify a non-standard port in the scope URL:

```js
nock('https://secure.example.test').get('/resource').reply(200)
nock('http://example.test:8081').get('/resource').reply(200)
```

## Specifying Path

The request path can be a string, a RegExp, or a function. Use any [supported HTTP method](#http-methods).

Using a string:

```js
const scope = nock('http://www.example.com')
  .get('/resource')
  .reply(200, 'path matched')
```

Using a regular expression:

```js
const scope = nock('http://www.example.com')
  .get(/source$/)
  .reply(200, 'path using regex matched')
```

Using a function:

```js
const scope = nock('http://www.example.com')
  .get(uri => uri.includes('cats'))
  .reply(200, 'path using function matched')
```

Nock accepts `'*'` as a path string, but string paths are exact matches; `'*'` is not a glob that matches every path. Use a RegExp or function for a broad path match:

```js
nock('http://www.example.com')
  .get(/.*/)
  .reply(200, 'any path')
```

## Specifying Request Body

You can specify the request body as the second argument to an HTTP method specification. Nock supports strings, buffers, regular expressions, JSON-like data, and matcher functions:

**String**: nock will exact match the stringified request body with the provided string

```js
nock('http://www.example.com')
  .post('/login', 'username=pgte&password=123456')
  .reply(200, { id: '123ABC' })
```

**Buffer**: nock will exact match the stringified request body with the provided buffer

```js
nock('http://www.example.com')
  .post('/login', Buffer.from([0xff, 0x11]))
  .reply(200, { id: '123ABC' })
```

**RegExp**: nock will test the stringified request body against the provided RegExp

```js
nock('http://www.example.com')
  .post('/login', /username=\w+/gi)
  .reply(200, { id: '123ABC' })
```

**JSON object**: nock will exact match the request body with the provided object. In order to increase flexibility, nock also supports RegExp as an attribute value for the keys:

```js
nock('http://www.example.com')
  .post('/login', { username: 'pgte', password: /.+/i })
  .reply(200, { id: '123ABC' })
```

**Function**: nock will evaluate the function providing the request body object as first argument. Return true if it should be considered a match:

```js
nock('http://www.example.com')
  .post('/login', body => body.username && body.password)
  .reply(200, { id: '123ABC' })
```

In case you need to perform a partial matching on a complex, nested request body you should have a look at libraries like [lodash.matches](https://lodash.com/docs/#matches). Indeed, partial matching can be achieved as:

```js
nock('http://www.example.com')
  .post('/user', _.matches({ address: { country: 'US' } }))
  .reply(200, { id: '123ABC' })
```

::: info How the body is compared
- JSON object and function matchers receive the body parsed as JSON. For `application/x-www-form-urlencoded` requests, the body is parsed into an object and the matcher's values are compared as strings.
- Line endings are ignored when comparing strings, except for `multipart` requests.
- Bodies that are not valid UTF-8 are compared as hex strings.
:::

## Specifying Query Strings

Nock understands query strings. Search parameters can be included as part of the path:

```js
nock('http://example.com').get('/users?foo=bar').reply(200)
```

Instead of placing the entire URL, you can specify the query part as an object:

```js
nock('http://example.com')
  .get('/users')
  .query({ name: 'pedro', surname: 'teixeira' })
  .reply(200, { results: [{ id: 'pgte' }] })
```

Nock supports array-style/object-style query parameters. The encoding format matches with request module.

```js
nock('http://example.com')
  .get('/users')
  .query({
    names: ['alice', 'bob'],
    tags: {
      alice: ['admin', 'tester'],
      bob: ['tester'],
    },
  })
  .reply(200, { results: [{ id: 'pgte' }] })
```

A `URLSearchParams` instance can be provided.

```js
const params = new URLSearchParams({ foo: 'bar' })

nock('http://example.com').get('/').query(params).reply(200)
```

Nock supports passing a function to query. The function determines if the actual query matches or not.

```js
nock('http://example.com')
  .get('/users')
  .query(actualQueryObject => {
    // do some compare with the actual Query Object
    // return true for matched
    // return false for not matched
    return true
  })
  .reply(200, { results: [{ id: 'pgte' }] })
```

To mock the entire url regardless of the passed query string:

```js
nock('http://example.com')
  .get('/users')
  .query(true)
  .reply(200, { results: [{ id: 'pgte' }] })
```

A query string that is already [URL encoded](https://en.wikipedia.org/wiki/Percent-encoding) can be
matched by passing the `encodedQueryParams` flag in the options when creating the Scope.

```js
nock('http://example.com', { encodedQueryParams: true })
  .get('/users')
  .query('foo%5Bbar%5D%3Dhello%20world%21')
  .reply(200, { results: [{ id: 'pgte' }] })
```

For URL-encoded query matching behavior, see [Scope Options](/api/scope-options#encodedqueryparams).

## Match Request Headers

Pass `reqheaders` when creating a scope to require request headers. Header names are case-insensitive; values can be strings, regular expressions, or functions:

```js
const scope = nock('http://example.test', {
  reqheaders: {
    authorization: /^Bearer /,
    'x-request-id': value => value !== null,
  },
})
  .get('/resource')
  .reply(200)
```

Use `badheaders` to reject requests containing any listed header:

```js
nock('http://example.test', { badheaders: ['cookie', 'x-forwarded-for'] })
  .get('/resource')
  .reply(200)
```

Use `.basicAuth()` for a Basic authorization header:

```js
const scope = nock('http://example.test')
  .get('/resource')
  .basicAuth({ user: 'alice', pass: 'secret' })
  .reply(200)

const authorization = `Basic ${Buffer.from('alice:secret').toString('base64')}`
await fetch('http://example.test/resource', {
  headers: { authorization },
})
scope.done()
```

Use `.matchHeader()` to apply header matching to an interceptor or subsequent interceptors on a scope:

```js
nock('http://example.test')
  .get('/resource')
  .matchHeader('accept', 'application/json')
  .reply(200)
```

If no request headers are specified, Nock does not match request headers. In v15, `host` is matched like any other explicitly configured header. For the complete options and defaults, see [Scope Options](/api/scope-options).

## Chain Interceptors

Define multiple expected requests on one scope by chaining method and reply calls:

```js
const scope = nock('http://example.test')
  .get('/users/1')
  .reply(404)
  .post('/users', { name: 'Ada' })
  .reply(201, { id: '123' })
```
