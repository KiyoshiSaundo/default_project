"use strict";

const { src, dest, parallel, series, watch, task } = require("gulp");

var babel = require("gulp-babel"),
    server = require("browser-sync").create(),
    include = require("gulp-include"),
    gulpif = require("gulp-if"),
    plumber = require("gulp-plumber"),
    wait = require("gulp-wait"),
    rename = require("gulp-rename"),
    filter = require("gulp-filter"),
    // html
    pug = require("gulp-pug"),
    // js
    concat = require("gulp-concat"),
    minify = require("gulp-minify"),
    jsValidate = require("gulp-jsvalidate"),
    // css
    prefixer = require("gulp-autoprefixer"),
    scss = require("gulp-sass")(require("sass")),
    scssGlob = require("gulp-sass-glob"),
    sourcemaps = require("gulp-sourcemaps"),
    cssnano = require("gulp-cssnano"),
    // svg
    svgSymbols = require("gulp-svg-symbols"),
    // modernizr
    fs = require("fs"),
    mdrnzr = require("modernizr");

/* ==== SETTINGS ============================================================ */

const settings = {
    tasks: [
        "sprites", // создает .pug и .scss файлы, лучше запускать до соответствующих задач

        "html",
        "js",
        "css",
        "fonts",

        "images",
        "upload",

        "modernizr",

        "vendor-css",
        "vendor-js",
    ],
    path: {
        root: __dirname.replace(/\\/g, "/"),
        config: __dirname.replace(/\\/g, "/") + "/source/.config",
        in: __dirname.replace(/\\/g, "/") + "/source",
        out: __dirname.replace(/\\/g, "/") + "/../static", // static
        // out: __dirname.replace(/\\/g, '/') + '/../local/templates/main', // bitrix
    },
    server: {
        enable: true,
        path: __dirname + "/../static",
        host: "localhost",
        port: 9000,
        tunnel: false,
        open: false,
        logLevel: "silent",
    },
    timeout: 0,
    scssMaps: false,
};

/* ==== TASKS =============================================================== */

// html
(() => {
    task("html:build", () => {
        let pathSrc = settings.path.in + "/html/pages/**/*",
            pathDest = settings.path.out;

        let onlyPug = filter(["**/*.pug"], {
            restore: true,
        });

        return src(pathSrc)
            .pipe(plumber())
            .pipe(onlyPug)
            .pipe(pug({ pretty: "\t" }))
            .pipe(onlyPug.restore)
            .pipe(dest(pathDest));
    });
    task("html:watch", () => {
        return watch(
            [
                settings.path.in + "/html/**/*",
                settings.path.in + "/images/sprites.svg",
            ],
            {
                ignoreInitial: true,
            },
            series("html:build", "server:reload")
        );
    });
})();

// js
(() => {
    task("js:build", () => {
        let pathSrc = [
                settings.path.in + "/js/**/*.js",
                "!" + settings.path.in + "/js/**/plugins.js",
            ],
            pathDest = settings.path.out + "/js";

        return src(pathSrc)
            .pipe(plumber())
            .pipe(jsValidate())
            .pipe(include())
            .pipe(
                babel({
                    presets: ["@babel/preset-env"],
                })
            )
            .pipe(concat("main.js"))
            .pipe(
                minify({
                    ext: {
                        src: ".js",
                        min: ".min.js",
                    },
                })
            )
            .pipe(dest(pathDest));
    });
    task("js:watch", () => {
        return watch(
            [settings.path.in + "/js/**/*.js"],
            {
                ignoreInitial: true,
            },
            series("js:build", "server:reload")
        );
    });
})();

// css
(() => {
    task("css:build", () => {
        let pathSrc = settings.path.in + "/scss/**/*.scss",
            pathDest = settings.path.out;

        return src(pathSrc)
            .pipe(include())
            .pipe(gulpif(settings.scssMaps, sourcemaps.init()))
            .pipe(wait(settings.timeout)) // fix #8 (not atomic save)
            .pipe(scssGlob())
            .pipe(scss().on("error", scss.logError))
            .pipe(prefixer())
            .pipe(
                cssnano({
                    zindex: false,
                    discardUnused: {
                        fontFace: false,
                    },
                })
            )
            .pipe(gulpif(settings.scssMaps, sourcemaps.write(".")))
            .pipe(dest(pathDest));
    });
    task("css:watch", () => {
        return watch(
            [settings.path.in + "/scss/**/*.scss"],
            {
                ignoreInitial: true,
            },
            series("css:build", "server:reload")
        );
    });
})();

// fonts
(() => {
    task("fonts:build", () => {
        let pasthSrc = settings.path.in + "/fonts/**/*.{woff,woff2}",
            pathDest = settings.path.out + "/fonts";

        return src(pasthSrc).pipe(dest(pathDest));
    });
    task("fonts:watch", () => {
        return watch(
            [settings.path.in + "/fonts/**/*.{woff,woff2}"],
            {
                ignoreInitial: true,
            },
            series("fonts:build", "server:reload")
        );
    });
})();

