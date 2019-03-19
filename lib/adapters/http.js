import {
  each,
  parseJson,
} from '../utils';

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

export default function (context) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const {
      method,
      url,
      headers,
    } = context;
    let { data } = context;
    context.xhr = xhr;
    xhr.onerror = reject;
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
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
