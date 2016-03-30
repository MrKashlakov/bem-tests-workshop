# Сложное тестирование взаимодействия с сервером #

## Тестирование AJAX запросов ##

Иногда приходиться тестировать AJAX запросы с клиентской части прилодения на серверную.
Для этого так же можно использовать sinon с возможностью подделывать ответы сервера.

```javascript
var server;

before(function () {
    server = sinon.fakeServer.create();
    /**
     * @param {String} method определяет метод, которым должны быть переданы запросы на сервер
     * @param {String} uri адрес по которому сервер ожидает запросов
     * @param {Object[]} response ответ от сервера
     */
    server.respondWith('POST', 'https://localhost/success-action', [
        200,
        {"Content-Type": "application/json"},
        JSON.stringify({
            status: 'success',
            url: 'https://localhost/success'
        })
    ]);
});

after(function () {
    // Обязательно удаляем поддельный сервер
    server.restore();
});

it("should get success response", function () {
    var callback = sinon.spy();
    form.on('on-ajax-success', callback);
    form.sendAjaxRequest({
        action: 'https://localhost/success-action',
        data: {
            val: 'test'
        }
    });
    // Просим сервер ответить на запрос
    server.respond();
    callback.should.have.been.callCount(1);
    callback.should.have.been.calledWithMatch({}, {
        status: "success",
        url: "https://localhost/success"
    });
});
```

## Тестированеи асинхронного кода ##

При тестировании клинетской части приложения встречаются кейсы, когда событие происходит после определенного промежутка времени, например окончание анимации или различная логика таймаутов.  
Для тестирования такого когда можно использовать sinon и механиз подделки таймеров.

```javascript
function throttle(callback) {
    var timer;
    return function () {
        clearTimeout(timer);
        var args = [].slice.call(arguments);
        timer = setTimeout(function () {
            callback.apply(this, args);
        }, 100);
    };
};
```

```javascript
var clock;
before(function () {
    clock = sinon.useFakeTimers();
});

after(function () {
    clock.restore();
});

it("calls callback after 100ms", function () {
    var callback = sinon.spy();
    var throttled = throttle(callback);

    throttled();

    clock.tick(99);
    callback.should.been.have.notCalled;

    clock.tick(1);
    callback.should.been.have.calledOnce;

    // Будте осторожны, sinon подменяет вообще все что связано с временем в JavaScript
    new Date().getTime().should.to.be.equal(100);
}
```
