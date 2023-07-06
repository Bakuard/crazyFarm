'use strict'

const http = require('http');
const format = require('date-format');
const exceptions = require('../model/exception/exceptions.js');
const {i18next} = require('../conf/i18nConf.js');
const {EntityMeta} = require('../model/logic/entityMeta.js');
const {Thirst} = require('../model/logic/thirst.js');
const {Satiety} = require('../model/logic/satiety.js');
const {Immunity} = require('../model/logic/immunity.js');
const {GrowTimer, growStates} = require('../model/logic/growTimer.js');
const {PotatoGhost} = require('../model/logic/potatoDeath.js');

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

class JwsWebsocketConnectionResponse {
    constructor(jws) {
        this.jws = jws;
    }
}
module.exports.JwsWebsocketConnectionResponse = JwsWebsocketConnectionResponse;

class Vegetable {
    constructor(entity) {
        this.type = 'potato';
        this.stage = entity.get(GrowTimer).growState.ordinal;
        this.needs = [];

        if(entity.get(Thirst).current < 5) this.needs.push('THIRST');
        if(entity.get(Satiety).current < 5) this.needs.push('HUNGER');
        if(entity.get(Immunity).current < 5) this.needs.push('SICKNESS');
    }
}

class GardenBedCell {
    constructor(vegatable) {
        this.isEmpty = !vegatable;
        this.isBlocked = Boolean(vegatable?.get(PotatoGhost));
        this.name = 'central';
        this.character = vegatable ? vegatable : null;
    }
}
module.exports.GardenBedCell = GardenBedCell;

class GardenBed {
    constructor(entities) {
        this.containers = entities.map(entity => new GardenBedCell(new Vegetable(entity)));
        if(this.containers.length == 0) this.containers.push(new GardenBedCell(null));
    }
}
module.exports.GardenBed = GardenBed;