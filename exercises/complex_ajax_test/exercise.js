var exercise = require('workshopper-exercise')();
var path = require('path');
var format = require('util').format;
var common = require('../common');
var constants = require('../constants');

exercise.requireSubmission = false;
exercise.addVerifyProcessor(function (callback) {
	console.log(constants.CHECK_EXERCISE_MESSAGE);
	var options = {
		baseDir: exercise.workshopper.appDir,
		testCases: [
			{
				enbCommandOption: constants.ENB_JS_SPECS_OPTION,
				blockPath: path.join(constants.JS_SPECS_FOLDER, 'form_ajax'),
				errorMessage: 'Во время сборки произошла ошибка'
			}
		]
	};

	common.runEnbTestCases(options).then(function () {
		var checkOptions = {
			percent: 100,
			baseDir: exercise.workshopper.appDir,
			testCasePath: 'common.blocks/form/_ajax/form_ajax.js'
		};
		common.checkJsCoverage(checkOptions).then(function (result) {
			console.log(format('Покрыто тестами %d% при минимально возможном покрытии 100%',
				result.currentPercent));
			result.passed ? callback(null, true) : exercise.emit('fail',
				'Процент покрытия не отвечает требованиям задания');
		}).fail(function (err) {
			exercise.fail('fail', 'Во время проверки задания возникла ошибка');
			console.log(err);
		});
	}).fail(function (result) {
		exercise.emit('fail', result.message);
		console.log(result.error);
	});
});

module.exports = exercise;
