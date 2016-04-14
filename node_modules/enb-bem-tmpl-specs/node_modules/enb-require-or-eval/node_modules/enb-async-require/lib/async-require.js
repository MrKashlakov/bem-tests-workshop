'use strict';
/**
 * async-require
 * =============
 *
 * Asyncronous version of require. Works using promise.
 */
var vow = require('vow');

var delay = 1;

/**
 * Async version of require.
 *
 * @param String filename name of file to require
 * @returns {Promise}
 */

module.exports = function (filename) {
    return new vow.Promise(function (resolve, reject) {
        var doRequire = function () {
            try {
                var result = require(filename);
                resolve(result);
                delay = Math.max(1, delay / 2);
            } catch (e) {
                if (e.code === 'EMFILE') {
                    delay++;
                    setTimeout(doRequire, delay);
                } else {
                    reject(e);
                }
            }
        };
        doRequire();
    });
};
