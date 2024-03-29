'use strict'

const ObjectID = require('mongodb').ObjectId;
const {User} = require('../model/auth/User.js');
const exceptions = require('../model/exception/exceptions.js');

module.exports.UserRepository = class UserRepository {

    constructor(dbConnector) {
        this.dbConnector = dbConnector;
    }

    async add(user) {
        try {
            const mongo = await this.dbConnector.getConnection();
            const db = mongo.db(process.env.MONGO_DB_NAME);
            const collection = db.collection('users');
            await collection.insertOne(user);
        } catch(err) {
            if(err.code == 11000) {
                throw new exceptions.DuplicateUserException(
                    'User.logginOrEmail.notUnique',
                    `User with loggin='${user.loggin}' and email='${user.email}' already exists`
                );
            }
            throw err;
        }
    }

    async update(user) {
        try {
            const mongo = await this.dbConnector.getConnection();
            const db = mongo.db(process.env.MONGO_DB_NAME);
            const collection = db.collection('users');
            await collection.replaceOne({_id: new ObjectID(user._id)}, user);
        } catch(err) {
            if(err.code == 11000) {
                throw new exceptions.DuplicateUserException(
                    'User.logginOrEmail.notUnique',
                    `User with loggin='${user.loggin}' and email='${user.email}' already exists`
                );
            }
            throw err;
        }
    }

    async findById(userId) {
        const mongo = await this.dbConnector.getConnection();
        const db = mongo.db(process.env.MONGO_DB_NAME);
        const collection = db.collection('users');
        const userDto = await collection.findOne({_id: new ObjectID(userId)});

        let result = null;
        if(userDto) result = new User(userDto);
        return result;
    }

    async findByLoggin(loggin) {
        const mongo = await this.dbConnector.getConnection();
        const db = mongo.db(process.env.MONGO_DB_NAME);
        const collection = db.collection('users');
        const userDto = await collection.findOne({loggin: loggin});

        let result = null;
        if(userDto) result = new User(userDto);
        return result;
    }

    async tryFindByLoggin(loggin) {
        let user = await this.findByLoggin(loggin);
        if(!user) {
            throw new exceptions.UnknownUserException(
                'User.loggin.unknown',
                `User with loggin='${loggin}' doesn't exist`
            );
        }
        return user;
    }

    async findByEmail(email) {
        const mongo = await this.dbConnector.getConnection();
        const db = mongo.db(process.env.MONGO_DB_NAME);
        const collection = db.collection('users');
        const userDto = await collection.findOne({email: email});

        let result = null;
        if(userDto) result = new User(userDto);
        return result;
    }

    async tryFindByEmail(email) {
        let user = await this.findByEmail(email);
        if(!user) {
            throw new exceptions.UnknownUserException(
                'User.email.unknown',
                `User with email='${email}' doesn't exist`
            );
        }
        return user;
    }

    async assertUnique(user) {
        const mongo = await this.dbConnector.getConnection();
        const db = mongo.db(process.env.MONGO_DB_NAME);
        const collection = db.collection('users');
        let duplicate = await collection.findOne({$or: [{loggin: user.loggin}, {email: user.email}]});
        if(duplicate) {
            throw new exceptions.DuplicateUserException(
                'User.logginOrEmail.notUnique',
                `User with loggin=${user.loggin} and email=${user.email} already exists`
            );
        }
    }
}
