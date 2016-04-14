borschik-tech-istanbul
======================

Tech module for [borschik](http://github.com/bem/borschik) that instruments js files on include
using [istanbul](https://github.com/gotwarlost/istanbul).

Usage
-----

First you should install `borschik` and this module into your project and save it into `package.json`

    npm install borschik borschik-tech-istanbul --save

Then you could run `borschik`

    node_modules/.bin/borschik --tech istanbul --input your.js --output your.min.js
    
**Options**

You can specify the `instrumentPaths` option to control which includes should be instrumented and
which should not. If this option is not specified then all includes will be instrumented. You can
pass an array of strings there - base paths for the includes to instrument. For example:

```
node_modules/.bin/borschik --tech istanbul --input your.js --output your.min.js --techOptions "{instrumentPaths: ['./js']}"
```
In this case the include files within `./js` folder tree will be instrumented.
Any other file will not. The relative paths resolve relative to the currrent
working directory. The absolute paths are allowed too.


License
-------

See [MIT](LICENSE) LICENSE.
