var exercise = require('workshopper-exercise')();
var path = require('path');
var common = require('../common');
var constants = require('../constants');

exercise.requireSubmission = false;
exercise.addVerifyProcessor(function (callback) {
	console.log(constants.CHECK_EXERCISE_MESSAGE);
	var options = {
		baseDir: exercise.workshopper.appDir,
		testCases: [
			{
				enbCommandOption: constants.ENB_TMPL_SPECS_OPTION,
				blockPath: path.join(constants.TMPL_SPECS_FOLDER, 'form'),
				errorMessage: 'Во время сборки произошла ошибка'
			}
		]
	};

	common.runEnbTestCases(options).then(function (stdOut) {
		var checkers = [
			/should be equal .*10-empty.* by bemhtml/
		];
		var checkResult = common.checkBemhtmlTestResult(stdOut, checkers);
		if (checkResult) {
			callback(null, true);
			return;
		}
		exercise.emit('fail', 'Обязательные тесты для блока не найдены');
	}).fail(function (result) {
		exercise.emit('fail', result.message)
		console.log(result.error);
	});
});

module.exports = exercise;