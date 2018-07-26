import ReqJSON from './lib/req-json';
import http from './lib/adapters/http';

ReqJSON.setAdapter(http);

export default ReqJSON;
