let fs = require('fs');
var uglify = require("uglify-es");
const jsdom = require("jsdom");
const rimraf = require("rimraf");
const fsExtra = require("fs-extra");
const {
    JSDOM
} = jsdom;
var distScripts = require('../../hasheconfig.json').scripts;

//get the index files
var index = fs.readFileSync('index.html').toString('utf8');
global.document = new JSDOM(index).window.document;

var args = process.argv;

if (args.indexOf('serve') == -1 && args.indexOf('build') == -1 && args.indexOf('dist') == -1) {
    console.log("\x1b[31m", "No arguments provided");
    console.log("\x1b[0m", "Use:");
    console.log("\x1b[0m", "\t\"hashe serve\" for watching files");
    console.log("\x1b[0m", "\t\"hashe dist\" for creating a build");
} else if (args.indexOf('serve') > -1) {
    console.log("\x1b[32m", "Watching for files changes ...");

    var flipx = false;
    fs.watch('hasheconfig.json', function () {
        if (flipx) {
            var totalJs = {};
            for (let j in distScripts) {
                console.log("\x1b[0m", "Compressing " + distScripts[j]);
                totalJs[distScripts[j]] = fs.readFileSync(distScripts[j]).toString('utf8');
                let scrpt = document.querySelector("script[src='"+distScripts[j]+"']");
                if(scrpt)
                document.body.removeChild(scrpt);
            }
            console.log("\x1b[0m", "Making angularjs build... ");
            fs.readdir('.', (err, files) => {
                for (var i = 0, len = files.length; i < len; i++) {
                    var match = files[i].match(/main-dist.*.js/);
                    if (match !== null)
                        fs.unlink(match[0], function () {});
                }
            });
            let minified = uglify.minify(totalJs, {
                mangle: false
            });
            if (!minified.error) {
                var uniqueName = Date.now() + Math.random(10000000000, 99999999999);
                fs.writeFileSync("main-dist." + uniqueName + ".js", minified.code);
                console.log("\x1b[32m", "Successfully build " + "main-dist." + uniqueName + ".js");


                let script = document.querySelector("script[src^='main-dist'");
                if (script)
                    document.body.removeChild(script);
                let scriptNew = document.createElement("script");
                scriptNew.src = "main-dist." + uniqueName + ".js";
                document.body.appendChild(scriptNew);
                fs.writeFileSync('index.html', "<!doctype html>\n" + document.querySelector("html").outerHTML);
                console.log("\x1b[32m", "Watching for further files changes ...");
            } else {
                console.log("\x1b[31m", minified.error);
                console.log("\x1b[32m", "Watching for further files changes ...");
            }
        }
        flipx = !flipx;
    });
    //getting all scripts from index files
    var flip = false;
    for (let i in distScripts) {
        fs.watch("./" + distScripts[i], function () {
            if (flip) {
                var totalJs = {};
                for (let j in distScripts) {
                    console.log("\x1b[0m", "Compressing " + distScripts[j]);
                    totalJs[distScripts[j]] = fs.readFileSync(distScripts[j]).toString('utf8');
                    let scrpt = document.querySelector("script[src='"+distScripts[j]+"']");
                    if(scrpt)
                    document.body.removeChild(scrpt);
                }
                console.log("\x1b[0m", "Making angularjs build... ");
                fs.readdir('.', (err, files) => {
                    for (var i = 0, len = files.length; i < len; i++) {
                        var match = files[i].match(/main-dist.*.js/);
                        if (match !== null)
                            fs.unlink(match[0], function () {});
                    }
                });
                let minified = uglify.minify(totalJs, {
                    mangle: false
                });
                if (!minified.error) {
                    var uniqueName = Date.now() + Math.random(10000000000, 99999999999);
                    fs.writeFileSync("main-dist." + uniqueName + ".js", minified.code);
                    console.log("\x1b[32m", "Successfully build " + "main-dist." + uniqueName + ".js");


                    let script = document.querySelector("script[src^='main-dist'");
                    if (script)
                        document.body.removeChild(script);
                    let scriptNew = document.createElement("script");
                    scriptNew.src = "main-dist." + uniqueName + ".js";
                    document.body.appendChild(scriptNew);
                    fs.writeFileSync('index.html', "<!doctype html>\n" + document.querySelector("html").outerHTML);
                    console.log("\x1b[32m", "Watching for further files changes ...");
                } else {
                    console.log("\x1b[31m", minified.error);
                    console.log("\x1b[32m", "Watching for further files changes ...");
                }
            }
            flip = !flip;
        });
    }
} else if (args.indexOf('dist') > -1) {
    console.log("\x1b[32m", "Creating build ...");
    var totalJs = {};
    for (let j in distScripts) {
        console.log("\x1b[0m", "Compressing " + distScripts[j]);
        totalJs[distScripts[j]] = fs.readFileSync(distScripts[j]).toString('utf8');
        let scrpt = document.querySelector("script[src='"+distScripts[j]+"']");
        if(scrpt)
        document.body.removeChild(scrpt);
    }
    console.log("\x1b[0m", "Making angularjs build... ");
    fs.readdir('.', (err, files) => {
        for (var i = 0, len = files.length; i < len; i++) {
            var match = files[i].match(/main-dist.*.js/);
            if (match !== null)
                fs.unlink(match[0], function () {});
        }
    });
    let minified = uglify.minify(totalJs, {
        mangle: false
    });
    if (!minified.error) {
        var uniqueName = Date.now() + Math.random(10000000000, 99999999999);
        fs.writeFileSync("main-dist." + uniqueName + ".js", minified.code);
        console.log("\x1b[32m", "Successfully build " + "main-dist." + uniqueName + ".js");


        let script = document.querySelector("script[src^='main-dist'");
        if (script)
            document.body.removeChild(script);
        
        

        let scriptNew = document.createElement("script");
        scriptNew.src = "main-dist." + uniqueName + ".js";
        document.body.appendChild(scriptNew);
        
        fs.writeFileSync('index.html', "<!doctype html>\n" + document.querySelector("html").outerHTML);
        // make a dist ready to get online
        console.log("\x1b[0m", "Creating dist...");
        if (fs.existsSync("dist")){
            rimraf.sync("dist");
        }
        fs.mkdirSync("dist");
        fsExtra.copy("assets", "dist/assets", function(err){});
        fsExtra.copy("views", "dist/views", function(err){});
        fsExtra.copy("main-dist." + uniqueName + ".js", "dist/main-dist." + uniqueName + ".js", function(err){});
        if(args.filter(arg => arg.indexOf("base=")).length > 0){
            let baseUrl = args.filter(arg => arg.indexOf("base=") > -1)[0].split("=")[1];
            let base = document.querySelector("base");
            if(base){
                base.href = baseUrl;
            }
            fs.writeFileSync('dist/index.html', "<!doctype html>\n" + document.querySelector("html").outerHTML);
        }
        console.log("\x1b[32m", "dist created successfully"); 
    } else {
        console.log("\x1b[31m", minified.error);
    }
}else if (args.indexOf('build') > -1) {
    console.log("\x1b[32m", "Creating build ...");
    var totalJs = {};
    for (let j in distScripts) {
        console.log("\x1b[0m", "Compressing " + distScripts[j]);
        totalJs[distScripts[j]] = fs.readFileSync(distScripts[j]).toString('utf8');
        let scrpt = document.querySelector("script[src='"+distScripts[j]+"']");
        if(scrpt)
        document.body.removeChild(scrpt);
    }
    console.log("\x1b[0m", "Making angularjs build... ");
    fs.readdir('.', (err, files) => {
        for (var i = 0, len = files.length; i < len; i++) {
            var match = files[i].match(/main-dist.*.js/);
            if (match !== null)
                fs.unlink(match[0], function () {});
        }
    });
    let minified = uglify.minify(totalJs, {
        mangle: false
    });
    if (!minified.error) {
        var uniqueName = Date.now() + Math.random(10000000000, 99999999999);
        fs.writeFileSync("main-dist." + uniqueName + ".js", minified.code);
        console.log("\x1b[32m", "Successfully build " + "main-dist." + uniqueName + ".js");


        let script = document.querySelector("script[src^='main-dist'");
        if (script)
            document.body.removeChild(script);
        let scriptNew = document.createElement("script");
        scriptNew.src = "main-dist." + uniqueName + ".js";
        document.body.appendChild(scriptNew);
        fs.writeFileSync('index.html', "<!doctype html>\n" + document.querySelector("html").outerHTML);
    } else {
        console.log("\x1b[31m", minified.error);
    }
}

console.log("\x1b[0m", "");