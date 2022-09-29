// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

var morgan = require('morgan');
var bodyParser = require('body-parser');
var validate = require('validate.js');
var ObjectId = require('mongodb').ObjectID;
var express = require('express');
var {Router} = require('express');
const mongoClient = require('./mongo');

validate.validators.illegal = function(value, options, key, attributes) {
    if (value !== undefined && options) {
        return "cannot be provided";
    }
}

var incomingBikeSchema = {
    id: {
        illegal: true
    },
    available: {
        illegal: true
    },
    model: {
        presence: true,
        length: { minimum: 1 }
    },
    hourlyCost: {
        presence: true,
        numericality: { greaterThan: 0, noStrings: true }
    },
    imageUrl: {
        presence: true,
        length: { minimum: 1 }
    },
    address: {
        presence: true,
        length: { minimum: 1 }
    },
    type: {
        presence: true,
        inclusion: [ "mountain", "road", "tandem" ]
    },
    ownerUserId: {
        presence: true
    },
    suitableHeightInMeters: {
        presence: true,
        numericality: { greaterThan: 0, noStrings: true }
    },
    maximumWeightInKg: {
        presence: true,
        numericality: { greaterThan: 0, noStrings: true }
    }
};

var app = express();
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

function getDb() {
    return mongoClient.getDb();
}

// find bike ------------------------------------------------------------
function handleGetAvailableBikes(req, res) {
    var requestID = req.header(requestIDHeaderName);
    var query = { available: true };

    // Add user filter conditions
    for (var queryParam in req.query) {
        if (isNaN(req.query[queryParam])) {
            query[queryParam] = req.query[queryParam];
        }
        else {
            query[queryParam] = parseFloat(req.query[queryParam]);
        }
    }

    var cursor = getDb().find(query).sort({ hourlyCost: 1 }).limit(30);
    cursor.toArray(function(err, data) {
        if (err) {
            dbError(res, err, requestID);
            return;
        }

        data.forEach(function(bike) {
            bike.id = bike._id;
            delete bike._id;
        });

        res.send(data);
    });
}

// get all bikes ------------------------------------------------------------
function handleGetAllBikes(req, res) {
    var requestID = req.header(requestIDHeaderName);

    var cursor = getDb().find({}).sort({ hourlyCost: 1 });
    cursor.toArray(function(err, data) {
        if (err) {
            dbError(res, err, requestID);
            return;
        }

        data.forEach(function(bike) {
            bike.id = bike._id;
            delete bike._id;
        });

        res.send(data);
    });
}

// new bike ------------------------------------------------------------
function handlePostBikes(req, res) {
    var requestID = req.header(requestIDHeaderName);
    var validationErrors = validate(req.body, incomingBikeSchema);
    if (validationErrors) {
        res.status(400).send(validationErrors);
        return;
    }

    var newBike = req.body;
    newBike.available = true;

    getDb().insertOne(newBike, function(err, result) {
        if (err) {
            dbError(res, err, requestID);
            return;
        }
        
        newBike.id = newBike._id;
        delete newBike._id;
        console.log(requestID + ' - inserted new bikeId: ' + newBike.id);
        res.send(newBike);
    });
}

// update bike ------------------------------------------------------------
function handlePutBike(req, res) {
    var requestID = req.header(requestIDHeaderName);
    var validationErrors = validate(req.body, incomingBikeSchema);
    if (validationErrors) {
        res.status(400).send(validationErrors);
        return;
    }
    if (!ObjectId.isValid(req.params.bikeId))
    {
        res.status(400).send(req.params.bikeId + ' is not a valid bikeId!');
        return;
    }

    var updatedBike = req.body;

    getDb().updateOne({ _id: new ObjectId(req.params.bikeId) }, { $set: updatedBike }, function(err, result) {
        if (err) {
            dbError(res, err, requestID);
            return;
        }
        if (!result) {
            res.status(500).send('DB response was null!');
            return;
        }
        if (result.matchedCount === 0) {
            bikeDoesNotExist(res, req.params.bikeId);
            return;
        }
        if (result.matchedCount !== 1 && result.modifiedCount !== 1) {
            var msg = 'Unexpected number of bikes modified! Matched: "' + result.matchedCount + '" Modified: "' + result.modifiedCount + '"';
            console.log(requestID + " - " + msg);
            res.status(500).send(msg);
            return;
        }

        res.sendStatus(200);
    });
}

