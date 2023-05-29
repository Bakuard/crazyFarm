'use strict'

const http = require('http');
const format = require('date-format');
const exceptions = require('../model/exception/exceptions.js');
const {i18next} = require('../conf/i18nConf.js');

class UserResponse {
    constructor({_id, loggin, email}) {
        this.userId = _id;
        this.loggin = loggin;
        this.email = email;
    }
}
module.exports.UserResponse = UserResponse;

class ExceptionResponse {
    constructor(err, httpErrorCode, lng) {
        this.timeStamp = format.asString('yyyy-MM-dd hh:mm:ss:SSS', new Date());
        this.httpErrorCode = httpErrorCode;
        this.httpStatus = http.STATUS_CODES[httpErrorCode];
        if(err instanceof exceptions.ValidationException) {
            this.reasons = err.userMessageKeys.map(key => i18next.t(key, {lng}));
        } else if(err instanceof exceptions.AbstractDomainException) {
            this.reasons = [i18next.t(err.userMessageKey, {lng})];
            let otherReasons = err.reasons.map(e => i18next.t(e.userMessageKey, {lng}));
            if(otherReasons?.length > 0) this.reasons.concat(otherReasons);
        } else {
            this.reasons = [i18next.t('unexpectedException', {lng})];
        }
        
    }
}
module.exports.ExceptionResponse = ExceptionResponse;

class JwsResponse {
    constructor(jws, user) {
        this.jws = jws;
        this.user = new UserResponse(user);
    }
}
module.exports.JwsResponse = JwsResponse;