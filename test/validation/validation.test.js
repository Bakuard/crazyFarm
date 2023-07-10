const validator = require('../../src/code/validation/validation.js');
const exceptions = require('../../src/code/model/exception/exceptions.js');

test(`checkNewUser(user):
        password is too short,
        email has incorrect format,
        loggin is too short
        => exception`,
    () => {
        let newUser = {
            loggin: 'a',
            email: 'newUser',
            password: '1234567'
        };

        return expect(() => validator.checkNewUser(newUser)).
            toThrowValidationException(
                new exceptions.ValidationException(
                    newUser, 
                    'User.loggin.min', 'User.email.format', 'User.password.min'
                )
            );
    });

test(`checkNewUser(user):
        password is empty,
        email is empty,
        loggin is empty
        => exception`,
    () => {
        let newUser = {
            loggin: '',
            email: '',
            password: ''
        };

        return expect(() => validator.checkNewUser(newUser)).
            toThrowValidationException(
                new exceptions.ValidationException(
                    newUser, 
                    'User.loggin.notEmpty', 'User.email.notEmpty', 'User.password.notEmpty'
                )
            );
    });

test(`checkNewUser(user):
        password is too long,
        email is too long,
        loggin is too long
        => exception`,
    () => {
        let newUser = {
            loggin: '01234567890123456789A',
            email:  'A1234567890123456789012345678901234567890@gmail.com',
            password: '01234567890123456789012345678901234567890123456789A'
        };

        return expect(() => validator.checkNewUser(newUser)).
            toThrowValidationException(
                new exceptions.ValidationException(
                    newUser,
                    'User.loggin.max', 'User.password.max', 'User.email.max'
                )
            );
    });

test(`checkNewUser(user):
        password is undefined,
        email is undefined,
        loggin is undefined
        => exception`,
    () => {
        let newUser = {};

        return expect(() => validator.checkNewUser(newUser)).
            toThrowValidationException(
                new exceptions.ValidationException(
                    newUser,
                    'User.loggin.notEmpty', 'User.password.notEmpty', 'User.email.notEmpty'
                )
            );
    });

test(`checkNewUser(user):
        user is undefined
        => exception`,
    () => {
        let newUser = undefined;

        return expect(() => validator.checkNewUser(newUser)).
            toThrowValidationException(
                new exceptions.ValidationException(
                    null,
                    'User.undefined'
                )
            );
    });

test(`checkNewUser(user):
        user is correct
        => doesn't throw any exception`,
    () => {
        let newUser = {
            loggin: 'new User',
            email: 'newUser@mail.com',
            password: '12345678'
        };

        return expect(() => validator.checkNewUser(newUser)).not.toThrow();
    });

test(`checkExistedUser(user):
        password is too short,
        loggin is too short
        => exception`,
    () => {
        let user = {
            loggin: 'a',
            password: '1234567'
        };

        return expect(() => validator.checkExistedUser(user)).
            toThrowValidationException(
                new exceptions.ValidationException(
                    user, 
                    'User.loggin.min', 'User.password.min'
                )
            );
    });

test(`checkExistedUser(user):
        password is empty,
        loggin is empty
        => exception`,
    () => {
        let user = {
            loggin: '',
            password: ''
        };

        return expect(() => validator.checkExistedUser(user)).
            toThrowValidationException(
                new exceptions.ValidationException(
                    user, 
                    'User.loggin.notEmpty', 'User.password.notEmpty'
                )
            );
    });

test(`checkExistedUser(user):
        password is too long,
        loggin is too long
        => exception`,
    () => {
        let user = {
            loggin: '01234567890123456789A',
            password: '01234567890123456789012345678901234567890123456789A'
        };

        return expect(() => validator.checkExistedUser(user)).
            toThrowValidationException(
                new exceptions.ValidationException(
                    user,
                    'User.loggin.max', 'User.password.max'
                )
            );
    });

test(`checkExistedUser(user):
        password is undefined,
        loggin is undefined
        => exception`,
    () => {
        let user = {};

        return expect(() => validator.checkExistedUser(user)).
            toThrowValidationException(
                new exceptions.ValidationException(
                    user,
                    'User.loggin.notEmpty', 'User.password.notEmpty'
                )
            );
    });

test(`checkExistedUser(user):
        user is undefined
        => exception`,
    () => {
        let user = undefined;

        return expect(() => validator.checkExistedUser(user)).
            toThrowValidationException(
                new exceptions.ValidationException(
                    null,
                    'User.undefined'
                )
            );
    });

test(`checkExistedUser(user):
        user is correct
        => doesn't throw any exception`,
    () => {
        let user = {
            loggin: 'new User',
            password: '12345678'
        };

        return expect(() => validator.checkExistedUser(user)).not.toThrow();
    });