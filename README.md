# req-json

Promise based simple HTTP/HTTPS client to request JSON or string.

[![npm](https://nodei.co/npm/req-json.png?downloads=true&stars=true)](https://www.npmjs.com/package/req-json)

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

## Advanced Usage

### Methods

Supports `GET` `POST` `PUT` `DELETE` methods.

```js
import ReqJSON from 'req-json';

const reqJSON = new ReqJSON();
const resource = reqJSON.resource('/api/item/:id');

async request() {
  try {
    await resource.get({ id: 1 });
    await resource.post({ id: 1 });
    await resource.get({ id: 1 });
    await resource.get({ id: 1 });
  } catch (err) {
    console.error(err);
  }
}
```

### Options

Customized request headers.

```js
import ReqJSON from 'req-json';

const reqJSON = new ReqJSON();
const resource = reqJSON.resource('/api/item/:id');

async request() {
  const options = {
    headers: {
      Authencate: 'abc'
    }
  };
  try {
    await resource.get({ id: 1 }, options);
  } catch (err) {
    console.error(err);
  }
}
```

### Middlewares

Supports two diffrent kinds of functions as middleware:

* async function
* common function

#### Async function (node >= v7.6.0)

```js
import ReqJSON from 'req-json';

const reqJSON = new ReqJSON();

reqJSON.use(async(context, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${context.method} ${context.url} ${ms}ms`);
});
```

#### Common function

```js
import ReqJSON from 'req-json';

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

#### context

Context contains these attributes:

* `path`
* `method`
* `url`
* `data`
* `options`
* `response`
