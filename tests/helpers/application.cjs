const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const assert = require('node:assert/strict');
const { parse } = require('acorn');

// Parse the shipped bundle, not an alternate implementation of the application.
// AST ranges handle braces in strings, comments and template literals correctly.
const source = readFileSync(join(__dirname, '../../app.js'), 'utf8');
const functions = new Map();
const declarations = new Map();
function visit(node) {
  if (!node || typeof node !== 'object') return;
  if (node.type === 'FunctionDeclaration' && !functions.has(node.id.name)) {
    functions.set(node.id.name, node);
  }
  if (node.type === 'VariableDeclaration') {
    for (const declaration of node.declarations) {
      if (declaration.id.type === 'Identifier' && !declarations.has(declaration.id.name)) {
        declarations.set(declaration.id.name, node);
      }
    }
  }
  for (const [key, value] of Object.entries(node)) {
    if (key === 'start' || key === 'end') continue;
    if (Array.isArray(value)) value.forEach(visit);
    else if (value && typeof value === 'object') visit(value);
  }
}
visit(parse(source, { ecmaVersion: 'latest' }));
exports.functionSource = (name) => {
  assert(functions.has(name), `Missing application function: ${name}`);
  const node = functions.get(name);
  return source.slice(node.start, node.end);
};
exports.declarationRange = (first, next) => {
  assert(declarations.has(first) && declarations.has(next), 'Missing fixture declarations');
  const start = declarations.get(first).start;
  const end = declarations.get(next).start;
  assert(start < end, `Invalid fixture range: ${first} to ${next}`);
  return source.slice(start, end);
};
exports.declarationSource = (name) => {
  assert(declarations.has(name), `Missing application declaration: ${name}`);
  const node = declarations.get(name);
  return source.slice(node.start, node.end);
};
