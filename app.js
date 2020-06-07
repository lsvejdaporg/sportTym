const createSpaServer = require("spaserver").createSpaServer;
const apiDb = require('./api-db').apiDb;

const PORT = 8080; //aplikace na Rosti.cz musi bezet na portu 8080
const API_HEAD = {
    "Content-type": "application/json"
};
const API_STATUS_OK = 0;
const API_STATUS_NOT_FOUND = -1;

function processApi(req, res) {
    //console.log(req.pathname);
    res.writeHead(200, API_HEAD);
    let obj = {};
    obj.status = API_STATUS_OK;

    if (req.pathname.startsWith("/db")) {
        apiDb(req, res, obj);
        return; //MySQL query je asynchronni
    } else {
        obj.status = API_STATUS_NOT_FOUND;
        obj.error = "API not found";
    }
    res.end(JSON.stringify(obj));
}

createSpaServer(PORT, processApi);

