var exercise = require('workshopper-exercise')();
var path = require('path');
var common = require('../common');
var constants = require('../constants');

var BLOCK_NAME = 'environment-checker'

exercise.requireSubmission = false;
exercise.addVerifyProcessor(function (callback) {
	console.log(constants.CHECK_EXERCISE_MESSAGE);
	var options = {
		baseDir: exercise.workshopper.appDir,
		testCases: [
			{
				enbCommandOption: constants.ENB_TMPL_SPECS_OPTION,
				blockPath: path.join(constants.TMPL_SPECS_FOLDER, BLOCK_NAME),
				errorMessage: 'Среда не готова к тестировнию BEMHTM шаблонов'
			},
			{
				enbCommandOption: constants.ENB_JS_SPECS_OPTION,
				blockPath: path.join(constants.JS_SPECS_FOLDER, BLOCK_NAME),
				commandOptions: constants.JS_COVERAGE_OPTIONS,
				errorMessage: 'Среда не готова к тестированию клиентского JavaScript'
			}
		]
	};

	common.runEnbTestCases(options).then(function () {
		callback(null, true);
	}).fail(function (result) {
		exercise.emit('fail', result.message)
		console.log(result.error);
	});
});

module.exports = exercise;