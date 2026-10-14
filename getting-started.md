---
title: "Getting Started"
description: "Install Nock and create a first HTTP mock."
---

# Getting Started

Nock is an HTTP mocking and expectations library for Node.js. It lets you test code that makes HTTP requests without depending on a live service.

Nock uses [`@mswjs/interceptors`](https://github.com/mswjs/interceptors) to intercept Node.js HTTP requests and `fetch`.

## Install Nock

Install Nock as a development dependency with your package manager:

```sh
npm install --save-dev nock
# or
pnpm add --save-dev nock
# or
yarn add --dev nock
```

## Create a Mock

Define an interceptor before the request. Nock matches the origin and request details, then returns the configured response.

```js
import assert from 'node:assert/strict'
import nock from 'nock'

const scope = nock('https://api.github.com')
  .get('/repos/atom/atom/license')
  .reply(200, { license: { key: 'mit', name: 'MIT License' } })

const response = await fetch('https://api.github.com/repos/atom/atom/license')
assert.equal(response.status, 200)
assert.deepEqual(await response.json(), {
  license: { key: 'mit', name: 'MIT License' },
})
scope.done()
```

::: tip Interceptors are consumed
By default, each interceptor is consumed by one matching request. This means you can mock two calls to the same URL with different replies, but you must define one interceptor per expected request. Use [`persist()`](/guide/repeat-persist-optional#persist-across-requests) when repeated requests should receive the same response, or [`times()`](/guide/repeat-persist-optional#repeat-a-mock) for an exact count.
:::

## Core Concepts

- A **scope** represents a request origin, such as `https://api.example.com`, and can contain one or more interceptors.
- An **interceptor** describes a request method and path, optional matchers, and the reply Nock should return.
- By default, an interceptor is consumed by its first matching request. Use [repeating and optional interceptors](/guide/repeat-persist-optional) to change that behavior.
- A request that does not match an interceptor on a mocked origin receives a `501` response with code `ERR_NOCK_NO_MATCH`. Requests to unmocked origins are governed by [network controls](/api/lifecycle-and-network).
