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
		depsTech : require('enb-bem-techs').depsOld
	});
};