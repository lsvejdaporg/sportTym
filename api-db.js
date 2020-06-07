const getDbConnection = require("./db-mysql").getConnection;
const nodemailer = require('nodemailer');
const crypto = require("crypto");
const getAppConfig = require("./app-config.js").getAppConfig;
const request = require("request");

let cfg = getAppConfig();

exports.apiDb = function (req, res, obj) {
    console.log(req.pathname);
    let connection = getDbConnection();
    if (req.pathname.endsWith("/hraci")) {
        let qry = "SELECT * FROM sporttym_hraci ORDER BY cislo_dresu";
        console.log(qry);
        connection.query(qry,
            function(err, rows){
                if (err) {
                    console.error(JSON.stringify({status: "Error", error: err}));
                    obj.error = JSON.stringify(err);
                } else {
                    obj.hraci = rows;
                }
                res.end(JSON.stringify(obj));
            }
        );
    } else if (req.pathname.endsWith("/pridejHrace")) {
        let qry = "INSERT INTO sporttym_hraci (cislo_dresu, jmeno, prijmeni, rok_narozeni)";
        qry += " VALUES ('"+req.parameters.dres+"', '"+req.parameters.jmeno+"', '"+req.parameters.prijmeni+"', '"+req.parameters.roknar+"');";
        connection.query(qry,
            function(err, rows){
                if (err) {
                    console.error(JSON.stringify({status: "Error", error: err}));
                    obj.error = JSON.stringify(err);
                } else {
                }
                res.end(JSON.stringify(obj));
            }
        );
    } else if (req.pathname.endsWith("/ulozHrace")) {
        let qry = "UPDATE sporttym_hraci SET cislo_dresu = '"+req.parameters.dres+"', jmeno = '"+req.parameters.jmeno+"', prijmeni = '"+req.parameters.prijmeni+"', rok_narozeni = '"+req.parameters.roknar+"' WHERE id="+req.parameters.id;
        connection.query(qry,
            function(err, rows){
                if (err) {
                    console.error(JSON.stringify({status: "Error", error: err}));
                    obj.error = JSON.stringify(err);
                } else {
                }
                res.end(JSON.stringify(obj));
            }
        );
    } else {
        obj.status = -1;
        obj.error = "API not found";
        res.end(JSON.stringify(obj));
    }
}
