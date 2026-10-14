---
title: "Recorder"
description: "Record HTTP interactions and configure recorder output."
---

# Recorder

Use the recorder to capture real HTTP interactions as Nock definitions:

```js
nock.recorder.rec()
// Some HTTP calls happen and the nock code necessary to mock
// those calls will be outputted to console
```

The legacy boolean form is still supported: `nock.recorder.rec(true)` is equivalent to `{ dont_print: true }`, while `rec(false)` prints output.

Recording relies on intercepting real requests and responses and then persisting them for later use.

In order to stop recording you should call `nock.restore()` and recording will stop.

::: warning
When recording is enabled, Nock does no validation, nor will any mocks be enabled. Turn off recording before using mocks in your tests. Calling `nock.recorder.rec()` while a recording is in progress throws `Nock recording already in progress`.
:::

## `dont_print`

If you just want to capture the generated code into a var as an array you can use:

```js
nock.recorder.rec({
  dont_print: true,
})
// ... some HTTP calls
const nockCalls = nock.recorder.play()
```

The `nockCalls` var will contain an array of strings representing the generated code you need.

Copy and paste that code into your tests, customize at will, and you're done! You can call `nock.recorder.clear()` to remove already recorded calls from the array that `nock.recorder.play()` returns.

(Remember that you should do this one test at a time).

`nock.recorder.play()` returns the recorded output. `nock.recorder.clear()` clears the stored output:

```js
const recordedCalls = nock.recorder.play()
nock.recorder.clear()
```

## `output_objects`

In case you want to generate the code yourself or use the test data in some other way, you can pass the `output_objects` option to `rec`:

```js
nock.recorder.rec({
  output_objects: true,
})
// ... some HTTP calls
const nockCallObjects = nock.recorder.play()
```

The returned call objects have the following properties:

- `scope` - the scope of the call including the protocol and non-standard ports (e.g. `'https://github.com:12345'`)
- `method` - the HTTP verb of the call (e.g. `'GET'`)
- `path` - the path of the call (e.g. `'/pgte/nock'`)
- `body` - the body of the call, if any
- `status` - the HTTP status of the reply (e.g. `200`)
- `response` - the body of the reply which can be a JSON, string, hex string representing binary buffers or an array of such hex strings (when handling `content-encoded` in reply header)
- `rawHeaders` - reply headers as an object of header names and values
- `reqheaders` - request headers, when request-header recording is enabled
- `responseIsBinary` - whether the recorded response body is binary

For loading, editing, or defining captured interactions, see [Definitions and Fixtures](/api/definitions).

## `enable_reqheaders_recording`

Recording request headers by default is deemed more trouble than it's worth as some of them depend on the timestamp or other values that may change after the tests have been recorded thus leading to complex postprocessing of recorded tests. Thus by default the request headers are not recorded.

The genuine use cases for recording request headers (e.g. checking authorization) can be handled manually or by using `enable_reqheaders_recording` in `recorder.rec()` options.

```js
nock.recorder.rec({
  dont_print: true,
  output_objects: true,
  enable_reqheaders_recording: true,
})
```

Note that even when request headers recording is enabled Nock will never record `user-agent` headers. `user-agent` values change with the version of Node and underlying operating system and are thus useless for matching as all that they can indicate is that the user agent isn't the one that was used to record the tests.

## `logging`

Nock will print using `console.log` by default (assuming that `dont_print` is `false`). If a different function is passed into `logging`, nock will send the log string (or object, when using `output_objects`) to that function. Here's a basic example.

```js
const appendLogToFile = content => {
  fs.appendFile('record.txt', content)
}
nock.recorder.rec({
  logging: appendLogToFile,
})
```

## `use_separator`

By default, nock will wrap its output with the separator string `<<<<<<-- cut here -->>>>>>` before and after anything it prints, whether to the console or a custom log function given with the `logging` option.

To disable this, set `use_separator` to false.

```js
nock.recorder.rec({
  use_separator: false,
})
```

