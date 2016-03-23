var path = require('path');
var Vow = require('vow');
var Istanbul = require('istanbul');
var exec = require('child_process').exec;
var constants = require('./constants');

/**
 * Запускает набор тесткейсов
 * @param {String} options.baseDir корневая директория приложения
 * @param {Object[]} options.testCases массив тесткейсов
 * @return {Promise}
 */
var runEnbTestCases = function(options) {
	process.env['ISTANBUL_COVERAGE'] = 'yes';
	var enb = path.join(options.baseDir, constants.ENB_BINARY_PATH);
	var commands = [];
	var executeEnbCommand = function(command, commandOptions, errorMessage) {
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

/**
 * Проверяет результат покрытия JavaScript тестов
 * @param {Object} options настройки
 * @param {Number} options.percent необходимый процент покрытия
 * @param {String} options.baseDir корневая папка приложения
 * @param {String} options.testCasePath относительный путь до тесткейса
 * @return {Boolean}
 */
var checkJsCoverage = function (options) {
	var defer = Vow.defer();
	var collector = new Istanbul.Collector();
	var reporter = new Istanbul.Reporter();
	try {
		var coverage = require(path.join(options.baseDir, 'coverage.json'));
		collector.add(coverage);
		reporter.add('json-summary');
		reporter.write(collector, false, function () {
			var summaryReport = require(path.join(options.baseDir, 'coverage', 'coverage-summary.json'));
			var blockResults = summaryReport[options.testCasePath] || {};
			defer.resolve({
				passed: blockResults.lines.pct >= options.percent,
				currentPercent: blockResults.lines.pct
			});
		});
	} catch (err) {
		defer.reject(err);
	}
	return defer.promise();
};

module.exports = {
	runEnbTestCases: runEnbTestCases,
	checkBemhtmlTestResult: checkBemhtmlTestResult,
	checkJsCoverage: checkJsCoverage
};