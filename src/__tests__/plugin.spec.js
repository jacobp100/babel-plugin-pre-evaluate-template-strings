import { transform } from 'babel-core';

test('Without tag', () => {
  const { code } = transform(
    `
    const world = "world";
    const test = \`
      hello \${world}
    \`
  `,
    {
      plugins: [require.resolve('..')],
      babelrc: false,
    }
  );

  expect(code).toMatchSnapshot();
});

test('With tag', () => {
  const { code } = transform(
    `
    const world = "world";
    const test = someTag\`
      hello \${world}
    \`
  `,
    {
      plugins: [require.resolve('..')],
      babelrc: false,
    }
  );

  expect(code).toMatchSnapshot();
});
