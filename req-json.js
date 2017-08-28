/**
 * Request JSON
 */
import {
  assign,
  clone,
  each,
  map,
  keys,
  omit,
  isObject,
  isFunction
} from 'lodash-es';

const methods = ['get', 'post', 'put', 'delete'];
const encode = encodeURIComponent;

function parseJson(json) {
  try {
    return JSON.parse(json);
  } catch (e) {
    return json;
  }
}

function transformQuery(args) {
  return map(keys(args).sort(), key => `${key}=${encode(args[key])}`).join('&');
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
    const query = transformQuery(omit(clone(data), variables));
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
  return new Promise((resolve) => {
    const xhr = new window.XMLHttpRequest();
    const method = context.method;
    const url = context.url;
    const options = context.options;
    const headers = assign({}, options.header, options.headers, context.header, context.headers);
    let data = context.data;
    context.xhr = xhr;
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
    methods.forEach((method) => {
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
