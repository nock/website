---
title: "Expectations"
description: "Assert that expected requests occurred and inspect active mocks."
---

# Expectations

Each interceptor represents an expected request. A matching request consumes the interceptor unless it is configured to repeat or persist. An unmatched request to a mocked origin receives a `501` response with code `ERR_NOCK_NO_MATCH`; see [Network Controls](/api/lifecycle-and-network) for behavior with unmocked origins.

Calls to nock() return a scope which you can assert by calling `scope.done()`. This will assert that all specified calls on that scope were performed.

Example:

```js
const scope = nock('http://google.com')
  .get('/')
  .reply(200, 'Hello from Google!')

// do some stuff

setTimeout(() => {
  // Will throw an assertion error if meanwhile a "GET http://google.com" was
  // not performed.
  scope.done()
}, 5000)
```

## `.done()`

Call `scope.done()` to assert that all calls specified on that scope were made. It throws an assertion error listing the pending mocks otherwise.

## `.isDone()`

You can call `isDone()` on a single expectation to determine if the expectation was met:

```js
const scope = nock('http://google.com').get('/').reply(200)

scope.isDone() // will return false
```

It is also available in the global scope, which will determine if all expectations have been met:

```js
nock.isDone()
```

## `.pendingMocks()`

If a scope is not done, you can inspect the scope to infer which ones are still pending using the `scope.pendingMocks()` function:

```js
if (!scope.isDone()) {
  console.error('pending mocks: %j', scope.pendingMocks())
}
```

It is also available in the global scope:

```js
console.error('pending mocks: %j', nock.pendingMocks())
```

## `.activeMocks()`

You can see every mock that is currently active (i.e. might potentially reply to requests) in a scope using `scope.activeMocks()`. A mock is active if it is pending, optional but not yet completed, or persisted. Mocks that have intercepted their requests and are no longer doing anything are the only mocks which won't appear here.

You probably don't need to use this - it mainly exists as a mechanism to recreate the previous (now-changed) behavior of `pendingMocks()`.

```js
console.error('active mocks: %j', scope.activeMocks())
```

It is also available in the global scope:

```js
console.error('active mocks: %j', nock.activeMocks())
```

