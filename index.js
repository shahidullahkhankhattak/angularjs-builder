/* libraries imports  */
let fs = require('fs');
let uglify = require("uglify-es");
const jsdom = require("jsdom");
const rimraf = require("rimraf");
const fsExtra = require("fs-extra");
const {
    JSDOM
} = jsdom;
let distScripts = JSON.parse(fs.readFileSync("hasheconfig.json").toString('utf8')).scripts;
/* libraries imports ends */

// add main-dist and node modules to gitignore if not exist
if (fs.existsSync(".gitignore")) {
    let gitIgnore = fs.readFileSync(".gitignore").toString('utf8');
    if (gitIgnore.indexOf("main-dist*.js") == -1) {
        if (gitIgnore.indexOf("node_modules") == -1) {
            gitIgnore += "\nnode_modules";
        }
        gitIgnore += "\nmain-dist*.js";
    }
    fs.writeFileSync(".gitignore", gitIgnore);
} else {
    fs.writeFileSync(".gitignore", "node_modules\nmain-dist*.js");
}

//get the index files
let index = fs.readFileSync('index.html').toString('utf8');

//add index file html to global document variable
global.document = new JSDOM(index).window.document;

//get  (build, serve, and other argument from console command)
let args = process.argv;

// if no valid arguments are provided it will print help 
if (args.indexOf('serve') == -1 && args.indexOf('build') == -1 && args.indexOf('dist') == -1) {
    console.log("\x1b[31m", "No arguments provided");
    console.log("\x1b[0m", "Use:");
    console.log("\x1b[0m", "\t\"hashe serve\" for watching files");
    console.log("\x1b[0m", "\t\"hashe dist\" for creating a build");
} else if (args.indexOf('serve') > -1) {
    // if files are being served
    console.log("\x1b[32m", "Watching for files changes ...");

    //flipx variable is used to prevent dual event firing after change in file
    let flipx = false;

    // watch for changes in hashe config file
    fs.watch('hasheconfig.json', function () {
        if (flipx) {
            // if file is changed get old scripts into an oldscript variable
            const oldScripts = distScripts;

            // get new scripts (as hasheconfig file is changed)
            distScripts = JSON.parse(fs.readFileSync("hasheconfig.json").toString('utf8')).scripts;

            // gets all new files that are added lastly
            let newfiles = distScripts.filter(f => (oldScripts.indexOf(f) < 0));

            // loop through newfiles and watch for changes in those too.
            newfiles.forEach(file => {
                let flipNew = false;
                fs.watch(file, function () {
                    if (flipNew) {

                        // hash table for all javascript files and their code
                        let totalJs = {};

                        // get all scripts and their code and add to hash table also remove those files form index.html page
                        for (let j in distScripts) {
                            console.log("\x1b[0m", "Compressing " + distScripts[j]);
                            totalJs[distScripts[j]] = fs.readFileSync(distScripts[j]).toString('utf8');
                            let scrpt = document.querySelector("script[src='" + distScripts[j] + "']");
                            if (scrpt)
                                document.body.removeChild(scrpt);
                        }
                        console.log("\x1b[0m", "Making angularjs build... ");

                        // read main directory and delete the previous main-dist.js file
                        fs.readdir('.', (err, files) => {
                            for (let i = 0, len = files.length; i < len; i++) {
                                let match = files[i].match(/main-dist.*.js/);
                                if (match !== null)
                                    fs.unlink(match[0], function () {});
                            }
                        });

                        // all code is compressed and minified into this variable now
                        let minified = uglify.minify(totalJs, {
                            mangle: false
                        });
                        if (!minified.error) {
                            // in case something wrong happens rollback the changes
                            let uniqueName = Date.now() + Math.random(10000000000, 99999999999);
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
                    flipNew = !flipNew;
                });
            });

            let totalJs = {};
            for (let j in distScripts) {
                console.log("\x1b[0m", "Compressing " + distScripts[j]);
                totalJs[distScripts[j]] = fs.readFileSync(distScripts[j]).toString('utf8');
                let scrpt = document.querySelector("script[src='" + distScripts[j] + "']");
                if (scrpt)
                    document.body.removeChild(scrpt);
            }
            console.log("\x1b[0m", "Making angularjs build... ");
            fs.readdir('.', (err, files) => {
                for (let i = 0, len = files.length; i < len; i++) {
                    let match = files[i].match(/main-dist.*.js/);
                    if (match !== null)
                        fs.unlink(match[0], function () {});
                }
            });
            let minified = uglify.minify(totalJs, {
                mangle: false
            });
            if (!minified.error) {
                let uniqueName = Date.now() + Math.random(10000000000, 99999999999);
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
    let flip = false;
    for (let i in distScripts) {
        fs.watch("./" + distScripts[i], function () {
            if (flip) {
                let totalJs = {};
                for (let j in distScripts) {
                    console.log("\x1b[0m", "Compressing " + distScripts[j]);
                    totalJs[distScripts[j]] = fs.readFileSync(distScripts[j]).toString('utf8');
                    let scrpt = document.querySelector("script[src='" + distScripts[j] + "']");
                    if (scrpt)
                        document.body.removeChild(scrpt);
                }
                console.log("\x1b[0m", "Making angularjs build... ");
                fs.readdir('.', (err, files) => {
                    for (let i = 0, len = files.length; i < len; i++) {
                        let match = files[i].match(/main-dist.*.js/);
                        if (match !== null)
                            fs.unlink(match[0], function () {});
                    }
                });
                let minified = uglify.minify(totalJs, {
                    mangle: false
                });
                if (!minified.error) {
                    let uniqueName = Date.now() + Math.random(10000000000, 99999999999);
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
    let totalJs = {};
    for (let j in distScripts) {
        console.log("\x1b[0m", "Compressing " + distScripts[j]);
        totalJs[distScripts[j]] = fs.readFileSync(distScripts[j]).toString('utf8');
        let scrpt = document.querySelector("script[src='" + distScripts[j] + "']");
        if (scrpt)
            document.body.removeChild(scrpt);
    }
    console.log("\x1b[0m", "Making angularjs build... ");
    fs.readdir('.', (err, files) => {
        for (let i = 0, len = files.length; i < len; i++) {
            let match = files[i].match(/main-dist.*.js/);
            if (match !== null)
                fs.unlink(match[0], function () {});
        }
    });
    let minified = uglify.minify(totalJs, {
        mangle: false
    });
    if (!minified.error) {
        let uniqueName = Date.now() + Math.random(10000000000, 99999999999);
        console.log("\x1b[32m", "Successfully build " + "main-dist." + uniqueName + ".js");

        let script = document.querySelector("script[src^='main-dist'");
        if (script)
            document.body.removeChild(script);

        let scriptNew = document.createElement("script");
        scriptNew.src = "main-dist." + uniqueName + ".js";
        document.body.appendChild(scriptNew);

        // make a dist ready to get online
        console.log("\x1b[0m", "Creating dist...");
        if (fs.existsSync("dist")) {
            rimraf.sync("dist");
        }

        fs.mkdirSync("dist");
        fsExtra.copy("assets", "dist/assets", function (err) {});
        fsExtra.copy("views", "dist/views", function (err) {});
        fs.writeFileSync("dist/main-dist." + uniqueName + ".js", minified.code);
        if (args.filter(arg => arg.indexOf("base=") > -1).length > 0) {
            let baseUrl = args.filter(arg => arg.indexOf("base=") > -1)[0].split("=")[1];
            let base = document.querySelector("base");
            if (base) {
                base.href = baseUrl;
            }
        }
        let cssVersion = Math.floor(Math.random() * 99999999999999999999);
        document.head.outerHTML = document.head.outerHTML.replace(/(\.css)([\?a-zA-Z\=])*(\d)*/gi, '.css?v='+cssVersion);
        fs.writeFileSync('dist/index.html', "<!doctype html>\n" + document.querySelector("html").outerHTML);


        console.log("\x1b[32m", "dist created successfully");
    } else {
        console.log("\x1b[31m", minified.error);
    }
} else if (args.indexOf('build') > -1) {
    console.log("\x1b[32m", "Creating build ...");
    let totalJs = {};
    for (let j in distScripts) {
        console.log("\x1b[0m", "Compressing " + distScripts[j]);
        totalJs[distScripts[j]] = fs.readFileSync(distScripts[j]).toString('utf8');
        let scrpt = document.querySelector("script[src='" + distScripts[j] + "']");
        if (scrpt)
            document.body.removeChild(scrpt);
    }
    console.log("\x1b[0m", "Making angularjs build... ");
    fs.readdir('.', (err, files) => {
        for (let i = 0, len = files.length; i < len; i++) {
            let match = files[i].match(/main-dist.*.js/);
            if (match !== null)
                fs.unlink(match[0], function () {});
        }
    });
    let minified = uglify.minify(totalJs, {
        mangle: false
    });
    if (!minified.error) {
        let uniqueName = Date.now() + Math.random(10000000000, 99999999999);
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