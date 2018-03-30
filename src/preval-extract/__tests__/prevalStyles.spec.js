import * as babel from 'babel-core';
import prevalStyles from '../prevalStyles';
import getReplacement from '../getReplacement';
import {
  instantiateModule,
  clearLocalModulesFromCache,
} from '../../lib/moduleSystem';

jest.mock('../getReplacement');
jest.mock('../../lib/moduleSystem', () => ({
  clearLocalModulesFromCache: jest.fn(),
  instantiateModule: jest.fn(() => ({ exports: 'header__abc123' })),
}));

function runAssertions(
  expectedReplacement,
  source = 'css`color: #ffffff`',
  options = {}
) {
  const path = {
    node: {
      loc: {
        start: { line: 5, column: 0 },
      },
    },
    parent: {
      id: {
        name: 'header',
      },
    },
    parentPath: {
      node: {
        init: null,
      },
    },
    getSource() {
      return source;
    },
    findParent() {
      return this.parentPath;
    },
    scope: {
      generateUidIdentifier: name => ({
        name,
      }),
    },
  };

  const babelToken = prevalStyles(
    babel,
    'header',
    path,
    { filename: 'test.js', opts: options },
    []
  );
  expect(getReplacement).toHaveBeenCalled();
  expect(getReplacement.mock.calls[0][0][0].code).toMatch(expectedReplacement);
  expect(clearLocalModulesFromCache).toHaveBeenCalled();
  expect(instantiateModule).toHaveBeenCalled();

  return babelToken;
}

function clearMocks() {
  getReplacement.mockClear();
  instantiateModule.mockClear();
  clearLocalModulesFromCache.mockClear();
}

describe('preval-extract/prevalStyles', () => {
  beforeEach(clearMocks);

  it('should eval styles and replace css with class name from content', () => {
    runAssertions("css.named('header', 'test.js')`color: #ffffff`");
  });

  it('should eval styles and append filename if used with css.named', () => {
    runAssertions(
      "css.named('header', 'test.js')`color: #ffffff`",
      "css.named('header')`color: #ffffff`"
    );

    clearMocks();

    runAssertions(
      "css.named('header', 'filename.js')`color: #ffffff`",
      "css.named('header', 'filename.js')`color: #ffffff`"
    );
  });

  it('should return minified className', () => {
    const { value: className } = runAssertions(
      "css.named('header', 'test.js')`color: #ffffff`",
      'css`color: #ffffff`',
      {
        minifyClassnames: true,
      }
    );

    expect(/ln[a-zA-Z0-9]{6}/.test(className)).toBeTruthy();
  });
});
