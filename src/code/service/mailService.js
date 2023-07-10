'use strict'

const nodemailer = require('nodemailer');
const pug = require('pug');
const path = require('path');
const {i18next} = require('../conf/i18nConf.js');

module.exports.MailService = class MailService {

    #transporter;
    #pathToTemplates;
    #compiledTemplateForRegistration;

    constructor() {
        this.#transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            },
            debug: true,
            logger: true
        });

        this.#pathToTemplates = path.resolve(__dirname, '..', '..', 'resources', 'emailTemplates');

        this.#compiledTemplateForRegistration = pug.compileFile(path.resolve(this.#pathToTemplates, 'registration.pug'));
    }

    async sendMailForRegistration(email, jws, lng) {
        await this.#transporter.sendMail({
            from: '"Crazy Farm" <flashcardsbox@gmail.com>',
            to: email,
            subject: 'confirm registration',
            html: this.#compiledTemplateForRegistration({
                registrationCompleteMessage: i18next.t('register.compliteMessage', {lng}),
                returnAddressWithJwt: process.env.MAIL_RETURN_ADDRESS + '?token=' + jws,
                link: i18next.t('register.link', {lng})
            })
        });
    }

}