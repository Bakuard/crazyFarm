'use strict'

const ObjectID = require('mongodb').ObjectId;
const {User} = require('../model/auth/User.js');
const exceptions = require('../model/exception/exceptions.js');

module.exports.GameRepository = class GameRepository {

    constructor(dbConnector) {
        this.dbConnector = dbConnector;
    }

    async save(fullGameState) {
        fullGameState.userId = new ObjectID(fullGameState.userId);

        const mongo = await this.dbConnector.getConnection();
        const db = mongo.db(process.env.MONGO_DB_NAME);
        const collection = db.collection('games');
        await collection.deleteOne({userId: new ObjectID(fullGameState.userId)});
        await collection.insertOne(fullGameState);
    }

    async load(userId) {
        const mongo = await this.dbConnector.getConnection();
        const db = mongo.db(process.env.MONGO_DB_NAME);
        const collection = db.collection('games');
        const result = await collection.findOne({userId: new ObjectID(userId)});

        return result;
    }
};
