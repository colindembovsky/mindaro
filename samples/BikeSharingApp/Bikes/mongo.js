const { MongoClient } = require("mongodb");
const { MongoMemoryServer } = require('mongodb-memory-server');

var mongoDBDatabase = process.env.mongo_database || "admin";
var mongoDBCollection = process.env.mongo_collection || "bikes";
var mongoDBConnStr = process.env.mongo_connectionstring || "mongodb://databases-mongo";
console.log("Database: " + mongoDBDatabase);
console.log("Collection: " + mongoDBCollection);
console.log("MongoDB connection string: " + mongoDBConnStr);

let dbConnection;

function connectToDb(err, db) {
  if (err || !db) {
    console.error(err);
    throw err;
  }

  dbConnection = db.db(mongoDBDatabase);
  console.log("Successfully connected to MongoDB.");

  client.on('close', function() {
    if (dbConnection) { // SIGINT and SIGTERM
        console.log('Mongo connection closed! Shutting down.');
        process.exit(1);
    }});

  return db;
}

const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

module.exports = {
  connectToServer: function (callback) {
    if (process.env.NODE_ENV === 'test') {
      MongoMemoryServer.create()
      .then(server => {
        mongoDBConnStr = server.getUri();
        console.log("In-memory MongoDB connection string: " + mongoDBConnStr);
        MongoClient.connect(mongoDBConnStr, mongoOptions, function(err, db) {
          if (err) {
              console.error("Mongo connection error!");
              console.error(err);
          }
          
          if (db) {
            dbConnection = db.db(mongoDBDatabase);
            callback(err, dbConnection);
          } else {
            callback(err, null);
          }
        });
      });
    } else {
      MongoClient.connect(mongoDBConnStr, mongoOptions, function(err, db) {
        if (err) {
            console.error("Mongo connection error!");
            console.error(err);
        }
        
        if (db) {
          dbConnection = db.db(mongoDBDatabase);
          callback(err, dbConnection);
        } else {
            callback(err, null);
        }
      });
    }
  },

  getDb: function () {
    return dbConnection.collection(mongoDBCollection);
  },

  close: function () {
    var tmp = dbConnection;
    dbConnection = null;
    console.log("%O", tmp);
  }
};