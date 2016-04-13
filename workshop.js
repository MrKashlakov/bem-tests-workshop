var workshopper = require('workshopper');
var path = require('path');

var menu = require('./exercises/menu');
var name = 'node workshop.js';
var title = 'Написание тестов для БЭМ блоков';
var subtitle = '\x1b[23mВыберите задание и нажмите \x1b[3mEnter\x1b[23m для начала';

workshopper({
	name: name,
	title: title,
	subtitle: subtitle,
	exerciseDir: path.join(__dirname, 'exercises'),
	appDir: __dirname
});
