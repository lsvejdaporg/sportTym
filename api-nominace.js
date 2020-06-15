const getDbConnection = require("./db-mysql").getConnection;

exports.apiNominace = function (req, res, obj) {
    console.log(req.pathname);
    let connection = getDbConnection();
    if (req.pathname.endsWith("/")) {
        let qry = "SELECT h.*,n.je_nominovan,n.goly,n.asistence FROM sporttym_hraci h LEFT JOIN sporttym_nominace n ON h.id = n.hraci_id WHERE n.zapasy_id="+req.parameters.zapas+" ORDER BY h.cislo_dresu";
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
    } else if (req.pathname.endsWith("/uloz")) {
        let qry = "DELETE FROM sporttym_nominace WHERE zapasy_id="+req.parameters.zapas+" AND hraci_id="+req.parameters.hrac;
        connection.query(qry,
            function(err, rows){
                if (err) {
                    console.error(JSON.stringify({status: "Error", error: err}));
                    obj.error = JSON.stringify(err);
                } else {
                    console.log(rows);
                    let qry = "INSERT INTO sporttym_nominace (zapasy_id,hraci_id,goly,asistence) VALUES ("+req.parameters.zapas+","+req.parameters.hrac+","+req.parameters.g+","+req.parameters.a+")";
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
                res.end(JSON.stringify(obj));
            }
        );
    } else {
        obj.status = -1;
        obj.error = "API not found";
        res.end(JSON.stringify(obj));
    }
}
