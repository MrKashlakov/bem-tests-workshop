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
		provide(BEMDOM.decl(this.name, /** @lends form.prototype */ {
			onSetMod: {
				js: function () {
					this.bindTo('submit', this._onSubmit);
				}
			},

			/**
			 * Обработчик события сабмита формы
			 * @param  {Object} e DOM событие
			 * @private
			 */
			_onSubmit: function(e) {
				var isFormValid = this.params.isValid;
				this.emit('beforeSubmit', {
					originalEvent: e
				});

				if (e.isDefaultPrevented()) {
					return false;
				}

				if (!isFormValid) {
					return false;
				}

				this.emit('submit');
				return true;
			}
		}));
	}
);