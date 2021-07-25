#! /usr/bin/env node
require('colors');
const execSync = require('child_process').execSync;
const utilsLog = require('../utils/utilsLog');
const utilsQuestion = require('../utils/utilsQuestion');
const utilsString = require('../utils/utilsString');
const utilsDockerize = require('../utils/utilsDockerize');
const customErrors = require('../errors/customErrors');

module.exports = async (p, o) => {

    utilsLog.logHeader("DOCKER FUNCTION: DOCKERIZE UPDATE", true, true, 100);

    try {
        // validate dockerize version
        var dockerizeVersion = utilsDockerize.getLocalVersion();
        var dockerizeVersionLast = utilsDockerize.getLastVersion();
        if (dockerizeVersion == dockerizeVersionLast) {
            console.log(`You have the latest version of dockerize installed (${dockerizeVersionLast}).`.green);
        } else {
            var update;
            if (o.onlyUpdate) {
                update = true;
            } else {
                console.log(`You have installed a different version (${dockerizeVersion}) than the latest version of dockerize (${dockerizeVersionLast}).`.brightRed);
                console.log()
                update = await utilsQuestion.makeQuestion(`Do you want to update dockerize? `, 'yes', true);
                console.log()
            }
            if (update) {
                try {
                    process.stdout.write(`Installing the latest version of dockerize (${dockerizeVersionLast}) ... `);
                    execSync(`npm i -g @goldenrace/dockerize`, {stdio: 'pipe'});
                } finally {
                    console.log()
                    console.log()
                }

                dockerizeVersion = utilsDockerize.getLocalVersion();
                dockerizeVersionLast = utilsDockerize.getLastVersion();
                if (dockerizeVersion == dockerizeVersionLast) {
                    console.log(`Finished process. Installed version ${dockerizeVersion}`.green);
                } else {
                    console.log(`Finished process. Installed version ${dockerizeVersion}. Not the last (${dockerizeVersionLast})`.brightRed);
                }

                if (!o.onlyUpdate) {
                    await require("./dockerizeWS")(p, o);
                }
            }
        }
    } catch (exception) {
        if (exception instanceof customErrors.ExitException) {
            console.log()
            console.log(exception.message)
        } else {
            console.log(`${exception}`.brightRed);
            console.log(`${exception.stack}`.brightRed);
        }
    }

}
