import {
  isFunction,
  each,
  assign,
  fillUrl,
} from './utils';

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

export default class ReqJSON {
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
