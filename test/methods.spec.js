import mock from 'xhr-mock';
import ReqJSON from '..';

describe('req-json middlewares', () => {
  const reqJSON = new ReqJSON();
  const resource = reqJSON.resource('/api/item/:id');
  const body = {
    name: 1,
  };

  beforeEach(() => mock.setup());

  afterEach(() => mock.teardown());

  it('should get data with default params', async () => {
    mock.get('/api/item/1', {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await resource.get(1);
    expect(data).toEqual(body);
  });

  it('should get data with specific params', async () => {
    mock.get('/api/item/1?foo=bar&foobar=1', {
      status: 200,
      body: JSON.stringify(body),
    });

    const data = await resource.get({
      id: 1,
      foo: 'bar',
      foobar: 1,
    });
    expect(data).toEqual(body);
  });

  it('should get data with undefined params', async () => {
    mock.get('/api/item', {
      status: 200,
      body: JSON.stringify(body),
    });

    const data = await resource.get();
    expect(data).toEqual(body);
  });

  it('should post data with specific params', async () => {
    const reqBody = {
      id: 1,
      name: 1,
    };

    mock.post('/api/item/1', (req, res) => {
      expect(req.header('Content-Type')).toEqual('application/json');
      expect(req.body()).toEqual(JSON.stringify(reqBody));
      return res.status(200).body(JSON.stringify(body));
    });

    const data = await resource.post(reqBody);
    expect(data).toEqual(body);
  });

  it('should post data with specific headers', async () => {
    const reqBody = JSON.stringify({
      id: 1,
      name: 1,
    });

    mock.post(`/api/item/${encodeURIComponent(reqBody)}`, (req, res) => {
      expect(req.header('Content-Type')).toEqual('text/plain');
      expect(req.body()).toEqual(reqBody);
      return res.status(200).body(JSON.stringify(body));
    });

    const data = await resource.post(reqBody, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
    expect(data).toEqual(body);
  });

  it('should put data with specific params', async () => {
    const reqBody = {
      id: 1,
      name: 1,
    };

    mock.put('/api/item/1', (req, res) => {
      expect(req.header('Content-Type')).toEqual('application/json');
      expect(req.body()).toEqual(JSON.stringify(reqBody));
      return res.status(200).body(JSON.stringify(body));
    });

    const data = await resource.put(reqBody);
    expect(data).toEqual(body);
  });

  it('should delete data with specific params', async () => {
    mock.delete('/api/item/1', {
      status: 204,
    });

    const data = await resource.delete({
      id: 1,
    });
    expect(data).toBeDefined();
  });
});
