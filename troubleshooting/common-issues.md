---
title: "Common Issues"
description: "Resolve common integration issues with Got, ES modules, Axios, and Jest."
---

## Common issues

**"No match for response" when using got with error responses**

[Got][] automatically retries failed requests twice. That means if you have a
test which mocks a 4xx or 5xx response, got will immediately reissue it. At
that point, the mock will have been consumed and the second request will error
out with **Nock: No match for request**.

The same is true for `.replyWithError()`.

Adding `{ retry: 0 }` to the `got` invocations will disable retrying, e.g.:

```js
await got('http://example.test/', { retry: 0 })
```

If you need to do this in all your tests, you can create a module
`got_client.js` which exports a custom got instance:

```js
import got from 'got'

export default got.extend({ retry: 0 })
```

This is how it's handled in Nock itself (see [#1523][]).

[got]: https://github.com/sindresorhus/got
[#1523]: https://github.com/nock/nock/issues/1523

### Requests made by ES Modules are not intercepted

When an ES module imports `request` with a namespaced import like `import * as
http from "node:http"`, and the module is imported before `nock`, requests made
by this module are not intercepted. You can fix this by telling Node to preload
`nock` using the `--import=nock` [CLI option](https://nodejs.org/api/cli.html#--importmodule)
or setting the `NODE_OPTIONS=--import=nock` environment variable.

### Axios

To use Nock with [Axios][], you may need to configure Axios to use the Node
adapter as in the example below:

```js
import axios from 'axios'
import nock from 'nock'
import test from 'ava' // You can use any test framework.

// If you are using jsdom, axios will default to using the XHR adapter which
// can't be intercepted by nock. So, configure axios to use the node adapter.
//
// References:
// https://github.com/axios/axios/pull/5277

axios.defaults.adapter = 'http'

test('can fetch test response', async t => {
  // Set up the mock request.
  const scope = nock('http://localhost')
    .get('/test')
    .reply(200, 'test response')

  // Make the request. Note that the hostname must match exactly what is passed
  // to `nock()`. Alternatively you can set `axios.defaults.host = 'http://localhost'`
  // and run `axios.get('/test')`.
  await axios.get('http://localhost/test')

  // Assert that the expected request was made.
  scope.done()
})
```

For Nock + Axios + Jest to work, you'll have to also adapt your jest.config.js, like so:

```js
const config = {
  moduleNameMapper: {
    // Force CommonJS build for http adapter to be available.
    // via https://github.com/axios/axios/issues/5101#issuecomment-1276572468
    '^axios$': require.resolve('axios'),
  },
}
```

[axios]: https://github.com/axios/axios

### Memory issues with Jest

Memory issues can be avoided by calling [`nock.restore()`](/api/lifecycle-and-network#restoring) after each test suite.  
One of the core principles of [Jest](https://jestjs.io/) is that it runs tests in isolation.
It does this by manipulating the modules cache of Node in a way that conflicts with how Nock monkey patches the builtin `http` and `https` modules.
[Related issue with more details](https://github.com/nock/nock/issues/1817).
