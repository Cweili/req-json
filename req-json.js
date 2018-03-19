/**
 * Request JSON
 */
const methods = ['get', 'post', 'put', 'delete'];
const encode = encodeURIComponent;

function isObject(value) {
  const type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

function isFunction(value) {
  if (!isObject(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  const tag = Object.prototype.toString.call(value);
  const asyncTag = '[object AsyncFunction]';
  const funcTag = '[object Function]';
  const genTag = '[object GeneratorFunction]';
  const proxyTag = '[object Proxy]';
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

function each(collection, handler) {
  return collection && (Array.isArray(collection)
    ? collection.forEach(handler)
    : Object.keys(collection).forEach(key => handler(collection[key], key)));
}

function assign(target, ...sources) {
  each(sources, (src) => {
    each(src, (value, key) => {
      target[key] = value;
    });
  });

  return target;
}

function omit(obj, attrs) {
  const result = {};

  each(obj, (value, key) => {
    if (attrs.indexOf(key) < 0) {
      result[key] = value;
    }
  });

  return result;
}

function parseJson(json) {
  try {
    return JSON.parse(json);
  } catch (e) {
    return json;
  }
}

function transformQuery(args) {
  return Object.keys(args).sort().map(key => `${key}=${encode(args[key])}`).join('&');
}

function fillUrl(method, path, data) {
  const pattern = /\/:(\w+)/g;
  const variables = [];
  const isDataObject = isObject(data);
  let result = path.replace(pattern, ($0, $1) => {
    variables.push($1);
    const value = isDataObject ? data[$1] : data;
    return value != null ? `/${encode(value)}` : '';
  });
  if (isDataObject && !/POST|PUT/.test(method)) {
    const query = transformQuery(omit(data, variables));
    query && (result += `?${query}`);
  }
  return result;
}

function parseResponseHeaders(headerStr) {
  const headers = {};
  if (!headerStr) {
    return headers;
  }
  const headerPairs = headerStr.split('\u000d\u000a');
  each(headerPairs, (headerPair) => {
    const index = headerPair.indexOf('\u003a\u0020');
    if (index > 0) {
      const key = headerPair.substring(0, index);
      const val = headerPair.substring(index + 2);
      headers[key.toLowerCase()] = val;
    }
  });
  return headers;
}

function ajax(context) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const method = context.method;
    const url = context.url;
    const options = context.options;
    const headers = assign({}, options.header, options.headers, context.header, context.headers);
    let data = context.data;
    context.xhr = xhr;
    xhr.onerror = reject;
    xhr.onreadystatechange = () => {
      if (xhr.readyState == 4) {
        context.status = xhr.status;
        context.header = context.headers = parseResponseHeaders(xhr.getAllResponseHeaders());
        resolve(context.response = parseJson(xhr.responseText));
      }
    };
    xhr.open(method, url, true);
    each(headers, (value, key) => {
      xhr.setRequestHeader(key, value);
    });
    if (data) {
      if (/POST|PUT/.test(method)) {
        if (!headers['Content-Type']) {
          xhr.setRequestHeader('Content-Type', 'application/json');
          data = JSON.stringify(data);
        }
      } else {
        data = undefined;
      }
    }
    xhr.send(data);
  });
}

export default class ReqJSON {
  constructor() {
    this.middlewares = [];
  }

  resource(path, options = {}) {
    const fns = {};
    each(methods, (method) => {
      fns[method] = (data) => {
        method = method.toUpperCase();
        const url = fillUrl(method, path, data);
        const context = {
          path,
          method,
          url,
          data,
          options
        };
        return this._dispatch(context, () => ajax(context))
          .then(() => context.response);
      };
    });
    return fns;
  }

  use(fn) {
    if (!isFunction(fn)) {
      throw new TypeError('Middleware must be a function');
    }
    this.middlewares.push(fn);
  }

  _dispatch(context, next) {
    // last called middleware #
    const middlewares = this.middlewares;
    let index = -1;

    function dispatch(i) {
      if (i <= index) {
        return Promise.reject(new Error('next() called multiple times'));
      }
      index = i;
      let fn = middlewares[i];
      if (i == middlewares.length) {
        fn = next;
      }
      if (!fn) {
        return Promise.resolve();
      }
      try {
        return Promise.resolve(fn(context, () => dispatch(i + 1)));
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return dispatch(0);
  }
}
