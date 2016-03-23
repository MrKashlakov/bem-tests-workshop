var path = require('path');
var Vow = require('vow');
var exec = require('child_process').exec;
var constants = require('./constants');

/**
 * Запускает набор тесткейсов
 * @param {String} options.baseDir корневая директория приложения
 * @param {Object[]} options.testCases массив тесткейсов
 * @return {Promise}
 */
var runEnbTestCases = function(options) {
	var enb = path.join(options.baseDir, constants.ENB_BINARY_PATH);
	var commands = [];
	var executeEnbCommand = function(command, errorMessage) {
		var defer = Vow.defer();
		exec(command, function (err, stdOut, stdErr) {
			if (err) {
				defer.reject({
					message: errorMessage,
					error: err
				});
			}
			defer.resolve(stdOut);
		});
		return defer.promise();
	};
	options.testCases.forEach(function (item) {
		var command = [
			enb,
			constants.ENB_COMMAND,
			item.enbCommandOption,
			item.blockPath,
			constants.ENB_NO_CAHE_ARGUMENT
		].join(' ');
		commands.push(executeEnbCommand(command, item.errorMessage));
	});

	return Vow.all(commands);
};

/**
 * Проверяет результаты выполнения BEMHTML тестов
 * @param {String} stdOut вывод команды проверки тестов
 * @param {Regex[]} checkers массив проверок
 * @return {Boolean}
 */
var checkBemhtmlTestResult = function(stdOut, checkers) {
	return checkers.every(function (checker) {
		return checker.test(stdOut);
	});
};

module.exports = {
	runEnbTestCases: runEnbTestCases,
	checkBemhtmlTestResult: checkBemhtmlTestResult
};