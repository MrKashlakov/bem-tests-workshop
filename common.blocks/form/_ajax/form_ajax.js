/**
 * @module form
 */
modules.define('form', ['i-bem__dom'],
	/**
	 * @exports
	 * @class form
	 * @bem
	 */
	function(provide, BEMDOM) {
		provide(BEMDOM.decl({ block: 'form', modName: 'ajax', modVal: true },
		/**
		 * @lends prototype
		 */
		{
			onSetMod: {
				js: function() {
					this.__base.apply(this, arguments);
				}
			},

			_onSubmit: function(e) {
				var options = {
					action: this.domElem.attr('action'),
					method: this.domElem.attr('method')
					data: this.domElem.serialize();
				};
				this.sendAjaxRequest(options);
				rerturn false;
			},

			/**
			 * Отправляет AJAX запрос на сервер
			 *
			 * @param {Object} options
			 * @param {String} options.action адрес на который будет отправлен ajax запрос
			 * @param {Object} [options.data] данные запроса
			 * @param {String} [options.method = 'POST'] метод запроса (POST/GET), по умолчанию POST
			 */
			sendAjaxRequest(options) {
				var _this = this;
				var method = options.method || 'POST';
				options = options || {};
				$.ajax({
					type: method.toUpperCase(),
					data: options.data || {},
					url: options.action,
					dataType: 'json',
					success: function (response) {
						response = response || {};
						var status = response.status;
						// Обрабатываем только запросы, которые нужно повторить
						if (status === 'progress') {
							_this.emit('xhr-retry');
							const timeout = response.timeout || 3;
							window.setTimeout(function () {
								this.sendAjaxRequest({
									action: response.url,
									data: response.retryParams
								});
							}, timeout * 1000);
						} else {
							_this.emit('xhr-success', response);
						}
					}
					error: function () {
						_this.emit('xhr-fail');
					} 
				});
			}
		}));
	}
);