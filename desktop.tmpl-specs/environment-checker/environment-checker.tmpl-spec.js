var assert = require('assert'),
    path = require('path'),

    clearRequire = require('./../../node_modules/enb-bem-tmpl-specs/node_modules/clear-require/index.js'),
    HtmlDiffer = require('./../../node_modules/enb-bem-tmpl-specs/node_modules/html-differ/lib/index.js').HtmlDiffer,
    htmlDiffer = new HtmlDiffer({"preset":"bem"}),
    referencesFilename = require.resolve('./environment-checker.references.js');

describe('environment-checker (desktop.tmpl-specs)', function() {
    var engines = {},
        references;

    beforeEach(function () {
        // reload references
        clearRequire(referencesFilename);
        references = require(referencesFilename);
    });


    //
    // no langs mode
    //

    beforeEach(function () {
        // reload engines artifacts
        engines = {};
        clearRequire(require.resolve('./environment-checker.bemhtml.js'));
engines['bemhtml'] = require('./environment-checker.bemhtml.js').BEMHTML;

    });

    
    describe('10-environment-checker', function() {

        
it('should be equal `10-environment-checker` by bemhtml', function () {
    var bemjson = references['10-environment-checker'].bemjson,
        expected = references['10-environment-checker'].html;
    // sync mode
    var actual = engines['bemhtml'].apply(bemjson);



    assertHtml(actual, expected);


});


    }); // describe 10-environment-checker
    



}); // /describe environment-checker (desktop.tmpl-specs)

function assertHtml(actual, expected, done, filename) {

    if (htmlDiffer.isEqual(actual, expected)) {
        assert.ok(actual);
        done && done(null);
    } else {

            assert.fail(actual, expected, null, '\n');
    }

}
