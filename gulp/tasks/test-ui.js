var gulp = require('gulp');
var path = require('path');
var statik = require('statik');
var exec = require('child_process').exec;

function buildTestimCmd(options) {
    return Object.keys(options || {}).reduce(function(cmd, key) {
        var vals = options[key] instanceof Array ?
            options[key] :
            [options[key]];
        var fixedKey = key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
        return vals.reduce(function (cmd, val) {
            return cmd + " --" + fixedKey + " " + val;
        }, cmd);
    }, "testim");
}

function runCmd(cmd) {
    return new Promise(function(resolve){
        var runner = exec(cmd, function(err){
            resolve(!!err ? 1 : 0);
        });
        runner.stdout.pipe(process.stdout);
        runner.stderr.pipe(process.stderr);
    });
}

function runCmdAndExit(cmd) {
    return runCmd(cmd).then(function(code) {
        process.exit(code);
    });
}

function run(options) {
    return runCmd(buildTestimCmd(options));
}

function runAndExit(options) {
    return runCmdAndExit(buildTestimCmd(options));
}

exports.task = function () {
    const port = 8000;
    const deployDir = path.normalize(process.cwd() + '/../test/testpage');

    console.log('---starting local server on port ' + port + "---");
    statik({
        port: port,
        root: deployDir
    });

    const args = {
        host: process.env.GRID_HOST,
        project: process.env.TESTIM_PROJECT_ID,
        token: process.env.TESTIM_TOKEN,
        port: 4444,
        reportFile: process.env.CIRCLE_TEST_REPORTS ? process.env.CIRCLE_TEST_REPORTS + '/testim/testim-report.xml': null,
        ext: '/opt/testim-headless',
        label: ["sanity"]
    };

    console.log('---run test---');
    return runAndExit(args);
};
