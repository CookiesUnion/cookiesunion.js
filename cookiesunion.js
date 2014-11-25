/*!
 * CookiesUnion.com Library
 *
 * Copyright 2014 CookiesUnion.com and other contributors
 * Released under the MIT license
 * http://cookiesunion.com/license/
 */
(function() {
    var memberCheck = '//en.cookiesunion.com/check/',
        joinLink = '//cookiesunion.com/#join',
        learnMoreLink = '//cookiesunion.com/info/?site=',
        loaded = false,
        index = 0,
        availableLanguages = {
            en: {
                info: 'Cookies help us deliver our services. By using our services, you agree to our use of cookies.',
                learnMore: 'Learn more',
                join: 'Join CookiesUnion.com to <u>NOT</u> be asked again.',
            },
            es: {
                info: 'Las cookies nos ayudan a ofrecer nuestros servicios. Usando nuestros servicios, aceptas nuestro uso de cookies.',
                learnMore: 'Mas información',
                join: 'Unete a CookiesUnion.com para <u>NO</u> volverte a preguntar.',
            }
        },
        options = {
            domain: null,
            language: navigator.languages ? navigator.languages : (navigator.language || navigator.userLanguage),
            classPrefix: '_cookiesunion',
            cookieName: '_cookies-informed',
            cookieValue: 'yes',
            memberCheck: true,
            life: 10*365*24*60*60,
        },
        autorun = true;

    var addEventHandler = function (elem,eventType,handler) {
        if (elem.addEventListener) {
            elem.addEventListener(eventType,handler,false);
        } else if (elem.attachEvent) {
            elem.attachEvent('on'+eventType,handler);
        }
    }

    var ASAP = function(a) {
        if (!loaded) {
            document.addEventListener ? document.addEventListener('DOMContentLoaded', a) : window.attachEvent('onload', a);
        } else {
            a();
        }
    }
    ASAP(function() {
        loaded = true;
    });

    var createSheet = function() {
        var style = document.createElement("style");
        style.appendChild(document.createTextNode(""));
        document.body.appendChild(style);

        return style.sheet;
    };

    var addCSSRule = function(sheet, selector, rules, index) {
        if("insertRule" in sheet) {
            sheet.insertRule(selector + "{" + rules + "}", index);
        } else if("addRule" in sheet) {
            sheet.addRule(selector, rules, index);
        }
    }

    var stickElement = function(e) {
        document.body.insertBefore(e, document.body.firstChild);
    }

    var instance = function(options) {
        var getLocale = function() {
            var lang = 'en';
            if (typeof options.language == 'object') {
                for (var i in options.language) {
                    var name = options.language[i];
                    if (options.availableLanguages.hasOwnProperty(name)) {
                        lang = name;
                        break;
                    }
                    var pieces = name.split('-');
                    name = pieces[0];
                    if (options.availableLanguages.hasOwnProperty(name)) {
                        lang = name;
                        break;
                    }
                }
            } else if (options.availableLanguages.hasOwnProperty(options.language)) {
                lang = options.language;
            }
            return options.availableLanguages[lang];
        }

        var create = function() {
            className = options.classPrefix+'-'+index.toString();
            ++index;
            var el = createElement(className);
            var domain = options.domain;
            var obj = {
                open: function () {
                    el.container.style.display = 'block';
                    el.notice.style.display = 'block';
                    el.join.style.display = 'none';
                },
                close: function () {
                    el.container.style.display = 'none';
                },
                accept: function () {
                    setCookie(domain);
                    el.notice.style.display = 'none';
                    if (options.memberCheck) {
                        el.join.style.display = 'block';
                    } else {
                        this.close();
                    }
                }
            };

            addEventHandler(el.accept, 'click', function(e) {
                obj.accept();
            });
            addEventHandler(el.close, 'click', function(e) {
                obj.close();
            });

            ASAP(function() {
                createStyle('.'+className);
                stickElement(el.container);
            });
            return obj;
        }
        var checkStatus = function(callback) {
            var domain = options.domain;
            if (document.cookie.indexOf(options.cookieName+'='+options.cookieValue) >= 0) {
                callback(true);
            } else if (options.memberCheck) {
                var success = false;
                var XHR = XMLHttpRequest || ActiveXObject;
                var r = new XHR('MSXML2.XMLHTTP.3.0');
                r.open("GET", memberCheck, true);
                r.onreadystatechange = function () {
                    if (!success && r.readyState == 4) {
                        success = true;
                        if (r.status == 200 && r.responseText == 'yes') {
                            setCookie(domain);
                            callback(true);
                        } else {
                            callback(false);
                        }
                    }
                };
                r.withCredentials = true;
                r.send();

                var timeout = setTimeout(function() {
                    if (!success) {
                        success = true;
                        r.abort();
                        callback(false);
                    }
                },5000);
            } else {
                callback(false);
            }
        }

        var setCookie = function(domain) {
            var d = new Date();
            var life = options.life;
            d.setTime(d.getTime() + (life*1000));
            if (domain === null) {
                domain = document.domain;
            }
            document.cookie = options.cookieName+"="+ options.cookieValue +"; path=/; domain="+domain+"; expires="+d.toGMTString();
        }

        var createStyle = function(selector) {
            var sheet = createSheet();
            addCSSRule(sheet, selector, 'line-height: 1.2em;text-align:center;padding:1em;background-color: #FFFACD;', 0);
            addCSSRule(sheet, selector + ' .learn-more', 'margin-left:1em', 0);
            addCSSRule(sheet, selector + ' .close', "display: inline-block;margin-left:1em;width: 10px;height: 10px;background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAFpJREFUeNp0j0sSwDAIQsXbeiE9rmnSSccYyhKeH+DuKa9gZtIVESvX4uVjUmiDYHCFJrM3dviA1sbyF+QW6mlhJapmfpQhzOchM4X91AahP9BVUFnACg4BBgCjnScgtOHE1wAAAABJRU5ErkJggg==');", 0);
        }

        var createElement = function(className) {
            var obj = {};

            obj.container = document.createElement("div");
            obj.container.className = options.classPrefix + ' ' + className;
            var t = getLocale();

            obj.notice = document.createElement("div");
            obj.notice.className = 'notice';
            obj.notice.innerHTML = t.info;

            obj.learnMore = document.createElement("a");
            obj.learnMore.className = 'learn-more';
            obj.learnMore.innerHTML = t.learnMore;
            var domain = options.domain;
            if (domain === null) {
                domain = document.domain;
            }
            obj.learnMore.href = learnMoreLink+domain;

            obj.accept = document.createElement("a");
            obj.accept.className = 'close';

            obj.notice.appendChild(obj.learnMore);
            obj.notice.appendChild(obj.accept);


            obj.join = document.createElement("div");
            obj.join.className = 'join';
            obj.join.style.display = 'none';

            obj.link = document.createElement("a");
            obj.link.href = joinLink;
            obj.link.innerHTML = t.join;

            obj.close = document.createElement("a");
            obj.close.className = 'close';

            obj.join.appendChild(obj.link);
            obj.join.appendChild(obj.close);


            obj.container.appendChild(obj.notice);
            obj.container.appendChild(obj.join);

            return obj;
        }
        return {
            check: function (callback) {
                if (typeof callback == 'undefined') {
                    callback = function(){};
                }
                checkStatus(function(accepted) {
                    callback(accepted, create);
                });
            },
            notice: function (callback) {
                if (typeof callback == 'undefined') {
                    callback = function(){};
                }
                this.check(function(accepted) {
                    if (!accepted) {
                        callback(accepted, create());
                    } else {
                        callback(accepted, null);
                    }
                });
            },
            forceNotice: function (callback) {
                if (typeof callback == 'undefined') {
                    callback = function(){};
                }
                callback(create());
            },
        };
    }

    CookiesUnion = function(config) {
        var newOptions = options;
        newOptions.availableLanguages = availableLanguages;
        if (typeof config == 'object') {
            for (var i in options) {
                if (config.hasOwnProperty(i)) {
                    newOptions[i] = config[i];
                }
            }
        }
        return instance(newOptions);
    };

    var scriptQuery = '';
    // Look for the <script> node that loads this script to get its parameters.
    // This starts looking at the end instead of just considering the last
    // because deferred and async scripts run out of order.
    // If the script is loaded twice, then this will run in reverse order.
    for (var scripts = document.scripts, i = scripts.length; --i >= 0;) {
        var script = scripts[i];
        var match = script.src.match(
            /^[^?#]*\/cookiesunion\.js(\?[^#]*)?(?:#.*)?$/);
        if (match) {
            scriptQuery = match[1] || '';
            // Remove the script from the DOM so that multiple runs at least run
            // multiple times even if parameter sets are interpreted in reverse
            // order.
            script.parentNode.removeChild(script);
            break;
        }
    }

    // Pull parameters into local variables.
    scriptQuery.replace(
        /[?&]([^&=]+)=([^&]+)/g,
        function (_, name, value) {
            value = decodeURIComponent(value);
            name = decodeURIComponent(name);
            if (name == 'autorun')   { autorun = !/^[0fn]/i.test(value); }
        }
    );

    if (autorun) {
        CookiesUnion().notice();
    }

})();