#! /usr/bin/env node
require('colors');
const execSync = require('child_process').execSync;
const utilsQuestion = require('../utils/utilsQuestion');
const utilsString = require('../utils/utilsString');
const listFunc = require('./listFunc');
const stopFunc = require('./stopFunc');
const compressing = require('compressing');
const readline = require('readline');
const fs = require('fs')

module.exports = {

    loadImage: async function (path, file) {
        var pathAndFile = path + "/" + file;
        var loadFile = await utilsQuestion.makeQuestion(
            `Do you want to load file ${pathAndFile.green} (y/n)? `, "", true);
        if (!loadFile) {
            console.log(`END. File ${pathAndFile} has not been loaded.`);
            return;
        }
        
        // inside the compressed file there is another raw file that has the name of the image
        var imageId = utilsString.replaceAll(execSync(`tar -tf \"${pathAndFile}\"`).toString(), "\n", "");
        imageId = utilsString.replaceAll(imageId, "\r", "");

        if (listFunc.imageExists(imageId)) {
            var overwrite = await utilsQuestion.makeQuestion(
                `Image ${imageId.brightRed} already exists. Do you want to ${"overwrite".brightRed} it (y/n)? `, "", true);
            if (overwrite) {
                // check if image has associated containers
                var imageContainers = listFunc.imageContainers(imageId, "ContainerName");
                if (imageContainers && imageContainers.length > 0) {
                    for (const container of imageContainers) {
                        console.log("");
                        await stopFunc.stopContainer(container);
                    }
                }
            } else {
                console.log(`END. File ${pathAndFile} has not been loaded.`);
                return;
            }
        }
        
        try {
            process.stdout.write(`Unzipping the file ${pathAndFile.green} ...`);
            await compressing.zip.uncompress(pathAndFile, path);
            readline.moveCursor(process.stdout, -3, 0);
            console.log("   ");
            console.log("");

            // TODO Save the raw file with the image name instead of the id
            process.stdout.write(`Loading image ${imageId.green} ...`);
            execSync(`docker load -i "${path + "/" + imageId}"`, {stdio: 'pipe'});
            readline.moveCursor(process.stdout, -3, 0);
            console.log("   ");
            console.log("");            

            process.stdout.write(`Deleting temporary file ...`);
            fs.unlinkSync(path + "/" + imageId);
        } finally {
            readline.moveCursor(process.stdout, -3, 0);
            console.log("   ");
            console.log("");
            if (fs.existsSync(path + "/" + imageId)) {
                process.stdout.write(`Deleting temporary file ...`);
                fs.unlinkSync(path + "/" + imageId);
                readline.moveCursor(process.stdout, -3, 0);
                console.log("   ");
                console.log("");
            }
        }

        if (listFunc.imageExists(imageId)) {
            console.log("PROCESS FINISHED: ".green +
                `Image ${imageId.green} loaded from file ${pathAndFile.green}`);
        } else {
            console.log("PROCESS FINISHED: ".brightRed +
                `Image ${imageId.brightRed} NOT loaded from file ${pathAndFile.brightRed}`);
        }
        console.log("");
    }

}
