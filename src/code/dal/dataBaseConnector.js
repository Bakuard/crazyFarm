'use strict'

const MongoClient = require('mongodb').MongoClient;
const {newLogger} = require('../conf/logConf.js');

const logger = newLogger('info', 'databaseConnector.js');

const mongo = new MongoClient(process.env.MONGO_URL);
mongo.connect().then(res => logger.info('connect to mongodb'));
process.on('SIGTERM', async function() {
    await mongo.close();
    logger.info('close connection to mongodb');
    process.exit(0);
});

module.exports.mongo = mongo;