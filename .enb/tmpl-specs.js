module.exports = function (config) {
	config.includeConfig('enb-bem-tmpl-specs');
	var tmplSpecs = config.module('enb-bem-tmpl-specs').createConfigurator('tmpl-specs');

	tmplSpecs.configure({
		destPath: 'desktop.tmpl-specs',
		levels: ['common.blocks', 'desktop.blocks'],
		sourceLevels: [
			{ path: './libs/bem-components/common.blocks', check: false },
			'common.blocks',
			'desktop.blocks'
		],
		engines: {
			bemhtml: {
				tech: 'enb-bemxjst/techs/bemhtml',
				options: { sourceSuffixes: ['bemhtml', 'bemhtml.js'] }
			}
		}
	})
};