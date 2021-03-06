/**
 * This file is a babel preset used to transform files inside evaluators.
 * It works the same as main `babel/extract` preset, but do not evaluate lazy dependencies.
 */
import { NodePath } from '@babel/traverse';
import { types } from '@babel/core';
import GenerateClassNames from '../visitors/GenerateClassNames';
import DetectStyledImportName from '../visitors/DetectStyledImportName';
import JSXElement from './visitors/JSXElement';
import ProcessStyled from './visitors/ProcessStyled';
import ProcessCSS from './visitors/ProcessCSS';
import { State, StrictOptions } from '../types';

function preeval(_babel: any, options: StrictOptions) {
  return {
    visitor: {
      Program: {
        enter(path: NodePath<types.Program>, state: State) {
          // Collect all the style rules from the styles we encounter
          state.queue = [];
          state.rules = {};
          state.index = -1;
          state.dependencies = [];
          state.replacements = [];

          // We need our transforms to run before anything else
          // So we traverse here instead of a in a visitor
          path.traverse({
            ImportDeclaration: p => DetectStyledImportName(p, state),
            TaggedTemplateExpression: p =>
              GenerateClassNames(p, state, options),
            JSXElement,
          });
        },
      },
      CallExpression: ProcessStyled,
      TaggedTemplateExpression: ProcessCSS, // TaggedTemplateExpression is processed before CallExpression
    },
  };
}

export default function preset(context: any, options: StrictOptions) {
  return {
    plugins: [[preeval, options]],
  };
}
