import { shouldTraverseExternalIds, isExcluded } from '../validators';

describe('preval-extract/validators', () => {
  describe('shouldTraverseExternalIds', () => {
    it('should return false if path is a import specifier', () => {
      expect(
        shouldTraverseExternalIds({ isImportDefaultSpecifier: () => true })
      ).toBeFalsy();
      expect(
        shouldTraverseExternalIds({
          isImportDefaultSpecifier: () => false,
          isImportSpecifier: () => true,
        })
      ).toBeFalsy();
    });

    it('should return true if path is not an import specifier', () => {
      expect(
        shouldTraverseExternalIds({
          isImportDefaultSpecifier: () => false,
          isImportSpecifier: () => false,
        })
      ).toBeTruthy();
    });
  });

  describe('isExcluded', () => {
    it('should return false if path has non-param binding', () => {
      expect(
        isExcluded({
          node: { name: 'test' },
          scope: {
            getBinding() {
              return {
                kind: 'module',
              };
            },
          },
        })
      ).toBeFalsy();
    });

    it('should return true if path has param binding', () => {
      expect(
        isExcluded({
          node: { name: 'test' },
          scope: {
            getBinding() {
              return {
                kind: 'param',
              };
            },
          },
        })
      ).toBeTruthy();
    });
  });
});
