'use strict'

const {MongoClient} = require('mongodb');
const {newLogger} = require('../conf/logConf.js');

const logger = newLogger('info', 'databaseConnector.js');

module.exports.DBConnector = class DBConnector {
    constructor() {}

    async getConnection() {
        if(!this.mongo) {
            const mongo = new MongoClient(process.env.MONGO_URL);
            await mongo.connect();
            logger.info('connect to mongodb');

            process.on('SIGTERM', async function() {
                await mongo.close();
                logger.info('close connection to mongodb');
                process.exit(0);
            });

            this.mongo = mongo;
        }
        return this.mongo;
    }

    async closeConnection() {
        if(this.mongo) {
            await this.mongo.close();
            logger.info('close connection to mongodb');
            this.mongo = null;
        }
    }
};