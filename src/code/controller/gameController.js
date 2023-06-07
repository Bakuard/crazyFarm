'use strict'

const dto = require('../dto/dto.js');
const ms = require('ms');
const {newLogger} = require('../conf/logConf.js');

const logger = newLogger('info', 'gameController.js');

module.exports.GameController = class GameController {

    #jwsService;

    constructor(jwsService) {
        this.#jwsService = jwsService;
    }

    async getJwtForConnection(req, res, next) {
        logger.info(`getJwtForConnection(): userId=%s`, req.jwsBody);
        let jws = this.#jwsService.generateJws(req.jwsBody, 'websocket', process.env.JWS_CONNECTION_TO_WEBSOCKET_LIFETIME_SECONDS);
        res.send(new dto.JwsWebsocketConnectionResponse(jws));
    }

};