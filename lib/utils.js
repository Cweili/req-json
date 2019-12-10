const encode = encodeURIComponent;

export function isObject(value) {
  const type = typeof value;
  return value != null && (type === 'object' || type === 'function');
}

export function isFunction(value) {
  if (!isObject(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  const tag = Object.prototype.toString.call(value);
  const asyncTag = '[object AsyncFunction]';
  const funcTag = '[object Function]';
  const genTag = '[object GeneratorFunction]';
  return tag === funcTag || tag === genTag || tag === asyncTag;
}

export function each(collection, handler) {
  return collection && (Array.isArray(collection)
    ? collection.forEach(handler)
    : Object.keys(collection).forEach((key) => handler(collection[key], key)));
}

export function assign(target, ...sources) {
  each(sources, (src) => {
    each(src, (value, key) => {
      target[key] = value;
    });
  });

  return target;
}

export function omit(obj, attrs) {
  const result = {};

  each(obj, (value, key) => {
    if (attrs.indexOf(key) < 0) {
      result[key] = value;
    }
  });

  return result;
}

export function parseJson(json) {
  try {
    return JSON.parse(json);
  } catch (e) {
    return json;
  }
}

export function transformQuery(args) {
  return Object.keys(args).sort().map((key) => `${key}=${encode(args[key])}`).join('&');
}

export function fillUrl(method, path, data) {
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
