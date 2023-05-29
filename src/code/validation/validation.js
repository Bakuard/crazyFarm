'use strict'

const Joi = require('joi');
const exceptions = require('../model/exception/exceptions.js');

const registerUserSchema = Joi.object({
    loggin: Joi.string().trim().min(1).max(20).required().messages({
        'string.min': 'newUser.loggin.min',
        'string.max': 'newUser.loggin.max',
        'string.empty': 'newUser.loggin.min'
    }),
    email: Joi.string().email().messages({
        'string.email': 'newUser.email.format',
        'string.empty': 'newUser.email.notEmpty'
    }),
    password: Joi.string().trim().min(8).max(50).required().messages({
        'string.min': 'newUser.password.min',
        'string.max': 'newUser.password.max',
        'string.empty': 'newUser.password.min'
    })
});

function exstractKeys(joiError, domainException) {
    for(let key of joiError.details) {
        domainException.userMessageKeys.push(key.message);
    }
    return domainException;
}

module.exports.checkNewUser = function(newUser) {
    let {error, value} = registerUserSchema.validate(newUser, {abortEarly: false});
    if(error) {
        throw exstractKeys(
            error,
            new exceptions.ValidationException(
                `Fail validation new user: ${JSON.stringify(newUser, (k, v) => k == 'password' ? '***' : v)}`)
        );
    }
}