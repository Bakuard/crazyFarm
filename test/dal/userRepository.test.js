const {mongo} = require('../../src/code/dal/dataBaseConnector.js');
const {UserRepository} = require('../../src/code/dal/repositories.js');
const {User} = require('../../src/code/model/auth/User.js');
const {DuplicateUserException} = require('../../src/code/model/exception/exceptions.js');

beforeEach(async () => {
    const db = mongo.db(process.env.MONGO_DB_NAME);
    const collection = db.collection('users');
    await collection.deleteMany({});
});

test(`userRepository.add(user):
       user with such loggin already exists
       => exception`,
    () => {
        let userRepository = new UserRepository();
        userRepository.add(User.createNewUser({
            loggin: 'user1', 
            email: 'user1@mail.com', 
            password: 'password1'
        }));

        return expect(async () => {
            let notUniqueUser = User.createNewUser({
                loggin: 'user1', 
                email: 'unique@mail.com', 
                password: 'password1'
            });
            await userRepository.add(notUniqueUser);
        }).rejects.toThrow(DuplicateUserException);
    });