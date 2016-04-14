/* begin: ../../common.blocks/environment-checker/environment-checker.spec.js */
modules.define(
	'spec',
	['environment-checker', 'i-bem__dom', 'BEMHTML', 'jquery'],
	function (provide, Checker, BEMDOM, BEMHTML, $) {
		describe('environment-checker', function () {
			var checker;

			beforeEach(function () {
				var checkerBemjson = {
					block: 'environment-checker'
				};

				checker = BEMDOM.init($(BEMHTML.apply(checkerBemjson)).appendTo('body'))
						.bem('environment-checker');
			});

			afterEach(function () {
				BEMDOM.destruct(checker.domElem);
			});

			it('should check test environment', function () {
				checker.hasMod('cheked', 'yes').should.be.true;
			});
		});

		provide();
	}
);
/* end: ../../common.blocks/environment-checker/environment-checker.spec.js */
