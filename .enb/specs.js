module.exports = function (config) {
	config.includeConfig('enb-bem-specs');

	var specs = config.module('enb-bem-specs').createConfigurator('specs');
	specs.configure({
		destPath: 'desktop.specs',
		levels: ['common.blocks', 'desktop.blocks'],
		sourceLevels: [
			{ path: 'libs/bem-core/common.blocks', cehck: false },
			{ path: 'libs/bem-pr/spec.blocks', check: false },
			'common.blocks',
			'desktop.blocks'
		],
		jsSuffixes: ['js', 'vanilla.js'],
		scripts: [
			'https://yastatic.net/jquery/1.8.3/jquery.min.js',
			'https://yastatic.net/lodash/2.4.1/lodash.min.js'
		],
	});
};