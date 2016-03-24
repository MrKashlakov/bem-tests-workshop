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
		provide(BEMDOM.decl({block: this.name, modName: 'id', modVal: 'spy-and-stub'}, 
		/**
		 * @lend form.prototype
		 */
		{
			onSetMod: {
				js: function () {
					this._bInput = this.findBlockInside('input');
				}
			},

			/**
			 * Перенаправляет пользователя на переданный адрес
			 * @param {String} uri адрес для перенаправления
			 */
			this._redirectTo: function(uri) {
				window.location = uri;
			}
		}));
	}
)