// images
(() => {
    task("images:build", () => {
        let pathSrc = settings.path.in + "/images/**/*",
            pathDest = settings.path.out + "/images";

        return src(pathSrc).pipe(dest(pathDest));
    });
    task("images:watch", () => {
        return watch(
            [settings.path.in + "/images/**/*"],
            {
                ignoreInitial: true,
                delay: 1000,
            },
            series("images:build", "server:reload")
        );
    });
})();

// upload
(() => {
    task("upload:build", () => {
        let pathSrc = settings.path.in + "/upload/**/*",
            pathDest = settings.path.out + "/upload";

        return src(pathSrc).pipe(dest(pathDest));
    });
    task("upload:watch", () => {
        return watch(
            [settings.path.in + "/upload/**/*"],
            {
                ignoreInitial: true,
                delay: 1000,
            },
            series("upload:build", "server:reload")
        );
    });
})();

// sprites
(() => {
    task("sprites:build", () => {
        let pathSrc = settings.path.in + "/sprites/**/*.svg",
            pathDestSvg = settings.path.in + "/images",
            pathDestScss = settings.path.in + "/scss",
            pathDestPug = settings.path.in + "/html";

        return src(pathSrc)
            .pipe(
                svgSymbols({
                    svgAttrs: {
                        width: 0,
                        height: 0,
                        style: `position: absolute`,
                        "aria-hidden": "true",
                    },
                    id: "icon-%f",
                    class: ".icon.icon-%f",
                    templates: [
                        settings.path.config + "/sprites-template.scss",
                        settings.path.config + "/sprites-template.svg",
                        settings.path.config + "/sprites-template.pug",
                    ],
                })
            )
            .pipe(
                rename(function (path) {
                    if (path.extname == ".scss") {
                        path.basename = "_sprites";
                    } else {
                        path.basename = "sprites";
                    }
                })
            )
            .pipe(gulpif(/[.]svg$/, dest(pathDestSvg)))
            .pipe(gulpif(/[.]scss$/, dest(pathDestScss)))
            .pipe(gulpif(/[.]pug$/, dest(pathDestPug)));
    });
    task("sprites:watch", () => {
        return watch(
            [
                settings.path.config + "/sprites-template.scss",
                settings.path.config + "/sprites-template.svg",
                settings.path.config + "/sprites-template.pug",
                settings.path.in + "/sprites/**/*.svg",
            ],
            {
                ignoreInitial: true,
            },
            series("sprites:build", "server:reload")
        );
    });
})();

// modernizr
(() => {
    task("modernizr:build", (done) => {
        let config = require(settings.path.config + "/modernizr.json"),
            pathDest = settings.path.out + "/js/modernizr.js";

        mdrnzr.build(config, (code) => {
            fs.writeFile(pathDest, code, () => {
                done();
            });
        });
    });
    task("modernizr:watch", () => {
        return watch(
            [settings.path.config + "/modernizr.json"],
            {
                ignoreInitial: true,
            },
            series("modernizr:build", "server:reload")
        );
    });
})();

// vendor
(() => {
    // css
    task("vendor-css:build", () => {
        let pathSrc = settings.path.in + "/vendor/vendor.css",
            pathDest = settings.path.out + "/css";

        return src(pathSrc)
            .pipe(include())
            .pipe(
                cssnano({
                    zindex: false,
                    discardUnused: {
                        fontFace: false,
                    },
                })
            )
            .pipe(dest(pathDest));
    });
    task("vendor-css:watch", () => {
        return watch(
            [settings.path.in + "/vendor/vendor.css"],
            {
                ignoreInitial: true,
            },
            series("vendor-css:build", "server:reload")
        );
    });

    // js
    task("vendor-js:build", () => {
        let pathSrc = settings.path.in + "/vendor/vendor.js",
            pathDest = settings.path.out + "/js";

        return src(pathSrc)
            .pipe(include())
            .pipe(
                minify({
                    ext: {
                        min: ".js",
                    },
                    noSource: true,
                })
            )
            .pipe(dest(pathDest));
    });
    task("vendor-js:watch", () => {
        return watch(
            [settings.path.in + "/vendor/vendor.js"],
            {
                ignoreInitial: true,
            },
            series("vendor-js:build", "server:reload")
        );
    });
})();

/* ==== BASE TASKS =========================================================== */

// server
task("server:init", (done) => {
    if (settings.server.enable) {
        server.init({
            server: {
                baseDir: settings.server.path,
            },
            host: settings.server.host,
            port: settings.server.port,
            tunnel: settings.server.tunnel,
            open: settings.server.open,
            notify: false,
            logLevel: settings.server.logLevel,
            logPrefix: "server",
            middleware: function (req, res, next) {
                if (
                    /\.json|\.txt|\.html/.test(req.url) &&
                    req.method.toUpperCase() == "POST"
                ) {
                    console.log("[POST => GET] : " + req.url);
                    req.method = "GET";
                }
                next();
            },
        });
    }
    done();
});
task("server:reload", (done) => {
    if (settings.server.enable) {
        server.reload();
    }
    done();
});

// default tasks
var tasksBuild = [];
var tasksWatch = [];
settings.tasks.forEach((item, i) => {
    tasksBuild[i] = item + ":build";
    tasksWatch[i] = item + ":watch";
});

task("build", series(tasksBuild));
task("watch", parallel(tasksWatch));
task("default", series("server:init", "build", "watch"));
