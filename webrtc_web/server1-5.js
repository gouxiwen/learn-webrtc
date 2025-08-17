'use strict'

var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');

var serveIndex = require('serve-index');

var express = require('express');
var app = express();

//顺序不能换
app.use(serveIndex(path.join(__dirname, 'lesson')));
app.use(express.static(path.join(__dirname, 'lesson')));
app.use((req, res) => {
  console.log('req', req);
})

var options = {
  key: fs.readFileSync(path.join(__dirname, 'cert/private.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'cert/csr.crt'))
}

var https_server = https.createServer(options, app);
https_server.listen(443, '0.0.0.0', function () {
  console.log('HTTPS Server is running');
});

var http_server = http.createServer(app);
http_server.listen(80, '0.0.0.0', function () {
  console.log('HTTP Server is running');
});


