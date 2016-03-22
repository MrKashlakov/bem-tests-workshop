/**
 * @module form
 */
modules.define(
	'form',
	['i-bem__dom'],
	/**
	 * @exports
	 * @class form
	 * @bem
	 */
	function(provide, BEMDOM) {
		provide(BEMDOM.decl({ block: this.name }, /** @lends form.prototype */ {
			onSetMod: {
				js: function () {
					this.setMod('check', 'yes');
				}
			}
		}));
	}
);