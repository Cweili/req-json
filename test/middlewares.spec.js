import mock from 'xhr-mock';
import ReqJSON from '../index';
import { each } from '../lib/utils';

describe('req-json middlewares', () => {
  beforeEach(() => mock.setup());

  afterEach(() => mock.teardown());

  it('should contains context attributes', async () => {
    const reqJSON = new ReqJSON();
    const resource = reqJSON.resource('/api/item/:id');
    const body = {
      name: 1,
    };

    reqJSON.use(async (ctx, next) => {
      expect(ctx.path).toEqual('/api/item/:id');
      expect(ctx.method).toEqual('GET');
      expect(ctx.url).toEqual('/api/item/1');
      expect(ctx.data).toEqual({
        id: 1,
      });
      expect(ctx.options).toEqual({
        headers: {
          Authorization: 'abc',
        },
      });
      await next();
      expect(ctx.status).toEqual(200);
      expect(ctx.response).toEqual(body);
      expect(ctx.headers).toEqual({
        'content-type': 'application/json',
      });
      expect(ctx.header).toEqual(ctx.headers);
    });

    mock.get('/api/item/1', {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    await resource.get({
      id: 1,
    }, {
      headers: {
        Authorization: 'abc',
      },
    });
  });

  it('should stop when it throws error', async () => {
    const reqJSON = new ReqJSON();

    const middleware1 = jest.fn();
    const middleware2 = jest.fn();

    reqJSON.use(async (ctx, next) => {
      middleware1();
      await next();
      middleware2();
    });

    reqJSON.use(() => {
      throw new Error('error');
    });

    const resource = reqJSON.resource('/api/item/:id');

    mock.get('/api/item/1', {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
      },
      body: 'Permission denied',
    });

    try {
      await resource.get({
        id: 1,
      });
    } catch (err) {
      expect(err.message).toEqual('error');
    } finally {
      expect(middleware1).toHaveBeenCalled();
      expect(middleware2).toHaveBeenCalledTimes(0);
    }
  });

  it('should support options extend', async () => {
    each([1, 2, 3], id => mock.get(`/api/item/${id}`, (req, res) => {
      expect(req.header('X-Test')).toBe(id);
      return res.status(204);
    }));

    const reqJSON1 = new ReqJSON({
      headers: {
        'X-Test': 1,
      },
    });
    const resource1 = reqJSON1.resource('/api/item/:id');
    await resource1.get(1);

    const reqJSON2 = new ReqJSON({
      headers: {
        'X-Test': 1,
      },
    });
    const resource2 = reqJSON2.resource('/api/item/:id', {
      headers: {
        'X-Test': 2,
      },
    });
    await resource2.get(2);

    const reqJSON3 = new ReqJSON({
      headers: {
        'X-Test': 1,
      },
    });
    const resource3 = reqJSON3.resource('/api/item/:id', {
      headers: {
        'X-Test': 2,
      },
    });
    await resource3.get(3, {
      headers: {
        'X-Test': 3,
      },
    });
  });

  it('should throw error when middleware is not a function', async () => {
    const reqJSON = new ReqJSON();

    try {
      reqJSON.use(1);
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  it('should throw error when next call multiple times', async () => {
    const reqJSON = new ReqJSON();

    reqJSON.use(async (ctx, next) => {
      await next();
      await next();
    });

    const resource = reqJSON.resource('/api/item/:id');
    const body = {
      name: 1,
    };

    mock.get('/api/item/1', {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    try {
      await resource.get({
        id: 1,
      });
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });
});
