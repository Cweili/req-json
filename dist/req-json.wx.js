/*!
 * req-json by @Cweili - https://github.com/Cweili/req-json
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.ReqJSON = factory());
}(this, (function () { 'use strict';

  const encode = encodeURIComponent;

  function isObject(value) {
    const type = typeof value;
    return value != null && (type === 'object' || type === 'function');
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
    return tag === funcTag || tag === genTag || tag === asyncTag || tag === proxyTag;
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
      if (query) {
        result += `?${query}`;
      }
    }
    return result;
  }

  const methods = ['get', 'post', 'put', 'delete'];

  function req(context, adapter) {
    return new Promise((resolve, reject) => {
      const { options } = context;
      context.header = context.headers = assign(
        {},
        options.header,
        options.headers,
        context.header,
        context.headers,
      );
      adapter(context, resolve, reject);
    });
  }

  class ReqJSON {
    constructor() {
      this.middlewares = [];
    }

    static setAdapter(adapter) {
      ReqJSON.adapter = adapter;
    }

    resource(path, options) {
      const fns = {};
      each(methods, (method) => {
        fns[method] = (data, newOptions) => {
          method = method.toUpperCase();
          const url = fillUrl(method, path, data);
          const context = {
            path,
            method,
            url,
            data,
            options: assign({}, options, newOptions),
          };
          return this._dispatch(context, () => req(context, ReqJSON.adapter))
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
      const { middlewares } = this;
      let index = -1;

      function dispatch(i) {
        if (i <= index) {
          return Promise.reject(new Error('next() called multiple times'));
        }
        index = i;
        let fn = middlewares[i];
        if (i === middlewares.length) {
          fn = next;
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

  function wx$1(context, resolve, reject) {
    const url = context.url.replace(/\?.*/, '');
    wx.request({
      url,
      data: context.data,
      header: context.header,
      method: context.method,
      success(res) {
        resolve({
          status: res.statusCode,
          response: res.data,
          headers: res.header,
          header: res.header
        });
      },
      fail(res) {
        reject({
          status: res.statusCode,
          message: res.errMsg
        });
      }
    });
  }

  ReqJSON.setAdapter(wx$1);

  return ReqJSON;

})));
