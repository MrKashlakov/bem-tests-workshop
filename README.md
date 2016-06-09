# bem-tests-workshop 

Пошаговый мастер-класс по написанию unit тестов для БЭМ блоков.

## Установка и запуск ##

* Склонируйте этот репозиторий;
* Запустите `npm install` внутри него, для установки всех зависимостей. Если у вас npm версии 3 или выше используйте команду `npm install --legacy-bundling`;
* Запустите `bower install` для установки оставшихся зависимостей. Если у вас bower не установлен глобально, запустите `./node_modules/.bin/bower install`, для пользователей Windows `.\node_modules\.bin\bower install`;
* Выполните команду `node workshop.js` для начала работы.


Если, во время установки зависимостей, npm падает с ошибкой, следует:

* Удалить поле scripts из package.json:
```
  "scripts": {
    "postinstall": "node postinstall.js"
  },
```
* Заново установить зависимости.
* Вручную выполнить скрипт - `node postintall.js`
