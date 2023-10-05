'use strict'

const http = require('http');
const format = require('date-format');
const exceptions = require('../model/exception/exceptions.js');
const {i18next} = require('../conf/i18nConf.js');
const {Thirst} = require('../model/logic/thirst.js');
const {Satiety} = require('../model/logic/satiety.js');
const {Immunity} = require('../model/logic/immunity.js');
const {PotatoGhost} = require('../model/logic/potatoDeath.js');
const {TomatoExplosion} = require('../model/logic/tomatoDeath.js');
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

        let state = vegetable.get(VegetableState);
        if(state.currentIsOneOf(lifeCycleStates.sleepingSeed, lifeCycleStates.seed)) this.stage = 0;
        else if(state.current() == lifeCycleStates.sprout) this.stage = 1;
        else if(state.current() == lifeCycleStates.child) this.stage = 2;
        else if(state.current() == lifeCycleStates.youth) this.stage = 3;
        else if(state.current() == lifeCycleStates.adult) this.stage = 4;
        else if(state.current() == lifeCycleStates.death && 
                state.previous() == lifeCycleStates.sprout) this.stage = 5;
        else if(state.current() == lifeCycleStates.death && 
                state.previous() == lifeCycleStates.child && 
                this.type == 'tomato') this.stage = 6;
        else if(state.current() == lifeCycleStates.death && 
                state.previous() == lifeCycleStates.youth && 
                this.type == 'tomato') this.stage = 7;
        else if(state.current() == lifeCycleStates.death && 
                state.previous() == lifeCycleStates.adult && 
                this.type == 'tomato') this.stage = 8;
        else if(state.current() == lifeCycleStates.death && 
                state.previousIsOneOf(lifeCycleStates.child, lifeCycleStates.youth, lifeCycleStates.adult) && 
                this.type == 'potato' && 
                !vegetable.hasTags('exploded')) this.stage = 6;
        else if(state.current() == lifeCycleStates.death && 
                this.type == 'potato' && 
                vegetable.hasTags('exploded')) this.stage = 7;

        if(vegetable.hasComponents(Thirst, Satiety, Immunity)) {
            if(vegetable.get(Thirst).current < 30) this.needs.push('THIRST');
            if(vegetable.get(Satiety).current < 30) this.needs.push('HUNGER');
            if(vegetable.get(Immunity).current < 30) this.needs.push('SICKNESS');
        }
    }
}
module.exports.VegetableResponse = VegetableResponse;

class GardenBedCellResponse {
    constructor(x, y, vegetable) {
        this.isEmpty = !vegetable;
        this.isBlocked = Boolean(vegetable?.hasComponents(PotatoGhost) || vegetable?.hasComponents(TomatoExplosion));
        this.name = x + '-' + y;
        this.character = vegetable ? new VegetableResponse(vegetable) : null;
    }
}
module.exports.GardenBedCellResponse = GardenBedCellResponse;

class GameResponse {
    constructor(grid, wallet) {
        this.player = {
            cash: wallet.sum
        };
        this.containers = [];
        grid.forEach((x, y, value) => this.containers.push(new GardenBedCellResponse(x, y, value)));
    }
}
module.exports.GameResponse = GameResponse;

class CommandRequest {
    constructor(command) {
        this.tool = command.tool;
        let coordinates = command.cell.split('-');
        this.cellX = Number(coordinates[0]);
        this.cellY = Number(coordinates[1]);
    }
}
module.exports.CommandRequest = CommandRequest;