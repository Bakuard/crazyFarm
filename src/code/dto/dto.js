'use strict'

const http = require('http');
const format = require('date-format');
const exceptions = require('../model/exception/exceptions.js');
const {i18next} = require('../conf/i18nConf.js');
const {VegetableMeta} = require('../model/logic/vegetableMeta.js');
const {Thirst} = require('../model/logic/thirst.js');
const {Satiety} = require('../model/logic/satiety.js');
const {Immunity} = require('../model/logic/immunity.js');
const {GrowTimer, growStates} = require('../model/logic/growTimer.js');
const {PotatoGhost} = require('../model/logic/potatoDeath.js');
const {GardenBedCell} = require('../model/logic/gardenBedCell.js');

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

class VegetableResponse {
    constructor(vegetable) {
        this.type = 'potato';
        this.needs = [];

        if(vegetable.hasTags('sleeping seed')) {
            this.stage = growStates.seed.ordinal;
        } else if(vegetable.hasComponents(PotatoGhost)) {
            this.stage = growStates.allValues.length;
        } else {
            this.stage = vegetable.get(GrowTimer).growState.ordinal;
            if(vegetable.get(Thirst).current < 30) this.needs.push('THIRST');
            if(vegetable.get(Satiety).current < 30) this.needs.push('HUNGER');
            if(vegetable.get(Immunity).current < 30) this.needs.push('SICKNESS');
        }
    }
}
module.exports.VegetableResponse = VegetableResponse;

class GardenBedCellResponse {
    constructor(cell) {
        let vegetable = cell.get(GardenBedCell).vegetable;

        this.isEmpty = !vegetable;
        this.isBlocked = Boolean(vegetable?.get(PotatoGhost));
        this.name = 'central';
        this.character = vegetable ? new VegetableResponse(vegetable) : null;
    }
}
module.exports.GardenBedCellResponse = GardenBedCellResponse;

class GardenBedResponse {
    constructor(entities) {
        this.containers = entities.map(entity => new GardenBedCellResponse(entity));
    }
}
module.exports.GardenBedResponse = GardenBedResponse;