#! /usr/bin/env node
const execSync = require('child_process').execSync;
const utilsString = require('../utils/utilsString');
const utilsArray = require('../utils/utilsArray');

module.exports = {

    /**
     * Search for container information using the "docker inspect" command
     * 
     * @param containersId one or more container names / identifiers, separated by " "
     * 
     * @return array with the data of each container 
     */
    getContainersData: function (containersId) {
        var containersData = JSON.parse(execSync(`docker inspect ${containersId}`, {maxBuffer: 10485760}).toString());

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
            newElement.MySQLversion = element.Config.Env ? utilsArray.value(element.Config.Env, "MYSQL_VERSION=") : undefined;
            newElement.MySQLpass = element.Config.Env ? utilsArray.value(element.Config.Env, "MYSQL_ROOT_PASSWORD=") : undefined;

            return newElement;
        });
        
        return containersData;
    }

}
