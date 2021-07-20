const fs = require('fs');
const path = require('path');
const utilsString = require('../utils/utilsString');

const appRoot = utilsString.replaceAll(path.resolve(__dirname), '\\', '/');
const configFile = appRoot + '/config.json';

module.exports = {

    getProperty: function (property) {
        var result = undefined;
        try {
            let configData = getConfigData();
            result = configData[property];
        } catch (exception) {
            console.log(exception)
            console.log(exception.message)
            console.log(exception.stack)
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
            console.log(exception)
            console.log(exception.message)
            console.log(exception.stack)
        }

        return result;
    }

}

function getConfigData() {
    if (!fs.existsSync(configFile)) {
        fs.writeFileSync(configFile, '{}');
    }
    let configDataRaw = fs.readFileSync(configFile);
    return JSON.parse(configDataRaw);
}