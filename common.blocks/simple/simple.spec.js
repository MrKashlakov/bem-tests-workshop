modules.define(
	'spec',
	['simple', 'i-bem__dom', 'BEMHTML', 'jquery', 'sinon'],
	function (provide, Simple, BEMDOM, BEMHTML, $, sinon) {
		describe('simple', function () {
			var simple;
			var simpleBemjson = {
				block: 'simple'
			};

			beforeEach(function () {
				simple = BEMDOM.init($(BEMHTML.apply(simpleBemjson)).appendTo('body'))
						.bem('simple');
			});

			afterEach(function () {
				BEMDOM.destruct(simple.domElem);
			});

			it('should has mod', function () {
				simple.hasMod('is-inited', 'yes').should.be.true;
			});
		});
		provide();
	}
);
