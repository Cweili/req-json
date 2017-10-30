# req-json

[![npm][npm-version]](npm)
[![npm][npm-downloads]](npm)
[![npm][npm-license]](npm)
[![github][github-issues]](github)


Promise based simple HTTP/HTTPS client to request JSON or string for RESTful apis, with koa-like middleware support.

## Install

```
npm install req-json --save
```

## Basic Usage

```js
import ReqJSON from 'req-json';

const reqJSON = new ReqJSON();
const resource = reqJSON.resource('/api/item/:id');

async getItem(id) {
  let item;
  try {
    item = await resource.get({ id });
  } catch (err) {
    console.error(err);
  }
  return item;
}

async updateItem(item) {
  try {
    await resource.post(item);
  } catch (err) {
    console.error(err);
  }
}
```

## Methods

Supports `GET` `POST` `PUT` `DELETE` methods.

```js
const reqJSON = new ReqJSON();
const resource = reqJSON.resource('/api/item/:id');

async request() {
  try {
    const response = await resource.get({ id: 1 });
    await resource.post({
      id: 1,
      others: { foo: 'bar' }
    });
    await resource.put({
      id: 1,
      others: { foo: 'bar' }
    });
    await resource.delete({ id: 1 });
  } catch (err) {
    console.error(err);
  }
}
```

## Options

Customized request headers.

```js
async request() {
  const options = {
    headers: {
      Authorization: 'abc'
    }
  };
  try {
    await resource.get({ id: 1 }, options);
  } catch (err) {
    console.error(err);
  }
}
```

## Middlewares

Supports two diffrent kinds of functions as middleware:

* async function
* common function

### Async function ([Can I use](http://caniuse.com/#feat=async-functions))

```js
const reqJSON = new ReqJSON();

reqJSON.use(async(context, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${context.method} ${context.url} ${ms}ms`);
});
```

### Common function

```js
const reqJSON = new ReqJSON();

reqJSON.use((context, next) => {
  const start = Date.now();
  return next()
    .then(() => {
      const ms = Date.now() - start;
      console.log(`${context.method} ${context.url} ${ms}ms`);
    });
});
```

### Context

Context contains these attributes:

* `path`
* `method`
* `url`
* `data`
* `options`
* `status`
* `response`
* `headers`
* `header` (alias to `headers`)
* `xhr`

### Reject when status 4xx or 5xx

#### Async function

```js
reqJSON.use(async(context, next) => {
  await next();
  if (context.status >= 400) {
    throw new Error(context.response);
  }
});
```

#### Common function

```js
reqJSON.use((context, next) => {
  return next()
    .then(() => {
      if (context.status >= 400) {
        throw new Error(context.response);
      }
    });
});
```

### Set request headers and get response headers

#### Async function

```js
reqJSON.use(async(context, next) => {
  // set request headers
  context.headers = {
    'If-None-Match': 'abcdefg'
  };
  await next();
  // get response headers
  console.log(context.headers.etag);
});
```

#### Common function

```js
reqJSON.use((context, next) => {
  // set request headers
  context.headers = {
    'If-None-Match': 'abcdefg'
  };
  return next()
    .then(() => {
      // get response headers
      console.log(context.headers.etag);
    });
});
```

[npm]: https://www.npmjs.com/package/req-json
[npm-version]: https://img.shields.io/npm/v/req-json.svg
[npm-downloads]: https://img.shields.io/npm/dt/req-json.svg
[npm-license]: https://img.shields.io/npm/l/req-json.svg

[github]: https://github.com/Cweili/req-json
[github-issues]: https://img.shields.io/github/issues/Cweili/req-json.svg
