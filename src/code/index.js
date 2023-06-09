'use strict'

const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDoc = require('../resources/swagger/swagger.json');
const ws = require('ws');
const http = require('http');
const {JwsService} = require('./service/jwsService.js');
const {UserController} = require('./controller/userController.js');
const {GameController} = require('./controller/gameController.js');
const {exceptionHandler} = require('./controller/exceptionHandler.js');
const {newLogger} = require('./conf/logConf.js');
const {i18next,i18nMiddleware} = require('./conf/i18nConf.js');

const jwsService = new JwsService();
const userController = new UserController(jwsService);
const gameController = new GameController(jwsService);
const logger = newLogger('info', 'index.js');
const app = express();
const server = http.createServer(app);
const wsServer = new ws.Server({noServer: true , path: '/game'});

app.use(express.json());
app.use(express.urlencoded());
app.use(i18nMiddleware.handle(i18next));
app.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
app.use(function (req, res, next) {
    res.append('Access-Control-Allow-Origin', ['*']);
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,HEAD,OPTIONS,PATCH,CONNECT');
    res.append('Access-Control-Allow-Headers', ['*']);
    res.append('Access-Control-Max-Age', '600');
    next();
});
app.post('/users/enter', wrapAsync(userController.enter.bind(userController)));
app.post('/users/registration/firstStep', wrapAsync(userController.registrationFirstStep.bind(userController)));
app.post('/users/registration/finalStep', wrapAsync(userController.registrationFinalStep.bind(userController)));
app.use(wrapAsync(async function(req, res, next) {
    let jws = jwsService.parseJws(req.headers.authorization, 'common');
    req.jwsBody = jws;
    next();
}));
app.get('/users/getByJws', wrapAsync(userController.getByJws.bind(userController)));
app.get('/game/getJwtForConnection', wrapAsync(gameController.getJwtForConnection.bind(gameController)));
app.use(exceptionHandler);

wsServer.on('connection', ws => {
    ws.on('message', data => {
        wsServer.clients.forEach(client => client.send('Broadcasting message'));
    });
    ws.on("error", e => ws.send(e));
    ws.send('You have been connected to CrazyFarm websocket');
});
server.on('upgrade', function upgrade(request, socket, head) {
    logger.info('server.upgrade(): try to create new webcosket connection');
    let url = new URL(request.url, 'ws://mockDomain:12000');
    let jws = url.searchParams.get('token');
    try {
        jwsService.parseJws(jws, 'websocket');
        wsServer.handleUpgrade(request, socket, head, ws => wsServer.emit('connection', ws, request));
    } catch(err) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
    }
});

server.listen(process.env.PORT, () => logger.info('Server started successfully'));

function wrapAsync(callback) {
    return function(req, res, next) {
        return callback(req, res, next).catch(err => next(err));
    }
}