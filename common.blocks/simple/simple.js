/**
 * @module simple
 */
modules.define('simple', ['i-bem__dom'],
	/**
	 * @exports
	 * @class simple
	 * @bem
	 */
	function (provide, BEMDOM) {
		provide(BEMDOM.decl({ block: 'simple' }, /** @lends simple.prototype */ {
			onSetMod: {
				js: function () {
					this.setMod('is-inited', 'yes');
				}
			}
		}));
	}
);
