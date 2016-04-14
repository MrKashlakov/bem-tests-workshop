var vow = require('vow'),
    mockFs = require('mock-fs'),
    asyncRequire = require('../../lib/async-require');

describe('async-require', function () {
    afterEach(function () {
        mockFs.restore();
        delete global.__EMFILE_EXC_THROWN;
    });

    it('should return promise as it\'s result', function () {
        var promise = asyncRequire();

        expect(promise).to.be.instanceOf(vow.Promise);
    });

    it('should provide required module as promise result', function () {
        mockFs({
            '/test/foo.js': 'module.exports = {};'
        });

        var syncRequiredModule = require('/test/foo.js');

        return expect(asyncRequire('/test/foo.js')).to.eventually.be.equal(syncRequiredModule);
    });

    it('should pass error to rejected handler if failed to require file', function () {
        return expect(asyncRequire(null)).to.eventually.be.rejectedWith(Error);
    });

    it('should delay file opening if no free file descriptors available', function () {
        mockFs({
            '/test/exc_file.js': 'if (!global.__EMFILE_EXC_THROWN) {' +
                                     'global.__EMFILE_EXC_THROWN = true;' +
                                     'var e = new Error("EMFILE test error");' +
                                     'e.code = "EMFILE";' +
                                     'throw e;' +
                                 '}'
        });

        global.__EMFILE_EXC_THROWN = false;

        return asyncRequire('/test/exc_file.js').then(function (asyncRequiredModule) {
            var syncRequiredModule = require('/test/exc_file.js');
            expect(asyncRequiredModule).to.be.equal(syncRequiredModule);
        });
    });
});
