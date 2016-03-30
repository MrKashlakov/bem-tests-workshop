'use strict';
var path = require('path');
var fs = require('fs');

console.log('Patching borschik...');
var borschikOriginalUtil = path.join(__dirname, 'node_modules', 'enb-bem-specs', 'node_modules',
		'enb-borschik', 'node_modules', 'borschik', 'lib', 'util.js');
var borschikPatchedUtil = path.join(__dirname, 'borschik-patch', 'util.js');
fs.createReadStream(borschikPatchedUtil).pipe(fs.createWriteStream(borschikOriginalUtil));
console.log('Patching done');
