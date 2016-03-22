var exercise = require('workshopper-exercise')();

exercise.requireSubmission = false;
exercise.addVerifyProcessor(function (callback) {
	callback(null, true);
});

module.exports = exercise;