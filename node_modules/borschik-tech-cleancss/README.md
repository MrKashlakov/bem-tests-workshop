# Borschik CSS tech based on CleanCSS
[![NPM version](https://badge.fury.io/js/borschik-tech-cleancss.png)](http://badge.fury.io/js/borschik-tech-cleancss)
[![Dependency Status](https://david-dm.org/doochik/borschik-tech-cleancss.png)](https://david-dm.org/doochik/borschik-tech-cleancss)

[CleanCSS](https://github.com/GoalSmashers/clean-css) based plugin to build CSS files with [borschik](https://github.com/bem/borschik).

## Installation
```sh
$ npm install borschik borschik-tech-cleancss
```
## Usage
```sh
$ ./node_modules/.bin/borschik -t cleancss -i test.css
```

Default CleanCSS options is
```json
{
    "noRebase": false,
    "processImport": false
}
```

You can extend it with `--tech-options`
```sh
$ ./node_modules/.bin/borschik -t cleancss -i test.css --tech-options='{"cleancss":{"noAdvanced":true,"compatibility":true}}'
```

