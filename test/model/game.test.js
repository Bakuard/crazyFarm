const {DBConnector} = require('../../src/code/dal/dataBaseConnector.js');
const {Game} = require('../../src/code/model/logic/game.js');
const {settings} = require('../resources/settings.js');
const {GameRepository, UserRepository} = require('../../src/code/dal/repositories.js');
const {Fabric} = require('../../src/code/model/logic/fabric.js');
const {OutputSystem} = require('../../src/code/model/logic/output.js');
const {User} = require('../../src/code/model/auth/User.js');

let game = null;
let outputData = null;
let randomGeneratorReturnedValue = null;
let timeUtil = null;
let dbConnector = null;

function createTimeUtil() {
    return {
        elapsedMillis: 0,
        callbacks: [],
        infiniteLoop(callback) {
            this.callbacks.push(callback);
            return callback;
        },
        stopLoop(callback) {
            this.callbacks = this.callbacks.filter(item => item != callback);
        },
        now() {
            return this.elapsedMillis;
        },
        advanceTime(millis) {
            this.elapsedMillis += millis;
            this.callbacks.forEach(callback => callback());
        }
    };
}

async function clearDB(dbConnector) {
    const mongo = await dbConnector.getConnection();
    const db = mongo.db('crazyFarmTest');
    const games = db.collection('games');
    await games.deleteMany({});
    const users = db.collection('users');
    await users.deleteMany({});
}

function vegetableDto(vegetableType, vegetableStateNumber, ...needs) {
    return {
        type: vegetableType,
        needs,
        stage: vegetableStateNumber
    };
}

function gardenBedCellDto(x, y, isBlocked, vegetableDto) {
    return {
        isEmpty: !vegetableDto,
        name: x + '-' + y,
        isBlocked,
        character: vegetableDto
    };
}

async function beforeEachTestScenario(isTutorialFinished, isDebugOutput) {
    dbConnector = new DBConnector();
    await clearDB(dbConnector);

    timeUtil = createTimeUtil();
    const fabric = new Fabric(settings);
    fabric.timeUtil = () => timeUtil;
    fabric.randomGenerator = () => () => randomGeneratorReturnedValue;
    game = new Game(
        null, 
        new User({_id: 'userid-123', loggin: 'Me', email: 'me@mail.com', passwordHash: 'pass-hash', salt: 'salt', isTutorialFinished}), 
        new GameRepository(dbConnector),
        new UserRepository(dbConnector),
        fabric
    );

    game.world.getSystemManager().putSystem('WorldLoggerSystem', { update() {} });
    game.world.getSystemManager().putSystem('OutputSystem',  
        new OutputSystem(isDebugOutput, (gameResponse) => outputData = gameResponse)
    );

    await game.start();
}