// get bike ------------------------------------------------------------
function handleGetBike(req, res) {
    var requestID = req.header(requestIDHeaderName);
    if (!req.params.bikeId) {
        res.status(400).send('Must specify bikeId');
        return;
    }
    if (!ObjectId.isValid(req.params.bikeId))
    {
        res.status(400).send(req.params.bikeId + ' is not a valid bikeId!');
        return;
    }

    getDb().findOne({ _id: new ObjectId(req.params.bikeId) }, function(err, result) {
        if (err) {
            dbError(res, err, requestID);
            return;
        }
        if (!result) {
            bikeDoesNotExist(res, req.params.bikeId);
            return;
        }

        var theBike = result;
        // Hard code image url *FIX ME*
        theBike.imageUrl = "/static/logo.svg";
        theBike.id = theBike._id;
        delete theBike._id;

        res.send(theBike);
    });
}

// delete bike ------------------------------------------------------------
function handleDeleteBike(req, res) {
    var requestID = req.header(requestIDHeaderName);
    if (!req.params.bikeId) {
        res.status(400).send('Must specify bikeId');
        return;
    }
    if (!ObjectId.isValid(req.params.bikeId))
    {
        res.status(400).send(req.params.bikeId + ' is not a valid bikeId!');
        return;
    }
    
    getDb().deleteOne({ _id: new ObjectId(req.params.bikeId) }, function(err, result) {
        if (err) {
            dbError(res, err, requestID);
            return;
        }
        if (result.deletedCount === 0) {
            bikeDoesNotExist(res, req.params.bikeId);
            return;
        }
        if (result.deletedCount !== 1) {
            var msg = 'Unexpected number of bikes deleted! Deleted: "' + result.deletedCount + '"';
            console.log(requestID + " - " + msg);
            res.status(500).send(msg);
            return;
        }
        
        res.sendStatus(200);
    });
}

// reserve bike ------------------------------------------------------------
function handleReserveBike(req, res) {
    var requestID = req.header(requestIDHeaderName);
    if (!req.params.bikeId) {
        res.status(400).send('Must specify bikeId');
        return;
    }

    processReservation(res, req.params.bikeId, false, requestID);
}

// clear bike ------------------------------------------------------------
function handlePatchBike(req, res) {
    var requestID = req.header(requestIDHeaderName);
    if (!req.params.bikeId) {
        res.status(400).send('Must specify bikeId');
        return;
    }

    processReservation(res, req.params.bikeId, true, requestID);
}

function handleHello(req, res) {
    res.status(200).send('hello!\n');
}

// utils ------------------------------------------------------------

function bikeDoesNotExist(res, bikeId) {
    res.status(404).send('BikeId "' + bikeId + '" does not exist!');
}

function dbError(res, err, requestID) {
    console.log(requestID + " - " + err);
    res.status(500).send(err);
}

function processReservation(res, bikeId, changeTo, requestID) {
    if (!ObjectId.isValid(bikeId))
    {
        res.status(400).send(bikeId + ' is not a valid bikeId!');
        return;
    }

    getDb().updateOne({ _id: new ObjectId(bikeId), available: !changeTo }, { $set: { available: changeTo } }, function(err, result) {
        if (err) {
            dbError(res, err, requestID);
            return;
        }
        if (result.matchedCount === 0) {
            // Figure out if bike does not exist or if it was invalid reservation request
            getDb().findOne({ _id: new ObjectId(bikeId) }, function(err, result) {
                if (err) {
                    dbError(res, err, requestID);
                    return;
                }

                if (!result) {
                    bikeDoesNotExist(res, bikeId);
                }
                else {
                    // Invalid reservation request
                    res.status(400).send('Invalid reservation request was made for BikeId ' + bikeId);
                }
            });
            
            return;
        }
        if (result.matchedCount !== 1 && result.modifiedCount !== 1) {
            var msg = 'Unexpected number of bikes changed availability! Matched: "' + result.matchedCount + '" Modified: "' + result.modifiedCount + '"';
            console.log(requestID + " - " + msg);
            res.status(500).send(msg);
            return;
        }

        res.sendStatus(200);
    });
}

// api ------------------------------------------------------------

const router = Router();
router.get('/api/availableBikes', handleGetAvailableBikes);
router.get('/api/allbikes', handleGetAllBikes);
router.post('/api/bikes', handlePostBikes);
router.put('/api/bikes/:bikeId', handlePutBike);
router.get('/api/bikes/:bikeId', handleGetBike);
router.delete('/api/bikes/:bikeId', handleDeleteBike);
router.patch('/api/bikes/:bikeId/reserve', handleReserveBike);
router.patch('/api/bikes/:bikeId/clear', handlePatchBike);
router.get('/hello', handleHello);

module.exports = { 
    router: router,
    closeMongoServer: mongoClient.close,
    connectToMongoServer: mongoClient.connectToServer
};