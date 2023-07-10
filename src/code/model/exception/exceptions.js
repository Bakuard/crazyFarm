'use strict'

class AbstractDomainException extends Error {

    userMessageKey;
    reasons;

    constructor(userMessageKey, logMessage, reasons) {
        super(logMessage);
        this.name = this.constructor.name;
        this.userMessageKey = userMessageKey;
        this.reasons = reasons;
    }

}
module.exports.AbstractDomainException = AbstractDomainException;

module.exports.BadCredentialException = class BadCredentialException extends AbstractDomainException {
    constructor(userMessageKey, logMessage, ...reasons) {
        super(userMessageKey, logMessage, reasons);
    }
}

module.exports.ValidationException = class ValidationException extends AbstractDomainException {
    userMessageKeys;
    constructor(user, ...userMessageKeys) {
        let logMessage = user != null ? 
                    `Fail validation new user: ${JSON.stringify(user, (k, v) => k == 'password' ? '***' : v)}`:
                    'Fail validation new user: null';
        super(null, logMessage, []);
        this.userMessageKeys = userMessageKeys;
    }
}

module.exports.DuplicateUserException = class DuplicateUserException extends AbstractDomainException {
    constructor(userMessageKey, logMessage, ...reasons) {
        super(userMessageKey, logMessage, reasons);
    }
}

module.exports.UnknownUserException = class UnknownUserException extends AbstractDomainException {
    constructor(userMessageKey, logMessage, ...reasons) {
        super(userMessageKey, logMessage, reasons);
    }
}

module.exports.UnauthorizedException = class UnauthorizedException extends AbstractDomainException {
    constructor(userMessageKey, logMessage, ...reasons) {
        super(userMessageKey, logMessage, reasons);
    }
}

module.exports.UnregisteredComponentException = class UnregisteredComponentException extends AbstractDomainException {
    constructor(userMessageKey, logMessage, ...reasons) {
        super(userMessageKey, logMessage, reasons);
    }
}