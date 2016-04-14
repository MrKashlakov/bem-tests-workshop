/**
 * Modules
 *
 * Copyright (c) 2013 Filatov Dmitry (dfilatov@yandex-team.ru)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 * @version 0.1.2
 */

(function(global) {

var undef,

    DECL_STATES = {
        NOT_RESOLVED : 'NOT_RESOLVED',
        IN_RESOLVING : 'IN_RESOLVING',
        RESOLVED     : 'RESOLVED'
    },

    /**
     * Creates a new instance of modular system
     * @returns {Object}
     */
    create = function() {
        var curOptions = {
                trackCircularDependencies : true,
                allowMultipleDeclarations : true
            },

            modulesStorage = {},
            waitForNextTick = false,
            pendingRequires = [],

            /**
             * Defines module
             * @param {String} name
             * @param {String[]} [deps]
             * @param {Function} declFn
             */
            define = function(name, deps, declFn) {
                if(!declFn) {
                    declFn = deps;
                    deps = [];
                }

                var module = modulesStorage[name];
                if(!module) {
                    module = modulesStorage[name] = {
                        name : name,
                        decl : undef
                    };
                }

                module.decl = {
                    name       : name,
                    prev       : module.decl,
                    fn         : declFn,
                    state      : DECL_STATES.NOT_RESOLVED,
                    deps       : deps,
                    dependents : [],
                    exports    : undef
                };
            },

            /**
             * Requires modules
             * @param {String|String[]} modules
             * @param {Function} cb
             * @param {Function} [errorCb]
             */
            require = function(modules, cb, errorCb) {
                if(typeof modules === 'string') {
                    modules = [modules];
                }

                if(!waitForNextTick) {
                    waitForNextTick = true;
                    nextTick(onNextTick);
                }

                pendingRequires.push({
                    deps : modules,
                    cb   : function(exports, error) {
                        error?
                            (errorCb || onError)(error) :
                            cb.apply(global, exports);
                    }
                });
            },

            /**
             * Returns state of module
             * @param {String} name
             * @returns {String} state, possible values are NOT_DEFINED, NOT_RESOLVED, IN_RESOLVING, RESOLVED
             */
            getState = function(name) {
                var module = modulesStorage[name];
                return module?
                    DECL_STATES[module.decl.state] :
                    'NOT_DEFINED';
            },

            /**
             * Returns whether the module is defined
             * @param {String} name
             * @returns {Boolean}
             */
            isDefined = function(name) {
                return !!modulesStorage[name];
            },

            /**
             * Sets options
             * @param {Object} options
             */
            setOptions = function(options) {
                for(var name in options) {
                    if(options.hasOwnProperty(name)) {
                        curOptions[name] = options[name];
                    }
                }
            },

            getStat = function() {
                var res = {},
                    module;

                for(var name in modulesStorage) {
                    if(modulesStorage.hasOwnProperty(name)) {
                        module = modulesStorage[name];
                        (res[module.decl.state] || (res[module.decl.state] = [])).push(name);
                    }
                }

                return res;
            },

            onNextTick = function() {
                waitForNextTick = false;
                applyRequires();
            },

            applyRequires = function() {
                var requiresToProcess = pendingRequires,
                    i = 0, require;

                pendingRequires = [];

                while(require = requiresToProcess[i++]) {
                    requireDeps(null, require.deps, [], require.cb);
                }
            },

            requireDeps = function(fromDecl, deps, path, cb) {
                var unresolvedDepsCnt = deps.length;
                if(!unresolvedDepsCnt) {
                    cb([]);
                }

                var decls = [],
                    onDeclResolved = function(_, error) {
                        if(error) {
                            cb(null, error);
                            return;
                        }

                        if(!--unresolvedDepsCnt) {
                            var exports = [],
                                i = 0, decl;
                            while(decl = decls[i++]) {
                                exports.push(decl.exports);
                            }
                            cb(exports);
                        }
                    },
                    i = 0, len = unresolvedDepsCnt,
                    dep, decl;

                while(i < len) {
                    dep = deps[i++];
                    if(typeof dep === 'string') {
                        if(!modulesStorage[dep]) {
                            cb(null, buildModuleNotFoundError(dep, fromDecl));
                            return;
                        }

                        decl = modulesStorage[dep].decl;
                    }
                    else {
                        decl = dep;
                    }

                    decls.push(decl);

                    startDeclResolving(decl, path, onDeclResolved);
                }
            },

            startDeclResolving = function(decl, path, cb) {
                if(decl.state === DECL_STATES.RESOLVED) {
                    cb(decl.exports);
                    return;
                }
                else if(decl.state === DECL_STATES.IN_RESOLVING) {
                    curOptions.trackCircularDependencies && isDependenceCircular(decl, path)?
                        cb(null, buildCircularDependenceError(decl, path)) :
                        decl.dependents.push(cb);
                    return;
                }

                decl.dependents.push(cb);

                if(decl.prev && !curOptions.allowMultipleDeclarations) {
                    provideError(decl, buildMultipleDeclarationError(decl));
                    return;
                }

                curOptions.trackCircularDependencies && (path = path.slice()).push(decl);

                var isProvided = false,
                    deps = decl.prev? decl.deps.concat([decl.prev]) : decl.deps;

                decl.state = DECL_STATES.IN_RESOLVING;
                requireDeps(
                    decl,
                    deps,
                    path,
                    function(depDeclsExports, error) {
                        if(error) {
                            provideError(decl, error);
                            return;
                        }

                        depDeclsExports.unshift(function(exports, error) {
                            if(isProvided) {
                                cb(null, buildDeclAreadyProvidedError(decl));
                                return;
                            }

                            isProvided = true;
                            error?
                                provideError(decl, error) :
                                provideDecl(decl, exports);
                        });

                        decl.fn.apply(
                            {
                                name   : decl.name,
                                deps   : decl.deps,
                                global : global
                            },
                            depDeclsExports);
                    });
            },

            provideDecl = function(decl, exports) {
                decl.exports = exports;
                decl.state = DECL_STATES.RESOLVED;

                var i = 0, dependent;
                while(dependent = decl.dependents[i++]) {
                    dependent(exports);
                }

                decl.dependents = undef;
            },

            provideError = function(decl, error) {
                decl.state = DECL_STATES.NOT_RESOLVED;

                var i = 0, dependent;
                while(dependent = decl.dependents[i++]) {
                    dependent(null, error);
                }

                decl.dependents = [];
            };

        return {
            create     : create,
            define     : define,
            require    : require,
            getState   : getState,
            isDefined  : isDefined,
            setOptions : setOptions,
            getStat    : getStat
        };
    },

    onError = function(e) {
        nextTick(function() {
            throw e;
        });
    },

    buildModuleNotFoundError = function(name, decl) {
        return Error(decl?
            'Module "' + decl.name + '": can\'t resolve dependence "' + name + '"' :
            'Required module "' + name + '" can\'t be resolved');
    },

    buildCircularDependenceError = function(decl, path) {
        var strPath = [],
            i = 0, pathDecl;
        while(pathDecl = path[i++]) {
            strPath.push(pathDecl.name);
        }
        strPath.push(decl.name);

        return Error('Circular dependence has been detected: "' + strPath.join(' -> ') + '"');
    },

    buildDeclAreadyProvidedError = function(decl) {
        return Error('Declaration of module "' + decl.name + '" has already been provided');
    },

    buildMultipleDeclarationError = function(decl) {
        return Error('Multiple declarations of module "' + decl.name + '" have been detected');
    },

    isDependenceCircular = function(decl, path) {
        var i = 0, pathDecl;
        while(pathDecl = path[i++]) {
            if(decl === pathDecl) {
                return true;
            }
        }
        return false;
    },

    nextTick = (function() {
        var fns = [],
            enqueueFn = function(fn) {
                return fns.push(fn) === 1;
            },
            callFns = function() {
                var fnsToCall = fns, i = 0, len = fns.length;
                fns = [];
                while(i < len) {
                    fnsToCall[i++]();
                }
            };

        if(typeof process === 'object' && process.nextTick) { // nodejs
            return function(fn) {
                enqueueFn(fn) && process.nextTick(callFns);
            };
        }

        if(global.setImmediate) { // ie10
            return function(fn) {
                enqueueFn(fn) && global.setImmediate(callFns);
            };
        }

        if(global.postMessage && !global.opera) { // modern browsers
            var isPostMessageAsync = true;
            if(global.attachEvent) {
                var checkAsync = function() {
                        isPostMessageAsync = false;
                    };
                global.attachEvent('onmessage', checkAsync);
                global.postMessage('__checkAsync', '*');
                global.detachEvent('onmessage', checkAsync);
            }

            if(isPostMessageAsync) {
                var msg = '__modules' + (+new Date()),
                    onMessage = function(e) {
                        if(e.data === msg) {
                            e.stopPropagation && e.stopPropagation();
                            callFns();
                        }
                    };

                global.addEventListener?
                    global.addEventListener('message', onMessage, true) :
                    global.attachEvent('onmessage', onMessage);

                return function(fn) {
                    enqueueFn(fn) && global.postMessage(msg, '*');
                };
            }
        }

        var doc = global.document;
        if('onreadystatechange' in doc.createElement('script')) { // ie6-ie8
            var head = doc.getElementsByTagName('head')[0],
                createScript = function() {
                    var script = doc.createElement('script');
                    script.onreadystatechange = function() {
                        script.parentNode.removeChild(script);
                        script = script.onreadystatechange = null;
                        callFns();
                    };
                    head.appendChild(script);
                };

            return function(fn) {
                enqueueFn(fn) && createScript();
            };
        }

        return function(fn) { // old browsers
            enqueueFn(fn) && setTimeout(callFns, 0);
        };
    })();

if(typeof exports === 'object') {
    module.exports = create();
}
else {
    global.modules = create();
}

})(typeof window !== 'undefined' ? window : global);


