var app = require('./index');
var http = require('http');
var esquery = require('./esquery');
var elasticsearch = require('elasticsearch');
var server;

/*
 * Create and start HTTP server.
 */

server = http.createServer(app);
server.listen(process.env.PORT || 8000);

//  const port = process.env.PORT || 5000;
