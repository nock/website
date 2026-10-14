---
title: "Filtering Requests"
description: "Normalize request origins, paths, and bodies before matching interceptors."
---

# Filtering Requests

Use request filters when part of the incoming request varies between runs. The available filters normalize the scope origin, path, or request body before Nock matches an interceptor.

## Filter a Scope

Set `filteringScope` in the scope options when the origin varies, such as a service that selects a numbered subdomain. The function receives the request origin including the port, for example `https://api2.example.test:443`, so do not anchor the pattern with `$`:

```js
const scope = nock('https://api.example.test', {
  filteringScope: origin => /^https:\/\/api[0-9]*\.example\.test(:443)?$/.test(origin),
})
  .get('/resource')
  .reply(200)
```

## Filter a Path

Use `.filteringPath()` to normalize a variable path before matching. It accepts a regular expression and replacement string:

```js
const scope = nock('http://api.example.test')
  .filteringPath(/password=[^&]*/g, 'password=XXX')
  .get('/users/1?password=XXX')
  .reply(200)
```

It also accepts a function that receives the path and returns the normalized path:

```js
const scope = nock('http://api.example.test')
  .filteringPath(path => '/ABC')
  .get('/ABC')
  .reply(200)
```

::: warning
`scope.filteringPath` is not cumulative: use it only once per scope.
:::

## Filter a Request Body

Use `.filteringRequestBody()` to transform the incoming body before matching it against the interceptor's expected body. The function receives the request body and the configured matcher:

```js
const scope = nock('http://api.example.test')
  .filteringRequestBody(body => {
    if (typeof body === 'string') {
      return body.replace(/timestamp=[0-9]+/, 'timestamp=XXX')
    }
    return body
  })
  .post('/events', 'timestamp=XXX')
  .reply(200)
```

Like `.filteringPath()`, it also accepts a regular expression and replacement string:

```js
const scope = nock('http://api.example.test')
  .filteringRequestBody(/password=[^&]*/g, 'password=XXX')
  .post('/users/1', 'data=ABC&password=XXX')
  .reply(201)
```

To skip body matching altogether, omit the body argument from the interceptor method instead of filtering:

```js
nock('http://api.example.test').post('/some_uri').reply(200)
```

Request headers are matched separately; see [Matching Requests](/guide/request-matching#match-request-headers). Scope-level matching options, including `conditionally`, are documented in [Scope Options](/api/scope-options).
