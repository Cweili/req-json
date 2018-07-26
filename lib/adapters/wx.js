export default function(context, resolve, reject) {
  const url = context.url.replace(/\?.*/, '');
  wx.request({
    url,
    data: context.data,
    header: context.header,
    method: context.method,
    success(res) {
      context.headers = context.header = res.header;
      context.status = res.statusCode;
      resolve(context.response = res.data);
    },
    fail(res) {
      context.status = res.statusCode;
      context.response = res.errMsg;
      reject(new Error(context.response = res.errMsg));
    }
  });
}
