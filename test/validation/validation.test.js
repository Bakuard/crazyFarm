const validator = require('../../src/code/validation/validation.js');
const exceptions = require('../../src/code/model/exception/exceptions.js');

test(`checkNewUser(newUser):
        password is to short,
        email has incorrect format,
        loggin is too short
        => exception`,
    () => {
        let newUser = {
            loggin: '',
            email: 'newUser',
            password: '1234567'
        };

        return expect(() => validator.checkNewUser(newUser)).
            toThrow(
                new exceptions.ValidationException(
                    `Fail validation new user: ${JSON.stringify(newUser, (k, v) => k == 'password' ? '***' : v)}`, 
                    ['newUser.loggin.min', 'newUser.email.format', 'newUser.password.min']
                )
            );
    });

test(`checkNewUser(newUser):
        newUser is correct
        => doesn't throw any exception`,
    () => {
        let newUser = {
            loggin: 'new User',
            email: 'newUser@mail.com',
            password: '12345678'
        };

        return expect(() => validator.checkNewUser(newUser)).not.toThrow();
    });