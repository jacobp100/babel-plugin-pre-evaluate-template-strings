/* @flow */
import type { NodePath, BabelTypes, RequirementSource } from '../types';

import { getSelfBinding } from './utils';

export default function resolveSource(
  types: BabelTypes,
  path: NodePath<*>
): ?RequirementSource {
  if (
    [
      'module',
      'global',
      '__dirname',
      '__filename',
      'exports',
      'require',
    ].includes(path.node.name)
  ) {
    return null;
  }

  const binding = getSelfBinding(path);

  if (!binding) {
    throw path.buildCodeFrameError(
      'Linaria css evaluation error:\n' +
        `  Could not find a reference to '${path.node.name}'.\n` +
        '  This might happen if you used some undeclared variable/function or a browser specific API.\n'
    );
  }

  let code: ?string;

  switch (binding.kind) {
    case 'module':
      code = binding.path.parentPath.getSource();
      break;
    case 'const':
    case 'let':
    case 'var':
      code =
        binding.path.getSource().length === 0
          ? null
          : `${binding.kind} ${binding.path.getSource()}`;
      break;
    default:
      code = binding.path.getSource();
      break;
  }

  if (!binding.path.node.loc || !code) {
    return null;
  }

  return {
    code,
    loc: binding.path.node.loc.start,
  };
}
