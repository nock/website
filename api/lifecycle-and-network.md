---
title: "Lifecycle and Network Controls"
description: "Restore and activate Nock, control real HTTP requests, and reset network rules."
---

# Lifecycle and Network Controls

## Restore Nock

You can restore the HTTP interceptor to the normal unmocked behaviour by calling:

```js
nock.restore()
```

::: info
`nock.restore()` does not clear the interceptor list. Use [nock.cleanAll()](/api/lifecycle-and-network#clear-interceptors) if you expect the interceptor list to be empty.

`nock.restore()` also removes the HTTP interceptor itself and stops any active [recording](/api/recorder). Run [nock.activate()](/api/lifecycle-and-network#activate-nock) to re-activate it. Without re-activation, Nock will not intercept any calls.
:::

## Activate Nock

Nock is activated when you import it. Only for cases where it has been deactivated using [nock.restore()](/api/lifecycle-and-network#restore-nock), you can reactivate the HTTP interceptor to start intercepting HTTP calls using:

```js
nock.activate()
```

Calling `nock.activate()` while Nock is already active throws `Nock already active`.

## Check Activation State

Use `nock.isActive()` to check whether the HTTP interceptor is currently active:

```js
if (!nock.isActive()) {
  nock.activate()
}
```

## Clear Interceptors

Use `nock.cleanAll()` to remove all registered interceptors, including persistent interceptors. This does not restore the HTTP interceptor:

```js
nock.cleanAll()
```

## Abort Pending Requests

Use `nock.abortPendingRequests()` to clear the timers Nock uses for delayed replies. Delayed requests that are still waiting do not complete; they are not rejected with an error.

```js
nock.abortPendingRequests()
```

## Remove an Interceptor

Use `nock.removeInterceptor()` with an interceptor instance:

```js
const interceptor = nock('http://example.org').get('/resource')
interceptor.reply(200, 'OK')
nock.removeInterceptor(interceptor)
```

You can also pass a request descriptor. `method` defaults to `GET`, `proto` to `http`, and `path` to `/`. Use `host` for the hostname; include a non-default port in the host value.

```js
nock.removeInterceptor({ host: 'localhost', path: '/mockedResource' })

nock.removeInterceptor({
  host: 'localhost',
  path: '/login',
  method: 'POST',
  proto: 'https',
})
```

`nock.removeInterceptor()` returns `true` when the origin has interceptors and `false` when it has none. Note that it also returns `true` when the origin has interceptors but none matched the descriptor, so do not rely on the result to confirm a removal. `.reply()` returns the scope, not the interceptor, so keep the interceptor reference before calling `.reply()` if you need to remove it later.

## Clone a Scope

Use `scope.clone()` to create a new scope with the same base URL and scope options:

```js
const scope = nock('http://example.test')
const getScope = scope.get('/').reply(200)
const postScope = scope.clone().post('/').reply(200)
```

## Disable Nock with `NOCK_OFF`

You can bypass Nock completely by setting the `NOCK_OFF` environment variable to `"true"` before Nock is imported.

This way you can have your tests hit the real servers just by switching on this environment variable.

```sh
NOCK_OFF=true node my_test.js
```

## Control Real Network Requests

By default, any requests made to a host that is not mocked will be executed normally. If you want to block these requests, nock allows you to do so.

### Disable Network Connections

For disabling real http requests.

```js
nock.disableNetConnect()
```

So, if you try to request any host not 'nocked', it will fail with a `NetConnectNotAllowedError`. Its message includes the host, port, and path.

```js
nock.disableNetConnect()
const req = http.get('http://google.com/')
req.on('error', err => {
  console.log(err)
})
// The returned `http.ClientRequest` will emit an error event (or throw if you're not listening for it)
// This code will log a NetConnectNotAllowedError with message:
// Nock: Disallowed net connect for "google.com:80/"
```

With `fetch`, the rejection is a `TypeError: fetch failed` whose `cause` is the `NetConnectNotAllowedError`.

### Allow Network Connections

For enabling any real HTTP requests (the default behavior):

```js
nock.enableNetConnect()
```

You could allow real HTTP requests for certain host names by providing a string or a regular expression for the hostname, or a function that accepts the hostname and returns true or false. A string is converted to a regular expression, so it matches as a substring of `host:port`:

```js
// Using a string
nock.enableNetConnect('amazon.com')

// Or a RegExp
nock.enableNetConnect(/(amazon|github)\.com/)

// Or a Function
nock.enableNetConnect(
  host => host.includes('amazon.com') || host.includes('github.com'),
)

http.get('http://www.amazon.com/')
http.get('http://github.com/')

http.get('http://google.com/')
// This will throw NetConnectNotAllowedError with message:
// Nock: Disallowed net connect for "google.com:80/"
```

A common use case when testing local endpoints would be to disable all but localhost, then add in additional nocks for external requests:

```js
nock.disableNetConnect()
// Allow localhost connections so we can test local routes and mock servers.
nock.enableNetConnect('127.0.0.1')
```

### Reset Network Rules

When you're done with the test, you probably want to set everything back to normal:

```js
nock.cleanAll()
nock.enableNetConnect()
```