describe(`grow some vegetables to 'sprout' then die,
          grow tomato to 'child' then die and explode other vegetables`, () => {
    beforeAll(async () => beforeEachTestScenario(true, true));
    afterAll(async () => dbConnector.closeConnection());

    describe.each([
        {
            events: [], 
            elapsedMillis: 100000, 
            updateNumber: 10,
            randomValue: 0.3, 
            expectedMoney: 200, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, false, null),
                gardenBedCellDto(1, 0, false, null),
                gardenBedCellDto(2, 0, false, null),
                gardenBedCellDto(3, 0, false, null),
                gardenBedCellDto(0, 1, false, null),
                gardenBedCellDto(1, 1, false, null),
                gardenBedCellDto(2, 1, false, null),
                gardenBedCellDto(3, 1, false, null),
                gardenBedCellDto(0, 2, false, null),
                gardenBedCellDto(1, 2, false, null),
                gardenBedCellDto(2, 2, false, null),
                gardenBedCellDto(3, 2, false, null)
            ]
        },
        {
            events: [
                {tool: 'seeds', cell: '0-0'}, {tool: 'seeds', cell: '0-1'}, 
                {tool: 'seeds', cell: '1-0'}, {tool: 'seeds', cell: '3-2'}
            ], 
            elapsedMillis: 100, 
            updateNumber: 10,
            randomValue: 0.3, 
            expectedMoney: 188, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, false, vegetableDto('potato', 0)),
                gardenBedCellDto(1, 0, false, vegetableDto('potato', 0)),
                gardenBedCellDto(2, 0, false, null),
                gardenBedCellDto(3, 0, false, null),
                gardenBedCellDto(0, 1, false, vegetableDto('potato', 0)),
                gardenBedCellDto(1, 1, false, null),
                gardenBedCellDto(2, 1, false, null),
                gardenBedCellDto(3, 1, false, null),
                gardenBedCellDto(0, 2, false, null),
                gardenBedCellDto(1, 2, false, null),
                gardenBedCellDto(2, 2, false, null),
                gardenBedCellDto(3, 2, false, vegetableDto('potato', 0))
            ]
        },
        {
            events: [
                {tool: 'seeds', cell: '1-1'}, {tool: 'seeds', cell: '2-2'}
            ], 
            elapsedMillis: 100, 
            updateNumber: 10,
            randomValue: 0.5, 
            expectedMoney: 182, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, false, vegetableDto('potato', 0)),
                gardenBedCellDto(1, 0, false, vegetableDto('potato', 0)),
                gardenBedCellDto(2, 0, false, null),
                gardenBedCellDto(3, 0, false, null),
                gardenBedCellDto(0, 1, false, vegetableDto('potato', 0)),
                gardenBedCellDto(1, 1, false, vegetableDto('tomato', 0)),
                gardenBedCellDto(2, 1, false, null),
                gardenBedCellDto(3, 1, false, null),
                gardenBedCellDto(0, 2, false, null),
                gardenBedCellDto(1, 2, false, null),
                gardenBedCellDto(2, 2, false, vegetableDto('tomato', 0)),
                gardenBedCellDto(3, 2, false, vegetableDto('potato', 0))
            ]
        },
        {
            events: [
                {tool: 'seeds', cell: '2-1'}
            ], 
            elapsedMillis: 100, 
            updateNumber: 10,
            randomValue: 0.75, 
            expectedMoney: 179, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, false, vegetableDto('potato', 0)),
                gardenBedCellDto(1, 0, false, vegetableDto('potato', 0)),
                gardenBedCellDto(2, 0, false, null),
                gardenBedCellDto(3, 0, false, null),
                gardenBedCellDto(0, 1, false, vegetableDto('potato', 0)),
                gardenBedCellDto(1, 1, false, vegetableDto('tomato', 0)),
                gardenBedCellDto(2, 1, false, vegetableDto('onion', 0)),
                gardenBedCellDto(3, 1, false, null),
                gardenBedCellDto(0, 2, false, null),
                gardenBedCellDto(1, 2, false, null),
                gardenBedCellDto(2, 2, false, vegetableDto('tomato', 0)),
                gardenBedCellDto(3, 2, false, vegetableDto('potato', 0))
            ]
        },
        {
            events: [
                {tool: 'bailer', cell: '0-0'}, {tool: 'bailer', cell: '1-0'}, 
                {tool: 'bailer', cell: '0-1'}, {tool: 'bailer', cell: '1-1'},
                {tool: 'bailer', cell: '2-1'}
            ], 
            elapsedMillis: 100, 
            updateNumber: 30,
            randomValue: 0.3, 
            expectedMoney: 179, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, false, vegetableDto('potato', 1)),
                gardenBedCellDto(1, 0, false, vegetableDto('potato', 1)),
                gardenBedCellDto(2, 0, false, null),
                gardenBedCellDto(3, 0, false, null),
                gardenBedCellDto(0, 1, false, vegetableDto('potato', 1)),
                gardenBedCellDto(1, 1, false, vegetableDto('tomato', 1)),
                gardenBedCellDto(2, 1, false, vegetableDto('onion', 1)),
                gardenBedCellDto(3, 1, false, null),
                gardenBedCellDto(0, 2, false, null),
                gardenBedCellDto(1, 2, false, null),
                gardenBedCellDto(2, 2, false, vegetableDto('tomato', 0)),
                gardenBedCellDto(3, 2, false, vegetableDto('potato', 0))
            ]
        },
        {
            events: [], 
            elapsedMillis: 100, 
            updateNumber: 270,
            randomValue: 0.3, 
            expectedMoney: 179, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, false, vegetableDto('potato', 1, 'THIRST', 'HUNGER')),
                gardenBedCellDto(1, 0, false, vegetableDto('potato', 1, 'THIRST', 'HUNGER')),
                gardenBedCellDto(2, 0, false, null),
                gardenBedCellDto(3, 0, false, null),
                gardenBedCellDto(0, 1, false, vegetableDto('potato', 1, 'THIRST', 'HUNGER')),
                gardenBedCellDto(1, 1, false, vegetableDto('tomato', 1, 'THIRST', 'HUNGER')),
                gardenBedCellDto(2, 1, false, vegetableDto('onion', 1, 'THIRST', 'HUNGER')),
                gardenBedCellDto(3, 1, false, null),
                gardenBedCellDto(0, 2, false, null),
                gardenBedCellDto(1, 2, false, null),
                gardenBedCellDto(2, 2, false, vegetableDto('tomato', 0)),
                gardenBedCellDto(3, 2, false, vegetableDto('potato', 0))
            ]
        },
        {
            events: [
                {tool: 'bailer', cell: '0-0'}, {tool: 'bailer', cell: '1-0'}, 
                {tool: 'bailer', cell: '0-1'}, {tool: 'bailer', cell: '1-1'},
                {tool: 'bailer', cell: '2-1'},
                {tool: 'fertilizer', cell: '0-0'}, {tool: 'fertilizer', cell: '1-0'}, 
                {tool: 'fertilizer', cell: '0-1'}, {tool: 'fertilizer', cell: '1-1'},
                {tool: 'fertilizer', cell: '2-1'}
            ], 
            elapsedMillis: 100, 
            updateNumber: 10,
            randomValue: 0.2, 
            expectedMoney: 169, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, false, vegetableDto('potato', 1)),
                gardenBedCellDto(1, 0, false, vegetableDto('potato', 1)),
                gardenBedCellDto(2, 0, false, null),
                gardenBedCellDto(3, 0, false, null),
                gardenBedCellDto(0, 1, false, vegetableDto('potato', 1)),
                gardenBedCellDto(1, 1, false, vegetableDto('tomato', 1)),
                gardenBedCellDto(2, 1, false, vegetableDto('onion', 1)),
                gardenBedCellDto(3, 1, false, null),
                gardenBedCellDto(0, 2, false, null),
                gardenBedCellDto(1, 2, false, null),
                gardenBedCellDto(2, 2, false, vegetableDto('tomato', 0)),
                gardenBedCellDto(3, 2, false, vegetableDto('potato', 0))
            ]
        },
        {
            events: [], 
            elapsedMillis: 100, 
            updateNumber: 290,
            randomValue: 0.3, 
            expectedMoney: 169, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, false, vegetableDto('potato', 1, 'SICKNESS')),
                gardenBedCellDto(1, 0, false, vegetableDto('potato', 1, 'SICKNESS')),
                gardenBedCellDto(2, 0, false, null),
                gardenBedCellDto(3, 0, false, null),
                gardenBedCellDto(0, 1, false, vegetableDto('potato', 1, 'SICKNESS')),
                gardenBedCellDto(1, 1, false, vegetableDto('tomato', 1, 'SICKNESS')),
                gardenBedCellDto(2, 1, false, vegetableDto('onion', 1, 'SICKNESS')),
                gardenBedCellDto(3, 1, false, null),
                gardenBedCellDto(0, 2, false, null),
                gardenBedCellDto(1, 2, false, null),
                gardenBedCellDto(2, 2, false, vegetableDto('tomato', 0)),
                gardenBedCellDto(3, 2, false, vegetableDto('potato', 0))
            ]
        },
        {
            events: [
                {tool: 'sprayer', cell: '0-0'}, {tool: 'sprayer', cell: '1-0'}, 
                {tool: 'sprayer', cell: '0-1'}, {tool: 'sprayer', cell: '1-1'},
                {tool: 'sprayer', cell: '2-1'}
            ], 
            elapsedMillis: 100, 
            updateNumber: 10,
            randomValue: 0.3, 
            expectedMoney: 159, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, false, vegetableDto('potato', 1, 'THIRST', 'HUNGER')),
                gardenBedCellDto(1, 0, false, vegetableDto('potato', 1, 'THIRST', 'HUNGER')),
                gardenBedCellDto(2, 0, false, null),
                gardenBedCellDto(3, 0, false, null),
                gardenBedCellDto(0, 1, false, vegetableDto('potato', 1, 'THIRST', 'HUNGER')),
                gardenBedCellDto(1, 1, false, vegetableDto('tomato', 1, 'THIRST', 'HUNGER')),
                gardenBedCellDto(2, 1, false, vegetableDto('onion', 1, 'THIRST', 'HUNGER')),
                gardenBedCellDto(3, 1, false, null),
                gardenBedCellDto(0, 2, false, null),
                gardenBedCellDto(1, 2, false, null),
                gardenBedCellDto(2, 2, false, vegetableDto('tomato', 0)),
                gardenBedCellDto(3, 2, false, vegetableDto('potato', 0))
            ]
        },
        {
            events: [
                {tool: 'bailer', cell: '0-1'}, {tool: 'bailer', cell: '1-1'}, {tool: 'bailer', cell: '2-1'},
                {tool: 'fertilizer', cell: '0-1'}, {tool: 'fertilizer', cell: '1-1'}, {tool: 'fertilizer', cell: '2-1'}
            ],
            elapsedMillis: 100, 
            updateNumber: 10,
            randomValue: 0.3, 
            expectedMoney: 153, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, false, vegetableDto('potato', 1, 'THIRST', 'HUNGER')),
                gardenBedCellDto(1, 0, false, vegetableDto('potato', 1, 'THIRST', 'HUNGER')),
                gardenBedCellDto(2, 0, false, null),
                gardenBedCellDto(3, 0, false, null),
                gardenBedCellDto(0, 1, false, vegetableDto('potato', 1)),
                gardenBedCellDto(1, 1, false, vegetableDto('tomato', 1)),
                gardenBedCellDto(2, 1, false, vegetableDto('onion', 1)),
                gardenBedCellDto(3, 1, false, null),
                gardenBedCellDto(0, 2, false, null),
                gardenBedCellDto(1, 2, false, null),
                gardenBedCellDto(2, 2, false, vegetableDto('tomato', 0)),
                gardenBedCellDto(3, 2, false, vegetableDto('potato', 0))
            ]
        },
        {
            events: [],
            elapsedMillis: 100, 
            updateNumber: 290,
            randomValue: 0.3, 
            expectedMoney: 153, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, false, vegetableDto('potato', 5)),
                gardenBedCellDto(1, 0, false, vegetableDto('potato', 5)),
                gardenBedCellDto(2, 0, false, null),
                gardenBedCellDto(3, 0, false, null),
                gardenBedCellDto(0, 1, false, vegetableDto('potato', 1)),
                gardenBedCellDto(1, 1, false, vegetableDto('tomato', 1)),
                gardenBedCellDto(2, 1, false, vegetableDto('onion', 1)),
                gardenBedCellDto(3, 1, false, null),
                gardenBedCellDto(0, 2, false, null),
                gardenBedCellDto(1, 2, false, null),
                gardenBedCellDto(2, 2, false, vegetableDto('tomato', 0)),
                gardenBedCellDto(3, 2, false, vegetableDto('potato', 0))
            ]
        },
        {
            events: [],
            elapsedMillis: 100, 
            updateNumber: 120,
            randomValue: 0.3, 
            expectedMoney: 153, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, false, vegetableDto('potato', 5)),
                gardenBedCellDto(1, 0, false, vegetableDto('potato', 5)),
                gardenBedCellDto(2, 0, false, null),
                gardenBedCellDto(3, 0, false, null),
                gardenBedCellDto(0, 1, false, vegetableDto('potato', 2, 'THIRST', 'HUNGER')),
                gardenBedCellDto(1, 1, false, vegetableDto('tomato', 2, 'THIRST', 'HUNGER')),
                gardenBedCellDto(2, 1, false, vegetableDto('onion', 2, 'THIRST', 'HUNGER')),
                gardenBedCellDto(3, 1, false, null),
                gardenBedCellDto(0, 2, false, null),
                gardenBedCellDto(1, 2, false, null),
                gardenBedCellDto(2, 2, false, vegetableDto('tomato', 0)),
                gardenBedCellDto(3, 2, false, vegetableDto('potato', 0))
            ]
        },
        {
            events: [
                {tool: 'bailer', cell: '0-1'}, {tool: 'bailer', cell: '2-1'}, 
                {tool: 'fertilizer', cell: '0-1'},  {tool: 'fertilizer', cell: '2-1'}
            ],
            elapsedMillis: 100, 
            updateNumber: 180,
            randomValue: 0.3, 
            expectedMoney: 149, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, false, vegetableDto('potato', 5)),
                gardenBedCellDto(1, 0, false, vegetableDto('potato', 5)),
                gardenBedCellDto(2, 0, false, null),
                gardenBedCellDto(3, 0, false, null),
                gardenBedCellDto(0, 1, false, vegetableDto('potato', 2)),
                gardenBedCellDto(1, 1, false, vegetableDto('tomato', 2, 'THIRST', 'HUNGER')),
                gardenBedCellDto(2, 1, false, vegetableDto('onion', 2)),
                gardenBedCellDto(3, 1, false, null),
                gardenBedCellDto(0, 2, false, null),
                gardenBedCellDto(1, 2, false, null),
                gardenBedCellDto(2, 2, false, vegetableDto('tomato', 0)),
                gardenBedCellDto(3, 2, false, vegetableDto('potato', 0))
            ]
        },
        {
            events: [],
            elapsedMillis: 100, 
            updateNumber: 1,
            randomValue: 0.3, 
            expectedMoney: 149, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, false, null),
                gardenBedCellDto(1, 0, false, null),
                gardenBedCellDto(2, 0, false, null),
                gardenBedCellDto(3, 0, false, null),
                gardenBedCellDto(0, 1, false, vegetableDto('potato', 7)),
                gardenBedCellDto(1, 1, false, vegetableDto('tomato', 6)),
                gardenBedCellDto(2, 1, false, vegetableDto('onion', 7)),
                gardenBedCellDto(3, 1, false, null),
                gardenBedCellDto(0, 2, false, null),
                gardenBedCellDto(1, 2, false, null),
                gardenBedCellDto(2, 2, false, null),
                gardenBedCellDto(3, 2, false, vegetableDto('potato', 0))
            ]
        },
        {
            events: [],
            elapsedMillis: 100, 
            updateNumber: 1,
            randomValue: 0.3, 
            expectedMoney: 149, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, false, null),
                gardenBedCellDto(1, 0, false, null),
                gardenBedCellDto(2, 0, false, null),
                gardenBedCellDto(3, 0, false, null),
                gardenBedCellDto(0, 1, false, vegetableDto('potato', 6)),
                gardenBedCellDto(1, 1, false, vegetableDto('tomato', 6)),
                gardenBedCellDto(2, 1, false, null),
                gardenBedCellDto(3, 1, false, null),
                gardenBedCellDto(0, 2, false, null),
                gardenBedCellDto(1, 2, false, null),
                gardenBedCellDto(2, 2, false, null),
                gardenBedCellDto(3, 2, false, vegetableDto('potato', 0))
            ]
        },
    ])(`step $#`, ({events, elapsedMillis, updateNumber, randomValue, expectedMoney, expectedGardenCells}) => {
        test(`events: ${JSON.stringify(events)}, 
              elapsedMillis: ${elapsedMillis},
              updateNumber: ${updateNumber},
              randomValue: ${randomValue},
              => expectedMoney: ${expectedMoney},
              expectedGardenCells: ${JSON.stringify(expectedGardenCells, null, 4)}`, 
        () => {
            randomGeneratorReturnedValue = randomValue;
            events.forEach(event => game.execute(event));
            for(let i = 0; i < updateNumber; i++) timeUtil.advanceTime(elapsedMillis);
    
            expect(outputData.containers).toEqual(expectedGardenCells);
            expect(outputData.player.cash).toEqual(expectedMoney);
        });
    });
});

