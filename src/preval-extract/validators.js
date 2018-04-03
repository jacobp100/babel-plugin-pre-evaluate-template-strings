/* @flow */

import type { NodePath } from '../types';

import { getSelfBinding } from './utils';

export function shouldTraverseExternalIds(path: NodePath<any>) {
  if (path.isImportDefaultSpecifier() || path.isImportSpecifier()) {
    return false;
  }

  return true;
}

export function isExcluded(path: NodePath<*>): boolean {
  const binding = getSelfBinding(path);
  return binding && binding.kind === 'param';
}
