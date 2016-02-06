'use strict';

var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;

module.exports = function(url, cb){
  MongoClient.connect(url, function(err, db){
    global.mongodb = db;

    console.log('Express: Database', url);
    if(cb){cb();}
  });
};
