const getDbConnection = require("./db-mysql").getConnection;
const nodemailer = require('nodemailer');
const crypto = require("crypto");
const getAppConfig = require("./app-config.js").getAppConfig;
const request = require("request");

let cfg = getAppConfig();

function hashPassword(pwd) {
    let hash;
    //rainbow databaze https://en.wikipedia.org/wiki/Rainbow_table
    { //jednoduchy hash ...otestujte na https://crackstation.net/
        hash = crypto.createHash("sha256").update(pwd).digest("hex");
        for (let i=0; i < 10; i++) { //opakovane hashovani hashe pro zmateni hackera ;-)
            hash = crypto.createHash("sha256").update(hash).digest("hex");
        }
        hash = hash.split("").reverse().join(""); //a jeste pro jistotu pozpatku ;-)
    }
    { //hash se "soli", na kterem by nemely fungovat rainbow databaze
        // salt = pwd.split("").reverse().join(""); //pozpatku
        // let hash = crypto.createHmac("sha256", salt).update(pwd).digest("hex");
    }
    return hash;
}

let loggedUsers = new Array();
exports.getLoggedUser = function (token) {
    let u = loggedUsers[token];
    console.log(token+": "+u);
    return u;
};

exports.apiDb = function (req, res, obj) {
    let connection = getDbConnection();
    if (req.pathname.endsWith("/tridy")) {
        connection.query(
            `SELECT * FROM spaserverexample_tridy ORDER BY rocnik,oznaceni`,
            function(err, rows){
                if (err) {
                    console.error(JSON.stringify({status: "Error", error: err}));
                    obj.error = JSON.stringify(err);
                } else {
                    obj.tridy = rows;
                }
                res.end(JSON.stringify(obj));
            }
        );
    } else if (req.pathname.endsWith("/studenti")) {
        let qry = "SELECT s.id,s.jmeno,s.prijmeni,t.rocnik,t.oznaceni as 'oznaceni_tridy',s.cislo_podle_tridnice FROM spaserverexample_studenti s, spaserverexample_tridy t WHERE t.id=s.tridy_id";
        qry += " AND s.stav=1";
        if (req.parameters.trida) { //pokud je zadana trida, vybereme jen studenty z dane tridy
            qry += " AND t.id="+req.parameters.trida;
        }
        if (req.parameters.text) { //pokud je zadan vyhledavany text, vybereme jen studenty, jejichz jmeno nebo prijmeni obsahuje dany text
            qry += " AND (s.jmeno LIKE '%"+req.parameters.text+"%' OR s.prijmeni LIKE '%"+req.parameters.text+"%')";
        }
        qry += " ORDER BY prijmeni,jmeno,rocnik"; //setridime primarne podle prijmeni
        console.log(qry);
        connection.query(qry,
            function(err, rows){
                if (err) {
                    console.error(JSON.stringify({status: "Error", error: err}));
                    obj.error = JSON.stringify(err);
                } else {
                    obj.studenti = rows;
                }
                res.end(JSON.stringify(obj));
            }
        );
    } else if (req.pathname.endsWith("/smazStudenta")) {
//        let qry = "DELETE FROM spaserverexample_studenti WHERE id="+req.parameters.id;
        let qry = "UPDATE spaserverexample_studenti SET stav = '2' WHERE id="+req.parameters.id;
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
    } else if (req.pathname.endsWith("/pridejStudenta")) {
        let qry = "INSERT INTO spaserverexample_studenti (tridy_id, jmeno, prijmeni, cislo_podle_tridnice)";
        qry += " VALUES ('"+req.parameters.trida+"', '"+req.parameters.jmeno+"', '"+req.parameters.prijmeni+"', '0');";
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
    } else if (req.pathname.endsWith("/ulozStudenta")) {
        let qry = "UPDATE spaserverexample_studenti SET tridy_id = '"+req.parameters.trida+"', jmeno = '"+req.parameters.jmeno+"', prijmeni = '"+req.parameters.prijmeni+"' WHERE id="+req.parameters.id;
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
    } else if (req.pathname.endsWith("/pridejUzivatele")) {

        if (!req.parameters.gr) {
            console.error("no captcha data");
            obj.error = "No captcha data";
            res.end(JSON.stringify(obj));
            return;
        }
        const secretKey = "6LddseYUAAAAAPAabNBlfjnnnmU8zct2SiMMjld0";
        console.log("req.connection.remoteAddress:"+req.connection.remoteAddress);
        const verificationURL = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.parameters.gr + "&remoteip=" + req.connection.remoteAddress;

        request(verificationURL,function(error,response,body) {
            body = JSON.parse(body);
            if(body.success !== undefined && !body.success) {
                obj.error = "Failed captcha verification";
                res.end(JSON.stringify(obj));
                return;
            } else {

                let token = crypto.randomBytes(32).toString("hex");
                let qry = "INSERT INTO uzivatele (ln, pw, em, token)";
                qry += " VALUES ('"+req.parameters.ln+"', '"+hashPassword(req.parameters.pw)+"', '"+req.parameters.em+"', '"+token+"');";
                connection.query(qry,
                    function(err, rows){
                        if (err) {
                            console.error(JSON.stringify({status: "Error", error: err}));
                            obj.error = JSON.stringify(err);
                        } else {
                            const transporter = nodemailer.createTransport({
                                host: cfg.mailer.host, // hostname
                                secureConnection: false, // TLS requires secureConnection to be false
                                port: cfg.mailer.port, // port for secure SMTP
                                tls: {
                                    ciphers: 'SSLv3'
                                },
                                auth: {
                                    user: cfg.mailer.user,
                                    pass: cfg.mailer.pass
                                }
                            });

                            const mailOptions = {
                                from: cfg.mailer.from, // sender address (who sends)
                                to: req.parameters.em, // list of receivers (who receives)
                                subject: 'Overeni e-mailu', // Subject line
                                //text: 'Testíček z Node.js', // plaintext body
                                html: `Potvrdte vas e-mail kliknutim <a href="http://127.0.0.1/db/overUzivatele?token=${token}">zde</a>.` // html body
                            };

// send mail with defined transport object
                            transporter.sendMail(mailOptions, function(error, info){
                                if(error){
                                    obj.error = error;
                                } else {
                                    console.log('Message sent: ' + info.response);
                                }
                            });
                        }
                        res.end(JSON.stringify(obj));
                    }
                );

            }
        });

    } else if (req.pathname.endsWith("/overUzivatele")) {
        let qry = "UPDATE uzivatele SET verified=1, token='' WHERE token='"+req.parameters.token+"'";
        connection.query(qry,
            function(err, rows){
                if (err) {
                    console.error(JSON.stringify({status: "Error", error: err}));
                    obj.error = JSON.stringify(err);
                } else if (rows.affectedRows == 0) {
                    obj.error = "token neplatny!";
                } else {
                    //ok
                }
                res.end(JSON.stringify(obj));
            }
        );
    } else if (req.pathname.endsWith("/prihlasUzivatele")) {
        let qry = "SELECT * FROM uzivatele WHERE ln='"+req.parameters.ln+"' AND pw='"+hashPassword(req.parameters.pw)+"'";
        console.log(qry);
        connection.query(qry,
            function(err, rows){
                console.log(rows.length);
                if (err) {
                    console.error(JSON.stringify({status: "Error", error: err}));
                    obj.error = JSON.stringify(err);
                } else if (rows.length != 1) {
                    obj.error = "uzivatel nenalezen";
                } else {
                    obj.name = rows[0].ln;
                    let loggedUser = {};
                    loggedUser.name = obj.name;
                    let token = crypto.randomBytes(16).toString('hex');
                    loggedUsers[token] = loggedUser;
                    obj.token = token;
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