const {DBConnector} = require('../../src/code/dal/dataBaseConnector.js');
const {UserRepository} = require('../../src/code/dal/repositories.js');
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