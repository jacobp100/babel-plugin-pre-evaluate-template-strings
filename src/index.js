/* @flow */

import type {
  BabelCore,
  NodePath,
  BabelIdentifier,
  RequirementSource,
} from './types';

import {
  shouldTraverseExternalIds,
  isExcluded,
} from './preval-extract/validators';
import { getSelfBinding, relativeToCwd } from './preval-extract/utils';
import prevalStyles from './preval-extract/prevalStyles';
import resolveSource from './preval-extract/resolveSource';

export const externalRequirementsVisitor = {
  Identifier(path: NodePath<BabelIdentifier>) {
    if (path.isReferenced() && getSelfBinding(path) && !isExcluded(path)) {
      const source: ?RequirementSource = resolveSource(this.types, path);
      if (
        source &&
        !this.requirements.find(item => item.code === source.code)
      ) {
        this.requirements.splice(this.addBeforeIndex, 0, source);
        const binding = getSelfBinding(path);
        if (shouldTraverseExternalIds(binding.path)) {
          binding.path.traverse(externalRequirementsVisitor, this);
        }
      }
    }
  },
};

export const cssTaggedTemplateRequirementsVisitor = {
  Identifier(path: NodePath<BabelIdentifier>) {
    if (path.isReferenced() && !isExcluded(path)) {
      const source: ?RequirementSource = resolveSource(this.types, path);
      if (
        source &&
        !this.requirements.find(item => item.code === source.code)
      ) {
        this.requirements.push(source);
        this.addBeforeIndex = this.requirements.length - 1;
        const binding = getSelfBinding(path);
        if (shouldTraverseExternalIds(binding.path)) {
          binding.path.traverse(externalRequirementsVisitor, this);
        }
      }
    }
  },
};

const resolveTemplateLiteral = (babel, path, state, title = 'NOT USED') => {
  const requirements: RequirementSource[] = [];

  path.traverse(cssTaggedTemplateRequirementsVisitor, {
    requirements,
    types: babel.types,
  });

  return prevalStyles(babel, title, path, state, requirements);
};

export default (babel: BabelCore) => ({
  visitor: {
    TemplateLiteral(path: NodePath<any>, state: State) {
      state.filename = relativeToCwd(state.file.opts.filename);
      const resolvedString = resolveTemplateLiteral(babel, path, state);
      path.replaceWith(
        babel.types.templateLiteral(
          [babel.types.templateElement({ raw: resolvedString })],
          []
        )
      );
      path.stop();
    },
  },
});
