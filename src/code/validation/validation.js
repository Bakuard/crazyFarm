'use strict'

const Joi = require('joi');
const exceptions = require('../model/exception/exceptions.js');

const registerUserSchema = Joi.object({
    loggin: Joi.string().trim().min(2).max(20).required().messages({
        'string.min': 'User.loggin.min',
        'string.max': 'User.loggin.max',
        'string.empty': 'User.loggin.notEmpty',
        'any.required': 'User.loggin.notEmpty'
    }),
    email: Joi.string().trim().max(50).email().required().messages({
        'string.email': 'User.email.format',
        'string.max': 'User.email.max',
        'string.empty': 'User.email.notEmpty',
        'any.required': 'User.email.notEmpty'
    }),
    password: Joi.string().trim().min(8).max(50).required().messages({
        'string.min': 'User.password.min',
        'string.max': 'User.password.max',
        'string.empty': 'User.password.notEmpty',
        'any.required': 'User.password.notEmpty'
    })
});
const existedUserSchema = registerUserSchema.fork(['email'], schema => schema.optional());

const gameCommandSchema = Joi.object({
    tool: Joi.string().valid('shovel', 'bailer', 'fertilizer', 'sprayer', 'seeds').required().messages({
        'string.valid': 'GameCommand.tool.unknown',
        'any.required': 'GameCommand.tool.notEmpty'
    }),
    cell: Joi.string().regex(/^\d+-\d+$/).required().messages({
        'object.regex': 'GameCommand.coordinates.format'
    })
});

function exstractKeys(joiError, domainException) {
    for(let key of joiError.details) {
        domainException.userMessageKeys.push(key.message);
    }
    return domainException;
}

module.exports.checkNewUser = function(user) {
    let {error, value} = registerUserSchema.validate(user, {abortEarly: false});
    if(error) {
        throw exstractKeys(
            error,
            new exceptions.ValidationException(user)
        );
    } else if(user == null) {
        throw new exceptions.ValidationException(null, 'User.undefined');
    }
}

module.exports.checkExistedUser = function(user) {
    let {error, value} = existedUserSchema.validate(user, {abortEarly: false});
    if(error) {
        throw exstractKeys(
            error,
            new exceptions.ValidationException(user)
        );
    } else if(user == null) {
        throw new exceptions.ValidationException(null, 'User.undefined');
    }
}

module.exports.checkRawGameCommand = function(rawCommand) {
    let {error, value} = gameCommandSchema.validate(rawCommand, {abortEarly: false});
    if(error) {
        throw exstractKeys(
            error,
            new exceptions.ValidationException(rawCommand)
        );
    } else if(rawCommand == null) {
        throw new exceptions.ValidationException(null, 'GameCommand.undefined');
    }
}