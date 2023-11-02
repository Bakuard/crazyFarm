'use strict'

const crypto = require('crypto');
const {BadCredentialException} = require('../exception/exceptions.js')

module.exports.User = class User {

    static createNewUser({loggin, email, password}) {
        let salt = crypto.randomBytes(16).toString('hex');
        let passwordHash = crypto.scryptSync(password, salt, 64).toString('hex');

        return new User({
            _id: null,
            loggin,
            email,
            passwordHash,
            salt
        });
    }

    _id;
    loggin;
    email;
    passwordHash;
    salt;

    constructor({_id, loggin, email, passwordHash, salt}) {
        this._id = _id;
        this.loggin = loggin?.trim();
        this.email = email;
        this.passwordHash = passwordHash;
        this.salt = salt;
    }

    assertCorrectPassword(password) {
        let isCorrect = crypto.scryptSync(password, this.salt, 64).toString('hex') === this.passwordHash;
        if(!isCorrect) throw new BadCredentialException('User.password.incorrect', 'incorrect password');
    }

}