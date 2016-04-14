# enb-require-or-eval

[![Build Status](https://travis-ci.org/enb-make/enb-require-or-eval.svg)](https://travis-ci.org/enb-make/enb-require-or-eval)
[![Build status](https://ci.appveyor.com/api/projects/status/e70sj2xly3krnde4?svg=true)](https://ci.appveyor.com/project/SwinX/enb-require-or-eval)

Module, which assists in supporting transitional (from 'eval' to 'require') BEM formats.

Usage:

```js
var requireOrEval = require('enb-require-or-eval');

function someEvalingFunc() {
	return requireOrEval('path/to/bemjson.js').then(function (result) {
		//process result here
	}
}
```
