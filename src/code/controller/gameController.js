'use strict'

const dto = require('../dto/dto.js');
const ms = require('ms');
const {newLogger} = require('../conf/logConf.js');

const logger = newLogger('info', 'gameController.js');

module.exports.GameController = class GameController {

    #jwsService;
    #wsServer;

    constructor(jwsService, wsServer) {
        this.#jwsService = jwsService;
        this.#wsServer = wsServer;
    }

    async getJwtForConnection(req, res, next) {
        logger.info(`getJwtForConnection(): userId=%s`, req.jwsBody);
        let jws = this.#jwsService.generateJws(req.jwsBody, 'websocket', process.env.JWS_CONNECTION_TO_WEBSOCKET_LIFETIME_SECONDS);
        res.send(new dto.JwsWebsocketConnectionResponse(jws));
    }

    startNewGame(clientSocket, req) {
        clientSocket.on('message', data => {});
        clientSocket.on('error', e => logger.error(e));
        clientSocket.on('close', () => {});

        clientSocket.userId = req.userId;
        clientSocket.send(`You have been connected to CrazyFarm websocket. User id=${req.userId}`);
    }

    authNewConnection(req, socket, head) {
        if(req.headers.upgrade == 'websocket') {
            logger.info('server.upgrade(): try to create new webcosket connection');
            let url = new URL(req.url, 'ws://mockDomain:12000');
            let jws = url.searchParams.get('token');
            try {
                let userId = this.#jwsService.parseJws(jws, 'websocket');
                req.userId = userId;
                this.#wsServer.handleUpgrade(req, socket, head, ws => wsServer.emit('connection', ws, req));
            } catch(err) {
                logger.error(`Faile to connect by websocket. Reason: %s`, err.message);
                socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
                socket.destroy();
            }
        }
    }

};