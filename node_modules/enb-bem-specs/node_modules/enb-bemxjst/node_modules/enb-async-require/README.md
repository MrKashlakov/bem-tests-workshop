# enb-async-require

[![Build Status](https://travis-ci.org/enb-make/enb-async-require.svg)](https://travis-ci.org/enb-make/enb-async-require)
[![Build status](https://ci.appveyor.com/api/projects/status/h2xmrbnc7mw4owwm?svg=true)](https://ci.appveyor.com/project/SwinX/enb-async-require)

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