describe(`grow vegetable to adult state and dig up this`, () => {
    beforeAll(async () => beforeEachTestScenario(true, true));
    afterAll(async () => dbConnector.closeConnection());

    describe.each([
        {
            events: [
                {tool: 'seeds', cell: '0-0'}, {tool: 'seeds', cell: '0-1'}, {tool: 'seeds', cell: '1-0'}, {tool: 'seeds', cell: '1-1'},
                {tool: 'bailer', cell: '0-0'}, {tool: 'bailer', cell: '0-1'}, {tool: 'bailer', cell: '1-0'}, {tool: 'bailer', cell: '1-1'}
            ], 
            elapsedMillis: 100, 
            updateNumber: 1,
            randomValue: 0.3, 
            expectedMoney: 188, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, false, vegetableDto('potato', 0)),
                gardenBedCellDto(1, 0, false, vegetableDto('potato', 0)),
                gardenBedCellDto(2, 0, false, null),
                gardenBedCellDto(3, 0, false, null),
                gardenBedCellDto(0, 1, false, vegetableDto('potato', 0)),
                gardenBedCellDto(1, 1, false, vegetableDto('potato', 0)),
                gardenBedCellDto(2, 1, false, null),
                gardenBedCellDto(3, 1, false, null),
                gardenBedCellDto(0, 2, false, null),
                gardenBedCellDto(1, 2, false, null),
                gardenBedCellDto(2, 2, false, null),
                gardenBedCellDto(3, 2, false, null)
            ]
        },
        {
            events: [
                {tool: 'seeds', cell: '2-0'}, {tool: 'seeds', cell: '3-0'},
                {tool: 'bailer', cell: '2-0'}, {tool: 'bailer', cell: '3-0'}
            ], 
            elapsedMillis: 100, 
            updateNumber: 1,
            randomValue: 0.5, 
            expectedMoney: 182, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, false, vegetableDto('potato', 0)),
                gardenBedCellDto(1, 0, false, vegetableDto('potato', 0)),
                gardenBedCellDto(2, 0, false, vegetableDto('tomato', 0)),
                gardenBedCellDto(3, 0, false, vegetableDto('tomato', 0)),
                gardenBedCellDto(0, 1, false, vegetableDto('potato', 0)),
                gardenBedCellDto(1, 1, false, vegetableDto('potato', 0)),
                gardenBedCellDto(2, 1, false, null),
                gardenBedCellDto(3, 1, false, null),
                gardenBedCellDto(0, 2, false, null),
                gardenBedCellDto(1, 2, false, null),
                gardenBedCellDto(2, 2, false, null),
                gardenBedCellDto(3, 2, false, null)
            ]
        },
        {
            events: [
                {tool: 'seeds', cell: '2-1'}, {tool: 'seeds', cell: '3-1'},
                {tool: 'bailer', cell: '2-1'}, {tool: 'bailer', cell: '3-1'}
            ], 
            elapsedMillis: 100, 
            updateNumber: 1,
            randomValue: 0.75, 
            expectedMoney: 176, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, false, vegetableDto('potato', 0)),
                gardenBedCellDto(1, 0, false, vegetableDto('potato', 0)),
                gardenBedCellDto(2, 0, false, vegetableDto('tomato', 0)),
                gardenBedCellDto(3, 0, false, vegetableDto('tomato', 0)),
                gardenBedCellDto(0, 1, false, vegetableDto('potato', 0)),
                gardenBedCellDto(1, 1, false, vegetableDto('potato', 0)),
                gardenBedCellDto(2, 1, false, vegetableDto('onion', 0)),
                gardenBedCellDto(3, 1, false, vegetableDto('onion', 0)),
                gardenBedCellDto(0, 2, false, null),
                gardenBedCellDto(1, 2, false, null),
                gardenBedCellDto(2, 2, false, null),
                gardenBedCellDto(3, 2, false, null)
            ]
        },
        {
            events: [], 
            elapsedMillis: 200, 
            updateNumber: 17,
            randomValue: 0.3, 
            expectedMoney: 176, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, false, vegetableDto('potato', 1)),
                gardenBedCellDto(1, 0, false, vegetableDto('potato', 1)),
                gardenBedCellDto(2, 0, false, vegetableDto('tomato', 1)),
                gardenBedCellDto(3, 0, false, vegetableDto('tomato', 1)),
                gardenBedCellDto(0, 1, false, vegetableDto('potato', 1)),
                gardenBedCellDto(1, 1, false, vegetableDto('potato', 1)),
                gardenBedCellDto(2, 1, false, vegetableDto('onion', 1)),
                gardenBedCellDto(3, 1, false, vegetableDto('onion', 1)),
                gardenBedCellDto(0, 2, false, null),
                gardenBedCellDto(1, 2, false, null),
                gardenBedCellDto(2, 2, false, null),
                gardenBedCellDto(3, 2, false, null)
            ]
        },
        {
            events: [], 
            elapsedMillis: 5000, 
            updateNumber: 10,
            randomValue: 0.3, 
            expectedMoney: 176, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, false, vegetableDto('potato', 1, 'THIRST', 'HUNGER')),
                gardenBedCellDto(1, 0, false, vegetableDto('potato', 1, 'THIRST', 'HUNGER')),
                gardenBedCellDto(2, 0, false, vegetableDto('tomato', 1, 'THIRST', 'HUNGER')),
                gardenBedCellDto(3, 0, false, vegetableDto('tomato', 1, 'THIRST', 'HUNGER')),
                gardenBedCellDto(0, 1, false, vegetableDto('potato', 1, 'THIRST', 'HUNGER')),
                gardenBedCellDto(1, 1, false, vegetableDto('potato', 1, 'THIRST', 'HUNGER')),
                gardenBedCellDto(2, 1, false, vegetableDto('onion', 1, 'THIRST', 'HUNGER')),
                gardenBedCellDto(3, 1, false, vegetableDto('onion', 1, 'THIRST', 'HUNGER')),
                gardenBedCellDto(0, 2, false, null),
                gardenBedCellDto(1, 2, false, null),
                gardenBedCellDto(2, 2, false, null),
                gardenBedCellDto(3, 2, false, null)
            ]
        },
        {
            events: [
                {tool: 'bailer', cell: '0-0'}, {tool: 'bailer', cell: '1-0'}, 
                {tool: 'bailer', cell: '2-0'}, {tool: 'bailer', cell: '3-0'}, 
                {tool: 'bailer', cell: '0-1'}, {tool: 'bailer', cell: '1-1'}, 
                {tool: 'bailer', cell: '2-1'}, {tool: 'bailer', cell: '3-1'},
                {tool: 'fertilizer', cell: '0-0'}, {tool: 'fertilizer', cell: '1-0'}, 
                {tool: 'fertilizer', cell: '2-0'}, {tool: 'fertilizer', cell: '3-0'},
                {tool: 'fertilizer', cell: '0-1'}, {tool: 'fertilizer', cell: '1-1'}, 
                {tool: 'fertilizer', cell: '2-1'}, {tool: 'fertilizer', cell: '3-1'},
            ], 
            elapsedMillis: 5000, 
            updateNumber: 10,
            randomValue: 0.3, 
            expectedMoney: 160, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, false, vegetableDto('potato', 2, 'THIRST', 'HUNGER')),
                gardenBedCellDto(1, 0, false, vegetableDto('potato', 2, 'THIRST', 'HUNGER')),
                gardenBedCellDto(2, 0, false, vegetableDto('tomato', 2, 'THIRST', 'HUNGER')),
                gardenBedCellDto(3, 0, false, vegetableDto('tomato', 2, 'THIRST', 'HUNGER')),
                gardenBedCellDto(0, 1, false, vegetableDto('potato', 2, 'THIRST', 'HUNGER')),
                gardenBedCellDto(1, 1, false, vegetableDto('potato', 2, 'THIRST', 'HUNGER')),
                gardenBedCellDto(2, 1, false, vegetableDto('onion', 2, 'THIRST', 'HUNGER')),
                gardenBedCellDto(3, 1, false, vegetableDto('onion', 2, 'THIRST', 'HUNGER')),
                gardenBedCellDto(0, 2, false, null),
                gardenBedCellDto(1, 2, false, null),
                gardenBedCellDto(2, 2, false, null),
                gardenBedCellDto(3, 2, false, null)
            ]
        },
        {
            events: [
                {tool: 'bailer', cell: '0-0'}, {tool: 'bailer', cell: '1-0'}, 
                {tool: 'bailer', cell: '2-0'}, {tool: 'bailer', cell: '3-0'}, 
                {tool: 'bailer', cell: '0-1'}, {tool: 'bailer', cell: '1-1'}, 
                {tool: 'bailer', cell: '2-1'}, {tool: 'bailer', cell: '3-1'},
                {tool: 'fertilizer', cell: '0-0'}, {tool: 'fertilizer', cell: '1-0'}, 
                {tool: 'fertilizer', cell: '2-0'}, {tool: 'fertilizer', cell: '3-0'},
                {tool: 'fertilizer', cell: '0-1'}, {tool: 'fertilizer', cell: '1-1'}, 
                {tool: 'fertilizer', cell: '2-1'}, {tool: 'fertilizer', cell: '3-1'},
            ],
            elapsedMillis: 5000, 
            updateNumber: 10,
            randomValue: 0.3, 
            expectedMoney: 144, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, false, vegetableDto('potato', 2, 'THIRST', 'HUNGER')),
                gardenBedCellDto(1, 0, false, vegetableDto('potato', 2, 'THIRST', 'HUNGER')),
                gardenBedCellDto(2, 0, false, vegetableDto('tomato', 2, 'THIRST', 'HUNGER')),
                gardenBedCellDto(3, 0, false, vegetableDto('tomato', 2, 'THIRST', 'HUNGER')),
                gardenBedCellDto(0, 1, false, vegetableDto('potato', 2, 'THIRST', 'HUNGER')),
                gardenBedCellDto(1, 1, false, vegetableDto('potato', 2, 'THIRST', 'HUNGER')),
                gardenBedCellDto(2, 1, false, vegetableDto('onion', 2, 'THIRST', 'HUNGER')),
                gardenBedCellDto(3, 1, false, vegetableDto('onion', 2, 'THIRST', 'HUNGER')),
                gardenBedCellDto(0, 2, false, null),
                gardenBedCellDto(1, 2, false, null),
                gardenBedCellDto(2, 2, false, null),
                gardenBedCellDto(3, 2, false, null)
            ]
        },
        {
            events: [
                {tool: 'bailer', cell: '0-0'}, {tool: 'bailer', cell: '1-0'}, 
                {tool: 'bailer', cell: '2-0'}, {tool: 'bailer', cell: '3-0'}, 
                {tool: 'bailer', cell: '0-1'}, {tool: 'bailer', cell: '1-1'}, 
                {tool: 'bailer', cell: '2-1'}, {tool: 'bailer', cell: '3-1'},
                {tool: 'fertilizer', cell: '0-0'}, {tool: 'fertilizer', cell: '1-0'}, 
                {tool: 'fertilizer', cell: '2-0'}, {tool: 'fertilizer', cell: '3-0'},
                {tool: 'fertilizer', cell: '0-1'}, {tool: 'fertilizer', cell: '1-1'}, 
                {tool: 'fertilizer', cell: '2-1'}, {tool: 'fertilizer', cell: '3-1'},
            ], 
            elapsedMillis: 5000, 
            updateNumber: 10,
            randomValue: 0.3, 
            expectedMoney: 128, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, false, vegetableDto('potato', 3, 'THIRST', 'HUNGER')),
                gardenBedCellDto(1, 0, false, vegetableDto('potato', 3, 'THIRST', 'HUNGER')),
                gardenBedCellDto(2, 0, false, vegetableDto('tomato', 3, 'THIRST', 'HUNGER')),
                gardenBedCellDto(3, 0, false, vegetableDto('tomato', 3, 'THIRST', 'HUNGER')),
                gardenBedCellDto(0, 1, false, vegetableDto('potato', 3, 'THIRST', 'HUNGER')),
                gardenBedCellDto(1, 1, false, vegetableDto('potato', 3, 'THIRST', 'HUNGER')),
                gardenBedCellDto(2, 1, false, vegetableDto('onion', 3, 'THIRST', 'HUNGER')),
                gardenBedCellDto(3, 1, false, vegetableDto('onion', 3, 'THIRST', 'HUNGER')),
                gardenBedCellDto(0, 2, false, null),
                gardenBedCellDto(1, 2, false, null),
                gardenBedCellDto(2, 2, false, null),
                gardenBedCellDto(3, 2, false, null)
            ]
        },
        {
            events: [
                {tool: 'bailer', cell: '0-0'}, {tool: 'bailer', cell: '1-0'}, 
                {tool: 'bailer', cell: '2-0'}, {tool: 'bailer', cell: '3-0'}, 
                {tool: 'bailer', cell: '0-1'}, {tool: 'bailer', cell: '1-1'}, 
                {tool: 'bailer', cell: '2-1'}, {tool: 'bailer', cell: '3-1'},
                {tool: 'fertilizer', cell: '0-0'}, {tool: 'fertilizer', cell: '1-0'}, 
                {tool: 'fertilizer', cell: '2-0'}, {tool: 'fertilizer', cell: '3-0'},
                {tool: 'fertilizer', cell: '0-1'}, {tool: 'fertilizer', cell: '1-1'}, 
                {tool: 'fertilizer', cell: '2-1'}, {tool: 'fertilizer', cell: '3-1'},
            ], 
            elapsedMillis: 5000, 
            updateNumber: 10,
            randomValue: 0.3, 
            expectedMoney: 112, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, false, vegetableDto('potato', 3, 'THIRST', 'HUNGER')),
                gardenBedCellDto(1, 0, false, vegetableDto('potato', 3, 'THIRST', 'HUNGER')),
                gardenBedCellDto(2, 0, false, vegetableDto('tomato', 3, 'THIRST', 'HUNGER')),
                gardenBedCellDto(3, 0, false, vegetableDto('tomato', 3, 'THIRST', 'HUNGER')),
                gardenBedCellDto(0, 1, false, vegetableDto('potato', 3, 'THIRST', 'HUNGER')),
                gardenBedCellDto(1, 1, false, vegetableDto('potato', 3, 'THIRST', 'HUNGER')),
                gardenBedCellDto(2, 1, false, vegetableDto('onion', 3, 'THIRST', 'HUNGER')),
                gardenBedCellDto(3, 1, false, vegetableDto('onion', 3, 'THIRST', 'HUNGER')),
                gardenBedCellDto(0, 2, false, null),
                gardenBedCellDto(1, 2, false, null),
                gardenBedCellDto(2, 2, false, null),
                gardenBedCellDto(3, 2, false, null)
            ]
        },
        {
            events: [
                {tool: 'bailer', cell: '0-0'}, {tool: 'bailer', cell: '1-0'}, 
                {tool: 'bailer', cell: '2-0'}, {tool: 'bailer', cell: '3-0'}, 
                {tool: 'bailer', cell: '0-1'}, {tool: 'bailer', cell: '1-1'}, 
                {tool: 'bailer', cell: '2-1'}, {tool: 'bailer', cell: '3-1'},
                {tool: 'fertilizer', cell: '0-0'}, {tool: 'fertilizer', cell: '1-0'}, 
                {tool: 'fertilizer', cell: '2-0'}, {tool: 'fertilizer', cell: '3-0'},
                {tool: 'fertilizer', cell: '0-1'}, {tool: 'fertilizer', cell: '1-1'}, 
                {tool: 'fertilizer', cell: '2-1'}, {tool: 'fertilizer', cell: '3-1'},
            ], 
            elapsedMillis: 5000, 
            updateNumber: 10,
            randomValue: 0.3, 
            expectedMoney: 96, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, false, vegetableDto('potato', 4, 'THIRST', 'HUNGER')),
                gardenBedCellDto(1, 0, false, vegetableDto('potato', 4, 'THIRST', 'HUNGER')),
                gardenBedCellDto(2, 0, false, vegetableDto('tomato', 4, 'THIRST', 'HUNGER')),
                gardenBedCellDto(3, 0, false, vegetableDto('tomato', 4, 'THIRST', 'HUNGER')),
                gardenBedCellDto(0, 1, false, vegetableDto('potato', 4, 'THIRST', 'HUNGER')),
                gardenBedCellDto(1, 1, false, vegetableDto('potato', 4, 'THIRST', 'HUNGER')),
                gardenBedCellDto(2, 1, false, vegetableDto('onion', 4, 'THIRST', 'HUNGER')),
                gardenBedCellDto(3, 1, false, vegetableDto('onion', 4, 'THIRST', 'HUNGER')),
                gardenBedCellDto(0, 2, false, null),
                gardenBedCellDto(1, 2, false, null),
                gardenBedCellDto(2, 2, false, null),
                gardenBedCellDto(3, 2, false, null)
            ]
        },
        {
            events: [
                {tool: 'shovel', cell: '0-0'}, {tool: 'shovel', cell: '1-0'}, 
                {tool: 'shovel', cell: '2-0'}, {tool: 'shovel', cell: '3-0'}, 
                {tool: 'shovel', cell: '0-1'}, {tool: 'shovel', cell: '1-1'}, 
                {tool: 'shovel', cell: '2-1'}, {tool: 'shovel', cell: '3-1'},
            ], 
            elapsedMillis: 100, 
            updateNumber: 1,
            randomValue: 0.3, 
            expectedMoney: 96 + 66 * 4 + 87 * 2 + 53 * 2, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, false, null),
                gardenBedCellDto(1, 0, false, null),
                gardenBedCellDto(2, 0, false, null),
                gardenBedCellDto(3, 0, false, null),
                gardenBedCellDto(0, 1, false, null),
                gardenBedCellDto(1, 1, false, null),
                gardenBedCellDto(2, 1, false, null),
                gardenBedCellDto(3, 1, false, null),
                gardenBedCellDto(0, 2, false, null),
                gardenBedCellDto(1, 2, false, null),
                gardenBedCellDto(2, 2, false, null),
                gardenBedCellDto(3, 2, false, null)
            ]
        }
    ])(`step $#`, ({events, elapsedMillis, updateNumber, randomValue, expectedMoney, expectedGardenCells}) => {
        test(`events: ${JSON.stringify(events)}, 
              elapsedMillis: ${elapsedMillis},
              updateNumber: ${updateNumber},
              randomValue: ${randomValue},
              => expectedMoney: ${expectedMoney},
              expectedGardenCells: ${JSON.stringify(expectedGardenCells, null, 4)}`, 
        () => {
            randomGeneratorReturnedValue = randomValue;
            events.forEach(event => game.execute(event));
            for(let i = 0; i < updateNumber; i++) timeUtil.advanceTime(elapsedMillis);
    
            expect(outputData.containers).toEqual(expectedGardenCells);
            expect(outputData.player.cash).toEqual(expectedMoney);
        });
    });
});

