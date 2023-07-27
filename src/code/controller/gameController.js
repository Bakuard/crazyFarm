'use strict'

const dto = require('../dto/dto.js');
const ms = require('ms');
const {newLogger} = require('../conf/logConf.js');
const {Game} = require('../model/logic/game.js');

const logger = newLogger('info', 'gameController.js');

module.exports.GameController = class GameController {

    #jwsService;
    #wsServer;
    #intervalIdForPing;

    constructor(jwsService, wsServer) {
        this.#jwsService = jwsService;
        this.#wsServer = wsServer;
        this.#intervalIdForPing = setInterval(() => {
            wsServer.clients.forEach(clientSocket => {
                if(clientSocket.isAlive === false) {
                    clientSocket.terminate();
                    logger.info(`terminate client socket with userId=${clientSocket.userId}`);
                }
                clientSocket.isAlive = false;
                clientSocket.ping();
            });
        }, process.env.WEBSOCKET_PING_TIMEOUT_IN_MS);
    }

    async getJwtForConnection(req, res, next) {
        logger.info(`getJwtForConnection(): userId=%s`, req.jwsBody);
        let jws = this.#jwsService.generateJws(req.jwsBody, 'websocket', process.env.JWS_CONNECTION_TO_WEBSOCKET_LIFETIME_SECONDS);
        res.send(new dto.JwsWebsocketConnectionResponse(jws));
    }

    startNewGame(clientSocket, req) {
        let game = new Game(data => clientSocket.send(JSON.stringify(new dto.GardenBedResponse(data), null, 4)), req.userId);

        clientSocket.on('pong', () => clientSocket.isAlive = true);
        clientSocket.on('message', data => game.execute(JSON.parse(data)));
        clientSocket.on('error', e => logger.error(e));
        clientSocket.on('close', () => {
            logger.info('close socket for userId=%s', clientSocket.userId);
            game.stop();
        });

        clientSocket.userId = req.userId;
        clientSocket.isAlive = true;
        
        game.start();
    }

    authNewConnection(req, socket, head) {
        if(req.headers.upgrade == 'websocket') {
            logger.info('server.upgrade(): try to create new webcosket connection');
            let url = new URL(req.url, 'ws://mockDomain:12000');
            let jws = url.searchParams.get('token');
            try {
                let userId = this.#jwsService.parseJws(jws, 'websocket');
                req.userId = userId;
                this.#wsServer.handleUpgrade(req, socket, head, ws => this.#wsServer.emit('connection', ws, req));
            } catch(err) {
                logger.error(`Faile to connect by websocket. %s`, err.stack);
                socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
                socket.destroy();
            }
        }
    }

};