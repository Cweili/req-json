import {
  isFunction,
  each,
  assign,
  fillUrl,
} from './utils';

const methods = ['get', 'post', 'put', 'delete'];
let adapter;

export default class ReqJSON {
  constructor() {
    this._m = [];
    each(methods, (method) => {
      this[method] = (path, data, options) => this.resource(path)[method](data, options);
    });
  }

  static setAdapter(a) {
    adapter = a;
  }

  resource(path, options) {
    const fns = {};
    each(methods, (method) => {
      fns[method] = (data, newOptions) => {
        method = method.toUpperCase();
        const url = fillUrl(method, path, data);
        const opts = assign({}, options, newOptions);
        const context = {
          path,
          method,
          url,
          data,
          options: opts,
        };
        context.header = context.headers = assign(
          {},
          opts.header,
          opts.headers,
        );
        return this._dispatch(context, () => {
          context.header = context.headers = assign({}, context.header, context.headers);
          return adapter(context);
        })
          .then(() => context.response);
      };
    });
    return fns;
  }

  use(fn) {
    if (!isFunction(fn)) {
      throw new TypeError('Middleware must be a function');
    }
    this._m.push(fn);

    return this;
  }

  _dispatch(context, next) {
    // last called middleware #
    const { _m } = this;
    let index = -1;

    function dispatch(i) {
      if (i <= index) {
        return Promise.reject(new Error('next() called multiple times'));
      }
      index = i;
      let fn = _m[i];
      if (i === _m.length) {
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
