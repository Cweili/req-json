export default function(context, resolve, reject) {
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
