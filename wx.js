import ReqJSON from './lib/req-json';
import wx from './lib/adapters/wx';

ReqJSON.setAdapter(wx);

export default ReqJSON;
