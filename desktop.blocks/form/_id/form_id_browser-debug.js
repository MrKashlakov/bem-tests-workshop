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
			{ block: 'form', modName: 'id', modVal: 'browser-debug' },
			/**
			 * @lends form.prototype
			 */
			{
				onSetMod: {
					js: function () {
						this.__base.apply(this, arguments);
						this.on('beforeSubmit', this._onBeforeSubmit, this);
					}
				},

				/**
				 * Обработчик события до валидации формы
				 * @private
				 */
				_onBeforeSubmit: function (e, data) {
					if (this.params.isValid) {
						this.setMod('is-valid', 'yes');
					}
					// Останавливаем сабмит формы
					e.preventDefault();
				}
			}
		));
	}
);
