module.exports = function (config) {
	config.includeConfig('enb-bem-tmpl-specs');
	var tmplSpecs = config.module('enb-bem-tmpl-specs').createConfigurator('tmpl-specs');

	tmplSpecs.configure({
		destPath: 'desktop.tmpl-specs',
		levels: ['common.blocks', 'desktop.blocks'],
		sourceLevels: [
			{ path: 'libs/bem-components/common.blocks', check: false },
			{ path: 'common.blocks', check: true },
			{ path: 'desktop.blocks', check: true }
		],
		engines: {
			'bemhtml': {
				tech: 'enb-bemxjst/techs/bemhtml',
				options: {
					exportName: 'BEMHTML',
					devMode: false
				}
			}
		}
	})
};