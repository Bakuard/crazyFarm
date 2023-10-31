const {Thirst} = require('../../../src/code/model/logic/thirst.js');
const {ThirstSystem} = require('../../../src/code/model/logic/thirst.js');
const {EntityComponentManager} = require('../../../src/code/model/gameEngine/entityComponentManager.js');
const {ComponentIdGenerator} = require('../../../src/code/model/gameEngine/componentIdGenerator.js');
const {EntityManager} = require('../../../src/code/model/gameEngine/entityManager.js');
const {EventManager} = require('../../../src/code/model/gameEngine/eventManager.js');
const {VegetableState, lifeCycleStates, StateDetail} = require('../../../src/code/model/logic/vegetableState.js');
const {GardenBedCellLink} = require('../../../src/code/model/logic/gardenBedCellLink.js');
const {Grid} = require('../../../src/code/model/logic/store/grid.js');

let manager = null;
let eventManager = null;
let worldMock = null;
let grid = null;
function beforeEachTest(){
    eventManager = new EventManager();
    manager = new EntityComponentManager(new EntityManager(), new ComponentIdGenerator());
    grid = new Grid(4, 3);
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
    {max: 10, current: 10, declineRatePerSeconds: 1, expected: 9, updateNumber: 1, isDeath: false},
    {max: 10, current: 10, declineRatePerSeconds: 2, expected: 9.5, updateNumber: 1, isDeath: false},
    {max: 10, current: 10, declineRatePerSeconds: 4, expected: 9.75, updateNumber: 1, isDeath: false},
    {max: 10, current: 10, declineRatePerSeconds: 1, expected: 0, updateNumber: 100, isDeath: true},
    {max: 10, current: 10, declineRatePerSeconds: 2, expected: 0, updateNumber: 100, isDeath: true},
    {max: 10, current: 10, declineRatePerSeconds: 4, expected: 0, updateNumber: 100, isDeath: true},
])(`update(groupName, world):`,
    ({max, current, declineRatePerSeconds, expected, updateNumber, isDeath}) => {
        beforeEach(beforeEachTest);

        test(`max ${max}, 
              current ${current}, 
              declineRatePerSeconds ${declineRatePerSeconds}, 
              updateNumber ${updateNumber} 
              => expected ${expected}, is death ${isDeath}`,
        () => {
            let vegetable = createVegetable(0, 0, max, current, declineRatePerSeconds);
            grid.write(0, 0, vegetable);
            manager.bindEntity(vegetable); 

            let system = new ThirstSystem(manager);
            for(let i = 0; i < updateNumber; i++) system.update('update', worldMock);

            expect(vegetable.get(Thirst).current).toBe(expected);
            expect(vegetable.get(VegetableState).history.at(-1) == lifeCycleStates.death).toBe(isDeath);
        });
    }
);

describe.each([
    {
        vegetables: [
            {cellX: 0, cellY: 0, maxThirst: 10, currentThirst: 5, declineThirstRatePerSeconds: 1},
            {cellX: 0, cellY: 1, maxThirst: 10, currentThirst: 10, declineThirstRatePerSeconds: 1},
            {cellX: 1, cellY: 0, maxThirst: 10, currentThirst: 10, declineThirstRatePerSeconds: 1},
            {cellX: 1, cellY: 1, maxThirst: 10, currentThirst: 10, declineThirstRatePerSeconds: 1}
        ],
        events: [
            {tool: 'bailer', cellX: 0, cellY: 0},
            {tool: 'bailer', cellX: 1, cellY: 1}
        ],
        expectedThirst: [
            {cellX: 0, cellY: 0, expectedThirst: 10},
            {cellX: 0, cellY: 1, expectedThirst: 9},
            {cellX: 1, cellY: 0, expectedThirst: 9},
            {cellX: 1, cellY: 1, expectedThirst: 10}
        ]
    },
    {
        vegetables: [
            {cellX: 0, cellY: 0, maxThirst: 10, currentThirst: 10, declineThirstRatePerSeconds: 1},
            {cellX: 0, cellY: 1, maxThirst: 10, currentThirst: 5, declineThirstRatePerSeconds: 1},
            {cellX: 1, cellY: 0, maxThirst: 10, currentThirst: 10, declineThirstRatePerSeconds: 1},
            {cellX: 1, cellY: 1, maxThirst: 10, currentThirst: 10, declineThirstRatePerSeconds: 1}
        ],
        events: [],
        expectedThirst: [
            {cellX: 0, cellY: 0, expectedThirst: 9},
            {cellX: 0, cellY: 1, expectedThirst: 4},
            {cellX: 1, cellY: 0, expectedThirst: 9},
            {cellX: 1, cellY: 1, expectedThirst: 9}
        ]
    }
])(`update(groupName, world):`,
    ({vegetables, events, expectedThirst}) => {
        beforeEach(beforeEachTest);

        test(`vegetables ${vegetables.map(JSON.stringify)}, 
            events ${events.map(JSON.stringify)}
            => expectedThirst ${expectedThirst.map(JSON.stringify)}`,
        () => {
            vegetables.forEach(param => {
                let vegetable = createVegetable(
                    param.cellX, 
                    param.cellX, 
                    param.maxThirst, 
                    param.currentThirst, 
                    param.declineThirstRatePerSeconds
                );
                grid.write(param.cellX, param.cellY, vegetable);
                manager.bindEntity(vegetable); 
            });
            events.forEach(event => eventManager.writeEvent(event.tool, event));

            let system = new ThirstSystem(manager);
            system.update('update', worldMock);

            expectedThirst.forEach(param => {
                let currentThirst = grid.get(param.cellX, param.cellY).get(Thirst).current;
                expect(currentThirst).toBe(param.expectedThirst);
            });
        });
    }
);

function createVegetable(cellX, cellY, maxThirst, currentThirst, declineThirstRatePerSeconds) {
    return manager.createEntity().put(
        vegetableState(),
        new Thirst(maxThirst, currentThirst, declineThirstRatePerSeconds, 1),
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