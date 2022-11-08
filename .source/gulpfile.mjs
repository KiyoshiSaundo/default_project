import gulp from "gulp";
import plumber from "gulp-plumber";
import filter from "gulp-filter";
import include from "gulp-include";
import wait from "gulp-wait";
import gulpif from "gulp-if";
import rename from "gulp-rename";
import fs from "fs";
import pug from "gulp-pug";
import babel from "gulp-babel";
import concat from "gulp-concat";
import minify from "gulp-minify";
import jsValidate from "gulp-jsvalidate";
import gulpSass from "gulp-sass";
import dartSass from "sass";
import scssGlob from "gulp-sass-glob";
import sourcemaps from "gulp-sourcemaps";
import autoprefixer from "gulp-autoprefixer";
import cssnano from "gulp-cssnano";
import imagemin from "gulp-imagemin";
import svgSymbols from "gulp-svg-symbols";
import modernizr from "modernizr";
import browserSync from "browser-sync";

const scss = gulpSass(dartSass);
const server = browserSync.create();

/* ==== SETTINGS ============================================================ */

const settings = {
    tasks: [
        "sprites", // создает .pug и .scss файлы, надо запускать до соответствующих задач

        "html",
        "js",
        "css",

        "fonts",

        "images",
        "upload",

        "modernizr",

        "vendorCss",
        "vendorJs",
    ],
    path: {
        config: "source/.config",
        in: "source",
        out: "../static", // static
        // out: "../local/templates/main", // bitrix
    },
    server: {
        enable: true,
        host: "localhost",
        port: 9000,
        tunnel: false,
        open: false,
        logLevel: "silent",
    },
    sourcemaps: false,
    timeout: 0,
    imageMin: false,
};

/* ==== PRESETS ============================================================= */

let preset = "";
process.argv.forEach((item) => {
    if (item.match(/\-\-custom/)) {
        preset = item.split("=")[1];
    }
});

switch (preset) {
    case "custom-dev":
        settings.server.enable = true;
        settings.imageMin = false;
        break;
    case "custom-build":
        settings.server.enable = false;
        settings.imageMin = true;
        break;
}

/* ==== SERVER ============================================================== */

