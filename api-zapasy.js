const getDbConnection = require("./db-mysql").getConnection;

exports.apiZapasy = function (req, res, obj) {
    console.log(req.pathname);
    let connection = getDbConnection();
    if (req.pathname.endsWith("/")) {
        let qry = "SELECT * FROM sporttym_zapasy ORDER BY id";
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
    } else if (req.pathname.endsWith("/pridej")) {
        let qry = "INSERT INTO sporttym_zapasy (datum, cas, misto, souper, skore)";
        qry += " VALUES ('"+req.parameters.datum+"', '"+req.parameters.cas+"', '"+req.parameters.misto+"', '"+req.parameters.souper+"', '"+req.parameters.skore+"');";
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
    } else if (req.pathname.endsWith("/uloz")) {
        let qry = "UPDATE sporttym_zapasy SET datum = '"+req.parameters.datum+"', cas = '"+req.parameters.cas+"', misto = '"+req.parameters.misto+"', souper = '"+req.parameters.souper+"', skore = '"+req.parameters.skore+"' WHERE id="+req.parameters.id;
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
