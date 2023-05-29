'use strict'

const jsonwebtoken = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const crypto = require('node:crypto');
const exceptions = require('../model/exception/exceptions.js');

module.exports.JwsService = class JwsService {

    #keyPairs;

    constructor() {
        this.#keyPairs = {};
    }

    generateJws(payload, keyName, lifeTimeInMillis) {
        return jsonwebtoken.sign(
            {body: payload},
            this.#getOrGenerateKeyPair(keyName).privateKey,
            {
                algorithm: 'RS256',
                expiresIn: lifeTimeInMillis,
                jwtid: uuidv4()
            }
        );
    }

    parseJws(jws, keyName) {
        try {
            if(jws.startsWith('Bearer ')) jws = jws.substring(7);

            return jsonwebtoken.verify(
                jws,
                this.#getOrGenerateKeyPair(keyName).publicKey,
                {
                    algorithm: 'RS256'
                }
            ).body;
        } catch(err) {
            let exception = new exceptions.UnauthorizedException(
                'Unauthorized',
                `Invalid jws='${jws}'`
            );
            exception.cause = err;
            throw exception;
        }
    }

    #getOrGenerateKeyPair(keyName) {
        if(this.#keyPairs[keyName]) {
            return this.#keyPairs[keyName];
        } else {
            let keyPair = crypto.generateKeyPairSync('rsa', {
                modulusLength: 2048,
                publicKeyEncoding: {
                  type: 'spki',
                  format: 'pem'
                },
                privateKeyEncoding: {
                  type: 'pkcs8',
                  format: 'pem',
                }
            });
            this.#keyPairs[keyName] = keyPair;
            return keyPair;
        }
    }

}