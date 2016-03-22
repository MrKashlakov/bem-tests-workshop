var exercise = require('workshopper-exercise')();
var path = require('path');
var exec = require('child_process').exec;
var Vow = require('vow');

var BLOCK_NAME = 'environment-checker'
var ENB_COMMAND = 'make';
var ENB_BINARY = path.join('node_modules', '.bin', 'enb');
var ENB_NO_CACHE = '-n';
var CHEK_PARAMS = [
	{
		enbCommandOption: 'tmpl-specs',
		blockPath: path.join('desktop.tmpl-specs', BLOCK_NAME),
		errorMessage: 'Среда не готова к тестировнию BEMHTM шаблонов'
	},
	{
		enbCommandOption: 'specs',
		blockPath: path.join('desktop.specs', BLOCK_NAME),
		errorMessage: 'Среда не готова к тестированию клиентского JavaScript'
	}
];

exercise.requireSubmission = false;
exercise.addVerifyProcessor(function (callback) {
	console.log('Выполняется проверка окружения. Пожалуйста подождите...');
	var baseDir = exercise.workshopper.appDir;
	var enb = path.join(baseDir, ENB_BINARY);
	var executeCommand = function(command, errorMessage) {
		var defer = Vow.defer();
		exec(command, function (err, stdErr, stdOut) {
			if (err) {
				exercise.emit('fail', errorMessage);
				defer.reject(err);
			}
			defer.resolve();
		});
		return defer.promise();
	};
	var commands = [];
	CHEK_PARAMS.forEach(function (item) {
		var command = [enb, ENB_COMMAND, item.enbCommandOption, item.blockPath, ENB_NO_CACHE]
				.join(' ');
		commands.push(executeCommand(command, item.errorMessage));
	});

	Vow.all(commands).then(function () {
		callback(null, true);
	}).fail(function (err) {
		console.log(err);
	});
});

module.exports = exercise;