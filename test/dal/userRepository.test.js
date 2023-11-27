const {DBConnector} = require('../../src/code/dal/dataBaseConnector.js');
const {UserRepository} = require('../../src/code/dal/userRepository.js');
const {User} = require('../../src/code/model/auth/User.js');
const {DuplicateUserException} = require('../../src/code/model/exception/exceptions.js');

let dbConnector = null;
let db = null;
beforeAll(async () => {
    dbConnector = new DBConnector();
    const mongo = await dbConnector.getConnection();
    db = mongo.db(process.env.MONGO_DB_NAME);
});

beforeEach(async () => {
    const collection = db.collection('users');
    await collection.deleteMany({});
});

afterAll(async () => dbConnector.closeConnection());

test(`userRepository.add(user):
       user with such loggin already exists
       => exception`,
    () => {
        let userRepository = new UserRepository(dbConnector);
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

test(`userRepository.assertUnique(user):
        user.loggin is null,
        user.email is null
        => doesn't throw any exception`,
    async () => {
        let userRepository = new UserRepository(dbConnector);
        let nullUser = User.createNewUser({
            loggin: null, 
            email: null, 
            password: 'password'
        });

        return userRepository.add(nullUser).catch(e => expect(e).toBeNull());
    });

test(`userRepository.update(user):
        there is not other user with such email and loggin
        => update user`,
    async () => {
        let userRepository = new UserRepository(dbConnector);
        let user = User.createNewUser({
            loggin: 'Me', 
            email: 'me@mail.com', 
            password: 'password'
        });
        await userRepository.add(user);

        user.loggin = 'He';
        user.email = 'he@mail.com';
        await userRepository.update(user);
        let actualUser = await userRepository.findById(user._id);

        expect(actualUser).toEqual(user);
    });