---
title: "Events"
description: "Listen for request, reply, and unmatched-request events."
---

# Events

A scope emits `request` when a request matches an interceptor and `replied` after the response body finishes. Both events receive the Web `Request` and the matched interceptor; `request` also receives the normalized request body.

```js
scope.on('request', (request, interceptor, body) => {
  console.log('Matched:', request.url, interceptor.method, body)
})

scope.on('replied', (request, interceptor) => {
  console.log('Replied to:', request.url, interceptor.method)
})
```

## Global No-Match Event

Listen for requests that did not match an interceptor with `nock.emitter`. The first argument is a Web `Request`; when Nock has interceptor candidates, the second argument contains those interceptors and their mismatch reasons.

```js
nock.emitter.on('no match', (req, interceptorResults) => {
  console.log('Request did not match any interceptors:', req.url)

  if (interceptorResults && interceptorResults.length > 0) {
    interceptorResults.forEach(({ interceptor, reasons }) => {
      console.log(
        'Interceptor:',
        interceptor.method,
        interceptor.basePath + interceptor.path,
      )
      console.log('Reasons:', reasons)
    })
  }
})
```

The callback receives these parameters:

- `req` - The Web `Request` that did not match
- `interceptorResults` - An array of objects containing detailed information about each interceptor that was tested, ordered from fewest to most mismatch reasons. It is `undefined` when the request is for an origin Nock has no interceptors for, so the event also fires for unmocked origins.
  Each object contains:
  - `interceptor` - The interceptor that was tested against the request
  - `reasons` - An array of strings describing why the request did not match this interceptor

::: warning Experimental
The structure and format of the detailed mismatch information may change in future versions as feedback is gathered. The feature itself is stable.
:::

Common mismatch reasons include:

- **Method mismatch**: `"Method mismatch: expected GET, got POST"`
- **Path mismatch**: `"Path mismatch: expected /api/users, got /api/posts"`
- **Header mismatch**: `"Header mismatch: expected authorization to match Bearer token, got null"`
- **Body mismatch**: `"Body mismatch: expected "expected body", got actual body"`
- **Query mismatch**: `"query matching failed"`
