---
title: "Debugging"
description: "Use Node debug logging to diagnose why requests do not match interceptors."
---

# Debugging

Nock uses node internals [`debuglog`](https://nodejs.org/api/util.html#utildebuglogsection-callbackg), so just run with environmental variable `NODE_DEBUG` set to `nock:*`.

```sh
NODE_DEBUG=nock:* node my_test.js
```

Each step in the matching process is logged this way and can be useful when determining why a request was not intercepted by Nock.

## Debug Namespaces

Enable a single area instead of `nock:*`:

| Namespace | Logs |
| --- | --- |
| `nock:scope:<host>` | Matching decisions and reply details for one scope. `<host>` omits the port when it is the default, for example `nock:scope:example.com` or `nock:scope:localhost:8080` |
| `nock:intercept` | Interceptor lookup and net-connect decisions |
| `nock:playback_interceptor` | Reply callback results |
| `nock:recorder` | Recording |
| `nock:back` | Nock Back |
| `nock:common` | Internal helpers |

## Example

The following shows that matching failed because the request had an extra search parameter.

```js
import got from 'got'
import nock from 'nock'

nock('http://example.com').get('/').query({ foo: 'bar' }).reply()

await got('http://example.com/?foo=bar&baz=foz')
```

```sh
NODE_DEBUG=nock:scope:example.com node my_test.js
```

```sh
...
NOCK:SCOPE:EXAMPLE.COM 103514: Interceptor queries: {"foo":"bar"}
NOCK:SCOPE:EXAMPLE.COM 103514:     Request queries: {"foo":"bar","baz":"foz"}
NOCK:SCOPE:EXAMPLE.COM 103514: query matching failed
```
