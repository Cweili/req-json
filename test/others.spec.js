import ReqJSON from '..';

describe('req-json others', () => {
  it('should throw error when call as a function', () => {
    expect(() => {
      ReqJSON();
    }).toThrow();
  });
});
