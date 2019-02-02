/* globals wx */
import { each } from '../utils';

function processHeader(res) {
  const header = {};
  each(res.header, (v, k) => {
    header[k.toLowerCase()] = v;
  });
  return header;
}

export default function (context, resolve, reject) {
  const url = context.url.replace(/\?.*/, '');
  wx.request({
    url,
    data: context.data,
    header: context.header,
    method: context.method,
    success(res) {
      context.headers = context.header = processHeader(res);
      context.status = res.statusCode;
      resolve(context.response = res.data);
    },
    fail(res) {
      context.headers = context.header = processHeader(res);
      context.status = res.statusCode;
      context.response = res.errMsg;
      reject(new Error(context.response = res.errMsg));
    },
  });
}
