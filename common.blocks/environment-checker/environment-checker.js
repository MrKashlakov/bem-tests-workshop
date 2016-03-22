/**
 * @module environment-checker
 */
modules.define('environment-checker', ['i-bem__dom'],
	/**
	 * @exports
	 * @class environment-checker
	 * @bem
	 */
	function (provide, BEMDOM) {
		provide(BEMDOM.decl(this.name, /** @lends environment-checker.prototype */ {
			onSetMod: {
				js: function () {
					this.setMod('cheked', 'yes');
				}
			}
		}));
	}
);