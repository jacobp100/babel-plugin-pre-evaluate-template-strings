import fs from 'fs';
import { transform } from 'babel-core';

jest.mock('fs');

const plugin = input =>
  transform(input, {
    plugins: [require.resolve('..')],
    babelrc: false,
  }).code;

test('Without tag', () => {
  const code = plugin`
    const world = "world";
    const test = \`
      hello \${world}
    \`
  `;

  expect(code).toMatchSnapshot();
});

test('With tag', () => {
  const code = plugin`
    const world = "world";
    const test = someTag\`
      hello \${world}
    \`
  `;

  expect(code).toMatchSnapshot();
});

test('With external file', () => {
  fs.readFileSync.mockReturnValue(`export default "world";`);

  const code = plugin`
    import world from "/world";
    const test = someTag\`
      hello \${world}
    \`
  `;

  expect(code).toMatchSnapshot();
  expect(fs.readFileSync).toBeCalledWith('/world', 'utf-8');
});

test('With multiple external files', () => {
  fs.readFileSync.mockReturnValueOnce(`
      export { world as default } from "/dictionary";
    `).mockReturnValueOnce(`
      export const world = "world";
    `);

  const code = plugin`
    import world from "/world";

    const test = someTag\`
      hello \${world}
    \`
  `;

  expect(code).toMatchSnapshot();
  expect(fs.readFileSync).toBeCalledWith('/world', 'utf-8');
  expect(fs.readFileSync).toHaveBeenLastCalledWith('/dictionary', 'utf-8');
});
