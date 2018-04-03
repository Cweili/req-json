import nock from 'nock';
import ReqJSON from '../dist/req-json.common';

const reqJSON = new ReqJSON();
const resource = reqJSON.resource('http://mock/api/item/:id');

nock('http://mock')
  .get('/api/item/1')
  .reply(200, {
    name: 1
  });

export default resource;
