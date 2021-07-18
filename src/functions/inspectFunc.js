#! /usr/bin/env node
const customErrors = require('../errors/customErrors');
const execSync = require('child_process').execSync;
const utilsString = require('../utils/utilsString');
const utilsArray = require('../utils/utilsArray');

const readline = require('readline');

module.exports = {

    /**
     * Search for container information using the "docker inspect" command
     * 
     * @param containersId array of one or more container names / identifiers
     * 
     * @return array with the data of each container 
     */
    getContainersData: function (containersId) {
        var containersData = inspect(containersId);

        try {
            containersData = containersData.map(element => {
                const newElement = {};
                newElement.ContainerName = element.Name;
                newElement.ContainerId = element.Config.Hostname;
                newElement.Created = element.Created;
                newElement.Status = element.State.Status;
                newElement.ExitCode = element.State.ExitCode;
                newElement.FinishedAt = element.State.FinishedAt;
                newElement.StartedAt = element.State.StartedAt;
                newElement.Health = (element.State.Health && element.State.Health.Status) ? element.State.Health.Status : undefined;
                newElement.ImageSourceName = element.Config.Image;
                newElement.ImageSourceId = element.Image.substring(7, 19);
                newElement.DockerizeWorkingDir = utilsString.replaceAll(element.Config.Labels['com.docker.compose.project.working_dir'], '\\', '/');
                newElement.DockerizeConfigFile = element.Config.Labels['com.docker.compose.project.config_files'];
                newElement.DockerizeService = element.Config.Labels['com.docker.compose.service'];
                newElement.MySQLversion = (element.Config && element.Config.Env) ? utilsArray.value(element.Config.Env, "MYSQL_VERSION=") : undefined;
                newElement.MySQLpass = (element.Config && element.Config.Env) ? utilsArray.value(element.Config.Env, "MYSQL_ROOT_PASSWORD=") : undefined;

                return newElement;
            });
            
            return containersData;
        } catch (exception) {
            console.log(`${exception}`.brightRed);
            throw `ERROR getting data from containers ${containersId}`;
        }
    },

    getAllContainersData: function () {
        return this.getContainersData(getIds('docker ps -aq'));
    },

    /**
     * Search for image information using the "docker inspect" command
     * 
     * @param imagesId array of one or more image names / identifiers
     * 
     * @return array with the data of each image 
     */
    getImagesData: function (imagesId) {
        var imagesData = inspect(imagesId);

        try {
            imagesData = imagesData.map(element => {
                const newElement = {};
                newElement.ImageName = element.RepoTags.toString();
                newElement.ImageId = element.Id.substring(7, 19);
                newElement.Created = element.Created;
                newElement.ImageParent = element.Parent.substring(7, 19);
                newElement.MySQLversion = (element.Config && element.Config.Env) ? utilsArray.value(element.Config.Env, "MYSQL_VERSION=") : undefined;
                newElement.MySQLpass = (element.Config && element.Config.Env) ? utilsArray.value(element.Config.Env, "MYSQL_ROOT_PASSWORD=") : undefined;
                newElement.Size = element.Size;

                return newElement;
            });
            
            return imagesData;
        } catch (exception) {
            console.log(`${exception}`.brightRed);
            throw `ERROR getting data from images ${imagesId}`;
        }
    },

    getAllImagesData: function (imagesId) {
        return this.getImagesData(getIds('docker image ls -aq'));
    },

    getContainerStatus: function (containerId) {
        const containerData = this.getContainersData(containerId);
        return containerData[0].Status;
    }

}

function inspect(ids) {
    process.stdout.write("Inspecting ... ");
    var param;
    if (Array.isArray(ids)) {
        param = ids.join(" ");
    } else {
        param = ids;
    }
    try {
        const result = JSON.parse(execSync(`docker inspect ${param}`, {stdio: 'pipe', maxBuffer: 10485760}).toString());
        readline.moveCursor(process.stdout, -15, 0);
        readline.clearScreenDown(process.stdout);
        return result;
    } catch (exception) {
        readline.moveCursor(process.stdout, -15, 0);
        readline.clearScreenDown(process.stdout);
        var stdoutExc = utilsString.replaceEOL(exception.stdout.toString(), "");
        if (exception.stdout && stdoutExc != '[]') {
            console.log(`${exception.stderr}`.brightRed);
            console.log(`${exception.stdout}`.green)
            return JSON.parse(exception.stdout);
        } else {
            throw new customErrors.NotFoundError(`${exception}`.brightRed + `\n` + `ERROR inspecting indexes ${ids}`);
        }
    }
}

/**
 * From a command, the function returns a array of ids
 * 
 * @param {String} command command to get a list of ids
 * 
 * @return {Array} of ids
 */
function getIds(command) {
    process.stdout.write("Reading ... ");
    try {
        const ids = execSync(command, {stdio: 'pipe'}).toString();
        const result = utilsString.toArray(ids, '\n');
        readline.moveCursor(process.stdout, -12, 0);
        readline.clearScreenDown(process.stdout);
        return result;
    } catch (exception) {
        readline.moveCursor(process.stdout, -12, 0);
        readline.clearScreenDown(process.stdout);
        console.log(`${exception}`.brightRed);
        throw `ERROR reading indexes from command ${command}`;
    }
}
