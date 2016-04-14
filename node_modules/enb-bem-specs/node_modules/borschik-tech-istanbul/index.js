var fs = require('fs'),
    path = require('path'),
    Instrumenter = require('istanbul').Instrumenter,
    instrumenter = new Instrumenter({preserveComments: true}),
    cwd = process.cwd();

module.exports = function(borschik) {
    var base = borschik.getTech('js'),
        File = base.File.inherit({
            read: function() {
                if (!this._shouldInstrument()) {
                    return this.__base();
                }

                var content = fs.readFileSync(this.processPath(this.path), 'utf8'),
                    instrumented = instrumenter.instrumentSync(content, path.relative(this.tech._root, this.path));

                this.content = this.parse(instrumented);
            },

            _shouldInstrument: function() {
                var ip = this.tech._instrumentPaths;
                if (!ip) {
                    // instrumentPaths option was not specified -> instrument
                    // every file
                    return true;
                }

                // Validate include path if instrumentPaths option is specified
                var instrument = false;
                for(var p = 0; p < ip.length; p++) {
                    if (this.path.indexOf(ip[p]) === 0) {
                        // processing path matches some of the specified
                        // instrument paths so instrument it
                        instrument = true;
                        break;
                    }
                }

                return instrument;
            }
        }),
        Tech = base.Tech.inherit({
            __constructor: function(opts) {
                var options = (opts.techOptions || {});

                this.__base(opts);
                this._instrumentPaths = options.instrumentPaths;
                this._root = options.root || cwd;

                if (this._instrumentPaths) {
                    this._instrumentPaths = this._instrumentPaths.map(function(p) {
                        return path.resolve(this._root, p);
                    });
                }
            },

            File: File
        });

    return {
        File: File,
        Tech: Tech
    };
};
