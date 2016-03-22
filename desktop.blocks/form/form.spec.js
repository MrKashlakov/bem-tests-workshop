modules.define(
	'spec',
	['form', 'i-bem__dom', 'BEMHTML', 'jquery'],
	function(provide, Form, BEMDOM, BEMHTML, $) {

describe('button', function() {
	var form;
	beforeEach(function() {
		form = BEMDOM.init($(BEMHTML.apply({ block: 'form'})).appendTo('body'))
			.bem('form');
	});

	afterEach(function() {
		BEMDOM.destruct(form.domElem);
	});

	it('should inited sucessful', function() {
		form.hasMod('check', 'yes').should.be.true;
	});
});

provide();

});