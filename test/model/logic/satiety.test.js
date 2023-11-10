const {SatietySystem, Satiety} = require('../../../src/code/model/logic/satiety.js');
const {EntityComponentManager} = require('../../../src/code/model/gameEngine/entityComponentManager.js');
const {ComponentIdGenerator} = require('../../../src/code/model/gameEngine/componentIdGenerator.js');
const {EntityManager} = require('../../../src/code/model/gameEngine/entityManager.js');
const {EventManager} = require('../../../src/code/model/gameEngine/eventManager.js');
const {Wallet} = require('../../../src/code/model/logic/wallet.js');
const {GardenBedCellLink} = require('../../../src/code/model/logic/gardenBedCellLink.js');
const {Grid} = require('../../../src/code/model/logic/store/grid.js');
const {SystemHandler} = require('../../../src/code/model/gameEngine/systemManager.js');

let manager = null;
let eventManager = null;
let wallet = null;
let worldMock = null;
let grid = null;
function beforeEachTest() {
    eventManager = new EventManager();
    manager = new EntityComponentManager(new EntityManager(), new ComponentIdGenerator());

    wallet = manager.createEntity().put(new Wallet(10, 2, 2, 3));
    grid = new Grid(4, 3);
    manager.putSingletonEntity('wallet', wallet);
    manager.putSingletonEntity('grid', grid);

    worldMock = {
        getGameLoop: () => {
            return {
                getElapsedTime: () => 1000
            }
        },
        getEntityComponentManager: () => manager,
        getEventManager: () => eventManager
    };
};

function createVegetable(cellX, cellY, maxSatiety, currentSatiety, declineSatietyRatePerSeconds) {
    return manager.createEntity().put(
        new Satiety(maxSatiety, currentSatiety, declineSatietyRatePerSeconds, 1),
        new GardenBedCellLink(cellX, cellY)
    );
}

function systemHandler(system) {
    return new SystemHandler('SatietySystem', 'update', system, 0, 1);
}

describe.each([
    {max: 10, current: 10, declineRatePerSeconds: 1, updateNumber: 1, expectedSatiety: 9, isDeath: false},
    {max: 10, current: 10, declineRatePerSeconds: 2, updateNumber: 1, expectedSatiety: 9.5, isDeath: false},
    {max: 10, current: 10, declineRatePerSeconds: 4, updateNumber: 1, expectedSatiety: 9.75, isDeath: false},
    {max: 10, current: 10, declineRatePerSeconds: 1, updateNumber: 100, expectedSatiety: 0, isDeath: true},
    {max: 10, current: 10, declineRatePerSeconds: 2, updateNumber: 100, expectedSatiety: 0, isDeath: true},
    {max: 10, current: 10, declineRatePerSeconds: 4, updateNumber: 100, expectedSatiety: 0, isDeath: true},
])(`update(groupName, world):`,
    ({max, current, declineRatePerSeconds, updateNumber, expectedSatiety, isDeath}) => {
        beforeEach(beforeEachTest);

        test(`max ${max}, 
              current ${current}, 
              declineRatePerSeconds ${declineRatePerSeconds}, 
              updateNumber ${updateNumber} 
              => expectedSatiety ${expectedSatiety}, is death ${isDeath}`,
        () => {
            let vegetable = createVegetable(0, 0, max, current, declineRatePerSeconds);
            grid.write(0, 0, vegetable);
            manager.bindEntity(vegetable); 

            let system = new SatietySystem(manager);
            for(let i = 0; i < updateNumber; i++) system.update(systemHandler(system), worldMock);

            expect(vegetable.get(Satiety).current).toBe(expectedSatiety);
            expect(vegetable.hasTags('dead')).toBe(isDeath);
        });
    }
);

describe.each([
    {
        vegetables: [
            {cellX: 0, cellY: 0, maxSatiety: 10, currentSatiety: 5, declineSatietyRatePerSeconds: 1},
            {cellX: 0, cellY: 1, maxSatiety: 10, currentSatiety: 10, declineSatietyRatePerSeconds: 1},
            {cellX: 1, cellY: 0, maxSatiety: 10, currentSatiety: 10, declineSatietyRatePerSeconds: 1},
            {cellX: 1, cellY: 1, maxSatiety: 10, currentSatiety: 10, declineSatietyRatePerSeconds: 1}
        ],
        events: [
            {tool: 'fertilizer', cellX: 0, cellY: 0},
            {tool: 'fertilizer', cellX: 1, cellY: 1}
        ],
        money: 10, 
        fertilizerPrice: 2, 
        expectedMoney: 6, 
        expectedSatiety: [
            {cellX: 0, cellY: 0, expectedSatiety: 10},
            {cellX: 0, cellY: 1, expectedSatiety: 9},
            {cellX: 1, cellY: 0, expectedSatiety: 9},
            {cellX: 1, cellY: 1, expectedSatiety: 10}
        ]
    },
    {
        vegetables: [
            {cellX: 0, cellY: 0, maxSatiety: 10, currentSatiety: 5, declineSatietyRatePerSeconds: 1},
            {cellX: 0, cellY: 1, maxSatiety: 10, currentSatiety: 10, declineSatietyRatePerSeconds: 1},
            {cellX: 1, cellY: 0, maxSatiety: 10, currentSatiety: 10, declineSatietyRatePerSeconds: 1},
            {cellX: 1, cellY: 1, maxSatiety: 10, currentSatiety: 10, declineSatietyRatePerSeconds: 1}
        ],
        events: [
            {tool: 'fertilizer', cellX: 0, cellY: 0}
        ],
        money: 1, 
        fertilizerPrice: 2, 
        expectedMoney: 1, 
        expectedSatiety: [
            {cellX: 0, cellY: 0, expectedSatiety: 4},
            {cellX: 0, cellY: 1, expectedSatiety: 9},
            {cellX: 1, cellY: 0, expectedSatiety: 9},
            {cellX: 1, cellY: 1, expectedSatiety: 9}
        ]
    }
])(`update(groupName, world):`,
    ({vegetables, events, money, fertilizerPrice, expectedMoney, expectedSatiety}) => {
        beforeEach(beforeEachTest);

        test(`vegetables ${vegetables.map(JSON.stringify)}, 
            events ${events.map(JSON.stringify)}, 
            money ${money}, 
            fertilizerPrice: ${fertilizerPrice}
            => expectedMoney ${expectedMoney}, 
               expectedSatiety ${expectedSatiety.map(JSON.stringify)}`,
        () => {
            vegetables.forEach(param => {
                let vegetable = createVegetable(
                    param.cellX, 
                    param.cellX, 
                    param.maxSatiety, 
                    param.currentSatiety, 
                    param.declineSatietyRatePerSeconds
                );
                grid.write(param.cellX, param.cellY, vegetable);
                manager.bindEntity(vegetable); 
            });
            events.forEach(event => eventManager.writeEvent(event.tool, event));
            wallet.get(Wallet).sum = money;
            wallet.get(Wallet).fertilizerPrice = fertilizerPrice;

            let system = new SatietySystem(manager);
            system.update(systemHandler(system), worldMock);

            expect(wallet.get(Wallet).sum).toBe(expectedMoney);
            expectedSatiety.forEach(param => {
                let currentSatiety = grid.get(param.cellX, param.cellY).get(Satiety).current;
                expect(currentSatiety).toBe(param.expectedSatiety);
            });
        });
    }
);
