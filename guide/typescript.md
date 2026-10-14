---
title: "TypeScript"
description: "Use Nock's exported types with ESM imports and typed reply callbacks."
---

# TypeScript

Nock is an ES module and publishes TypeScript declarations. Import the default `nock` value and refer to its exported types through the `nock` namespace:

```ts
import nock from 'nock'

const scope: nock.Scope = nock('https://api.example.test')
const interceptor: nock.Interceptor = scope.get('/users')
interceptor.reply(200, [{ id: 1 }])
```

Reply callback requests are Web `Request` objects. A reply can return a body, or a tuple containing a status, body, and optional headers.

::: warning
`.reply()` is loosely typed (its first parameter is `any`), so TypeScript does not infer the callback's `request` parameter. Annotate it explicitly (`(request: Request) => ...`) or `strict` mode reports an implicit `any`.
:::

```ts
import nock from 'nock'

const reply: (request: Request) => nock.ReplyFnResult = request => [
  200,
  { url: request.url },
  { 'content-type': 'application/json' },
]

nock('https://api.example.test')
  .get('/users')
  .reply(async (request: Request) => reply(request))
```

Types are also available for scope options and definition objects:

```ts
import nock from 'nock'

const options: nock.Options = { allowUnmocked: false }
const definition: nock.Definition = {
  scope: 'https://api.example.test',
  method: 'GET',
  path: '/users',
  status: 200,
  response: [{ id: 1 }],
}
```

Other exported types include `nock.RecorderOptions`, `nock.BackOptions`, `nock.BackContext`, `nock.RequestBodyMatcher`, `nock.RequestHeaderMatcher`, `nock.ReplyBody`, and `nock.ReplyHeaders`.