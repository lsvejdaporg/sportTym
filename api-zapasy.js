const getDbConnection = require("./db-mysql").getConnection;
const decodeStringColumns = require("./db-mysql").decodeStringColumns;

exports.apiZapasy = function (req, res, obj) {
    console.log(req.pathname);
    let connection = getDbConnection();
    if (req.pathname.endsWith("/")) {
        let qry = "SELECT * FROM sporttym_zapasy";
        if (req.parameters.id) {
            qry += " WHERE id="+req.parameters.id;
        } else {
            qry += " ORDER BY id";
        }
        console.log(qry);
        connection.query(qry,
            function(err, rows, cols){
                if (err) {
                    console.error(JSON.stringify({status: "Error", error: err}));
                    obj.error = JSON.stringify(err);
                } else {
                    decodeStringColumns(rows, cols);
                    obj.zapasy = rows;
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
                    console.log(rows);
                    obj.id = rows.insertId;
                    let qry = "INSERT INTO sporttym_nominace (zapasy_id, hraci_id)";
                    qry += " SELECT "+rows.insertId+", id FROM sporttym_hraci;";
                    connection.query(qry,
                        function(err, rows){
                            if (err) {
                                console.error(JSON.stringify({status: "Error", error: err}));
                                obj.error = JSON.stringify(err);
                            } else {
                                console.log(rows);
                            }
                            res.end(JSON.stringify(obj));
                        }
                    );
                }
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
                    console.log(rows);
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
