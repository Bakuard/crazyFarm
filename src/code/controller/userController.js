'use strict'

const ms = require('ms');

const validator = require('../validation/validation.js');
const dto = require('../dto/dto.js');
const exceptions = require('../model/exception/exceptions.js');
const {User} = require('../model/auth/User.js');
const {MailService} = require('../service/mailService.js');
const {newLogger} = require('../conf/logConf.js');
const {i18next} = require('../conf/i18nConf.js');

const mailService = new MailService();
const logger = newLogger('info', 'userController.js');

module.exports.UserController = class UserController {

    #jwsService;
    #userRepository;
    #googleAuthService;

    constructor(jwsService, userRepository, googleAuthService) {
        this.#jwsService = jwsService;
        this.#userRepository = userRepository;
        this.#googleAuthService = googleAuthService;
    }

    async enter(req, res, next) { 
        const userRequest = new dto.UserRequest(req.body);
        logger.info(`enter(): user '%s' is trying to enter`, userRequest);

        validator.checkExistedUser(userRequest);
        const user = await this.#userRepository.tryFindByLoggin(userRequest.loggin);
        user.assertCorrectPassword(userRequest.password);
        const jws = this.#jwsService.generateJws(user._id, 'common', ms(process.env.JWS_COMMON_LIFETIME_DAYS));
        res.send(new dto.JwsResponse(jws, user));
    }

    async registrationFirstStep(req, res, next) {
        const userRequest = new dto.UserRequest(req.body);
        logger.info('registrationFirstStep(): register new user {loggin: %s, email: %s}', userRequest.loggin, userRequest.email);

        await exceptions.tryExecuteAll(
            () => validator.checkNewUser(userRequest),
            async () => this.#userRepository.assertUnique(userRequest)
        );
        const user = User.createNewUser(userRequest); 
        const jws = this.#jwsService.generateJws(user, 'registration', ms(process.env.JWS_REGISTER_LIFETIME_DAYS));
        await mailService.sendMailForRegistration(user.email, jws, req.language);
        res.send(i18next.t('register.firstStep', {lng: req.language}));
    }

    async registrationFinalStep(req, res, next) {
        const rawUserFromJws = this.#jwsService.parseJws(req.headers.authorization, 'registration');
        const user = new User(rawUserFromJws);
        logger.info('registrationFinalStep(): register new user {loggin: %s, email: %s}.', user.loggin, user.email);
        await this.#userRepository.add(user);
        const jws = this.#jwsService.generateJws(user._id, 'common', ms(process.env.JWS_COMMON_LIFETIME_DAYS));
        res.send(new dto.JwsResponse(jws, user));
    }

    async enterGoogle(req, res, next) {
        const jwtAndUser = await this.#googleAuthService.enter(req.headers.authorization);
        res.send(new dto.JwsResponse(jwtAndUser.jws, jwtAndUser.user));
    }

    async registrationGoogle(req, res, next) {
        const jwtAndUser = await this.#googleAuthService.registration(req.headers.authorization);
        res.send(new dto.JwsResponse(jwtAndUser.jws, jwtAndUser.user));
    }

    async getByJws(req, res, next) {
        logger.info('getByJws(): User with id=%s is trying to get self credential', req.jwsBody);

        const user = await this.#userRepository.findById(req.jwsBody);
        res.send(new dto.UserResponse(user));
    }

}
