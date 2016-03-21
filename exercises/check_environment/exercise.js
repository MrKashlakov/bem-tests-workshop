var exercise = require('workshopper-exercise')();
var path = require('path');
var exec = require('child_process').exec;

exercise.requireSubmission = false;
exercise.addVerifyProcessor(function (callback) {
	var commandBinaryPath = path.join(exercise.workshopper.appDir, 'node_modules',
				'.bin', 'enb');
	var command = commandBinaryPath + ' make tmpl-specs';
	exec(command, function(err, stdOut, stdErr) {
		if (err) {
			exercise.emit('fail', 'Workshop развернут не верно или не совместим с операционной системой');
			console.log(err);
			return;
		}

		callback(null, true);
	});
});

module.exports = exercise;