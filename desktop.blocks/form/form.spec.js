modules.define(
	'spec',
	['form', 'i-bem__dom', 'BEMHTML', 'jquery'],
	function (provide, Form, BEMDOM, BEMHTML, $) {
		describe('form', function () {
			var form;

			beforeEach(function () {
				form = BEMDOM.init($(BEMHTML.apply({block: 'form'})).appendTo('body'))
						.bem('form');
			});

			afterEach(function () {
				BEMDOM.destruct(form.domElem);
			});

			it('should initet successful', function () {
				form.should.be.ok;
				form.hasMod('is-inited', 'yes').should.be.true;
			});
		});

		provide();
	}
);