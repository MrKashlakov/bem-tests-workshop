var path = require('path');

module.exports = {
	/**
	 * Относительный путь до исполняемого файла ENB
	 * @type {String}
	 */
	ENB_BINARY_PATH: path.join('node_modules', '.bin', 'enb'),

	/**
	 * Команда для выполнения сборки
	 * @type {String}
	 */
	ENB_COMMAND: 'make',

	/**
	 * При добавлении этого аргумента, ENB выполняет сборку без кеша
	 * @type {String}
	 */
	ENB_NO_CAHE_ARGUMENT: '-n',

	/**
	 * Опция для enb make позволяющая собирать тесты для BEMHTML шаблонов
	 * @type {String}
	 */
	ENB_TMPL_SPECS_OPTION: 'tmpl-specs',

	/**
	 * Опция для enb make позволяющая собирать тесты для клиентского JavaScript
	 * @type {String}
	 */
	ENB_JS_SPECS_OPTION: 'specs',

	/**
	 * Название папки с результатами сборки тестов для BEMHTML шаблонов
	 * @type {String}
	 */
	TMPL_SPECS_FOLDER: 'desktop.tmpl-specs',

	/**
	 * Название папки с результатми сборки тестов для клиентского JavaScript
	 * @type {String}
	 */
	JS_SPECS_FOLDER: 'desktop.specs',

	/**
	 * Сообщение для проверки залания по умолчанию
	 * @type {String}
	 */
	CHECK_EXERCISE_MESSAGE: 'Выполняется проверка задания. Пожалуйста подождите...'
};