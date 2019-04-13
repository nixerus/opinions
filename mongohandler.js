const mongo = require("mongodb");
const config = require("./config.js");


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
}

module.exports = DatabaseHandler;