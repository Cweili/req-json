/*!
 * req-json by @Cweili - https://github.com/Cweili/req-json
 */
'use strict';

var encode = encodeURIComponent;
function isObject(value) {
  var type = typeof value;
  return value != null && (type === 'object' || type === 'function');
}
function isFunction(value) {
  if (!isObject(value)) {
    return false;
  } // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.


  var tag = Object.prototype.toString.call(value);
  var asyncTag = '[object AsyncFunction]';
  var funcTag = '[object Function]';
  var genTag = '[object GeneratorFunction]';
  var proxyTag = '[object Proxy]';
  return tag === funcTag || tag === genTag || tag === asyncTag || tag === proxyTag;
}
function each(collection, handler) {
  return collection && (Array.isArray(collection) ? collection.forEach(handler) : Object.keys(collection).forEach(function (key) {
    return handler(collection[key], key);
  }));
}
function assign(target) {
  for (var _len = arguments.length, sources = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    sources[_key - 1] = arguments[_key];
  }

  each(sources, function (src) {
    each(src, function (value, key) {
      target[key] = value;
    });
  });
  return target;
}
function omit(obj, attrs) {
  var result = {};
  each(obj, function (value, key) {
    if (attrs.indexOf(key) < 0) {
      result[key] = value;
    }
  });
  return result;
}
function transformQuery(args) {
  return Object.keys(args).sort().map(function (key) {
    return key + "=" + encode(args[key]);
  }).join('&');
}
function fillUrl(method, path, data) {
  var pattern = /\/:(\w+)/g;
  var variables = [];
  var isDataObject = isObject(data);
  var result = path.replace(pattern, function ($0, $1) {
    variables.push($1);
    var value = isDataObject ? data[$1] : data;
    return value != null ? "/" + encode(value) : '';
  });

  if (isDataObject && !/POST|PUT/.test(method)) {
    var query = transformQuery(omit(data, variables));

    if (query) {
      result += "?" + query;
    }
  }

  return result;
}

var methods = ['get', 'post', 'put', 'delete'];

function req(context, adapter) {
  return new Promise(function (resolve, reject) {
    var options = context.options;
    context.header = context.headers = assign({}, options.header, options.headers, context.header, context.headers);
    adapter(context, resolve, reject);
  });
}

var ReqJSON =
/*#__PURE__*/
function () {
  function ReqJSON() {
    this.middlewares = [];
  }

  ReqJSON.setAdapter = function setAdapter(adapter) {
    ReqJSON.adapter = adapter;
  };

  var _proto = ReqJSON.prototype;

  _proto.resource = function resource(path, options) {
    var _this = this;

    var fns = {};
    each(methods, function (method) {
      fns[method] = function (data, newOptions) {
        method = method.toUpperCase();
        var url = fillUrl(method, path, data);
        var context = {
          path: path,
          method: method,
          url: url,
          data: data,
          options: assign({}, options, newOptions)
        };
        return _this._dispatch(context, function () {
          return req(context, ReqJSON.adapter);
        }).then(function () {
          return context.response;
        });
      };
    });
    return fns;
  };

  _proto.use = function use(fn) {
    if (!isFunction(fn)) {
      throw new TypeError('Middleware must be a function');
    }

    this.middlewares.push(fn);
  };

  _proto._dispatch = function _dispatch(context, next) {
    // last called middleware #
    var middlewares = this.middlewares;
    var index = -1;

    function dispatch(i) {
      if (i <= index) {
        return Promise.reject(new Error('next() called multiple times'));
      }

      index = i;
      var fn = middlewares[i];

      if (i === middlewares.length) {
        fn = next;
      }

      try {
        return Promise.resolve(fn(context, function () {
          return dispatch(i + 1);
        }));
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return dispatch(0);
  };

  return ReqJSON;
}();

/* globals wx */

function processHeader(res) {
  var header = {};
  each(res.header, function (v, k) {
    header[k.toLowerCase()] = v;
  });
  return header;
}

function wx$1 (context, resolve, reject) {
  var url = context.url.replace(/\?.*/, '');
  wx.request({
    url: url,
    data: context.data,
    header: context.header,
    method: context.method,
    success: function success(res) {
      context.headers = context.header = processHeader(res);
      context.status = res.statusCode;
      resolve(context.response = res.data);
    },
    fail: function fail(res) {
      context.headers = context.header = processHeader(res);
      context.status = res.statusCode;
      context.response = res.errMsg;
      reject(new Error(context.response = res.errMsg));
    }
  });
}

ReqJSON.setAdapter(wx$1);

module.exports = ReqJSON;
