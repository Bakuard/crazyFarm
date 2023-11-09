const {DBConnector} = require('../../src/code/dal/dataBaseConnector.js');
const {Game} = require('../../src/code/model/logic/game.js');
const {settings} = require('../resources/settings.js');
const {GameRepository} = require('../../src/code/dal/repositories.js');
const {Fabric} = require('../../src/code/model/logic/fabric.js');
const {OutputSystem} = require('../../src/code/model/logic/output.js');
const {groups} = require('../../src/code/model/gameEngine/gameLoop.js');

let game = null;
let outputData = null;
let randomGeneratorReturnedValue = null;
let timeUtil = null;

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

async function beforeEachTestScenario() {
    const dbConnector = new DBConnector();
    await clearDB(dbConnector);

    timeUtil = createTimeUtil();
    const fabric = new Fabric(settings);
    fabric.timeUtil = () => timeUtil;
    fabric.randomGenerator = () => () => randomGeneratorReturnedValue;
    game = new Game(
        () => {}, 
        {_id: '123'}, 
        new GameRepository(dbConnector),
        fabric
    );

    game.world.getSystemManager().removeSystem('WorldLogger');
    game.world.getSystemManager().putSystem('OutputSystem',  
        new OutputSystem(true, (gameResponse) => outputData = gameResponse)
    );

    await game.start();
}

