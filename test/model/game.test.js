const {Game} = require('../../src/code/model/logic/game.js');
const {settings} = require('../resources/settings.js');
const {GameRepository} = require('../../src/code/dal/repositories.js');
const {mongo} = require('../../src/code/dal/dataBaseConnector.js');

let game = null;
let systemManager = null;
let outputData = null;
let randomGeneratorRetrunedValue = null;

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
    beforeAll(() => {
        jest.useFakeTimers();

        game = new Game(
            (GameResponse) => outputData = GameResponse, 
            {_id: 'some user id'}, 
            () => randomGeneratorRetrunedValue,
            new GameRepository(),
            settings
        );
    
        systemManager = game.world.getSystemManager();
        systemManager.removeSystem('WorldLogger');
        systemManager.updateGroup = jest.fn(systemManager.updateGroup); 
    
        game.start();
    });

    describe.each([
        {eventNames: [], elapsedMillis: 100000, randomValue: 0.3, expectedMoney: 20, 
         expectedVegetable: gardenBedCellDto(0, 0, false, null)},
    
        {eventNames: ['seeds'], elapsedMillis: 1000, randomValue: 0.3, expectedMoney: 17, 
         expectedVegetable: gardenBedCellDto(0, 0, false, vegetableDto('potato', 0))},
    
        {eventNames: ['bailer'], elapsedMillis: 3000, randomValue: 0.3, expectedMoney: 17, 
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
            randomGeneratorRetrunedValue = randomValue;
            eventNames.forEach(eventName => game.execute({tool: eventName, cell: '0-0'}));
            jest.advanceTimersByTime(elapsedMillis);
    
            expect(outputData.containers[0]).toEqual(expectedVegetable);
            expect(outputData.player.cash).toEqual(expectedMoney);
        });
    });
});
