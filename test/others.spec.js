import ReqJSON from '../index';

describe('req-json others', () => {
  it('should throw error when call as a function', () => {
    expect(() => {
      ReqJSON();
    }).toThrow();
  });
});
