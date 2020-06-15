const getDbConnection = require("./db-mysql").getConnection;
const decodeStringColumns = require("./db-mysql").decodeStringColumns;

exports.apiHraci = function (req, res, obj) {
    console.log(req.pathname);
    let connection = getDbConnection();
    if (req.pathname.endsWith("/")) {
        let qry = "SELECT h.*, COALESCE(SUM(n.je_nominovan),0) as z, COALESCE(SUM(n.goly),0) as g, COALESCE(SUM(n.asistence),0) as a";
        qry += " FROM sporttym_hraci h LEFT JOIN sporttym_nominace n ON h.id = n.hraci_id";
        qry += " GROUP BY h.id";
        qry += " ORDER BY h.cislo_dresu";
        console.log(qry);
        connection.query(qry,
            function(err, rows, cols){
                if (err) {
                    console.error(JSON.stringify({status: "Error", error: err}));
                    obj.error = JSON.stringify(err);
                } else {
                    console.log(rows);
                    decodeStringColumns(rows, cols);
                    obj.hraci = rows;
                }
                res.end(JSON.stringify(obj));
            }
        );
    } else if (req.pathname.endsWith("/pridej")) {
        let qry = "INSERT INTO sporttym_hraci (cislo_dresu, jmeno, prijmeni, rok_narozeni)";
        qry += " VALUES ('"+req.parameters.dres+"', '"+req.parameters.jmeno+"', '"+req.parameters.prijmeni+"', '"+req.parameters.roknar+"');";
        connection.query(qry,
            function(err, rows){
                if (err) {
                    console.error(JSON.stringify({status: "Error", error: err}));
                    obj.error = JSON.stringify(err);
                } else {
                    console.log(rows);
                    console.log("### "+rows.insertId);
                }
                res.end(JSON.stringify(obj));
            }
        );
    } else if (req.pathname.endsWith("/uloz")) {
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
