# Тестирование BEMHTML шаблона для БЭМ блока #

Задача unit тестирования шаблонов блоков заключается в том, чтобы покрыть всю вариативность блока минимальным колическтовм эталонных файлов.

## файловая структура ##

Тесты для BEMHTML шаблонов кладутся в папку ```<block-name>.tmpl-specs```. Файл с исходным BEMJSON имеет расширение ```bemjson.js```, файл с эталонным HTML - ```html```.
### Пример файловой структуры ###
Пример файловой структуры для блока ```form```:
```
form
+-- __control
|	+-- form__control.bemhtml.js
+-- form.bemhtml.js
+-- form.tmpl-specs
	+-- 10-empty.bemjson.js
	+-- 10-empty.html
	+-- 20-simple.bemjson.js
	+-- 20-simple.html
```
Чтобы протестировать модификатор который находиться на другом уровне, нужно добавть тесты в папку с этим модификатором:

```
form
+-- _id
	+-- form_id_my-form.bemhtml.js
	+-- form_id_my-form.tmpl-specs
		+-- 10-empty.bemjson.js
		+-- 10-empty.html
```

## Зависимости ##
Для того чтобы тестировать BEMHTML шаблоны, необходимо добавить в ```<block-name>.deps.js``` следующие зависимости:

Зависимость от блока ```i-bem``` и его элемента ```html```
```javascript
{
	mustDeps: { block: 'i-bem', elems: ['html'] }
}
```
Зависимость от самого себя. Нужна только для сборки тестов, что бы BEMHTML тестируемого блока попал в сборку:

```javascript
{
	tech: 'tmpl-spec.js',
	mustDeps: { tech: 'bemhtml', block: 'block-name' }
}
```
В результате файл с зависимостями должен выглядеть следующим образом:

```javascript
[
	{
		// Зависимость от i-bem
		mustDeps: { block: 'i-bem', elems: ['html'] }
		// так же тут могут находиться другие общие зависимости блока
	},
	{
		// Зависимости которые нужны только для тестов
		tech: 'tmpl-spec.js',
		mustDeps: { tech: 'bemhtml', block: 'block-name' }
		// Если тестируется интеграция разных модификаторов или один модификтор, их нужно перечислить тут
	}
]
```

## Правила именования тест кейсов
* Поведение блока по умолчанию, когда у него нет ни каких полей ктроме block рекомендуется называть 10-empty;
* Рекомендуемаое поведение блока (с минимально необходимым набором полей для реального использования) рекомендуется называть 20-simple;
* Расширенный набор полей (все возмжные поля и параметры блока) рекомендуется называть 30-extended;
* Для каждого модификатора нужен отдельный файл 50-disabled и далее 60-pseudo, интеграционный тест двух модификаторов рекомендуется называть 55-disables-pseudo.

## Запуск тестов
В общем случае запуск всех тестов происходит через команду ```enb make tmpl-specs```.
Если нужно запустить тест для конкретного блока, можно воспользваться командой ```enb make tmpl-specs ./<level>.tmpl-specs/<block-name>```. 
Где ```level``` это уровень переопределения (desktop, touch-phone), а ```block-name``` - названеи блока.
Если тестируется блок с модификатором то можно указать так: ```block-name_modName_modVal```.

## Задача
Напишите тесты шаблонов для блока ```form``` на всех уровнях переопределенеия.