describe(`tutorial`, () => {
    beforeAll(async () => beforeEachTestScenario(false, true));
    afterAll(async () => process.nextTick(() => dbConnector.closeConnection()));
    beforeEach(() => outputData = null);

    describe.each([
        {
            events: [
                {tool: 'seeds', cell: '0-0'}, {tool: 'seeds', cell: '0-1'}, {tool: 'seeds', cell: '1-1'}, {tool: 'seeds', cell: '2-1'},
                {tool: 'seeds', cell: '1-2'}, {tool: 'seeds', cell: '2-2'}, {tool: 'seeds', cell: '2-3'}, {tool: 'seeds', cell: '3-2'}
            ], 
            elapsedMillis: 100, 
            updateNumber: 1000,
            randomValue: 0.3, 
            expectedTutorialStep: 1,
            expectedMoney: 200, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, true, null),
                gardenBedCellDto(1, 0, false, null),
                gardenBedCellDto(2, 0, true, null),
                gardenBedCellDto(3, 0, true, null),
                gardenBedCellDto(0, 1, true, null),
                gardenBedCellDto(1, 1, true, null),
                gardenBedCellDto(2, 1, true, null),
                gardenBedCellDto(3, 1, true, null),
                gardenBedCellDto(0, 2, true, null),
                gardenBedCellDto(1, 2, true, null),
                gardenBedCellDto(2, 2, true, null),
                gardenBedCellDto(3, 2, true, null)
            ]
        },
        {
            events: [
                {tool: 'seeds', cell: '1-0'}
            ], 
            elapsedMillis: 100, 
            updateNumber: 1,
            randomValue: 0.3, 
            expectedTutorialStep: 2,
            expectedMoney: 197, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, true, null),
                gardenBedCellDto(1, 0, false, vegetableDto('potato', 0)),
                gardenBedCellDto(2, 0, true, null),
                gardenBedCellDto(3, 0, true, null),
                gardenBedCellDto(0, 1, true, null),
                gardenBedCellDto(1, 1, true, null),
                gardenBedCellDto(2, 1, true, null),
                gardenBedCellDto(3, 1, true, null),
                gardenBedCellDto(0, 2, true, null),
                gardenBedCellDto(1, 2, true, null),
                gardenBedCellDto(2, 2, true, null),
                gardenBedCellDto(3, 2, true, null)
            ]
        },
        {
            events: [
                {tool: 'bailer', cell: '1-0'}
            ], 
            elapsedMillis: 100, 
            updateNumber: 10,
            randomValue: 0.3, 
            expectedTutorialStep: 3,
            expectedMoney: 197, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, true, null),
                gardenBedCellDto(1, 0, false, vegetableDto('potato', 1)),
                gardenBedCellDto(2, 0, true, null),
                gardenBedCellDto(3, 0, true, null),
                gardenBedCellDto(0, 1, true, null),
                gardenBedCellDto(1, 1, true, null),
                gardenBedCellDto(2, 1, true, null),
                gardenBedCellDto(3, 1, true, null),
                gardenBedCellDto(0, 2, true, null),
                gardenBedCellDto(1, 2, true, null),
                gardenBedCellDto(2, 2, true, null),
                gardenBedCellDto(3, 2, true, null)
            ]
        },
        {
            events: [], 
            elapsedMillis: 100, 
            updateNumber: 20,
            randomValue: 0.3, 
            expectedTutorialStep: 3,
            expectedMoney: 197, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, true, null),
                gardenBedCellDto(1, 0, false, vegetableDto('potato', 1, 'THIRST')),
                gardenBedCellDto(2, 0, true, null),
                gardenBedCellDto(3, 0, true, null),
                gardenBedCellDto(0, 1, true, null),
                gardenBedCellDto(1, 1, true, null),
                gardenBedCellDto(2, 1, true, null),
                gardenBedCellDto(3, 1, true, null),
                gardenBedCellDto(0, 2, true, null),
                gardenBedCellDto(1, 2, true, null),
                gardenBedCellDto(2, 2, true, null),
                gardenBedCellDto(3, 2, true, null)
            ]
        },
        {
            events: [
                {tool: 'bailer', cell: '1-0'}
            ], 
            elapsedMillis: 100, 
            updateNumber: 1,
            randomValue: 0.3, 
            expectedTutorialStep: 3,
            expectedMoney: 197, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, true, null),
                gardenBedCellDto(1, 0, false, vegetableDto('potato', 1)),
                gardenBedCellDto(2, 0, true, null),
                gardenBedCellDto(3, 0, true, null),
                gardenBedCellDto(0, 1, true, null),
                gardenBedCellDto(1, 1, true, null),
                gardenBedCellDto(2, 1, true, null),
                gardenBedCellDto(3, 1, true, null),
                gardenBedCellDto(0, 2, true, null),
                gardenBedCellDto(1, 2, true, null),
                gardenBedCellDto(2, 2, true, null),
                gardenBedCellDto(3, 2, true, null)
            ]
        },
        {
            events: [], 
            elapsedMillis: 100, 
            updateNumber: 60,
            randomValue: 0.3, 
            expectedTutorialStep: 4,
            expectedMoney: 197, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, true, null),
                gardenBedCellDto(1, 0, false, vegetableDto('potato', 2)),
                gardenBedCellDto(2, 0, true, null),
                gardenBedCellDto(3, 0, true, null),
                gardenBedCellDto(0, 1, true, null),
                gardenBedCellDto(1, 1, true, null),
                gardenBedCellDto(2, 1, true, null),
                gardenBedCellDto(3, 1, true, null),
                gardenBedCellDto(0, 2, true, null),
                gardenBedCellDto(1, 2, true, null),
                gardenBedCellDto(2, 2, true, null),
                gardenBedCellDto(3, 2, true, null)
            ]
        },
        {
            events: [], 
            elapsedMillis: 100, 
            updateNumber: 20,
            randomValue: 0.3, 
            expectedTutorialStep: 4,
            expectedMoney: 197, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, true, null),
                gardenBedCellDto(1, 0, false, vegetableDto('potato', 2, 'HUNGER', 'SICKNESS')),
                gardenBedCellDto(2, 0, true, null),
                gardenBedCellDto(3, 0, true, null),
                gardenBedCellDto(0, 1, true, null),
                gardenBedCellDto(1, 1, true, null),
                gardenBedCellDto(2, 1, true, null),
                gardenBedCellDto(3, 1, true, null),
                gardenBedCellDto(0, 2, true, null),
                gardenBedCellDto(1, 2, true, null),
                gardenBedCellDto(2, 2, true, null),
                gardenBedCellDto(3, 2, true, null)
            ]
        },
        {
            events: [
                {tool: 'fertilizer', cell: '1-0'}, {tool: 'sprayer', cell: '1-0'}
            ], 
            elapsedMillis: 100, 
            updateNumber: 1,
            randomValue: 0.3, 
            expectedTutorialStep: 4,
            expectedMoney: 193, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, true, null),
                gardenBedCellDto(1, 0, false, vegetableDto('potato', 2)),
                gardenBedCellDto(2, 0, true, null),
                gardenBedCellDto(3, 0, true, null),
                gardenBedCellDto(0, 1, true, null),
                gardenBedCellDto(1, 1, true, null),
                gardenBedCellDto(2, 1, true, null),
                gardenBedCellDto(3, 1, true, null),
                gardenBedCellDto(0, 2, true, null),
                gardenBedCellDto(1, 2, true, null),
                gardenBedCellDto(2, 2, true, null),
                gardenBedCellDto(3, 2, true, null)
            ]
        },
        {
            events: [], 
            elapsedMillis: 100, 
            updateNumber: 60,
            randomValue: 0.3, 
            expectedTutorialStep: 5,
            expectedMoney: 193, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, true, null),
                gardenBedCellDto(1, 0, false, vegetableDto('potato', 3)),
                gardenBedCellDto(2, 0, true, null),
                gardenBedCellDto(3, 0, true, null),
                gardenBedCellDto(0, 1, true, null),
                gardenBedCellDto(1, 1, true, null),
                gardenBedCellDto(2, 1, true, null),
                gardenBedCellDto(3, 1, true, null),
                gardenBedCellDto(0, 2, true, null),
                gardenBedCellDto(1, 2, true, null),
                gardenBedCellDto(2, 2, true, null),
                gardenBedCellDto(3, 2, true, null)
            ]
        },
        {
            events: [], 
            elapsedMillis: 100, 
            updateNumber: 20,
            randomValue: 0.3, 
            expectedTutorialStep: 5,
            expectedMoney: 193, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, true, null),
                gardenBedCellDto(1, 0, false, vegetableDto('potato', 3, 'THIRST', 'HUNGER', 'SICKNESS')),
                gardenBedCellDto(2, 0, true, null),
                gardenBedCellDto(3, 0, true, null),
                gardenBedCellDto(0, 1, true, null),
                gardenBedCellDto(1, 1, true, null),
                gardenBedCellDto(2, 1, true, null),
                gardenBedCellDto(3, 1, true, null),
                gardenBedCellDto(0, 2, true, null),
                gardenBedCellDto(1, 2, true, null),
                gardenBedCellDto(2, 2, true, null),
                gardenBedCellDto(3, 2, true, null)
            ]
        },
        {
            events: [
                {tool: 'bailer', cell: '1-0'}, {tool: 'fertilizer', cell: '1-0'}, {tool: 'sprayer', cell: '1-0'}
            ], 
            elapsedMillis: 100, 
            updateNumber: 1,
            randomValue: 0.3, 
            expectedTutorialStep: 5,
            expectedMoney: 189, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, true, null),
                gardenBedCellDto(1, 0, false, vegetableDto('potato', 3)),
                gardenBedCellDto(2, 0, true, null),
                gardenBedCellDto(3, 0, true, null),
                gardenBedCellDto(0, 1, true, null),
                gardenBedCellDto(1, 1, true, null),
                gardenBedCellDto(2, 1, true, null),
                gardenBedCellDto(3, 1, true, null),
                gardenBedCellDto(0, 2, true, null),
                gardenBedCellDto(1, 2, true, null),
                gardenBedCellDto(2, 2, true, null),
                gardenBedCellDto(3, 2, true, null)
            ]
        },
        {
            events: [], 
            elapsedMillis: 100, 
            updateNumber: 60,
            randomValue: 0.3, 
            expectedTutorialStep: 6,
            expectedMoney: 189, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, true, null),
                gardenBedCellDto(1, 0, false, vegetableDto('potato', 4)),
                gardenBedCellDto(2, 0, true, null),
                gardenBedCellDto(3, 0, true, null),
                gardenBedCellDto(0, 1, true, null),
                gardenBedCellDto(1, 1, true, null),
                gardenBedCellDto(2, 1, true, null),
                gardenBedCellDto(3, 1, true, null),
                gardenBedCellDto(0, 2, true, null),
                gardenBedCellDto(1, 2, true, null),
                gardenBedCellDto(2, 2, true, null),
                gardenBedCellDto(3, 2, true, null)
            ]
        },
        {
            events: [
                {tool: 'shovel', cell: '1-0'}
            ], 
            elapsedMillis: 100, 
            updateNumber: 1,
            randomValue: 0.3, 
            expectedTutorialStep: 7,
            expectedMoney: 189 + 66, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, false, null),
                gardenBedCellDto(1, 0, false, null),
                gardenBedCellDto(2, 0, false, null),
                gardenBedCellDto(3, 0, false, null),
                gardenBedCellDto(0, 1, false, null),
                gardenBedCellDto(1, 1, false, null),
                gardenBedCellDto(2, 1, false, null),
                gardenBedCellDto(3, 1, false, null),
                gardenBedCellDto(0, 2, false, null),
                gardenBedCellDto(1, 2, false, null),
                gardenBedCellDto(2, 2, false, null),
                gardenBedCellDto(3, 2, false, null)
            ]
        },
        {
            events: [], 
            elapsedMillis: 100, 
            updateNumber: 1000,
            randomValue: 0.3, 
            expectedTutorialStep: undefined,
            expectedMoney: 189 + 66, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, false, null),
                gardenBedCellDto(1, 0, false, null),
                gardenBedCellDto(2, 0, false, null),
                gardenBedCellDto(3, 0, false, null),
                gardenBedCellDto(0, 1, false, null),
                gardenBedCellDto(1, 1, false, null),
                gardenBedCellDto(2, 1, false, null),
                gardenBedCellDto(3, 1, false, null),
                gardenBedCellDto(0, 2, false, null),
                gardenBedCellDto(1, 2, false, null),
                gardenBedCellDto(2, 2, false, null),
                gardenBedCellDto(3, 2, false, null)
            ]
        },
        {
            events: [
                {tool: 'seeds', cell: '0-0'}
            ], 
            elapsedMillis: 100, 
            updateNumber: 1000,
            randomValue: 0.3, 
            expectedTutorialStep: undefined,
            expectedMoney: 252, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, false, vegetableDto('potato', 0)),
                gardenBedCellDto(1, 0, false, null),
                gardenBedCellDto(2, 0, false, null),
                gardenBedCellDto(3, 0, false, null),
                gardenBedCellDto(0, 1, false, null),
                gardenBedCellDto(1, 1, false, null),
                gardenBedCellDto(2, 1, false, null),
                gardenBedCellDto(3, 1, false, null),
                gardenBedCellDto(0, 2, false, null),
                gardenBedCellDto(1, 2, false, null),
                gardenBedCellDto(2, 2, false, null),
                gardenBedCellDto(3, 2, false, null)
            ]
        }
    ])(`step $#`, ({events, elapsedMillis, updateNumber, randomValue, expectedTutorialStep, expectedMoney, expectedGardenCells}) => {
        test(`events: ${JSON.stringify(events)}, 
              elapsedMillis: ${elapsedMillis},
              updateNumber: ${updateNumber},
              randomValue: ${randomValue},
              => expectedTutorialStep: ${expectedTutorialStep},
              expectedMoney: ${expectedMoney},
              expectedGardenCells: ${JSON.stringify(expectedGardenCells, null, 4)}`, 
        () => {
            randomGeneratorReturnedValue = randomValue;
            events.forEach(event => game.execute(event));
            for(let i = 0; i < updateNumber; i++) timeUtil.advanceTime(elapsedMillis);
    
            expect(outputData.containers).toEqual(expectedGardenCells);
            expect(outputData.player.cash).toEqual(expectedMoney);
            expect(outputData.tutorial?.currentStep).toEqual(expectedTutorialStep);
        });
    });
});
