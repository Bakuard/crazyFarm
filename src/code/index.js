'use strict'

const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDoc = require('../resources/swagger/swagger.json');
const {WebSocketServer} = require('ws');
const http = require('http');
const {UserRepository} = require('./dal/userRepository.js');
const {GameRepository} = require('./dal/gameRepository.js');
const {DBConnector} = require('./dal/dataBaseConnector.js');
const {JwsService} = require('./service/jwsService.js');
const {UserController} = require('./controller/userController.js');
const {GameController} = require('./controller/gameController.js');
const {exceptionHandler} = require('./controller/exceptionHandler.js');
const {newLogger} = require('./conf/logConf.js');
const {i18next,i18nMiddleware} = require('./conf/i18nConf.js');
const {GoogleAuthService} = require('./service/googleAuthService.js');
const {MailAuthService} = require('./service/mailAuthService.js');

const logger = newLogger('info', 'index.js');
const app = express();
const server = http.createServer(app);
const wsServer = new WebSocketServer({noServer: true , path: '/game'});
const jwsService = new JwsService();
const dbConnector = new DBConnector();
const userRepository = new UserRepository(dbConnector);
const gameRepository = new GameRepository(dbConnector);
const googleAuthService = new GoogleAuthService(userRepository, jwsService);
const mailAuthService = new MailAuthService(jwsService, userRepository);
const userController = new UserController(userRepository, googleAuthService, mailAuthService);
const gameController = new GameController(jwsService, wsServer, userRepository, gameRepository);

app.use(express.json());
app.use(express.urlencoded());
app.use(cors);
app.use(i18nMiddleware.handle(i18next));
app.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
app.post('/users/enter', wrapAsync(userController.enter.bind(userController)));
app.post('/users/enter/google', wrapAsync(userController.enterGoogle.bind(userController)));
app.post('/users/registration/firstStep', wrapAsync(userController.registrationFirstStep.bind(userController)));
app.post('/users/registration/finalStep', wrapAsync(userController.registrationFinalStep.bind(userController)));
app.post('/users/registration/google', wrapAsync(userController.registrationGoogle.bind(userController)));
app.use(wrapAsync(checkJws));
app.get('/users/getByJws', wrapAsync(userController.getByJws.bind(userController)));
app.get('/game/getJwtForConnection', wrapAsync(gameController.getJwtForConnection.bind(gameController)));
app.use(exceptionHandler);

wsServer.on('connection', gameController.startNewGame.bind(gameController));
server.on('upgrade', gameController.authNewConnection.bind(gameController));

server.listen(process.env.PORT, () => logger.info('Server started successfully'));


function cors(req, res, next) {
    res.append('Access-Control-Allow-Origin', ['*']);
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,HEAD,PATCH');
    res.append('Access-Control-Allow-Headers', ['*']);
    res.append('Access-Control-Max-Age', '600');
    if(req.method == 'OPTIONS') res.sendStatus(204);
    else next();
}

async function checkJws(req, res, next) {
    let jws = jwsService.parseJws(req.headers.authorization, 'common');
    req.jwsBody = jws;
    next();
}

function wrapAsync(callback) {
    return function(req, res, next) {
        return callback(req, res, next).catch(err => next(err));
    }
}