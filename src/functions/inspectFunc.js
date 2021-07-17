#! /usr/bin/env node
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
            newElement.ImageSource = element.Config.Image;
            newElement.DockerizeWorkingDir = utilsString.replaceAll(element.Config.Labels['com.docker.compose.project.working_dir'], '\\', '/');
            newElement.DockerizeConfigFile = element.Config.Labels['com.docker.compose.project.config_files'];
            newElement.DockerizeService = element.Config.Labels['com.docker.compose.service'];
            newElement.MySQLversion = (element.Config && element.Config.Env) ? utilsArray.value(element.Config.Env, "MYSQL_VERSION=") : undefined;
            newElement.MySQLpass = (element.Config && element.Config.Env) ? utilsArray.value(element.Config.Env, "MYSQL_ROOT_PASSWORD=") : undefined;

            return newElement;
        });
        
        return containersData;
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

        imagesData = imagesData.map(element => {
            const newElement = {};
            newElement.ImageName = element.RepoTags;
            newElement.ImageId = element.Id.substring(7, 19);
            newElement.Created = element.Created;
            newElement.ImageParent = element.Parent.substring(7, 19);
            newElement.MySQLversion = (element.Config && element.Config.Env) ? utilsArray.value(element.Config.Env, "MYSQL_VERSION=") : undefined;
            newElement.MySQLpass = (element.Config && element.Config.Env) ? utilsArray.value(element.Config.Env, "MYSQL_ROOT_PASSWORD=") : undefined;
            newElement.Size = element.Size;

            return newElement;
        });
        
        return imagesData;
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
    const result = JSON.parse(execSync(`docker inspect ${param}`, {maxBuffer: 10485760}).toString());
    readline.moveCursor(process.stdout, -15, 0);
    readline.clearScreenDown(process.stdout);
    return result;
}
