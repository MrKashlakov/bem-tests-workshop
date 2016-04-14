var compat = exports;
var esprima = require('esprima');
var ometajs = null;
var BEMHTMLParser = null;
var BEMHTMLToXJST = null;
var XJSTToJS = null;

function lazyLoad() {
  ometajs = require('ometajs');
  BEMHTMLParser = require('./ometa/bemhtml').BEMHTMLParser;
  BEMHTMLToXJST = require('./ometa/bemhtml').BEMHTMLToXJST;
  XJSTToJS = require('./ometa/bemhtml').XJSTToJS;
}

// Parse old bemhtml source
compat.parse = function parse(source) {
  lazyLoad();
  return BEMHTMLParser.matchAll(source, 'topLevel');
};

// Translate old ast to new ast
compat.translate = function translate(ast) {
  lazyLoad();
  ast = BEMHTMLToXJST.match(ast, 'topLevel');
  var out = XJSTToJS.match(ast, 'topLevel');
  return esprima.parse(out);
};

// Transpile old source to new source
compat.transpile = function transpile(source) {
  // If code is ECMAScript compatible - there is no need to use ometajs
  try {
    if (esprima.parse(source)) return source;
  } catch (e) {
  }

  lazyLoad();
  var ast = compat.parse(source);
  ast = BEMHTMLToXJST.match(ast, 'topLevel');
  return XJSTToJS.match(ast, 'topLevel');
};
