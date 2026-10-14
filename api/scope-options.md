---
title: "Scope Options"
description: "Reference for every option accepted when creating a Nock scope."
---

# Scope Options

Pass an options object as the second argument to `nock()` to configure scope matching. All fields are optional.

```js
const scope = nock('https://api.example.test', {
  allowUnmocked: false,
  reqheaders: { accept: 'application/json' },
  badheaders: ['x-debug'],
  conditionally: () => process.env.USE_API_MOCKS === 'true',
  filteringScope: origin => /^https:\/\/api[0-9]+\.example\.test(:443)?$/.test(origin),
  encodedQueryParams: false,
})
```

## `allowUnmocked`

When `true`, requests to paths that have no matching interceptor on this scope may pass through to the network. Defaults to `false`.

## `reqheaders`

An object of request header names and expected values. Header names are case-insensitive; a value can be a string, regular expression, or matcher function. When omitted, no request headers are required. See [Matching Request Headers](/guide/request-matching#match-request-headers).

## `badheaders`

An array of request header names that must not be present. Defaults to an empty list.

## `conditionally`

A function that decides whether the scope is enabled. It should return `true` to enable matching and `false` to disable the scope. When omitted, the scope is enabled.

## `filteringScope`

A function that receives the request origin, including the port (for example `https://api2.example.test:443`), and returns `true` when that origin should match this scope. Use it when the origin varies, such as a numbered subdomain. When omitted, the scope uses exact origin matching. See [Filtering Requests](/guide/filtering#filter-a-scope).

```js
const scope = nock('https://api.example.test', {
  filteringScope: origin => /^https:\/\/api[0-9]+\.example\.test(:443)?$/.test(origin),
})
```

## `encodedQueryParams`

When `true`, the query given to `.query()` is treated as already percent-encoded and is decoded before it is compared with the request query. Defaults to `false`.

For request path, query, and header matching examples, see [Matching Requests](/guide/request-matching).