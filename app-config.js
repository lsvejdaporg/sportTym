const fs = require('fs');

let appConfig;

exports.getAppConfig = function () {
    if (!appConfig) {
        let json = fs.readFileSync("app-config.json");
        appConfig = JSON.parse(json);
    }
    return appConfig;
}
