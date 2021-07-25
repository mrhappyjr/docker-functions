#! /usr/bin/env node
require('colors');
const execSync = require('child_process').execSync;
const utilsLog = require('../utils/utilsLog');
const utilsQuestion = require('../utils/utilsQuestion');
const utilsString = require('../utils/utilsString');
const utilsDockerize = require('../utils/utilsDockerize');
const customErrors = require('../errors/customErrors');

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
        var answer = await utilsQuestion.makeQuestion(
            `You want to create a ${"dockerize workspace".green} from the ${"version @goldenrace/dockerize@".green}${dockerizeVersion.green}?\n` +
            `If so, indicate the ${"path".green} where you want to create the workspace\n` + 
            `(if you do not specify the unit it will be created from the current path \"${currentPath}\"\n` +
            `and if it does not exist it will be created). Otherwise write \"n\": `);

        // TODO comprobar si la ruta introducida ya existe como workspace de dockerize (leer el fichero dockerize.worksapces.config.json)

        if (answer.toLowerCase() != 'n' && answer.toLowerCase() != 'no') {
            var dockerizeWorkspacePath = utilsString.replaceAll(answer, '\\', '/');
            if (!dockerizeWorkspacePath.includes(':')) {
                // If the path is relative
                dockerizeWorkspacePath = currentPath + dockerizeWorkspacePath;
            }
            console.log()
            var confirm = await utilsQuestion.makeQuestion(
                `Create ${"dockerize workspace".green} ${"version @goldenrace/dockerize@".green}${dockerizeVersion.green} in ${"path".green} ${dockerizeWorkspacePath.green} (y/n)? `, "", true);
            if (confirm) {
                try {
                    console.log()
                    process.stdout.write(
                        `Creating ${"dockerize workspace".green} ${"version @goldenrace/dockerize@".green}${dockerizeVersion.green} in ${"path".green} ${dockerizeWorkspacePath.green} ... `);
                    execSync(`dockerize gen-wk -o ${dockerizeWorkspacePath} -d DockerizeWorkspace_${dockerizeVersion}`, {stdio: 'pipe'});

                    // TODO comprobar si se ha creado correctamente el workspace
                } finally {
                    console.log()
                    console.log()
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
