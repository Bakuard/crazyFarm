const {ImmunitySystem, Immunity} = require('../../../src/code/model/logic/immunity.js');
const {EntityComponentManager} = require('../../../src/code/model/gameEngine/entityComponentManager.js');
const {ComponentIdGenerator} = require('../../../src/code/model/gameEngine/componentIdGenerator.js');
const {EntityManager} = require('../../../src/code/model/gameEngine/entityManager.js');
const {EventManager} = require('../../../src/code/model/gameEngine/eventManager.js');
const {Wallet} = require('../../../src/code/model/logic/wallet.js');
const {VegetableState, lifeCycleStates, StateDetail} = require('../../../src/code/model/logic/vegetableState.js');
const {GardenBedCellLink} = require('../../../src/code/model/logic/gardenBedCellLink.js');
const {Grid} = require('../../../src/code/model/logic/store/grid.js');

let manager = null;
let eventManager = null;
let wallet = null;
let worldMock = null;
let grid = null;
function beforeEachTest() {
    eventManager = new EventManager();
    manager = new EntityComponentManager(new EntityManager(), new ComponentIdGenerator());
    grid = new Grid(4, 3);
    wallet = manager.createEntity().put(new Wallet(10, 2, 2, 3));
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

describe.each([
    {max: 10, declineRatePerSeconds: 1, updateNumber: 1, probability: 0.5, random: 0.5, expectedImmunity: 9, isDeath: false},
    {max: 10, declineRatePerSeconds: 2, updateNumber: 1, probability: 0.5, random: 0.5, expectedImmunity: 9.5, isDeath: false},
    {max: 10, declineRatePerSeconds: 4, updateNumber: 1, probability: 0.5, random: 0.5, expectedImmunity: 9.75, isDeath: false},
    {max: 10, declineRatePerSeconds: 1, updateNumber: 100, probability: 0.5, random: 0.5, expectedImmunity: 0, isDeath: true},
    {max: 10, declineRatePerSeconds: 2, updateNumber: 100, probability: 0.5, random: 0.5, expectedImmunity: 0, isDeath: true},
    {max: 10, declineRatePerSeconds: 4, updateNumber: 100, probability: 0.5, random: 0.5, expectedImmunity: 0, isDeath: true},
    {max: 10, declineRatePerSeconds: 1, updateNumber: 100, probability: 0.5, random: 0.6, expectedImmunity: 10, isDeath: false},
    {max: 10, declineRatePerSeconds: 2, updateNumber: 100, probability: 0.5, random: 0.6, expectedImmunity: 10, isDeath: false},
    {max: 10, declineRatePerSeconds: 4, updateNumber: 100, probability: 0.5, random: 0.6, expectedImmunity: 10, isDeath: false}
])(`update(groupName, world):`,
    ({max, declineRatePerSeconds, updateNumber, probability, random, expectedImmunity, isDeath}) => {
        beforeEach(beforeEachTest);

        test(`max ${max}, 
              declineRatePerSeconds ${declineRatePerSeconds}, 
              updateNumber ${updateNumber},
              probability ${probability},
              random ${random}
              => expectedImmunity ${expectedImmunity}, is death ${isDeath}`,
        () => {
            let vegetable = createVegetable(0, 0, max, max, false, declineRatePerSeconds, probability);
            grid.write(0, 0, vegetable);
            manager.bindEntity(vegetable); 

            let system = new ImmunitySystem(manager, () => random);
            for(let i = 0; i < updateNumber; i++) system.update('update', worldMock);

            expect(vegetable.get(Immunity).current).toBe(expectedImmunity);
            expect(vegetable.get(VegetableState).history.at(-1) == lifeCycleStates.death).toBe(isDeath);
        });
    }
);

describe.each([
    {
        vegetables: [
            {cellX: 0, cellY: 0, maxImmunity: 10, currentImmunity: 5, isSick: false, declineImmunityRatePerSeconds: 1, probability: 0.5},
            {cellX: 0, cellY: 1, maxImmunity: 10, currentImmunity: 10, isSick: false, declineImmunityRatePerSeconds: 1, probability: 0.5},
            {cellX: 1, cellY: 0, maxImmunity: 10, currentImmunity: 10, isSick: false, declineImmunityRatePerSeconds: 1, probability: 0.5},
            {cellX: 1, cellY: 1, maxImmunity: 10, currentImmunity: 10, isSick: false, declineImmunityRatePerSeconds: 1, probability: 0.5}
        ],
        events: [
            {tool: 'sprayer', cellX: 0, cellY: 0},
            {tool: 'sprayer', cellX: 1, cellY: 1}
        ],
        money: 10, 
        sprayerPrice: 3, 
        expectedMoney: 4, 
        random: 0.4, 
        expectedImmunity: [
            {cellX: 0, cellY: 0, expectedImmunity: 10},
            {cellX: 0, cellY: 1, expectedImmunity: 9},
            {cellX: 1, cellY: 0, expectedImmunity: 9},
            {cellX: 1, cellY: 1, expectedImmunity: 10}
        ]
    },
    {
        vegetables: [
            {cellX: 0, cellY: 0, maxImmunity: 10, currentImmunity: 5, isSick: false, declineImmunityRatePerSeconds: 1, probability: 0.5},
            {cellX: 0, cellY: 1, maxImmunity: 10, currentImmunity: 10, isSick: false, declineImmunityRatePerSeconds: 1, probability: 0.5},
            {cellX: 1, cellY: 0, maxImmunity: 10, currentImmunity: 10, isSick: false, declineImmunityRatePerSeconds: 1, probability: 0.5},
            {cellX: 1, cellY: 1, maxImmunity: 10, currentImmunity: 10, isSick: false, declineImmunityRatePerSeconds: 1, probability: 0.5}
        ],
        events: [
            {tool: 'sprayer', cellX: 0, cellY: 0},
            {tool: 'sprayer', cellX: 1, cellY: 1}
        ],
        money: 2, 
        sprayerPrice: 3, 
        expectedMoney: 2, 
        random: 0.4, 
        expectedImmunity: [
            {cellX: 0, cellY: 0, expectedImmunity: 4},
            {cellX: 0, cellY: 1, expectedImmunity: 9},
            {cellX: 1, cellY: 0, expectedImmunity: 9},
            {cellX: 1, cellY: 1, expectedImmunity: 9}
        ]
    },
    {
        vegetables: [
            {cellX: 0, cellY: 0, maxImmunity: 10, currentImmunity: 5, isSick: false, declineImmunityRatePerSeconds: 1, probability: 0.5},
            {cellX: 0, cellY: 1, maxImmunity: 10, currentImmunity: 10, isSick: false, declineImmunityRatePerSeconds: 1, probability: 0.5},
            {cellX: 1, cellY: 0, maxImmunity: 10, currentImmunity: 10, isSick: false, declineImmunityRatePerSeconds: 1, probability: 0.5},
            {cellX: 1, cellY: 1, maxImmunity: 10, currentImmunity: 10, isSick: false, declineImmunityRatePerSeconds: 1, probability: 0.5}
        ],
        events: [],
        money: 10, 
        sprayerPrice: 3, 
        expectedMoney: 10, 
        random: 0.6, 
        expectedImmunity: [
            {cellX: 0, cellY: 0, expectedImmunity: 5},
            {cellX: 0, cellY: 1, expectedImmunity: 10},
            {cellX: 1, cellY: 0, expectedImmunity: 10},
            {cellX: 1, cellY: 1, expectedImmunity: 10}
        ]
    }
])(`update(groupName, world):`,
    ({vegetables, events, money, sprayerPrice, expectedMoney, random, expectedImmunity}) => {
        beforeEach(beforeEachTest);

        test(`vegetables ${vegetables.map(JSON.stringify)}, 
            events ${events.map(JSON.stringify)}, 
            money ${money}, 
            sprayerPrice: ${sprayerPrice},
            random ${random}
            => expectedMoney ${expectedMoney}, 
               expectedImmunity ${expectedImmunity.map(JSON.stringify)}`,
        () => {
            vegetables.forEach(param => {
                let vegetable = createVegetable(
                    param.cellX, 
                    param.cellX, 
                    param.maxImmunity, 
                    param.currentImmunity, 
                    param.isSick,
                    param.declineImmunityRatePerSeconds,
                    param.probability
                );
                grid.write(param.cellX, param.cellY, vegetable);
                manager.bindEntity(vegetable); 
            });
            events.forEach(event => eventManager.writeEvent(event.tool, event));
            wallet.get(Wallet).sum = money;
            wallet.get(Wallet).sprayerPrice = sprayerPrice;

            let system = new ImmunitySystem(manager, () => random);
            system.update('update', worldMock);

            expect(wallet.get(Wallet).sum).toBe(expectedMoney);
            expectedImmunity.forEach(param => {
                let currentImmunity = grid.get(param.cellX, param.cellY).get(Immunity).current;
                expect(currentImmunity).toBe(param.expectedImmunity);
            });
        });
    }
);

function createVegetable(cellX, cellY, max, current, isSick, declineRatePerSeconds, probability) {
    return manager.createEntity().put(
        vegetableState(),
        new Immunity(max, current, isSick, declineRatePerSeconds, probability),
        new GardenBedCellLink(cellX, cellY)
    );
}

function vegetableState() {
    return VegetableState.of(
        StateDetail.of(10, lifeCycleStates.seed),
        StateDetail.of(10, lifeCycleStates.sprout),
        StateDetail.of(10, lifeCycleStates.child),
        StateDetail.of(10, lifeCycleStates.youth)
    );
}