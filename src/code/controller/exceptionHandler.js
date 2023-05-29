'use strict'

const exceptions = require('../model/exception/exceptions.js');
const dto = require('../dto/dto.js');
const {newLogger} = require('../conf/logConf.js');

const logger = newLogger('error', 'exceptionHandler.js');

module.exports.exceptionHandler = function(err, req, res, next) {
    logger.error(err);
    if(err instanceof exceptions.BadCredentialException) {
        res.status(403).send(new dto.ExceptionResponse(err, 403, req.language));
    } else if(err instanceof exceptions.UnknownUserException) {
        res.status(404).send(new dto.ExceptionResponse(err, 404, req.language));
    } else if(err instanceof exceptions.UnauthorizedException) {
        res.status(401).send(new dto.ExceptionResponse(err, 401, req.language));
    } else if(err instanceof exceptions.AbstractDomainException) {
        res.status(400).send(new dto.ExceptionResponse(err, 400, req.language));
    } else {
        res.status(500).send(new dto.ExceptionResponse(err, 500, req.language));
    }
};