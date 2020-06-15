const createSpaServer = require("spaserver").createSpaServer;
const apiHraci = require('./api-hraci').apiHraci;
const apiZapasy = require('./api-zapasy').apiZapasy;
const apiNominace = require('./api-nominace').apiNominace;

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

    if (req.pathname.startsWith("/hraci")) {
        apiHraci(req, res, obj);
        return; //MySQL query je asynchronni
    } else if (req.pathname.startsWith("/zapasy")) {
        apiZapasy(req, res, obj);
        return; //MySQL query je asynchronni
    } else if (req.pathname.startsWith("/nominace")) {
        apiNominace(req, res, obj);
        return; //MySQL query je asynchronni
    } else {
        obj.status = API_STATUS_NOT_FOUND;
        obj.error = "API not found";
    }
    res.end(JSON.stringify(obj));
}

createSpaServer(PORT, processApi);

