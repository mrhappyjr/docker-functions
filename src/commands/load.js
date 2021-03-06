#! /usr/bin/env node
require('colors');
const utilsLog = require('../utils/utilsLog');
const utilsQuestion = require('../utils/utilsQuestion');
const utilsNumber = require('../utils/utilsNumber');
const utilsString = require('../utils/utilsString');
const loadFunc = require('../functions/loadFunc');
const config = require('../config/config');
const fs = require('fs');
const customErrors = require('../errors/customErrors');

module.exports = async (p, o) => {

    utilsLog.logHeader("DOCKER FUNCTION: LOAD", true, true, 100);
    const fileExtension = '.zip';
    var filesToLoad;
    var path = (config.getProperty("SAVE_PATH") && fs.existsSync(config.getProperty("SAVE_PATH")))? config.getProperty("SAVE_PATH") : process.cwd();
    path = utilsString.replaceAll(path, '\\', '/');
    var isChangeDir = false;
    try {
        do {
            isChangeDir = false;
            // read files from directory
            console.log(`Reading files from ${path}`);
            var i = 1;
            var files = fs.readdirSync(path).filter(file => file.endsWith(fileExtension));
            if (files && files.length > 0) {
                files.forEach(file => {
                    console.log(i++ + ". " + file);
                });
            } else {
                console.log(`No file with extension ${fileExtension} was found in path ${path}`.brightRed);
            }

            var answer = await utilsQuestion.makeQuestion(
                'Type \"cp\" to change directory or select the number of files to load (enter the numbers separated by \",\" or \"-\" for range): ');
            if (answer && answer.toLowerCase() == "cp") {
                // change directory
                do {
                    var changeDir = await utilsQuestion.makeQuestion(
                        'In which directory do you want to look for compressed image files? ');
                    path = utilsString.replaceAll(changeDir, '\\', '/');
                    if (!fs.existsSync(path)) {
                        console.log(`Directory \"${path}\" does not exist`.brightRed);
                    }
                } while (!fs.existsSync(path));
                config.setProperty("SAVE_PATH", path);
                isChangeDir = true;
            } else {
                var separateNumbers = utilsNumber.separateNumbers(answer);
                filesToLoad = new Array();
                for (const number of separateNumbers) {
                    var id = number - 1;
                    if (id >= 0 && id < files.length) {
                        filesToLoad.push(files[id]);
                    }
                }
            }
        } while(isChangeDir);

        console.log("Files to load:")
        filesToLoad.forEach(file => {
            console.log("  " + file);
        });
        console.log("");
        for (const file of filesToLoad) {
            await loadFunc.loadImage(path, file);
        }
    } catch (exception) {
        if (exception instanceof customErrors.ExitException) {
            console.log(exception.message)
        } else {
            console.log(`${exception}`.brightRed);
        }
    }

}
