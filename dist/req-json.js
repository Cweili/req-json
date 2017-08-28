import _isFunction from 'lodash-es/isFunction';
import _isObject from 'lodash-es/isObject';
import _omit from 'lodash-es/omit';
import _keys from 'lodash-es/keys';
import _map from 'lodash-es/map';
import _each from 'lodash-es/each';
import _clone from 'lodash-es/clone';
import _assign from 'lodash-es/assign'; /**
                                         * Request JSON
                                         */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var methods = ['get', 'post', 'put', 'delete'];
var encode = encodeURIComponent;

function parseJson(json) {
  try {
    return JSON.parse(json);
  } catch (e) {
    return json;
  }
}

function transformQuery(args) {
  return _map(_keys(args).sort(), function (key) {
    return key + '=' + encode(args[key]);
  }).join('&');
}

function fillUrl(method, path, data) {
  var pattern = /\/:(\w+)/g;
  var variables = [];
  var isDataObject = _isObject(data);
  var result = path.replace(pattern, function ($0, $1) {
    variables.push($1);
    var value = isDataObject ? data[$1] : data;
    return value != null ? '/' + encode(value) : '';
  });
  if (isDataObject && !/POST|PUT/.test(method)) {
    var query = transformQuery(_omit(_clone(data), variables));
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
  _each(headerPairs, function (headerPair) {
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
  return new Promise(function (resolve) {
    var xhr = new window.XMLHttpRequest();
    var method = context.method;
    var url = context.url;
    var options = context.options;
    var header = _assign({}, options.header, options.headers, context.header, context.headers);
    var data = context.data;
    context.xhr = xhr;
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        context.status = xhr.status;
        context.header = context.headers = parseResponseHeaders(xhr.getAllResponseHeaders());
        resolve(context.response = parseJson(xhr.responseText));
      }
    };
    xhr.open(method, url, true);
    _each(header, function (value, key) {
      xhr.setRequestHeader(key, value);
    });
    if (data) {
      if (/POST|PUT/.test(method)) {
        if (!header['Content-Type']) {
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

  ReqJSON.prototype.resource = function resource(path) {
    var _this = this;

    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var fns = {};
    methods.forEach(function (method) {
      fns[method] = function (data) {
        method = method.toUpperCase();
        var url = fillUrl(method, path, data);
        var context = {
          path: path,
          method: method,
          url: url,
          data: data,
          options: options
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
    if (!_isFunction(fn)) {
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
      if (!fn) {
        return Promise.resolve();
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

export default ReqJSON;