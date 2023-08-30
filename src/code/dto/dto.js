'use strict'

const http = require('http');
const format = require('date-format');
const exceptions = require('../model/exception/exceptions.js');
const {i18next} = require('../conf/i18nConf.js');
const {Thirst} = require('../model/logic/thirst.js');
const {Satiety} = require('../model/logic/satiety.js');
const {Immunity} = require('../model/logic/immunity.js');
const {PotatoGhost} = require('../model/logic/potatoDeath.js');
const {GardenBedCell} = require('../model/logic/gardenBedCell.js');
const {VegetableMeta} = require('../model/logic/vegetableMeta.js');
const {VegetableState, lifeCycleStates} = require('../model/logic/vegetableState.js');

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
        this.reasons = [];
        if(err instanceof exceptions.AbstractDomainException) {
            let stack = [err];
            while(stack.length > 0) {
                let currentErr = stack.pop();
                if(currentErr.userMessageKeys) this.reasons.push(...currentErr.userMessageKeys.map(key => i18next.t(key, {lng})));
                if(currentErr.reasons) stack.push(...currentErr.reasons);
            }
        }
        if(this.reasons.length == 0) {
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
        this.type = vegetable.get(VegetableMeta).typeName.toLowerCase();
        this.needs = [];
        this.stage = Math.max(0, vegetable.get(VegetableState).history.at(-1).ordinal - 1);
        if(vegetable.hasComponents(Thirst, Satiety, Immunity)) {
            if(vegetable.get(Thirst).current < 30) this.needs.push('THIRST');
            if(vegetable.get(Satiety).current < 30) this.needs.push('HUNGER');
            if(vegetable.get(Immunity).current < 30) this.needs.push('SICKNESS');
        }
    }
}
module.exports.VegetableResponse = VegetableResponse;

class GardenBedCellResponse {
    constructor(cell) {
        let vegetable = cell.get(GardenBedCell).entity;

        this.isEmpty = !vegetable;
        this.isBlocked = Boolean(vegetable?.get(PotatoGhost) || vegetable?.hasTags('explosion'));
        this.name = 'central';
        this.character = vegetable ? new VegetableResponse(vegetable) : null;
    }
}
module.exports.GardenBedCellResponse = GardenBedCellResponse;

class GameResponse {
    constructor(entities, wallet) {
        this.player = {
            cash: wallet.sum
        };
        this.containers = entities.map(entity => new GardenBedCellResponse(entity));
    }
}
module.exports.GameResponse = GameResponse;