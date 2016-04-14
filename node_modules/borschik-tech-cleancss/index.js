var cssbase = require('borschik/lib/techs/css');

exports.Tech = cssbase.Tech.inherit({

    minimize: function(content) {
        var CleanCSS = require('clean-css');

        var CleanCSSOptions = this.opts.techOptions.cleancss || {};
        CleanCSSOptions.rebase = typeof CleanCSSOptions.noRebase === 'undefined' ? true : false;
        CleanCSSOptions.processImport = typeof CleanCSSOptions.processImport === 'undefined' ? false : CleanCSSOptions.processImport;

        return new CleanCSS(CleanCSSOptions).minify(content).styles;
    }

});
