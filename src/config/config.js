const fs = require('fs');
const os = require('os');
require('colors');
const path = require('path');
const utilsString = require('../utils/utilsString');

const configFile = path.resolve(os.homedir(), "./.goldenrace/docker-functions.config.json");

module.exports = {

    getProperty: function (property) {
        var result = undefined;
        try {
            let configData = getConfigData();
            result = configData[property];
        } catch (exception) {
            console.log(exception.brightred)
        }

        return result;
    },

    setProperty: function (property, value) {
        var result = false;
        try {
            let configData = getConfigData();
            configData[property] = value;
            const configDataString = JSON.stringify(configData, null, 2);
            fs.writeFileSync(configFile, configDataString);
            result = true;
        } catch (exception) {
            console.log(exception.brightred)
        }

        return result;
    }

}

function getConfigData() {
    var dirname = path.dirname(configFile);
    if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname);
    }
    if (!fs.existsSync(configFile)) {
        fs.writeFileSync(configFile, '{}');
    }
    let configDataRaw = fs.readFileSync(configFile);
    return JSON.parse(configDataRaw);
}