# req-json

[![npm][badge-version]][npm]
[![bundle size][badge-size]][bundlephobia]
[![npm downloads][badge-downloads]][npm]
[![license][badge-license]][license]


[![github][badge-issues]][github]
[![build][badge-build]][travis]
[![coverage][badge-coverage]][coveralls]


Promise based simple HTTP/HTTPS client for browser to request JSON or string for RESTful apis, with koa-like middleware support.

## Installation

### NPM

```
npm install req-json --save
```

ES modules for Webpack 2+ or Rollup

```js
import ReqJSON from 'req-json';
```

CommonJS for Webpack 1 or Browserify

```js
const ReqJSON = require('req-json');
```

### Browser

Direct `<script>` include

```html
<script src="https://cdn.jsdelivr.net/npm/req-json@2"></script>
```

### Wechat mini program (weapp)

```js
const ReqJSON = require('req-json/dist/req-json.wx');
```

or just [download](https://cdn.jsdelivr.net/npm/req-json@2/dist/req-json.wx.js) and copy to your project.

## Basic Usage

```js
import ReqJSON from 'req-json';

const reqJSON = new ReqJSON();

reqJSON.get('/api/item/:id', { id: 1 })
  .then((item) => {});
```

## Shorthand methods

```js
async getItem(id) {
  let item;
  try {
    item = await reqJSON.get('/api/item/:id', { id });
  } catch (err) {
    console.error(err);
  }
  return item;
}

async updateItem(item) {
  try {
    await reqJSON.post('/api/item/:id', item);
  } catch (err) {
    console.error(err);
  }
}
```

## RESTful API

```js
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

Customized request headers for single request.

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

Or for resource defination.

```js
const options = {
  headers: {
    Authorization: 'abc'
  }
};
const resource = reqJSON.resource('/api/item/:id', options);

async request() {
  try {
    await resource.get({ id: 1 });
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
reqJSON.use(async(context, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${context.method} ${context.url} ${ms}ms`);
});
```

### Common function

```js
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

```ts
/**
 * The path to use for the request, with parameters defined.
 */
path: string
    
/**
 * The HTTP method to use for the request (e.g. "POST", "GET", "PUT", "DELETE").
 */
method: string
    
/**
 * The URL to which the request is sent.
 */
url: string
    
/**
 * The data to be sent.
 */
data: any
    
/**
 * The options to use for the request.
 */
options: object
    
/**
 * The HTTP status of the response. Only available when the request completes.
 */
status?: number
    
/**
 * The parsed response. Only available when the request completes.
 */
response?: string | object

/**
 * The request headers before the request is sent, the response headers when the request completes.
 */
headers: object
    
/**
 * Alias to `headers`
 */
header: object
    
/**
 * The original XMLHttpRequest object.
 */
xhr: XMLHttpRequest
```

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

[badge-version]: https://img.shields.io/npm/v/req-json.svg
[badge-downloads]: https://img.shields.io/npm/dt/req-json.svg
[npm]: https://www.npmjs.com/package/req-json

[badge-size]: https://img.shields.io/bundlephobia/minzip/req-json.svg
[bundlephobia]: https://bundlephobia.com/result?p=req-json

[badge-license]: https://img.shields.io/npm/l/req-json.svg
[license]: https://github.com/Cweili/req-json/blob/master/LICENSE

[badge-issues]: https://img.shields.io/github/issues/Cweili/req-json.svg
[github]: https://github.com/Cweili/req-json

[badge-build]: https://img.shields.io/travis/Cweili/req-json/master.svg
[travis]: https://travis-ci.org/Cweili/req-json

[badge-coverage]: https://img.shields.io/coveralls/github/Cweili/req-json/master.svg
[coveralls]: https://coveralls.io/github/Cweili/req-json?branch=master
