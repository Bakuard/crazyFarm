const {Thirst} = require('../../../src/code/model/logic/thirst.js');
const {Satiety} = require('../../../src/code/model/logic/satiety.js');
const {Immunity} = require('../../../src/code/model/logic/immunity.js');
const {TomatoDeathSystem, TomatoExplosion} = require('../../../src/code/model/logic/tomatoDeath.js');
const {EntityComponentManager} = require('../../../src/code/model/gameEngine/entityComponentManager.js');
const {ComponentIdGenerator} = require('../../../src/code/model/gameEngine/componentIdGenerator.js');
const {VegetableMeta} = require('../../../src/code/model/logic/vegetableMeta.js');
const {EntityManager} = require('../../../src/code/model/gameEngine/entityManager.js');
const {GardenBedCellLink} = require('../../../src/code/model/logic/gardenBedCellLink.js');
const {VegetableState, lifeCycleStates, StateDetail} = require('../../../src/code/model/logic/vegetableState.js');
const {Grid} = require('../../../src/code/model/logic/store/grid.js');
const {EventManager} = require('../../../src/code/model/gameEngine/eventManager.js');
const {SystemHandler} = require('../../../src/code/model/gameEngine/systemManager.js');

const {sleepingSeed, seed, sprout, child, youth, adult, death} = lifeCycleStates;
let manager = null;
let worldMock = null;
let grid = null;
let eventManager = null;
function beforeEachTest() {
    eventManager = new EventManager();
    manager = new EntityComponentManager(new EntityManager(), new ComponentIdGenerator());
    grid = new Grid(4, 3);
    manager.putSingletonEntity('grid', grid);

    worldMock = {
        elapsedTime: 1000,
        getGameLoop: function() {
            const et = this.elapsedTime;
            return {
                getElapsedTime: () => et
            }
        },
        getEntityComponentManager: () => manager,
        getEventManager: () => eventManager
    };
};

function vegetableState(stateHistory) {
    let result = VegetableState.of(
        StateDetail.of(10, lifeCycleStates.seed),
        StateDetail.of(10, lifeCycleStates.sprout),
        StateDetail.of(10, lifeCycleStates.child),
        StateDetail.of(10, lifeCycleStates.youth)
    );
    result.history = stateHistory;

    return result;
}

function systemHandler(system) {
    return new SystemHandler('TomatoDeathSystem', 'update', system, 0, 1);
}

