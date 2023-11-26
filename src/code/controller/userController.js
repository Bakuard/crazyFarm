'use strict'

const dto = require('../dto/dto.js');
const {newLogger} = require('../conf/logConf.js');
const {i18next} = require('../conf/i18nConf.js');

const logger = newLogger('info', 'userController.js');

module.exports.UserController = class UserController {

    #jwsService;
    #userRepository;
    #googleAuthService;
    #mailAuthService;

    constructor(userRepository, googleAuthService, mailAuthService) {
        this.#userRepository = userRepository;
        this.#googleAuthService = googleAuthService;
        this.#mailAuthService = mailAuthService;
    }

    async enter(req, res, next) { 
        const userRequest = new dto.UserRequest(req.body);
        const jwtAndUser = await this.#mailAuthService.enter(userRequest);
        res.send(new dto.JwsResponse(jwtAndUser.jws, jwtAndUser.user));
    }

    async registrationFirstStep(req, res, next) {
        const userRequest = new dto.UserRequest(req.body);
        await this.#mailAuthService.registrationFirstStep(userRequest, req.language);
        res.send(i18next.t('register.firstStep', {lng: req.language}));
    }

    async registrationFinalStep(req, res, next) {
        const jwtAndUser = await this.#mailAuthService.registrationFinalStep(req.headers.authorization);
        res.send(new dto.JwsResponse(jwtAndUser.jws, jwtAndUser.user));
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