/*borschik:include:../../libs/bem-core/common.blocks/i-bem/i-bem.vanilla.js*/
/*borschik:include:../../libs/bem-core/common.blocks/i-bem/__internal/i-bem__internal.vanilla.js*/
/*borschik:include:../../libs/bem-core/common.blocks/inherit/inherit.vanilla.js*/
/*borschik:include:../../libs/bem-core/common.blocks/identify/identify.vanilla.js*/
/*borschik:include:../../libs/bem-core/common.blocks/next-tick/next-tick.vanilla.js*/
/*borschik:include:../../libs/bem-core/common.blocks/objects/objects.vanilla.js*/
/*borschik:include:../../libs/bem-core/common.blocks/functions/functions.vanilla.js*/
/*borschik:include:../../libs/bem-core/common.blocks/events/events.vanilla.js*/
/*borschik:include:../../libs/bem-core/common.blocks/i-bem/__dom/i-bem__dom.js*/
/*borschik:include:../../libs/bem-core/common.blocks/jquery/jquery.js*/
/*borschik:include:../../libs/bem-core/common.blocks/loader/_type/loader_type_js.js*/
/*borschik:include:../../libs/bem-core/common.blocks/jquery/__config/jquery__config.js*/
/*borschik:include:../../libs/bem-core/common.blocks/dom/dom.js*/
/*borschik:include:../../libs/bem-core/common.blocks/i-bem/__dom/_init/i-bem__dom_init.js*/
/*borschik:include:../../common.blocks/environment-checker/environment-checker.js*/
/*borschik:include:../../libs/bem-pr/spec.blocks/mocha/mocha.js*/
/*borschik:include:../../libs/bem-pr/spec.blocks/chai/chai.js*/
/*borschik:include:../../libs/bem-pr/spec.blocks/sinon/sinon.js*/
/*borschik:include:../../libs/bem-pr/spec.blocks/sinon-chai/sinon-chai.js*/
/*borschik:include:../../libs/bem-pr/spec.blocks/simulate-dom-event/simulate-dom-event.js*/
/*borschik:include:../../libs/bem-pr/spec.blocks/spec/spec.js*/
(function(global) {
var buildBemXjst = function(exports, __bem_xjst_libs__){
if (typeof Vow === "undefined") { global.Vow = __bem_xjst_libs__.vow || __bem_xjst_libs__.Vow; }
var $$mode = "", $$block = "", $$elem = "", $$elemMods = null, $$mods = null, $$once = false, $$wrap = false;

var __$ref = {};

function apply(ctx) {
    ctx = ctx || this;
    $$wrap = undefined;
    $$once = undefined;
    $$mods = ctx["mods"];
    $$elemMods = ctx["elemMods"];
    $$elem = ctx["elem"];
    $$block = ctx["block"];
    $$mode = ctx["_mode"];
    try {
        return applyc(ctx, __$ref);
    } catch (e) {
        e.xjstContext = ctx;
        throw e;
    }
}

exports.apply = apply;

function applyc(__$ctx, __$ref) {
    var cache;
    var cache;
    var cache;
    var __$r = __$g0(__$ctx, __$ref);
    if (__$r !== __$ref) return __$r;
}

[ function(exports, context) {
    var undef, BEM_ = {}, toString = Object.prototype.toString, slice = Array.prototype.slice, isArray = Array.isArray || function(obj) {
        return toString.call(obj) === "[object Array]";
    }, SHORT_TAGS = {
        area: 1,
        base: 1,
        br: 1,
        col: 1,
        command: 1,
        embed: 1,
        hr: 1,
        img: 1,
        input: 1,
        keygen: 1,
        link: 1,
        meta: 1,
        param: 1,
        source: 1,
        wbr: 1
    }, resetApplyNext = context.resetApplyNext || function() {};
    (function(BEM, undefined) {
        var MOD_DELIM = "_", ELEM_DELIM = "__", NAME_PATTERN = "[a-zA-Z0-9-]+";
        function buildModPostfix(modName, modVal) {
            var res = MOD_DELIM + modName;
            if (modVal !== true) res += MOD_DELIM + modVal;
            return res;
        }
        function buildBlockClass(name, modName, modVal) {
            var res = name;
            if (modVal) res += buildModPostfix(modName, modVal);
            return res;
        }
        function buildElemClass(block, name, modName, modVal) {
            var res = buildBlockClass(block) + ELEM_DELIM + name;
            if (modVal) res += buildModPostfix(modName, modVal);
            return res;
        }
        BEM.INTERNAL = {
            NAME_PATTERN: NAME_PATTERN,
            MOD_DELIM: MOD_DELIM,
            ELEM_DELIM: ELEM_DELIM,
            buildModPostfix: buildModPostfix,
            buildClass: function(block, elem, modName, modVal) {
                var typeOfModName = typeof modName;
                if (typeOfModName === "string" || typeOfModName === "boolean") {
                    var typeOfModVal = typeof modVal;
                    if (typeOfModVal !== "string" && typeOfModVal !== "boolean") {
                        modVal = modName;
                        modName = elem;
                        elem = undef;
                    }
                } else if (typeOfModName !== "undefined") {
                    modName = undef;
                } else if (elem && typeof elem !== "string") {
                    elem = undef;
                }
                if (!(elem || modName)) {
                    return block;
                }
                return elem ? buildElemClass(block, elem, modName, modVal) : buildBlockClass(block, modName, modVal);
            },
            buildModsClasses: function(block, elem, mods) {
                var res = "";
                if (mods) {
                    var modName;
                    for (modName in mods) {
                        if (!mods.hasOwnProperty(modName)) continue;
                        var modVal = mods[modName];
                        if (!modVal && modVal !== 0) continue;
                        typeof modVal !== "boolean" && (modVal += "");
                        res += " " + (elem ? buildElemClass(block, elem, modName, modVal) : buildBlockClass(block, modName, modVal));
                    }
                }
                return res;
            },
            buildClasses: function(block, elem, mods) {
                var res = "";
                res += elem ? buildElemClass(block, elem) : buildBlockClass(block);
                res += this.buildModsClasses(block, elem, mods);
                return res;
            }
        };
    })(BEM_);
    context.BEMContext = BEMContext;
    function BEMContext(context, apply_) {
        this.ctx = typeof context === "undefined" ? "" : context;
        this.apply = apply_;
        this._str = "";
        var _this = this;
        this._buf = {
            push: function() {
                var chunks = slice.call(arguments).join("");
                _this._str += chunks;
            },
            join: function() {
                return this._str;
            }
        };
        this._ = this;
        this._start = true;
        this._mode = "";
        this._listLength = 0;
        this._notNewList = false;
        this.position = 0;
        this.block = undef;
        this.elem = undef;
        this.mods = undef;
        this.elemMods = undef;
        this._resetApplyNext = resetApplyNext;
    }
    BEMContext.prototype.isArray = isArray;
    BEMContext.prototype.isSimple = function isSimple(obj) {
        if (!obj || obj === true) return true;
        var t = typeof obj;
        return t === "string" || t === "number";
    };
    BEMContext.prototype.isShortTag = function isShortTag(t) {
        return SHORT_TAGS.hasOwnProperty(t);
    };
    BEMContext.prototype.extend = function extend(o1, o2) {
        if (!o1 || !o2) return o1 || o2;
        var res = {}, n;
        for (n in o1) o1.hasOwnProperty(n) && (res[n] = o1[n]);
        for (n in o2) o2.hasOwnProperty(n) && (res[n] = o2[n]);
        return res;
    };
    var cnt = 0, id = +new Date(), expando = "__" + id, get = function() {
        return "uniq" + id + ++cnt;
    };
    BEMContext.prototype.identify = function(obj, onlyGet) {
        if (!obj) return get();
        if (onlyGet || obj[expando]) {
            return obj[expando];
        } else {
            return obj[expando] = get();
        }
    };
    BEMContext.prototype.xmlEscape = function xmlEscape(str) {
        return (str + "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    };
    BEMContext.prototype.attrEscape = function attrEscape(str) {
        return (str + "").replace(/&/g, "&amp;").replace(/"/g, "&quot;");
    };
    BEMContext.prototype.jsAttrEscape = function jsAttrEscape(str) {
        return (str + "").replace(/&/g, "&amp;").replace(/'/g, "&#39;");
    };
    BEMContext.prototype.BEM = BEM_;
    BEMContext.prototype.isFirst = function isFirst() {
        return this.position === 1;
    };
    BEMContext.prototype.isLast = function isLast() {
        return this.position === this._listLength;
    };
    BEMContext.prototype.generateId = function generateId() {
        return this.identify(this.ctx);
    };
    var oldApply = exports.apply;
    exports.apply = BEMContext.apply = function BEMContext_apply(context) {
        var ctx = new BEMContext(context || this, oldApply);
        ctx.apply();
        return ctx._str;
    };
    BEMContext.prototype.reapply = BEMContext.apply;
}, function(exports, context) {
    var BEMContext = exports.BEMContext || context.BEMContext;
    if (!BEMContext) {
        throw Error("Seems like you have no base templates from i-bem.bemhtml");
    }
    BEMContext.prototype.require = function(lib) {
        return __bem_xjst_libs__[lib];
    };
} ].forEach(function(fn) {
    fn(exports, this);
}, {
    recordExtensions: function(ctx) {
        ctx["__$anflg2"] = false;
        ctx["ctx"] = undefined;
        ctx["_mode"] = undefined;
        ctx["_str"] = undefined;
        ctx["block"] = undefined;
        ctx["elem"] = undefined;
        ctx["_notNewList"] = undefined;
        ctx["position"] = undefined;
        ctx["_listLength"] = undefined;
        ctx["__$a0"] = 0;
        ctx["_currBlock"] = undefined;
        ctx["mods"] = undefined;
        ctx["elemMods"] = undefined;
    },
    resetApplyNext: function(ctx) {
        ctx["__$a0"] = 0;
    }
});

function __$b9(__$ctx, __$ref) {
    var BEM_INTERNAL__$7 = __$ctx.BEM.INTERNAL, ctx__$8 = __$ctx.ctx, isBEM__$9, tag__$10, res__$11;
    var __$r__$13;
    var __$l0__$14 = __$ctx._str;
    __$ctx._str = "";
    var vBlock__$15 = $$block;
    var __$r__$17;
    var __$l1__$18 = $$mode;
    $$mode = "tag";
    __$r__$17 = applyc(__$ctx, __$ref);
    $$mode = __$l1__$18;
    tag__$10 = __$r__$17;
    typeof tag__$10 !== "undefined" || (tag__$10 = ctx__$8.tag);
    typeof tag__$10 !== "undefined" || (tag__$10 = "div");
    if (tag__$10) {
        var jsParams__$19, js__$20;
        if (vBlock__$15 && ctx__$8.js !== false) {
            var __$r__$21;
            var __$l2__$22 = $$mode;
            $$mode = "js";
            __$r__$21 = applyc(__$ctx, __$ref);
            $$mode = __$l2__$22;
            js__$20 = __$r__$21;
            js__$20 = js__$20 ? __$ctx.extend(ctx__$8.js, js__$20 === true ? {} : js__$20) : ctx__$8.js === true ? {} : ctx__$8.js;
            js__$20 && ((jsParams__$19 = {})[BEM_INTERNAL__$7.buildClass(vBlock__$15, ctx__$8.elem)] = js__$20);
        }
        __$ctx._str += "<" + tag__$10;
        var __$r__$23;
        var __$l3__$24 = $$mode;
        $$mode = "bem";
        __$r__$23 = applyc(__$ctx, __$ref);
        $$mode = __$l3__$24;
        isBEM__$9 = __$r__$23;
        typeof isBEM__$9 !== "undefined" || (isBEM__$9 = typeof ctx__$8.bem !== "undefined" ? ctx__$8.bem : ctx__$8.block || ctx__$8.elem);
        var __$r__$26;
        var __$l4__$27 = $$mode;
        $$mode = "cls";
        __$r__$26 = applyc(__$ctx, __$ref);
        $$mode = __$l4__$27;
        var cls__$25 = __$r__$26;
        cls__$25 || (cls__$25 = ctx__$8.cls);
        var addJSInitClass__$28 = ctx__$8.block && jsParams__$19 && !ctx__$8.elem;
        if (isBEM__$9 || cls__$25) {
            __$ctx._str += ' class="';
            if (isBEM__$9) {
                __$ctx._str += BEM_INTERNAL__$7.buildClasses(vBlock__$15, ctx__$8.elem, ctx__$8.elemMods || ctx__$8.mods);
                var __$r__$30;
                var __$l5__$31 = $$mode;
                $$mode = "mix";
                __$r__$30 = applyc(__$ctx, __$ref);
                $$mode = __$l5__$31;
                var mix__$29 = __$r__$30;
                ctx__$8.mix && (mix__$29 = mix__$29 ? [].concat(mix__$29, ctx__$8.mix) : ctx__$8.mix);
                if (mix__$29) {
                    var visited__$32 = {}, visitedKey__$33 = function(block, elem) {
                        return (block || "") + "__" + (elem || "");
                    };
                    visited__$32[visitedKey__$33(vBlock__$15, $$elem)] = true;
                    __$ctx.isArray(mix__$29) || (mix__$29 = [ mix__$29 ]);
                    for (var i__$34 = 0; i__$34 < mix__$29.length; i__$34++) {
                        var mixItem__$35 = mix__$29[i__$34];
                        typeof mixItem__$35 === "string" && (mixItem__$35 = {
                            block: mixItem__$35
                        });
                        var hasItem__$36 = mixItem__$35.block && (vBlock__$15 !== ctx__$8.block || mixItem__$35.block !== vBlock__$15) || mixItem__$35.elem, mixBlock__$37 = mixItem__$35.block || mixItem__$35._block || $$block, mixElem__$38 = mixItem__$35.elem || mixItem__$35._elem || $$elem;
                        hasItem__$36 && (__$ctx._str += " ");
                        __$ctx._str += BEM_INTERNAL__$7[hasItem__$36 ? "buildClasses" : "buildModsClasses"](mixBlock__$37, mixItem__$35.elem || mixItem__$35._elem || (mixItem__$35.block ? undefined : $$elem), mixItem__$35.elemMods || mixItem__$35.mods);
                        if (mixItem__$35.js) {
                            (jsParams__$19 || (jsParams__$19 = {}))[BEM_INTERNAL__$7.buildClass(mixBlock__$37, mixItem__$35.elem)] = mixItem__$35.js === true ? {} : mixItem__$35.js;
                            addJSInitClass__$28 || (addJSInitClass__$28 = mixBlock__$37 && !mixItem__$35.elem);
                        }
                        if (hasItem__$36 && !visited__$32[visitedKey__$33(mixBlock__$37, mixElem__$38)]) {
                            visited__$32[visitedKey__$33(mixBlock__$37, mixElem__$38)] = true;
                            var __$r__$40;
                            var __$l6__$41 = $$mode;
                            $$mode = "mix";
                            var __$l7__$42 = $$block;
                            $$block = mixBlock__$37;
                            var __$l8__$43 = $$elem;
                            $$elem = mixElem__$38;
                            __$r__$40 = applyc(__$ctx, __$ref);
                            $$mode = __$l6__$41;
                            $$block = __$l7__$42;
                            $$elem = __$l8__$43;
                            var nestedMix__$39 = __$r__$40;
                            if (nestedMix__$39) {
                                Array.isArray(nestedMix__$39) || (nestedMix__$39 = [ nestedMix__$39 ]);
                                for (var j__$44 = 0; j__$44 < nestedMix__$39.length; j__$44++) {
                                    var nestedItem__$45 = nestedMix__$39[j__$44];
                                    if (!nestedItem__$45.block && !nestedItem__$45.elem || !visited__$32[visitedKey__$33(nestedItem__$45.block, nestedItem__$45.elem)]) {
                                        nestedItem__$45._block = mixBlock__$37;
                                        nestedItem__$45._elem = mixElem__$38;
                                        mix__$29.splice(i__$34 + 1, 0, nestedItem__$45);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            cls__$25 && (__$ctx._str += isBEM__$9 ? " " + cls__$25 : cls__$25);
            __$ctx._str += addJSInitClass__$28 ? ' i-bem"' : '"';
        }
        if (isBEM__$9 && jsParams__$19) {
            __$ctx._str += " data-bem='" + __$ctx.jsAttrEscape(JSON.stringify(jsParams__$19)) + "'";
        }
        var __$r__$47;
        var __$l9__$48 = $$mode;
        $$mode = "attrs";
        __$r__$47 = applyc(__$ctx, __$ref);
        $$mode = __$l9__$48;
        var attrs__$46 = __$r__$47;
        attrs__$46 = __$ctx.extend(attrs__$46, ctx__$8.attrs);
        if (attrs__$46) {
            var name__$49, attr__$50;
            for (name__$49 in attrs__$46) {
                attr__$50 = attrs__$46[name__$49];
                if (typeof attr__$50 === "undefined") continue;
                __$ctx._str += " " + name__$49 + '="' + __$ctx.attrEscape(__$ctx.isSimple(attr__$50) ? attr__$50 : __$ctx.reapply(attr__$50)) + '"';
            }
        }
    }
    if (__$ctx.isShortTag(tag__$10)) {
        __$ctx._str += "/>";
    } else {
        tag__$10 && (__$ctx._str += ">");
        var __$r__$52;
        var __$l10__$53 = $$mode;
        $$mode = "content";
        __$r__$52 = applyc(__$ctx, __$ref);
        $$mode = __$l10__$53;
        var content__$51 = __$r__$52;
        if (content__$51 || content__$51 === 0) {
            __$ctx._resetApplyNext(__$wrapThis(__$ctx));
            isBEM__$9 = vBlock__$15 || $$elem;
            var __$r__$54;
            var __$l11__$55 = $$mode;
            $$mode = "";
            var __$l12__$56 = __$ctx._notNewList;
            __$ctx._notNewList = false;
            var __$l13__$57 = __$ctx.position;
            __$ctx.position = isBEM__$9 ? 1 : __$ctx.position;
            var __$l14__$58 = __$ctx._listLength;
            __$ctx._listLength = isBEM__$9 ? 1 : __$ctx._listLength;
            var __$l15__$59 = __$ctx.ctx;
            __$ctx.ctx = content__$51;
            __$r__$54 = applyc(__$ctx, __$ref);
            $$mode = __$l11__$55;
            __$ctx._notNewList = __$l12__$56;
            __$ctx.position = __$l13__$57;
            __$ctx._listLength = __$l14__$58;
            __$ctx.ctx = __$l15__$59;
        }
        tag__$10 && (__$ctx._str += "</" + tag__$10 + ">");
    }
    res__$11 = __$ctx._str;
    __$r__$13 = undefined;
    __$ctx._str = __$l0__$14;
    __$ctx._buf.push(res__$11);
    return;
}

function __$b15(__$ctx, __$ref) {
    var __$r__$61;
    var __$l0__$62 = $$mode;
    $$mode = "";
    var __$l1__$63 = __$ctx.ctx;
    __$ctx.ctx = __$ctx.ctx._value;
    var __$r__$65;
    var __$l2__$66 = __$ctx.__$a0;
    __$ctx.__$a0 = __$ctx.__$a0 | 1;
    __$r__$65 = applyc(__$ctx, __$ref);
    __$ctx.__$a0 = __$l2__$66;
    __$r__$61 = __$r__$65;
    $$mode = __$l0__$62;
    __$ctx.ctx = __$l1__$63;
    return;
}

function __$b16(__$ctx, __$ref) {
    __$ctx._listLength--;
    var ctx__$67 = __$ctx.ctx;
    if (ctx__$67 && ctx__$67 !== true || ctx__$67 === 0) {
        __$ctx._str += ctx__$67 + "";
    }
    return;
}

function __$b17(__$ctx, __$ref) {
    __$ctx._listLength--;
    return;
}

function __$b18(__$ctx, __$ref) {
    var ctx__$68 = __$ctx.ctx, len__$69 = ctx__$68.length, i__$70 = 0, prevPos__$71 = __$ctx.position, prevNotNewList__$72 = __$ctx._notNewList;
    if (prevNotNewList__$72) {
        __$ctx._listLength += len__$69 - 1;
    } else {
        __$ctx.position = 0;
        __$ctx._listLength = len__$69;
    }
    __$ctx._notNewList = true;
    while (i__$70 < len__$69) (function __$lb__$73() {
        var __$r__$74;
        var __$l0__$75 = __$ctx.ctx;
        __$ctx.ctx = ctx__$68[i__$70++];
        __$r__$74 = applyc(__$ctx, __$ref);
        __$ctx.ctx = __$l0__$75;
        return __$r__$74;
    })();
    prevNotNewList__$72 || (__$ctx.position = prevPos__$71);
    return;
}

function __$b19(__$ctx, __$ref) {
    __$ctx.ctx || (__$ctx.ctx = {});
    var vBlock__$76 = __$ctx.ctx.block, vElem__$77 = __$ctx.ctx.elem, block__$78 = __$ctx._currBlock || $$block;
    var __$r__$80;
    var __$l0__$81 = $$mode;
    $$mode = "default";
    var __$l1__$82 = $$block;
    $$block = vBlock__$76 || (vElem__$77 ? block__$78 : undefined);
    var __$l2__$83 = __$ctx._currBlock;
    __$ctx._currBlock = vBlock__$76 || vElem__$77 ? undefined : block__$78;
    var __$l3__$84 = $$elem;
    $$elem = vElem__$77;
    var __$l4__$85 = $$mods;
    $$mods = vBlock__$76 ? __$ctx.ctx.mods || (__$ctx.ctx.mods = {}) : $$mods;
    var __$l5__$86 = $$elemMods;
    $$elemMods = __$ctx.ctx.elemMods || {};
    $$block || $$elem ? __$ctx.position = (__$ctx.position || 0) + 1 : __$ctx._listLength--;
    applyc(__$ctx, __$ref);
    __$r__$80 = undefined;
    $$mode = __$l0__$81;
    $$block = __$l1__$82;
    __$ctx._currBlock = __$l2__$83;
    $$elem = __$l3__$84;
    $$mods = __$l4__$85;
    $$elemMods = __$l5__$86;
    return;
}

function __$g0(__$ctx, __$ref) {
    var __$t = $$mode;
    if (__$t === "content") {
        if ($$block === "spec-runner" && !$$elem) {
            return [ "(function() {", "var global = this;", 'typeof modules === "object"?', '  modules.require(["jquery", "mocha", "spec"], function($, mocha) {', "    init($, mocha);", "  }) : ", "  init(global.jQuery, global.mocha);", "function init($, mocha) {", "  global.mochaPhantomJS? global.mochaPhantomJS.run(done) : mocha.run(done);", '  function done() { $("#mocha").show() }', "}", "}());" ];
        }
        return __$ctx.ctx.content;
    } else if (__$t === "tag") {
        var __$t = $$block;
        if (__$t === "spec-runner") {
            if (!$$elem) {
                return "script";
            }
        } else if (__$t === "environment-checker") {
            if (!$$elem) {
                return "span";
            }
        }
        return undefined;
    } else if (__$t === "js") {
        if ($$block === "environment-checker" && !$$elem) {
            return true;
        }
        return undefined;
    } else if (__$t === "default") {
        if ($$block === "spec" && !$$elem && __$ctx["__$anflg2"] !== true) {
            var __$r__$1;
            var __$l0__$2 = __$ctx.__$anflg2;
            __$ctx.__$anflg2 = true;
            var __$r__$4;
            var __$l1__$5 = __$ctx.ctx;
            __$ctx.ctx = {
                block: "mocha"
            };
            var __$l2__$6 = $$mode;
            $$mode = "";
            __$r__$4 = applyc(__$ctx, __$ref);
            __$ctx.ctx = __$l1__$5;
            $$mode = __$l2__$6;
            __$r__$1 = __$r__$4;
            __$ctx.__$anflg2 = __$l0__$2;
            var __$r = __$r__$1;
            if (__$r !== __$ref) return __$r;
        }
        var __$r = __$b9(__$ctx, __$ref);
        if (__$r !== __$ref) return __$r;
    } else if (__$t === "attrs") {
        if ($$block === "mocha" && !$$elem) {
            return {
                id: "mocha"
            };
        }
        return undefined;
    } else if (__$t === "mix") {
        return undefined;
    } else if (__$t === "bem") {
        return undefined;
    } else if (__$t === "cls") {
        return undefined;
    } else if (__$t === "") {
        if (__$ctx.ctx && __$ctx.ctx._vow && (__$ctx.__$a0 & 1) === 0) {
            var __$r = __$b15(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
        if (__$ctx.isSimple(__$ctx.ctx)) {
            var __$r = __$b16(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
        if (!__$ctx.ctx) {
            var __$r = __$b17(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
        if (__$ctx.isArray(__$ctx.ctx)) {
            var __$r = __$b18(__$ctx, __$ref);
            if (__$r !== __$ref) return __$r;
        }
        var __$r = __$b19(__$ctx, __$ref);
        if (__$r !== __$ref) return __$r;
    }
    throw new Error("Match failed, no templates found");
    return __$ref;
}

function __$wrapThis(ctx) {
    ctx._mode = $$mode;
    ctx.block = $$block;
    ctx.elem = $$elem;
    ctx.elemMods = $$elemMods;
    ctx.mods = $$mods;
    return ctx;
}


    return exports;
};

var defineAsGlobal = true;
if(typeof module === "object" && typeof module.exports === "object") {
    exports["BEMHTML"] = buildBemXjst({}, {});
    defineAsGlobal = false;
}
if(typeof modules === "object") {
    modules.define("BEMHTML", [], function(provide) {
        provide(buildBemXjst({}, {}));
    });
    defineAsGlobal = false;
}
if(defineAsGlobal) {
    global["BEMHTML"] = buildBemXjst({}, {});
}
})(this);
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
