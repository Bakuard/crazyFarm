'use strict'

const ms = require('ms');
const {OAuth2Client} = require('google-auth-library');
const {User} = require('../model/auth/User.js');
const {newLogger} = require('../conf/logConf.js');
const passwordGenerator = require('generate-password');

const logger = newLogger('info', 'googleAuthService.js');

module.exports.GoogleAuthService = class GoogleAuthService {

    #gooleJwtValidator;
    #userRepository
    #jwsService;

    constructor(userRepository,jwsService) {
        this.#gooleJwtValidator = new OAuth2Client();
        this.#userRepository = userRepository;
        this.#jwsService = jwsService;
    }

    async enter(idToken) {
        const payload = await this.#parseToken(idToken);
        
        logger.info('enter(): user {loggin: %s, email: %s} try to enter', payload.given_name, payload.email);

        let user = await this.#userRepository.tryFindByEmail(payload.email);
        let jws = this.#jwsService.generateJws(user._id, 'common', ms(process.env.JWS_COMMON_LIFETIME_DAYS));
        return {jws, user};
    }

    async registration(idToken) {
        const payload = await this.#parseToken(idToken);

        logger.info('registration(): register new user {loggin: %s, email: %s}.', payload.given_name, payload.email);

        let user = User.createNewUser({
            loggin: payload.given_name,
            email: payload.email,
            password: this.#generatePassword()
        }); 
        await this.#userRepository.assertUnique(user);

        await this.#userRepository.add(user);

        let jws = this.#jwsService.generateJws(user._id, 'common', ms(process.env.JWS_COMMON_LIFETIME_DAYS));
        return {jws, user};
    }

    async #parseToken(idToken) {
        if(idToken.startsWith('Bearer ')) idToken = idToken.substring(7);
        const ticket = await this.#gooleJwtValidator.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        return ticket.getPayload();
    }

    #generatePassword() {
        return passwordGenerator.generate({
            length: 15,
            numbers: true,
            symbols: true,
            strict: true
        });
    }

};