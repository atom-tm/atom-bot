const mongo = require('mongodb')
const Storage = require('./base')

class MongoStorage extends Storage
{
    constructor(params)
    {
        super();
        this.client = new mongo.MongoClient(params.dbUri, { useNewUrlParser: true, useUnifiedTopology: true });
        this.client.connect(err => {
            if (err) {
                return console.error(err);
            }
            this.db = this.client.db(params.dbName);
        });
    }
}

module.exports = MongoStorage