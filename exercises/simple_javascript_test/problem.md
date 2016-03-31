# Unit тестирование клиентского JavaScript кода #

Основной задачей unit тестирования клиентского JavaScript кода является обеспечение работоспособности клиентского кода блока перед тем как он будет использован пользователем. При этом в ходе unit тестирования решаются следующие основные проблемы:

* Сложность рефакторинга;
* Добавление новой функциональности в код;
* Скорость устранения неисправностей в коде;
* Несоответсвие кода заявленным требованиям.

## Файловая структура ##
Тесты для клиентского JavaScript кода находятся в той же папке что и тестируемый код. Файл с тестами имеет расширение ```<block-name>.spec.js```.

Пример файловой структуры для ```form```:

```
form
+-- __control
|	+-- _awsome-control
|		+-- form__control_awsome-control.js
|		+-- form__control_awsome-control.spec.js
+-- _ajax
|	+-- form_ajax.js
|	+-- form_ajax.spec.js
+-- form.js
+-- form.spec.js
```

## Зависимости ##
Для того что бы тестировать клиентский код необходимо добавить в ```<block-name.deps.js>``` следующие зависимости:

Зависимость от блока ```i-bem``` и его элемента ```dom```
```javascript
{
	mustDeps: { block: 'i-bem', elems: ['dom'] }
}
```
Зависимость от самого себя. Нужна только для сборки тестов, что бы BEMHTML тестируемого блока попал в сборку:

```javascript
{
	tech: 'spec.js',
	mustDeps: { tech: 'bemhtml', block: 'block-name' }
}
```
В результате файл с зависимостями должен выглядеть следующим образом:

```javascript
[
	{
		// Зависимость от i-bem
		mustDeps: { block: 'i-bem', elems: ['dom'] }
		// так же тут могут находиться другие общие зависимости блока
	},
	{
		// Зависимости которые нужны только для тестов
		tech: 'spec.js',
		mustDeps: { tech: 'bemhtml', block: 'block-name' }
		// Если тестируется интеграция разных модификаторов или один модификтор, их нужно перечислить тут
	}
]
```
## Запуск тестов ##
В общем случае запуск всех тестов происходит через команду ```enb make specs```
Если нужно запустить тест для конкретного блока, можно воспользваться командой ```enb make specs ./<level>.specs/<block-name>```.
Где ```level``` это уровень переопределения (desktop, touch-phone), а ```block-name``` - названеи блока.
Если тестируется блок с модификатором то можно указать так: ```block-name_modName_modVal```.

## Структура spec.js файла ##

```javascript
// Определяем модуль c unit тестами
modules.define(
	'spec',
	/**
	 * Для тестирования понадобятся следующие зависимости:
	 * block-name - тестируемый блок 
	 * i-bem__dom - BEMDOM для работы с DOM деревом в терминах БЭМ
	 * BEMHTML - нужен для рендеринга блока на страницу с тестами
	 * jquery - нужен для различных манипуляций с DOM деревом, в общем без него никуда
	 * sinon - основная утилита для тестирования (подробнее в следующих разделах)
	 */
	['block-name', 'i-bem__dom', 'BEMHTML', 'jquery', 'sinon'],
	function (provide, BlockName, BEMDOM, BEMHTML, $, sinon) {
		describe('block-name', function () {
			var blockName;
			beforeEach(function () {
				// Перед началом каждого теста нужно создавать блок на странице
				var blockNameBemjson = {
					block: 'block-name'
				};
				blockName = BEMDOM.init($(BEMHTML.apply(blockNameBemjson)).appendTo('body'))
						.bem('block-name');
			});

			// После каждого теста нужно удалить блок
			afterEach(function () {
				BEMDOM.destruct(blockName.domElem);
			});

			it('should be awsome', function () {
				// Код тесткейса
			});
		});

		provide();
	}
);
```

## Задача ##

Добейтесеь 100% покрытия тестами кода блока ```simple```.

* Модификатор должен устанавливаться
