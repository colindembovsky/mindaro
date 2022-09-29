// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

var morgan = require('morgan');
var bodyParser = require('body-parser');
var express = require('express');
var async = require('async');
const {router, closeMongoServer, connectToMongoServer, requestIDHeaderName } = require("./app");

var app = express();
app.use(requestIDParser);
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use('/', router);

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
    closeMongoServer();
});

process.on("SIGTERM", () => {
    console.log("Terminating...");
    if (server) {
        server.close();
    }
    closeMongoServer();
});

async.retry({times: 3, interval: 500}, connectToMongoServer, function(err, _) {
    if (err) {
        console.error("Couldn't connect to Mongo! Giving up.");
        console.error(err);
        process.exit(1);
    }

    console.log("Connected to MongoDB");
    
    // Start server
    server = app.listen(port, function () {
        console.log('Listening on port ' + port);
    });
});