describe(`grow some vegetables to 'sprout' then die,
          grow tomato to 'child' then die and explode 'child' potato`, () => {
    beforeAll(beforeEachTestScenario);

    describe.each([
        {
            events: [], 
            elapsedMillis: 100000, 
            updateNumber: 1,
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
            events: [{tool: 'seeds', cell: '0-0'}, {tool: 'seeds', cell: '0-1'}, {tool: 'seeds', cell: '1-0'}, {tool: 'seeds', cell: '3-2'}], 
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
            events: [{tool: 'seeds', cell: '1-1'}, {tool: 'seeds', cell: '2-2'}], 
            elapsedMillis: 100, 
            updateNumber: 10,
            randomValue: 0.7, 
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
            events: [{tool: 'bailer', cell: '0-0'}, {tool: 'bailer', cell: '1-0'}, {tool: 'bailer', cell: '0-1'}, {tool: 'bailer', cell: '1-1'}], 
            elapsedMillis: 100, 
            updateNumber: 30,
            randomValue: 0.3, 
            expectedMoney: 182, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, false, vegetableDto('potato', 1)),
                gardenBedCellDto(1, 0, false, vegetableDto('potato', 1)),
                gardenBedCellDto(2, 0, false, null),
                gardenBedCellDto(3, 0, false, null),
                gardenBedCellDto(0, 1, false, vegetableDto('potato', 1)),
                gardenBedCellDto(1, 1, false, vegetableDto('tomato', 1)),
                gardenBedCellDto(2, 1, false, null),
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
            expectedMoney: 182, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, false, vegetableDto('potato', 1, 'THIRST', 'HUNGER')),
                gardenBedCellDto(1, 0, false, vegetableDto('potato', 1, 'THIRST', 'HUNGER')),
                gardenBedCellDto(2, 0, false, null),
                gardenBedCellDto(3, 0, false, null),
                gardenBedCellDto(0, 1, false, vegetableDto('potato', 1, 'THIRST', 'HUNGER')),
                gardenBedCellDto(1, 1, false, vegetableDto('tomato', 1, 'THIRST', 'HUNGER')),
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
                {tool: 'bailer', cell: '0-0'}, {tool: 'bailer', cell: '1-0'}, {tool: 'bailer', cell: '0-1'}, {tool: 'bailer', cell: '1-1'},
                {tool: 'fertilizer', cell: '0-0'}, {tool: 'fertilizer', cell: '1-0'}, {tool: 'fertilizer', cell: '0-1'}, {tool: 'fertilizer', cell: '1-1'}
            ], 
            elapsedMillis: 100, 
            updateNumber: 10,
            randomValue: 0.2, 
            expectedMoney: 174, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, false, vegetableDto('potato', 1)),
                gardenBedCellDto(1, 0, false, vegetableDto('potato', 1)),
                gardenBedCellDto(2, 0, false, null),
                gardenBedCellDto(3, 0, false, null),
                gardenBedCellDto(0, 1, false, vegetableDto('potato', 1)),
                gardenBedCellDto(1, 1, false, vegetableDto('tomato', 1)),
                gardenBedCellDto(2, 1, false, null),
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
            expectedMoney: 174, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, false, vegetableDto('potato', 1, 'SICKNESS')),
                gardenBedCellDto(1, 0, false, vegetableDto('potato', 1, 'SICKNESS')),
                gardenBedCellDto(2, 0, false, null),
                gardenBedCellDto(3, 0, false, null),
                gardenBedCellDto(0, 1, false, vegetableDto('potato', 1, 'SICKNESS')),
                gardenBedCellDto(1, 1, false, vegetableDto('tomato', 1, 'SICKNESS')),
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
                {tool: 'sprayer', cell: '0-0'}, {tool: 'sprayer', cell: '1-0'}, {tool: 'sprayer', cell: '0-1'}, {tool: 'sprayer', cell: '1-1'}
            ], 
            elapsedMillis: 100, 
            updateNumber: 10,
            randomValue: 0.3, 
            expectedMoney: 166, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, false, vegetableDto('potato', 1, 'THIRST', 'HUNGER')),
                gardenBedCellDto(1, 0, false, vegetableDto('potato', 1, 'THIRST', 'HUNGER')),
                gardenBedCellDto(2, 0, false, null),
                gardenBedCellDto(3, 0, false, null),
                gardenBedCellDto(0, 1, false, vegetableDto('potato', 1, 'THIRST', 'HUNGER')),
                gardenBedCellDto(1, 1, false, vegetableDto('tomato', 1, 'THIRST', 'HUNGER')),
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
                {tool: 'bailer', cell: '0-1'}, {tool: 'bailer', cell: '1-1'},
                {tool: 'fertilizer', cell: '0-1'}, {tool: 'fertilizer', cell: '1-1'}
            ],
            elapsedMillis: 100, 
            updateNumber: 10,
            randomValue: 0.3, 
            expectedMoney: 162, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, false, vegetableDto('potato', 1, 'THIRST', 'HUNGER')),
                gardenBedCellDto(1, 0, false, vegetableDto('potato', 1, 'THIRST', 'HUNGER')),
                gardenBedCellDto(2, 0, false, null),
                gardenBedCellDto(3, 0, false, null),
                gardenBedCellDto(0, 1, false, vegetableDto('potato', 1)),
                gardenBedCellDto(1, 1, false, vegetableDto('tomato', 1)),
                gardenBedCellDto(2, 1, false, null),
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
            expectedMoney: 162, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, false, vegetableDto('potato', 5)),
                gardenBedCellDto(1, 0, false, vegetableDto('potato', 5)),
                gardenBedCellDto(2, 0, false, null),
                gardenBedCellDto(3, 0, false, null),
                gardenBedCellDto(0, 1, false, vegetableDto('potato', 1)),
                gardenBedCellDto(1, 1, false, vegetableDto('tomato', 1)),
                gardenBedCellDto(2, 1, false, null),
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
            expectedMoney: 162, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, false, vegetableDto('potato', 5)),
                gardenBedCellDto(1, 0, false, vegetableDto('potato', 5)),
                gardenBedCellDto(2, 0, false, null),
                gardenBedCellDto(3, 0, false, null),
                gardenBedCellDto(0, 1, false, vegetableDto('potato', 2, 'THIRST', 'HUNGER')),
                gardenBedCellDto(1, 1, false, vegetableDto('tomato', 2, 'THIRST', 'HUNGER')),
                gardenBedCellDto(2, 1, false, null),
                gardenBedCellDto(3, 1, false, null),
                gardenBedCellDto(0, 2, false, null),
                gardenBedCellDto(1, 2, false, null),
                gardenBedCellDto(2, 2, false, vegetableDto('tomato', 0)),
                gardenBedCellDto(3, 2, false, vegetableDto('potato', 0))
            ]
        },
        {
            events: [{tool: 'bailer', cell: '0-1'}, {tool: 'fertilizer', cell: '0-1'}],
            elapsedMillis: 100, 
            updateNumber: 180,
            randomValue: 0.3, 
            expectedMoney: 160, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, false, vegetableDto('potato', 5)),
                gardenBedCellDto(1, 0, false, vegetableDto('potato', 5)),
                gardenBedCellDto(2, 0, false, null),
                gardenBedCellDto(3, 0, false, null),
                gardenBedCellDto(0, 1, false, vegetableDto('potato', 2)),
                gardenBedCellDto(1, 1, false, vegetableDto('tomato', 2, 'THIRST', 'HUNGER')),
                gardenBedCellDto(2, 1, false, null),
                gardenBedCellDto(3, 1, false, null),
                gardenBedCellDto(0, 2, false, null),
                gardenBedCellDto(1, 2, false, null),
                gardenBedCellDto(2, 2, false, vegetableDto('tomato', 0)),
                gardenBedCellDto(3, 2, false, vegetableDto('potato', 0))
            ]
        },
        {
            events: [{tool: 'bailer', cell: '0-1'}, {tool: 'fertilizer', cell: '0-1'}],
            elapsedMillis: 100, 
            updateNumber: 10,
            randomValue: 0.3, 
            expectedMoney: 158, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, false, null),
                gardenBedCellDto(1, 0, false, null),
                gardenBedCellDto(2, 0, false, null),
                gardenBedCellDto(3, 0, false, null),
                gardenBedCellDto(0, 1, true, vegetableDto('potato', 7)),
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
    beforeAll(beforeEachTestScenario);

    describe.each([
        {
            events: [
                {tool: 'seeds', cell: '0-0'}, {tool: 'seeds', cell: '0-1'}, {tool: 'seeds', cell: '1-0'}, {tool: 'seeds', cell: '1-1'},
                {tool: 'bailer', cell: '0-0'}, {tool: 'bailer', cell: '0-1'}, {tool: 'bailer', cell: '1-0'}, {tool: 'bailer', cell: '1-1'}
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
            events: [], 
            elapsedMillis: 200, 
            updateNumber: 10,
            randomValue: 0.3, 
            expectedMoney: 188, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, false, vegetableDto('potato', 1)),
                gardenBedCellDto(1, 0, false, vegetableDto('potato', 1)),
                gardenBedCellDto(2, 0, false, null),
                gardenBedCellDto(3, 0, false, null),
                gardenBedCellDto(0, 1, false, vegetableDto('potato', 1)),
                gardenBedCellDto(1, 1, false, vegetableDto('potato', 1)),
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
            elapsedMillis: 5000, 
            updateNumber: 10,
            randomValue: 0.3, 
            expectedMoney: 188, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, false, vegetableDto('potato', 1, 'THIRST', 'HUNGER')),
                gardenBedCellDto(1, 0, false, vegetableDto('potato', 1, 'THIRST', 'HUNGER')),
                gardenBedCellDto(2, 0, false, null),
                gardenBedCellDto(3, 0, false, null),
                gardenBedCellDto(0, 1, false, vegetableDto('potato', 1, 'THIRST', 'HUNGER')),
                gardenBedCellDto(1, 1, false, vegetableDto('potato', 1, 'THIRST', 'HUNGER')),
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
                {tool: 'bailer', cell: '0-0'}, {tool: 'bailer', cell: '1-0'}, {tool: 'bailer', cell: '0-1'}, {tool: 'bailer', cell: '1-1'},
                {tool: 'fertilizer', cell: '0-0'}, {tool: 'fertilizer', cell: '1-0'}, {tool: 'fertilizer', cell: '0-1'}, {tool: 'fertilizer', cell: '1-1'}
            ], 
            elapsedMillis: 5000, 
            updateNumber: 10,
            randomValue: 0.3, 
            expectedMoney: 180, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, false, vegetableDto('potato', 2, 'THIRST', 'HUNGER')),
                gardenBedCellDto(1, 0, false, vegetableDto('potato', 2, 'THIRST', 'HUNGER')),
                gardenBedCellDto(2, 0, false, null),
                gardenBedCellDto(3, 0, false, null),
                gardenBedCellDto(0, 1, false, vegetableDto('potato', 2, 'THIRST', 'HUNGER')),
                gardenBedCellDto(1, 1, false, vegetableDto('potato', 2, 'THIRST', 'HUNGER')),
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
                {tool: 'bailer', cell: '0-0'}, {tool: 'bailer', cell: '1-0'}, {tool: 'bailer', cell: '0-1'}, {tool: 'bailer', cell: '1-1'},
                {tool: 'fertilizer', cell: '0-0'}, {tool: 'fertilizer', cell: '1-0'}, {tool: 'fertilizer', cell: '0-1'}, {tool: 'fertilizer', cell: '1-1'}
            ], 
            elapsedMillis: 5000, 
            updateNumber: 10,
            randomValue: 0.3, 
            expectedMoney: 172, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, false, vegetableDto('potato', 2, 'THIRST', 'HUNGER')),
                gardenBedCellDto(1, 0, false, vegetableDto('potato', 2, 'THIRST', 'HUNGER')),
                gardenBedCellDto(2, 0, false, null),
                gardenBedCellDto(3, 0, false, null),
                gardenBedCellDto(0, 1, false, vegetableDto('potato', 2, 'THIRST', 'HUNGER')),
                gardenBedCellDto(1, 1, false, vegetableDto('potato', 2, 'THIRST', 'HUNGER')),
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
                {tool: 'bailer', cell: '0-0'}, {tool: 'bailer', cell: '1-0'}, {tool: 'bailer', cell: '0-1'}, {tool: 'bailer', cell: '1-1'},
                {tool: 'fertilizer', cell: '0-0'}, {tool: 'fertilizer', cell: '1-0'}, {tool: 'fertilizer', cell: '0-1'}, {tool: 'fertilizer', cell: '1-1'}
            ], 
            elapsedMillis: 5000, 
            updateNumber: 10,
            randomValue: 0.3, 
            expectedMoney: 164, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, false, vegetableDto('potato', 3, 'THIRST', 'HUNGER')),
                gardenBedCellDto(1, 0, false, vegetableDto('potato', 3, 'THIRST', 'HUNGER')),
                gardenBedCellDto(2, 0, false, null),
                gardenBedCellDto(3, 0, false, null),
                gardenBedCellDto(0, 1, false, vegetableDto('potato', 3, 'THIRST', 'HUNGER')),
                gardenBedCellDto(1, 1, false, vegetableDto('potato', 3, 'THIRST', 'HUNGER')),
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
                {tool: 'bailer', cell: '0-0'}, {tool: 'bailer', cell: '1-0'}, {tool: 'bailer', cell: '0-1'}, {tool: 'bailer', cell: '1-1'},
                {tool: 'fertilizer', cell: '0-0'}, {tool: 'fertilizer', cell: '1-0'}, {tool: 'fertilizer', cell: '0-1'}, {tool: 'fertilizer', cell: '1-1'}
            ], 
            elapsedMillis: 5000, 
            updateNumber: 10,
            randomValue: 0.3, 
            expectedMoney: 156, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, false, vegetableDto('potato', 3, 'THIRST', 'HUNGER')),
                gardenBedCellDto(1, 0, false, vegetableDto('potato', 3, 'THIRST', 'HUNGER')),
                gardenBedCellDto(2, 0, false, null),
                gardenBedCellDto(3, 0, false, null),
                gardenBedCellDto(0, 1, false, vegetableDto('potato', 3, 'THIRST', 'HUNGER')),
                gardenBedCellDto(1, 1, false, vegetableDto('potato', 3, 'THIRST', 'HUNGER')),
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
                {tool: 'bailer', cell: '0-0'}, {tool: 'bailer', cell: '1-0'}, {tool: 'bailer', cell: '0-1'}, {tool: 'bailer', cell: '1-1'},
                {tool: 'fertilizer', cell: '0-0'}, {tool: 'fertilizer', cell: '1-0'}, {tool: 'fertilizer', cell: '0-1'}, {tool: 'fertilizer', cell: '1-1'}
            ], 
            elapsedMillis: 5000, 
            updateNumber: 10,
            randomValue: 0.3, 
            expectedMoney: 148, 
            expectedGardenCells: [
                gardenBedCellDto(0, 0, false, vegetableDto('potato', 4, 'THIRST', 'HUNGER')),
                gardenBedCellDto(1, 0, false, vegetableDto('potato', 4, 'THIRST', 'HUNGER')),
                gardenBedCellDto(2, 0, false, null),
                gardenBedCellDto(3, 0, false, null),
                gardenBedCellDto(0, 1, false, vegetableDto('potato', 4, 'THIRST', 'HUNGER')),
                gardenBedCellDto(1, 1, false, vegetableDto('potato', 4, 'THIRST', 'HUNGER')),
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
                {tool: 'shovel', cell: '0-0'}, {tool: 'shovel', cell: '1-0'}, {tool: 'shovel', cell: '0-1'}, {tool: 'shovel', cell: '1-1'}
            ], 
            elapsedMillis: 100, 
            updateNumber: 1,
            randomValue: 0.3, 
            expectedMoney: 148 + 66 * 4, 
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
