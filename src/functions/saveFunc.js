#! /usr/bin/env node
require('colors');
const execSync = require('child_process').execSync;
const utilsQuestion = require('../utils/utilsQuestion');
const utilsString = require('../utils/utilsString');
const config = require('../config/config');
const compressing = require('compressing');
const readline = require('readline');
const fs = require('fs')

module.exports = {

    saveImage: async function (image) {
        console.log(`SAVE image: ` + image.ImageName.green)
        var savePath = (config.getProperty("SAVE_PATH") && fs.existsSync(config.getProperty("SAVE_PATH")))? config.getProperty("SAVE_PATH") : process.cwd();
        savePath = utilsString.replaceAll(savePath, '\\', '/');
        savePath = savePath.endsWith('/') ? savePath : (savePath + '/');
        const fileExtension = '.zip';
        var fileName = image.ImageName.split('/')[image.ImageName.split('/').length - 1].replace(':', '_');
        var fileNameToSave = await utilsQuestion.makeQuestion(
            `Write the ${"absolute path and the name of the file".green} where you want to ${"save".green} a compressed copy of image ${image.ImageName.green}:\n  `, 
            savePath + fileName + fileExtension);
        var proceed = false;
        // check if there is an file with the same name
        do {
            if (fs.existsSync(fileNameToSave)) {
                var newFileNameToSave = await utilsQuestion.makeQuestion(
                    'This file already exists. Change the name or press enter to overwrite it: '.brightRed, 
                    fileNameToSave);
                if (newFileNameToSave == fileNameToSave) {
                    proceed = true;
                } else {
                    fileNameToSave = newFileNameToSave;
                }
            } else {
                proceed = true;
            }
        } while (proceed == false);

        var answer = await utilsQuestion.makeQuestion(
            `Do you want to save image ${image.ImageName.green} in file ${fileNameToSave.green} (y/n)? `, "", true);

        if (answer) {
            savePath = utilsString.getPath(fileNameToSave);
            if (!fs.existsSync(savePath)) {
                fs.mkdirSync(savePath);
            }
            config.setProperty("SAVE_PATH", savePath);
            try {
                process.stdout.write(`Saving image ${image.ImageName.green} in temporary file ...`);
                execSync(`docker save "${image.ImageName}" -o "${savePath + image.ImageId}"`, {stdio: 'pipe'});
                readline.moveCursor(process.stdout, -3, 0);
                console.log("   ");
                console.log("");

                process.stdout.write(`Compressing image ${image.ImageName.green} in file ${fileNameToSave.green} ...`);
                await compressing.zip.compressFile(savePath + image.ImageId, fileNameToSave);
                readline.moveCursor(process.stdout, -3, 0);
                console.log("   ");
                console.log("");

                process.stdout.write(`Deleting temporary file ...`);
                fs.unlinkSync(savePath + image.ImageId);
            } finally {
                readline.moveCursor(process.stdout, -3, 0);
                console.log("   ");
                console.log("");
                if (fs.existsSync(savePath + image.ImageId)) {
                    process.stdout.write(`Deleting temporary file ...`);
                    fs.unlinkSync(savePath + image.ImageId);
                    readline.moveCursor(process.stdout, -3, 0);
                    console.log("   ");
                    console.log("");
                }
            }

            if (fs.existsSync(fileNameToSave)) {
                console.log("PROCESS FINISHED: ".green +
                    `File ${fileNameToSave.green} created from image ${image.ImageName.green}`);
            } else {
                console.log("PROCESS FINISHED: ".brightRed +
                    `File ${fileNameToSave.brightRed} NOT created from image ${image.ImageName.brightRed}`);
            }
        } else {
            console.log(`END. Image ${image.ImageName} has not been saved.`);
        }
    }

}
