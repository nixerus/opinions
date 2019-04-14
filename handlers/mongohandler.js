const mongo = require("mongodb");
const config = require("../config/config.js");


class DatabaseHandler {
    constructor(){
        this.client = mongo.MongoClient;
        this.url = "mongodb://" + config.mongoAddress + ":27017/" + config.mongoDatabase;
        this.db = [];
        this.bucket = [];
    }

    setup(){
        let obj = this;
        return new Promise(function (resolve, reject) {
            obj.client.connect(obj.url).then(function (db) {
                obj.db = db.db(config.mongoDatabase);
                resolve(obj);
            })
        });
    }

    fetchConfig(){
        let db = this.db;
        return new Promise(function(resolve,reject){
            let configuration = require('../config/defaults');
            db.collection("config").find({}, function(configErr,configResult){
                configResult.toArray(function(toArrayErr,toArrayResult){
                    for(let i = 0; i < toArrayResult.length; i++){
                        configuration[toArrayResult[i].name] = toArrayResult[i].value;
                    }
                    resolve(configuration);
                });
            });
        });
    }
}

module.exports = DatabaseHandler;