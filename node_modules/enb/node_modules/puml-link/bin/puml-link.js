#!/usr/bin/env node
var fs = require('fs');

var filename = process.argv[2];
if (fs.existsSync(filename)) {
    console.log(require('../index').generatePumlUrl(fs.readFileSync(filename)));
} else {
    throw new Error('File does not exist: ' + filename);
}
