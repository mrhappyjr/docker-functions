#! /usr/bin/env node
require('colors');
const execSync = require('child_process').execSync;
const utilsLog = require('../utils/utilsLog');
const utilsQuestion = require('../utils/utilsQuestion');
const utilsString = require('../utils/utilsString');
const utilsDockerize = require('../utils/utilsDockerize');
const customErrors = require('../errors/customErrors');
const path = require('path');
const os = require('os');
const fs = require('fs');

const dockerizeConfigFile = path.resolve(os.homedir(), "./.goldenrace/dockerize.workspaces.config.json");

module.exports = async (p, o) => {

    utilsLog.logHeader("DOCKER FUNCTION: DOCKERIZE WORKSPACE", true, true, 100);

    try {
        // validate dockerize version
        var dockerizeVersion = utilsDockerize.getLocalVersion();
        var dockerizeVersionLast = utilsDockerize.getLastVersion();
        if (dockerizeVersion == dockerizeVersionLast) {
            console.log(`You have the latest version of dockerize installed (${dockerizeVersionLast}).`.green);
        } else {
            console.log(`You have installed a different version (${dockerizeVersion}) than the latest version of dockerize (${dockerizeVersionLast}).`.brightRed);
            console.log()
            var update = await utilsQuestion.makeQuestion(`Do you want to update dockerize before creating a new workspace? `, 'yes', true);
            if (update) {
                o.onlyUpdate = true;
                await require("./dockerizeUpdate")(p, o);
            }
        }

        dockerizeVersion = utilsDockerize.getLocalVersion();
        if (dockerizeVersion == 'notFound') {
            console.log();
            console.log(`Cannot create workspace without @goldenrace/dockerize package installed.`.brightRed);
            console.log();
            return;
        }
        var currentPath = utilsString.replaceAll(process.cwd(), '\\', '/') + '/';

        console.log()
        console.log(`\x1b[44mYou want to create a ${"dockerize workspace".green} from the ${"version @goldenrace/dockerize@".green}${dockerizeVersion.green}?\x1b[0m`);
        console.log(`\x1b[44mIf so, indicate the ${"path".green} where you want to create the workspace\x1b[0m`);
        console.log(`\x1b[44m(if you do not specify the unit it will be created from the current path \"${currentPath}\"\x1b[0m`);
        var answer = await utilsQuestion.makeQuestion(`and if it does not exist it will be created). Otherwise write \"n\": `);

        if (answer.toLowerCase() != 'n' && answer.toLowerCase() != 'no') {
            var dockerizeWorkspacePath = utilsString.replaceAll(answer, '\\', '/');
            if (!dockerizeWorkspacePath.includes(':')) {
                // If the path is relative
                dockerizeWorkspacePath = currentPath + dockerizeWorkspacePath;
            }
            // check if the entered path already exists as dockerize workspace
            if (existWS(dockerizeWorkspacePath)) {
                console.log(`In ${"path".brightRed} ${dockerizeWorkspacePath.brightRed} a dockerize workspace already exists`);
            } else {
                console.log()
                var confirm = await utilsQuestion.makeQuestion(
                    `Create ${"dockerize workspace".green} ${"version @goldenrace/dockerize@".green}${dockerizeVersion.green} in ${"path".green} ${dockerizeWorkspacePath.green} (y/n)? `, "", true);
                if (confirm) {
                    try {
                        console.log()
                        process.stdout.write(
                            `Creating ${"dockerize workspace".green} ${"version @goldenrace/dockerize@".green}${dockerizeVersion.green} in ${"path".green} ${dockerizeWorkspacePath.green} ... `);
                        execSync(`dockerize gen-wk -o ${dockerizeWorkspacePath} -d DockerizeWorkspace_${dockerizeVersion}`, {stdio: 'pipe'});

                        // check if the workspace has been created correctly
                        if (existWS(dockerizeWorkspacePath)) {
                            console.log(`${"SUCESS".green}. ${"Dockerize workspace".green} ${"version @goldenrace/dockerize@".green}${dockerizeVersion.green} created correctly in ${"path".green} ${dockerizeWorkspacePath.green}.`);
                        } else {
                            console.log(`${"ERROR".brightRed}. ${"Dockerize workspace".brightRed} ${"version @goldenrace/dockerize@".brightRed}${dockerizeVersion.brightRed} not created in ${"path".brightRed} ${dockerizeWorkspacePath.brightRed}.`);
                        }
                    } finally {
                        console.log()
                        console.log()
                    }
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

function readWS() {
    try {
        let configDataRaw = fs.readFileSync(dockerizeConfigFile);
        let configData =  JSON.parse(configDataRaw);
        result = configData["workspaces"];
    } catch (exception) {
        console.log(exception.brightred)
    }
    return result;
}

function existWS(wsPath) {
    return readWS().some(ws => utilsString.replaceAll(ws.workspacePath, '\\', '/').toLowerCase() == utilsString.replaceAll(wsPath, '\\', '/').toLowerCase());
}
