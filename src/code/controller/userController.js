'use strict'

const ms = require('ms');

const validator = require('../validation/validation.js');
const dto = require('../dto/dto.js');
const exceptions = require('../model/exception/exceptions.js');
const {User} = require('../model/auth/User.js');
const {MailService} = require('../service/mailService.js');
const {UserRepository} = require('../dal/repositories.js');
const {newLogger} = require('../conf/logConf.js');
const {i18next} = require('../conf/i18nConf.js');

const mailService = new MailService();
const userRepository = new UserRepository();
const logger = newLogger('info', 'userController.js');

module.exports.UserController = class UserController {

    #jwsService;

    constructor(jwsService) {
        this.#jwsService = jwsService;
    }

    async enter(req, res, next) { 
        logger.info('enter(): user %s is trying to enter', req.body.loggin);

        validator.checkExistedUser(req.body);
        let user = await userRepository.tryFindByLoggin(req.body.loggin);
        user.assertCorrectPassword(req.body.password);
        let jws = this.#jwsService.generateJws(user._id, 'common', ms(process.env.JWS_COMMON_LIFETIME_DAYS));
        res.send(new dto.JwsResponse(jws, user));
    }

    async registrationFirstStep(req, res, next) {
        logger.info('registrationFirstStep(): register new user {loggin: %s, email: %s}', req.body.loggin, req.body.email);

        validator.checkNewUser(req.body);
        let user = User.createNewUser(req.body); 
        await userRepository.assertUnique(user);
        let jws = this.#jwsService.generateJws(user, 'registration', ms(process.env.JWS_REGISTER_LIFETIME_DAYS));
        await mailService.sendMailForRegistration(user.email, jws, req.language);
        res.send(i18next.t('register.firstStep', {lng: req.language}));
    }

    async registrationFinalStep(req, res, next) {
        let user = this.#jwsService.parseJws(req.headers.authorization, 'registration');
        logger.info('registrationFinalStep(): register new user {loggin: %s, email: %s}.', user.loggin, user.email);
        await userRepository.add(user);
        let jws = this.#jwsService.generateJws(user._id, 'common', ms(process.env.JWS_COMMON_LIFETIME_DAYS));
        res.send(new dto.JwsResponse(jws, user));
    }

    async getByJws(req, res, next) {
        logger.info('getByJws(): User with id=%s is trying to get self credential', req.jwsBody);

        let user = await userRepository.findById(req.jwsBody);
        res.send(new dto.UserResponse(user));
    }

}