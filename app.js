const https = require('https');
const fs = require('fs');
const bodyParser = require('body-parser');
const express = require('express');
const {dbconn, dbstmt} = require('idb-connector');

const app = express();

// https接続用の設定
var ssl_server_key = './key/server_key.pem';
var ssl_server_crt = './key/server_crt.pem';

const server = require('https').createServer(
  {
    key: fs.readFileSync('./key/server_key.pem'),
    cert: fs.readFileSync('./key/server_crt.pem'),
  },
  app
);

app.use(express.static('views'));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.set('view engine', 'ejs');

const hostname = 'ibmi75';
const port = 9443;

var options = {
        key: fs.readFileSync(ssl_server_key),
        cert: fs.readFileSync(ssl_server_crt)
};

app.get('/', (req, res) => {
  res.render('index.ejs', {update_flag : 0, flag : 0});
});

app.post('/qrid', (req, res) => {
  if (req.body.id != null){
    const sql = `SELECT * FROM ACCESS.ACCESSTABLE WHERE QRID = ${req.body.id} LIMIT 1`;
    const connection = new dbconn();
    connection.conn('*LOCAL');
  
    const statement = new dbstmt(connection);
    const result = statement.execSync(sql);

    let qrid = JSON.stringify(result[0].QRID);
    let name = JSON.stringify(result[0].NAME);
    let status = JSON.stringify(result[0].STATUS);

    statement.close();
    connection.disconn();
    connection.close();

    res.render('submitqr.ejs', {qrid : qrid, name : name, status : status, flag : 1});
  }
});

app.post("/submit",(req,res)=>{
  let update = 0;

  const connection = new dbconn();
  connection.conn('*LOCAL');
  const statement = new dbstmt(connection);

  const sql = `SELECT * FROM ACCESS.ACCESSTABLE WHERE QRID = ${req.body.id} LIMIT 1`;
  const result = statement.execSync(sql);

  let qrid = JSON.stringify(result[0].QRID).slice( 1, -1 );
  let status = JSON.stringify(result[0].STATUS).slice( 1, -1 );

  const statement_update = new dbstmt(connection); 

  if (status == 'schedule'){
    const sql_up = `UPDATE ACCESS.ACCESSTABLE SET STATUS = 'stay' WHERE QRID = ${qrid}`;
    const result = statement_update.execSync(sql_up);
    update = 1;
  } else if (status == 'stay'){
    const sql_up = `UPDATE ACCESS.ACCESSTABLE SET STATUS = 'leave' WHERE QRID = + ${qrid}`;
    const result = statement_update.execSync(sql_up);
    update = 2;
  } else {
    update = 3;
  } 

  statement.close();
  statement_update.close();
  connection.disconn(); 
  connection.close();

  res.render('index.ejs', {update_flag : update, flag : 0});
})

server.listen(port, () => console.log(`Listening on port ${port}!`));
