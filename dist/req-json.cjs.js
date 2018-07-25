'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*!
 * req-json by @Cweili - https://github.com/Cweili/req-json
 */
var methods = ['get', 'post', 'put', 'delete'];
var encode = encodeURIComponent;

function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

function isFunction(value) {
  if (!isObject(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = Object.prototype.toString.call(value);
  var asyncTag = '[object AsyncFunction]';
  var funcTag = '[object Function]';
  var genTag = '[object GeneratorFunction]';
  var proxyTag = '[object Proxy]';
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

function each(collection, handler) {
  return collection && (Array.isArray(collection) ? collection.forEach(handler) : Object.keys(collection).forEach(function (key) {
    return handler(collection[key], key);
  }));
}

function assign(target) {
  for (var _len = arguments.length, sources = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
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

function parseJson(json) {
  try {
    return JSON.parse(json);
  } catch (e) {
    return json;
  }
}

function transformQuery(args) {
  return Object.keys(args).sort().map(function (key) {
    return key + '=' + encode(args[key]);
  }).join('&');
}

function fillUrl(method, path, data) {
  var pattern = /\/:(\w+)/g;
  var variables = [];
  var isDataObject = isObject(data);
  var result = path.replace(pattern, function ($0, $1) {
    variables.push($1);
    var value = isDataObject ? data[$1] : data;
    return value != null ? '/' + encode(value) : '';
  });
  if (isDataObject && !/POST|PUT/.test(method)) {
    var query = transformQuery(omit(data, variables));
    query && (result += '?' + query);
  }
  return result;
}

function parseResponseHeaders(headerStr) {
  var headers = {};
  if (!headerStr) {
    return headers;
  }
  var headerPairs = headerStr.split('\r\n');
  each(headerPairs, function (headerPair) {
    var index = headerPair.indexOf(': ');
    if (index > 0) {
      var key = headerPair.substring(0, index);
      var val = headerPair.substring(index + 2);
      headers[key.toLowerCase()] = val;
    }
  });
  return headers;
}

function ajax(context) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    var method = context.method;
    var url = context.url;
    var options = context.options;
    var headers = assign({}, options.header, options.headers, context.header, context.headers);
    var data = context.data;
    context.xhr = xhr;
    xhr.onerror = reject;
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        context.status = xhr.status;
        context.header = context.headers = parseResponseHeaders(xhr.getAllResponseHeaders());
        resolve(context.response = parseJson(xhr.responseText));
      }
    };
    xhr.open(method, url, true);
    each(headers, function (value, key) {
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

var ReqJSON = function () {
  function ReqJSON() {
    _classCallCheck(this, ReqJSON);

    this.middlewares = [];
  }

  ReqJSON.prototype.resource = function resource(path, options) {
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
          return ajax(context);
        }).then(function () {
          return context.response;
        });
      };
    });
    return fns;
  };

  ReqJSON.prototype.use = function use(fn) {
    if (!isFunction(fn)) {
      throw new TypeError('Middleware must be a function');
    }
    this.middlewares.push(fn);
  };

  ReqJSON.prototype._dispatch = function _dispatch(context, next) {
    // last called middleware #
    var middlewares = this.middlewares;
    var index = -1;

    function dispatch(i) {
      if (i <= index) {
        return Promise.reject(new Error('next() called multiple times'));
      }
      index = i;
      var fn = middlewares[i];
      if (i == middlewares.length) {
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

module.exports = ReqJSON;
