import resource from './resource';

it('method GET', async() => {
  const data = await resource.get('1');
  expect(data).toEqual({
    name: 1
  });
});
