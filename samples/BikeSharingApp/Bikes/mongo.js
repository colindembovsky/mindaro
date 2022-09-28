const { MongoClient } = require("mongodb");
const { populateTestData } = require('./__test__/populateTestData');

var mongoDBDatabase = process.env.mongo_database || "admin";
var mongoDBCollection = process.env.mongo_collection || "bikes";
var mongoDBConnStr = process.env.mongo_connectionstring || "mongodb://databases-mongo";
console.log("Database: " + mongoDBDatabase);
console.log("Collection: " + mongoDBCollection);
console.log("MongoDB connection string: " + mongoDBConnStr);

let dbConnection;
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

function connectToDb(constr, callback, populateTestData) {
  MongoClient.connect(constr, mongoOptions, function(err, db) {
    if (err) {
        console.error("Mongo connection error!");
        console.error(err);
    }
    
    if (db) {
      dbConnection = db.db(mongoDBDatabase);
      if (populateTestData) {
        populateTestData(dbConnection.collection(mongoDBCollection), function (err, _) {
          console.log("Added test data")
          callback(err, dbConnection);
        });
      }
    } else {
      callback(err, null);
    }
  });
}

let inmemServer;
module.exports = {
  connectToServer: function (callback) {
    if (process.env.NODE_ENV === 'test') {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      MongoMemoryServer.create()
      .then(server => {
        inmemServer = server;
        mongoDBConnStr = server.getUri();
        console.log("In-memory MongoDB connection string: " + mongoDBConnStr);
        connectToDb(mongoDBConnStr, callback, populateTestData);
      });
    } else {
      connectToDb(mongoDBConnStr, callback);
    }
  },

  getDb: function () {
    return dbConnection.collection(mongoDBCollection);
  },

  close: function () {
    dbConnection.s.client.close();
    if (inmemServer) inmemServer.stop();
  }
};