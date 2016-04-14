'use strict';

/**
 * requireOrEval
 * =============
 *
 * Module, which assists in supporting transitional (from 'eval' to 'require') BEM formats.
 *
 * For example, earlier `bemjson` looked like this:
 * ```javascript
 * ({
 *     block: 'button'
 * })
 * ```
 *
 * New `bemjson` looks like this:
 * ```javascript
 * module.exports = {
 *     block: 'button'
 * };
 * ```
 */

var asyncRequire = require('enb-async-require'),
    vowFs = require('vow-fs'),
    vm = require('vm'),
    clearRequire = require('clear-require');

/**
 * @name requireOrEval
 * @param String filePath path to file which needs to be required or evaled
 * @returns Promise
 */
module.exports = function (filePath) {
    // Replace slashes with backslashes for windows paths for correct require cache work.
    var isWinPath = /^\w{1}:/.test(filePath);
    filePath = isWinPath ? filePath.replace(/\//g, '\\') : filePath;

    clearRequire(filePath);
    return asyncRequire(filePath).then(function (json) {
        if (typeof json === 'object' && json !== null && !Array.isArray(json)) {
            var hasData = false;
            for (var i in json) {
                if (json.hasOwnProperty(i)) {
                    hasData = true;
                    break;
                }
            }
            if (hasData) {
                return json;
            } else {
                return vowFs.read(filePath, 'utf8').then(function (data) {
                    return vm.runInThisContext(data);
                });
            }
        } else {
            // If not object or null was returned, value exported explicitly
            return json;
        }
    });
};
