/**
 * @module form
 */
modules.define('form', ['i-bem__dom'],
	/**
	 * @exports
	 * @class form
	 * @bem
	 */
	function (provide, BEMDOM) {
		provide(BEMDOM.decl(
			{ block: 'form', modName: 'id', modVal: 'spy-and-stub' }, 
			/**
			 * @lends form.prototype
			 */
			{
				onSetMod: {
					js: function () {
						this.__base.apply(this, arguments);

						this.on('xhr-fail', this._onXhrFail, this);
						this.on('xhr-success', this._onXhrSuccess, this);
					}
				},

				/**
				 * Обработчик неудачного ответа от сервера
				 * @private
				 */
				_onXhrFail: function () {
					this._redirectTo('https://localhost/ajax-error');
				},

				/**
				 * Обработчик успешного ответа от сервера
				 * @private
				 */
				_onXhrSuccess: function (e, data) {
					this.emit('success-redirect', data);
					this._redirectTo('https://localhost/ajax-success');
				},

				/**
				 * Перенаправляет пользователя на переданный адрес
				 * @param {String} uri адрес для перенаправления
				 * @private
				 */
				_redirectTo: function(uri) {
					window.location = uri;
				}
			}
		));
	}
);
