# enb-async-require

[![Build Status](https://travis-ci.org/SwinX/enb-async-require.svg)](https://travis-ci.org/SwinX/enb-async-require)

Require files in async manner.

Usage example:

```js
var asyncRequire = require('enb-async-require');

function someAsyncFunc () {
	returm asyncRequire('path/to/module').then(function (module) {
		//do stuff with required module here
	}
}
```
