// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

var morgan = require('morgan');
var bodyParser = require('body-parser');
var validate = require('validate.js');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var express = require('express');
var async = require('async');
const {router, mongodb, mongoDBDatabase, mongoDBCollection, mongoDBConnStr} = require("./app");

var app = express();
app.use('/', router);
app.use(requestIDParser);
app.use(morgan("dev"));
app.use(bodyParser.json());

var requestIDHeaderName = 'x-contoso-request-id';
var requestIDRegex = new RegExp(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)

function requestIDParser(req, res, next) {
    var reqID = req.header(requestIDHeaderName);
    var test = false;
    if (reqID) {
        test = requestIDRegex.test(reqID);
    }
    if (!test && req.path != "/hello") {
        res.status(400).send("Couldn't parse request id guid");
        return;
    }

    console.log("RequestID start: " + reqID);
    next();
    console.log("RequestID done: " + reqID);
}

// start server ------------------------------------------------------------
var port = process.env.PORT || 3000;
var server = null;

process.on("SIGINT", () => {
    console.log("Interrupted. Terminating...");
    if (server) {
        server.close();
    }
    var tmp = mongoDB;
    mongoDB = null;
    tmp.close();
});

process.on("SIGTERM", () => {
    console.log("Terminating...");
    if (server) {
        server.close();
    }
    var tmp = mongoDB;
    mongoDB = null;
    tmp.close();
});

function tryMongoConnect(callback, results) {
    MongoClient.connect(mongoDBConnStr, { useUnifiedTopology: true }, function(err, db) {
        if (err) {
            console.error("Mongo connection error!");
            console.error(err);
        }
        
        if (db) {
            callback(err, db.db(mongoDBDatabase));
        } else {
            callback(err, null);
        }
    });
}

async.retry({times: 10, interval: 1000}, tryMongoConnect, function(err, result) {
    if (err) {
        console.error("Couldn't connect to Mongo! Giving up.");
        console.error(err);
        process.exit(1);
    }

    console.log("Connected to MongoDB");
    mongoDB = result;    
    mongoDB.s.client.on('close', function() {
        if (mongoDB) { // SIGINT and SIGTERM
            console.log('Mongo connection closed! Shutting down.');
            process.exit(1);
        }});
    // Start server
    server = app.listen(port, function () {
        console.log('Listening on port ' + port);
    });
});