const serverInit = (done) => {
    if (settings.server.enable) {
        server.init({
            server: { baseDir: settings.path.out },
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
};
const serverReload = (done) => {
    if (settings.server.enable) {
        server.reload();
    }
    done();
};

/* ==== TASKS =============================================================== */

/* html */

export const htmlBuild = () => {
    let pathSrc = settings.path.in + "/html/pages/**/*",
        pathDest = settings.path.out;

    let onlyPug = filter(["**/*.pug"], { restore: true });

    return gulp
        .src(pathSrc)
        .pipe(plumber())
        .pipe(onlyPug)
        .pipe(pug({ pretty: "    " }))
        .pipe(onlyPug.restore)
        .pipe(gulp.dest(pathDest));
};
const htmlWatch = () => {
    return gulp.watch(
        [
            settings.path.in + "/html/**/*",
            settings.path.in + "/images/sprites.svg",
        ],
        { ignoreInitial: true },
        gulp.series(htmlBuild, serverReload)
    );
};

/* js */

export const jsBuild = () => {
    let pathSrc = [
            settings.path.in + "/js/**/*.js",
            "!" + settings.path.in + "/js/**/plugins.js",
        ],
        pathDest = settings.path.out + "/js";

    return gulp
        .src(pathSrc)
        .pipe(plumber())
        .pipe(jsValidate())
        .pipe(include())
        .pipe(babel({ presets: ["@babel/preset-env"] }))
        .pipe(concat("main.js"))
        .pipe(minify({ ext: { min: ".js" }, noSource: true }))
        .pipe(gulp.dest(pathDest));
};
const jsWatch = () => {
    return gulp.watch(
        [settings.path.in + "/js/**/*.js"],
        { ignoreInitial: true },
        gulp.series(jsBuild, serverReload)
    );
};

/* css */

export const cssBuild = () => {
    let pathSrc = settings.path.in + "/scss/**/*.scss",
        pathDest = settings.path.out;

    return gulp
        .src(pathSrc)
        .pipe(include())
        .pipe(gulpif(settings.sourcemaps, sourcemaps.init()))
        .pipe(wait(settings.timeout)) // fix #8 (not atomic save)
        .pipe(scssGlob())
        .pipe(scss().on("error", scss.logError))
        .pipe(autoprefixer())
        .pipe(
            cssnano({
                zindex: false,
                discardUnused: { fontFace: false },
            })
        )
        .pipe(gulpif(settings.sourcemaps, sourcemaps.write(".")))
        .pipe(gulp.dest(pathDest));
};
const cssWatch = () => {
    return gulp.watch(
        [settings.path.in + "/scss/**/*.scss"],
        { ignoreInitial: true },
        gulp.series(cssBuild, serverReload)
    );
};

/* fonts */

export const fontsBuild = () => {
    let pasthSrc = settings.path.in + "/fonts/**/*.{woff,woff2}",
        pathDest = settings.path.out + "/fonts";

    return gulp.src(pasthSrc).pipe(gulp.dest(pathDest));
};
const fontsWatch = () => {
    return gulp.watch(
        [settings.path.in + "/fonts/**/*.{woff,woff2}"],
        { ignoreInitial: true },
        gulp.series(fontsBuild, serverReload)
    );
};
/* images */

export const imagesBuild = () => {
    let pathSrc = settings.path.in + "/images/**/*",
        pathDest = settings.path.out + "/images";

    return gulp
        .src(pathSrc)
        .pipe(gulpif(settings.imageMin, imagemin()))
        .pipe(gulp.dest(pathDest));
};
const imagesWatch = () => {
    return gulp.watch(
        [settings.path.in + "/images/**/*"],
        { ignoreInitial: true, delay: 1000 },
        gulp.series(imagesBuild, serverReload)
    );
};

/* upload */

export const uploadBuild = () => {
    let pathSrc = settings.path.in + "/upload/**/*",
        pathDest = settings.path.out + "/upload";

    return gulp.src(pathSrc).pipe(gulp.dest(pathDest));
};
const uploadWatch = () => {
    return gulp.watch(
        [settings.path.in + "/upload/**/*"],
        { ignoreInitial: true, delay: 1000 },
        gulp.series(uploadBuild, serverReload)
    );
};

/* sprites */

export const spritesBuild = () => {
    let pathSrc = settings.path.in + "/sprites/**/*.svg",
        pathDestSvg = settings.path.in + "/images",
        pathDestScss = settings.path.in + "/scss",
        pathDestPug = settings.path.in + "/html";

    return gulp
        .src(pathSrc)
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
        .pipe(gulpif(/[.]svg$/, gulp.dest(pathDestSvg)))
        .pipe(gulpif(/[.]scss$/, gulp.dest(pathDestScss)))
        .pipe(gulpif(/[.]pug$/, gulp.dest(pathDestPug)));
};
const spritesWatch = () => {
    return gulp.watch(
        [
            settings.path.config + "/sprites-template.scss",
            settings.path.config + "/sprites-template.svg",
            settings.path.config + "/sprites-template.pug",
            settings.path.in + "/sprites/**/*.svg",
        ],
        { ignoreInitial: true },
        gulp.series(spritesBuild, serverReload)
    );
};

/* modernizr */

export const modernizrBuild = (done) => {
    let config = JSON.parse(
            fs.readFileSync(settings.path.config + "/modernizr.json")
        ),
        pathDest = settings.path.out + "/js/modernizr.js";

    modernizr.build(config, (code) => {
        fs.writeFile(pathDest, code, () => {
            done();
        });
    });
};
const modernizrWatch = () => {
    return gulp.watch(
        [settings.path.config + "/modernizr.json"],
        { ignoreInitial: true },
        gulp.series(modernizrBuild, serverReload)
    );
};

/* vendors - css */

export const vendorCssBuild = () => {
    let pathSrc = settings.path.in + "/vendor/vendor.css",
        pathDest = settings.path.out + "/css";

    return gulp
        .src(pathSrc)
        .pipe(include())
        .pipe(
            cssnano({
                zindex: false,
                discardUnused: { fontFace: false },
            })
        )
        .pipe(gulp.dest(pathDest));
};
const vendorCssWatch = () => {
    return gulp.watch(
        [settings.path.in + "/vendor/vendor.css"],
        { ignoreInitial: true },
        gulp.series(vendorCssBuild, serverReload)
    );
};

/* vendors - js */

export const vendorJsBuild = () => {
    let pathSrc = settings.path.in + "/vendor/vendor.js",
        pathDest = settings.path.out + "/js";

    return gulp
        .src(pathSrc)
        .pipe(include())
        .pipe(minify({ ext: { min: ".js" }, noSource: true }))
        .pipe(gulp.dest(pathDest));
};
const vendorJsWatch = () => {
    return gulp.watch(
        [settings.path.in + "/vendor/vendor.js"],
        { ignoreInitial: true },
        gulp.series(vendorJsBuild, serverReload)
    );
};

/* ==== BASE TASKS ========================================================== */

let building = [],
    watching = [];

for (let task of settings.tasks) {
    building.push(eval(task + "Build"));
    watching.push(eval(task + "Watch"));
}

const gulpBuild = gulp.series(building);
const gulpWatch = gulp.parallel(watching);
const gulpDefault = gulp.series(serverInit, gulpBuild, gulpWatch);

export { gulpBuild as build };
export { gulpWatch as watch };
export default gulpDefault;
