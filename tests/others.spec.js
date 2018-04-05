import ReqJSON from '../dist/req-json.cjs';

describe('req-json others', () => {
  it('should throw error when call as a function', () => {
    expect(() => {
      ReqJSON();
    }).toThrow();
  });
});
