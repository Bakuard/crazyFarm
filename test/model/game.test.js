const {DBConnector} = require('../../src/code/dal/dataBaseConnector.js');
const {Game} = require('../../src/code/model/logic/game.js');
const {settings} = require('../resources/settings.js');
const {GameRepository} = require('../../src/code/dal/repositories.js');
const { VegetableState } = require('../../src/code/model/logic/vegetableState.js');

let game = null;
let outputData = null;
let randomGeneratorReturnedValue = null;
let timeUtil = null;

function createTimeUtil() {
    return {
        elapsedMillis: 0,
        callbacks: [],
        infiniteLoop(callback, iterationDurationInMillis) {
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

describe(`grow vegetable to 'adult' state`, () => {
    beforeAll(async () => {
        const dbConnector = new DBConnector();
        await clearDB(dbConnector);

        timeUtil = createTimeUtil();
        game = new Game(
            (GameResponse) => outputData = GameResponse, 
            {_id: '123'}, 
            () => randomGeneratorReturnedValue,
            new GameRepository(dbConnector),
            timeUtil,
            settings
        );
    
        game.world.getSystemManager().removeSystem('WorldLogger');

        await game.start();
    });

    describe.each([
        {eventNames: [], elapsedMillis: 100000, randomValue: 0.3, expectedMoney: 20, 
         expectedVegetable: gardenBedCellDto(0, 0, false, null)},
    
        {eventNames: ['seeds'], elapsedMillis: 100000, randomValue: 0.3, expectedMoney: 17, 
         expectedVegetable: gardenBedCellDto(0, 0, false, vegetableDto('potato', 0))},
    
        {eventNames: ['bailer'], elapsedMillis: 2000, randomValue: 0.3, expectedMoney: 17, 
         expectedVegetable: gardenBedCellDto(0, 0, false, vegetableDto('potato', 0))},
    
        {eventNames: [], elapsedMillis: 1000, randomValue: 0.3, expectedMoney: 17, 
         expectedVegetable: gardenBedCellDto(0, 0, false, vegetableDto('potato', 1))},
        
        {eventNames: [], elapsedMillis: 40000, randomValue: 0.3, expectedMoney: 17, 
         expectedVegetable: gardenBedCellDto(0, 0, false, vegetableDto('potato', 2, 'THIRST', 'HUNGER'))},
    
        {eventNames: ['bailer', 'fertilizer'], elapsedMillis: 1000, randomValue: 0.3, expectedMoney: 15, 
         expectedVegetable: gardenBedCellDto(0, 0, false, vegetableDto('potato', 2))},
        
        {eventNames: [], elapsedMillis: 39000, randomValue: 0.3, expectedMoney: 15, 
         expectedVegetable: gardenBedCellDto(0, 0, false, vegetableDto('potato', 3, 'THIRST', 'HUNGER'))},
    
        {eventNames: ['bailer', 'fertilizer'], elapsedMillis: 1000, randomValue: 0.3, expectedMoney: 13, 
         expectedVegetable: gardenBedCellDto(0, 0, false, vegetableDto('potato', 3))},
    
        {eventNames: [], elapsedMillis: 39000, randomValue: 0.3, expectedMoney: 13, 
         expectedVegetable: gardenBedCellDto(0, 0, false, vegetableDto('potato', 4, 'THIRST', 'HUNGER'))}
    
    ])(`step $#`, ({eventNames, elapsedMillis, randomValue, expectedMoney, expectedVegetable}) => {
        test(`eventNames: [${eventNames}], 
              elapsedMillis: ${elapsedMillis},
              randomValue: ${randomValue}
              => expectedMoney: ${expectedMoney},
                 expectedVegetable: ${JSON.stringify(expectedVegetable)}`, 
        () => {
            randomGeneratorReturnedValue = randomValue;
            eventNames.forEach(eventName => game.execute({tool: eventName, cell: '0-0'}));
            timeUtil.advanceTime(elapsedMillis);
    
            expect(outputData.containers[0]).toEqual(expectedVegetable);
            expect(outputData.player.cash).toEqual(expectedMoney);
        });
    });
});
