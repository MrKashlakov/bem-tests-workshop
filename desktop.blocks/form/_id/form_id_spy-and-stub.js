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
						this._bInput = this.findBlockInside('input');
						console.log('LOG:');
					}
				},

				/**
				 * Перенаправляет пользователя на переданный адрес
				 * @param {String} uri адрес для перенаправления
				 */
				_redirectTo: function(uri) {
					window.location = uri;
				}

			}
		));
	}
);