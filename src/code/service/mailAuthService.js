'use strict'

const {User} = require('../model/auth/User.js');
const {MailService} = require('./mailService.js');
const {newLogger} = require('../conf/logConf.js');
const validator = require('../validation/validation.js');
const exceptions = require('../model/exception/exceptions.js');
const ms = require('ms');

const logger = newLogger('info', 'mailAuthService.js');

module.exports.MailAuthService = class MailAuthService {

    #mailService;
    #jwsService;
    #userRepository;

    constructor(jwsService, userRepository) {
        this.#mailService = new MailService();
        this.#jwsService = jwsService;
        this.#userRepository = userRepository;
    }

    async enter(userRequest) { 
        logger.info(`enter(): user '%s' is trying to enter`, userRequest);

        validator.checkExistedUser(userRequest);
        const user = await this.#userRepository.tryFindByLoggin(userRequest.loggin);
        user.assertCorrectPassword(userRequest.password);
        const jws = this.#jwsService.generateJws(user._id, 'common', ms(process.env.JWS_COMMON_LIFETIME_DAYS));
        return { jws, user };
    }

    async registrationFirstStep(userRequest, laguage) {
        logger.info('registrationFirstStep(): register new user {loggin: %s, email: %s}', userRequest.loggin, userRequest.email);

        await exceptions.tryExecuteAll(
            () => validator.checkNewUser(userRequest),
            async () => this.#userRepository.assertUnique(userRequest)
        );
        const user = User.createNewUser(userRequest); 
        const jws = this.#jwsService.generateJws(user, 'registration', ms(process.env.JWS_REGISTER_LIFETIME_DAYS));
        await this.#mailService.sendMailForRegistration(user.email, jws, laguage);
    }

    async registrationFinalStep(jwtForRegistration) {
        const rawUserFromJws = this.#jwsService.parseJws(jwtForRegistration, 'registration');
        const user = new User(rawUserFromJws);
        logger.info('registrationFinalStep(): register new user {loggin: %s, email: %s}.', user.loggin, user.email);
        await this.#userRepository.add(user);
        const jws = this.#jwsService.generateJws(user._id, 'common', ms(process.env.JWS_COMMON_LIFETIME_DAYS));
        return { jws, user };
    }
};
