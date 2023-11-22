'use strict'

class AbstractDomainException extends Error {
    constructor(userMessageKeys, logMessage, reasons) {
        super(logMessage);
        this.name = this.constructor.name;
        this.userMessageKeys = userMessageKeys;
        this.reasons = reasons;
    }
}
module.exports.AbstractDomainException = AbstractDomainException;

class AggregateDomainException extends AbstractDomainException {
    constructor(logMesssage, reasons) {
        super(null, logMesssage, reasons);
    }
}
module.exports.AggregateDomainException = AggregateDomainException;
module.exports.tryExecuteAll = async function(...callbacks) {
    callbacks = callbacks.map(c => {
        if(c[Symbol.toStringTag] === 'AsyncFunction') return c();
        else return new Promise(resolve => resolve(c()));
    });

    return Promise.allSettled(callbacks).
            then(results => {
                let exceptions = results.filter(r => r.status == 'rejected').map(r => r.reason);
                if(exceptions.length > 0) {
                    throw new AggregateDomainException(`Aggregate exception: ${exceptions.map(e => e.message)}`, exceptions);
                }
            });
};

module.exports.BadCredentialException = class BadCredentialException extends AbstractDomainException {
    constructor(userMessageKey, logMessage, ...reasons) {
        super([userMessageKey], logMessage, reasons);
    }
}

module.exports.ValidationException = class ValidationException extends AbstractDomainException {
    constructor(user, ...userMessageKeys) {
        let logMessage = user != null ? 
                    `Fail validation new user: ${JSON.stringify(user, (k, v) => k == 'password' ? '***' : v)}`:
                    'Fail validation new user: null';
        super(userMessageKeys, logMessage, []);
    }
}

module.exports.DuplicateUserException = class DuplicateUserException extends AbstractDomainException {
    constructor(userMessageKey, logMessage, ...reasons) {
        super([userMessageKey], logMessage, reasons);
    }
}

module.exports.UnknownUserException = class UnknownUserException extends AbstractDomainException {
    constructor(userMessageKey, logMessage, ...reasons) {
        super([userMessageKey], logMessage, reasons);
    }
}

module.exports.UnauthorizedException = class UnauthorizedException extends AbstractDomainException {
    constructor(userMessageKey, logMessage, ...reasons) {
        super([userMessageKey], logMessage, reasons);
    }
}

module.exports.UnknownVegetableType = class UnknownVegetableType extends Error {
    constructor(logMessage) {
        super(logMessage);
    }
}

module.exports.IncorrectVegetableState = class IncorrectVegetableState extends Error {
    constructor(logMessage) {
        super(logMessage);
    }
}

module.exports.FailToCreateVegetableMeta = class FailToCreateVegetableMeta extends Error {
    constructor(logMessage) {
        super(logMessage);
    }
}

module.exports.UnknownSystemException = class UnknownSystemException extends Error {
    constructor(logMessage) {
        super(logMessage);
    }
}

module.exports.IndexOutOfBoundException = class IndexOutOfBoundException extends Error {
    constructor(logMessage) {
        super(logMessage);
    }
}