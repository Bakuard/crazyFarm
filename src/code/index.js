'use strict'

const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDoc = require('../resources/swagger/swagger.json');

const {JwsService} = require('./service/jwsService.js');
const {UserController} = require('./controller/userController.js');
const {exceptionHandler} = require('./controller/exceptionHandler.js');
const {newLogger} = require('./conf/logConf.js');
const {i18next,i18nMiddleware} = require('./conf/i18nConf.js');

const jwsService = new JwsService();
const userController = new UserController(jwsService);
const logger = newLogger('info', 'index.js');
const app = express();

app.use(i18nMiddleware.handle(i18next));
app.use('/api', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
app.use(function (req, res, next) {
    res.append('Access-Control-Allow-Origin', ['*']);
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.append('Access-Control-Allow-Headers', 'Content-Type');
    next();
});
app.post('/users/enter', express.json(), wrapAsync(userController.enter.bind(userController)));
app.post('/users/registration/firstStep', express.json(), wrapAsync(userController.registrationFirstStep.bind(userController)));
app.post('/users/registration/finalStep', wrapAsync(userController.registrationFinalStep.bind(userController)));
app.use(wrapAsync(async function(req, res, next) {
    let jws = jwsService.parseJws(req.headers.authorization, 'common');
    req.jwsBody = jws;
    next();
}));
app.get('/users/getByJws', wrapAsync(userController.getByJws.bind(userController)));
app.use(exceptionHandler);
app.listen(process.env.PORT, () => logger.info('Server started successfully'));

function wrapAsync(callback) {
    return function(req, res, next) {
        return callback(req, res, next).catch(err => next(err));
    }
}