describe.each([
    {
        initVegetablesState: [
            {cellX: 0, cellY: 0, stateHistory: [adult], hasGrowComps: true, isDead: true, explosion: null},
            {cellX: 1, cellY: 0, stateHistory: [youth], hasGrowComps: true, isDead: true, explosion: null},
            {cellX: 0, cellY: 1, stateHistory: [child], hasGrowComps: true, isDead: true, explosion: null},
            {cellX: 1, cellY: 1, stateHistory: [adult], hasGrowComps: true, isDead: true, explosion: null},
            {cellX: 2, cellY: 1, stateHistory: [seed, sprout], hasGrowComps: true, isDead: false, explosion: null},
            {cellX: 1, cellY: 2, stateHistory: [sleepingSeed, seed], hasGrowComps: true, isDead: false, explosion: null},
            {cellX: 2, cellY: 2, stateHistory: [sleepingSeed], hasGrowComps: false, isDead: false, explosion: null},
            {cellX: 0, cellY: 2, stateHistory: [sprout, death], hasGrowComps: false, isDead: true, explosion: null}
        ],
        elapsedTime: 999,
        expectedVegetablesState: [
            {cellX: 0, cellY: 0, isAlive: true, isCellEmpty: false, hasTomatoExplosionComp: true, hasGrowComps: false},
            {cellX: 1, cellY: 0, isAlive: true, isCellEmpty: false, hasTomatoExplosionComp: true, hasGrowComps: false},
            {cellX: 0, cellY: 1, isAlive: true, isCellEmpty: false, hasTomatoExplosionComp: true, hasGrowComps: false},
            {cellX: 1, cellY: 1, isAlive: true, isCellEmpty: false, hasTomatoExplosionComp: true, hasGrowComps: false},
            {cellX: 2, cellY: 1, isAlive: false, isCellEmpty: true},
            {cellX: 1, cellY: 2, isAlive: false, isCellEmpty: true},
            {cellX: 2, cellY: 2, isAlive: false, isCellEmpty: true},
            {cellX: 0, cellY: 2, isAlive: false, isCellEmpty: true}
        ]
    },
    {
        initVegetablesState: [
            {cellX: 0, cellY: 0, stateHistory: [adult], hasGrowComps: true, isDead: true, explosion: null},
            {cellX: 1, cellY: 0, stateHistory: [youth], hasGrowComps: true, isDead: true, explosion: null},
            {cellX: 0, cellY: 1, stateHistory: [child], hasGrowComps: true, isDead: true, explosion: null},
            {cellX: 1, cellY: 1, stateHistory: [adult], hasGrowComps: true, isDead: true, explosion: null},
            {cellX: 2, cellY: 1, stateHistory: [seed, sprout], hasGrowComps: true, isDead: false, explosion: null},
            {cellX: 1, cellY: 2, stateHistory: [sleepingSeed, seed], hasGrowComps: true, isDead: false, explosion: null},
            {cellX: 2, cellY: 2, stateHistory: [sleepingSeed], hasGrowComps: false, isDead: false, explosion: null},
            {cellX: 0, cellY: 2, stateHistory: [sprout, death], hasGrowComps: false, isDead: true, explosion: null}
        ],
        elapsedTime: 1000,
        expectedVegetablesState: [
            {cellX: 0, cellY: 0, isAlive: false, isCellEmpty: true},
            {cellX: 1, cellY: 0, isAlive: false, isCellEmpty: true},
            {cellX: 0, cellY: 1, isAlive: false, isCellEmpty: true},
            {cellX: 1, cellY: 1, isAlive: false, isCellEmpty: true},
            {cellX: 2, cellY: 1, isAlive: false, isCellEmpty: true},
            {cellX: 1, cellY: 2, isAlive: false, isCellEmpty: true},
            {cellX: 2, cellY: 2, isAlive: false, isCellEmpty: true},
            {cellX: 0, cellY: 2, isAlive: false, isCellEmpty: true}
        ]
    },
    {
        initVegetablesState: [
            {cellX: 0, cellY: 0, stateHistory: [adult], hasGrowComps: true, isDead: true, explosion: null},
            {cellX: 1, cellY: 0, stateHistory: [youth], hasGrowComps: true, isDead: true, explosion: null},
            {cellX: 0, cellY: 1, stateHistory: [child], hasGrowComps: true, isDead: true, explosion: null},
            {cellX: 1, cellY: 1, stateHistory: [adult], hasGrowComps: true, isDead: true, explosion: null},
            {cellX: 2, cellY: 1, stateHistory: [seed, sprout], hasGrowComps: true, isDead: false, explosion: null},
            {cellX: 1, cellY: 2, stateHistory: [sleepingSeed, seed], hasGrowComps: true, isDead: false, explosion: null},
            {cellX: 2, cellY: 2, stateHistory: [sleepingSeed], hasGrowComps: false, isDead: false, explosion: null},
            {cellX: 0, cellY: 2, stateHistory: [sprout, death], hasGrowComps: false, isDead: true, explosion: null}
        ],
        elapsedTime: 1001,
        expectedVegetablesState: [
            {cellX: 0, cellY: 0, isAlive: false, isCellEmpty: true},
            {cellX: 1, cellY: 0, isAlive: false, isCellEmpty: true},
            {cellX: 0, cellY: 1, isAlive: false, isCellEmpty: true},
            {cellX: 1, cellY: 1, isAlive: false, isCellEmpty: true},
            {cellX: 2, cellY: 1, isAlive: false, isCellEmpty: true},
            {cellX: 1, cellY: 2, isAlive: false, isCellEmpty: true},
            {cellX: 2, cellY: 2, isAlive: false, isCellEmpty: true},
            {cellX: 0, cellY: 2, isAlive: false, isCellEmpty: true}
        ]
    },
    {
        initVegetablesState: [
            {cellX: 0, cellY: 0, stateHistory: [adult, death], hasGrowComps: false, isDead: true, explosion: {neighboursNumber: 8, timeInMillis: 1000}},
            {cellX: 1, cellY: 0, stateHistory: [youth, death], hasGrowComps: false, isDead: true, explosion: {neighboursNumber: 8, timeInMillis: 1000}},
            {cellX: 0, cellY: 1, stateHistory: [child, death], hasGrowComps: false, isDead: true, explosion: {neighboursNumber: 8, timeInMillis: 1000}},
            {cellX: 1, cellY: 1, stateHistory: [adult, death], hasGrowComps: false, isDead: true, explosion: {neighboursNumber: 8, timeInMillis: 1000}},
            {cellX: 2, cellY: 1, stateHistory: [seed, sprout], hasGrowComps: true, isDead: false, explosion: null},
            {cellX: 1, cellY: 2, stateHistory: [sleepingSeed, seed], hasGrowComps: true, isDead: false, explosion: null},
            {cellX: 2, cellY: 2, stateHistory: [sleepingSeed], hasGrowComps: false, isDead: false, explosion: null},
            {cellX: 0, cellY: 2, stateHistory: [sprout, death], hasGrowComps: false, isDead: true, explosion: null}
        ],
        elapsedTime: 999,
        expectedVegetablesState: [
            {cellX: 0, cellY: 0, isAlive: true, isCellEmpty: false, hasTomatoExplosionComp: true, hasGrowComps: false},
            {cellX: 1, cellY: 0, isAlive: true, isCellEmpty: false, hasTomatoExplosionComp: true, hasGrowComps: false},
            {cellX: 0, cellY: 1, isAlive: true, isCellEmpty: false, hasTomatoExplosionComp: true, hasGrowComps: false},
            {cellX: 1, cellY: 1, isAlive: true, isCellEmpty: false, hasTomatoExplosionComp: true, hasGrowComps: false},
            {cellX: 2, cellY: 1, isAlive: true, isCellEmpty: false, hasTomatoExplosionComp: false, hasGrowComps: true},
            {cellX: 1, cellY: 2, isAlive: true, isCellEmpty: false, hasTomatoExplosionComp: false, hasGrowComps: true},
            {cellX: 2, cellY: 2, isAlive: true, isCellEmpty: false, hasTomatoExplosionComp: false, hasGrowComps: false},
            {cellX: 0, cellY: 2, isAlive: true, isCellEmpty: false, hasTomatoExplosionComp: false, hasGrowComps: false}
        ]
    }
])(`update(groupName, world): case $#`,
    ({initVegetablesState, elapsedTime, expectedVegetablesState}) => {
        beforeEach(beforeEachTest);

        test(`initVegetablesState: ${JSON.stringify(initVegetablesState)},
            elapsedTime: ${elapsedTime},
            => expectedVegetablesState: ${JSON.stringify(expectedVegetablesState)}`,
        () => {
            let vegetables = initVegetablesState.map(state => {
                let vegetable = manager.createEntity();
                vegetable.put(
                    new VegetableMeta('Tomato'),
                    new GardenBedCellLink(state.cellX, state.cellY),
                    vegetableState(state.stateHistory)
                );
                if(state.explosion) vegetable.put(new TomatoExplosion(state.explosion.neighboursNumber, state.explosion.timeInMillis));
                if(state.hasGrowComps) vegetable.put(Immunity.of(60, 1, 0.2, 30), Satiety.of(60, 1, 30), Thirst.of(60, 1, 30));
                if(state.isDead) vegetable.addTags('dead');
                manager.bindEntity(vegetable);
                grid.write(state.cellX, state.cellY, vegetable);
                return vegetable;
            });
            worldMock.elapsedTime = elapsedTime;

            let system  = new TomatoDeathSystem(manager, () => 0.1, () => new TomatoExplosion(8, 1000));
            system.update(systemHandler(system), worldMock);

            expectedVegetablesState.forEach((expected, index) => {
                let vegetable = vegetables[index];
                expect(manager.isAlive(vegetable)).toBe(expected.isAlive);
                expect(grid.get(expected.cellX, expected.cellY) == null).toBe(expected.isCellEmpty);
                if(expected.isAlive) {
                    expect(vegetable.hasComponents(TomatoExplosion)).toBe(expected.hasTomatoExplosionComp);
                    expect(vegetable.hasComponents(Immunity)).toBe(expected.hasGrowComps);
                    expect(vegetable.hasComponents(Satiety)).toBe(expected.hasGrowComps);
                    expect(vegetable.hasComponents(Thirst)).toBe(expected.hasGrowComps);
                }
            });
        });
    }
);
