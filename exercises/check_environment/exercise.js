var exercise = require('workshopper-exercise')();
var exec = require('child_preocess').exec;

exercise.requireSubmission = false;
exercise.addVerifyProcessor(function (callback) {
	console.log('Проверям правильность выполнения задания. Пожалуйста подождите...');
	callback(null, true);
});

module.exports = exercise;