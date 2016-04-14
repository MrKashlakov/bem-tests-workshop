var vow = require('vow');
var mockFs = require('mock-fs');
var requireOrEval = require('../../lib/require-or-eval');

describe('require-or-eval', function () {
    afterEach(function () {
        mockFs.restore();
    });

    it('should return promise as result', function () {
        mockFs({
            '/test/path.js': ''
        });

        expect(requireOrEval('/test/path.js'))
            .to.be.instanceOf(vow.Promise);
    });

    it('should eval old json format', function () {
        mockFs({
            '/old/json/path.js': '({ block: "button" })'
        });

        return expect(requireOrEval('/old/json/path.js'))
            .to.be.eventually.deep.equal({ block: 'button' });
    });

    it('should require modern bemjson format', function () {
        mockFs({
            '/modern/json/path.js': 'module.exports = {' +
                                        'block: "button"' +
                                      '};'
        });

        return expect(requireOrEval('/modern/json/path.js'))
            .to.be.eventually.deep.equal({ block: 'button' });
    });
});
