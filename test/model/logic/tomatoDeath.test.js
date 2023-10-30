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

const {sleepingSeed, seed, sprout, child, youth, adult, death} = lifeCycleStates;
let manager = null;
let worldMock = null;
let grid = null;
function beforeEachTest() {
    manager = new EntityComponentManager(new EntityManager(), new ComponentIdGenerator());
    grid = new Grid(4, 3);
    manager.putSingletonEntity('fabric', {
        tomatoExplosion() {
            return new TomatoExplosion(8, 1001);
        }
    });
    manager.putSingletonEntity('grid', grid);

    worldMock = {
        elapsedTime: 1000,
        getGameLoop: function() {
            const et = this.elapsedTime;
            return {
                getElapsedTime: () => et
            }
        },
        getEntityComponentManager: () => manager
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

function createAndPrepareTomato(cellX, cellY, currentState, previousState) {
    let vegetable = manager.createEntity().put(
        new VegetableMeta('Tomato'),
        new GardenBedCellLink(cellX, cellY),
        vegetableState([previousState, currentState]),
        Immunity.of(60, 1, 0.2),
        Satiety.of(60, 1),
        Thirst.of(60, 1)
    );
    manager.bindEntity(vegetable);
    grid.write(cellX, cellY, vegetable);
    return vegetable;
}

function createAndPrepareExplodedTomato(cellX, cellY, previousState, explosion) {
    let vegetable = manager.createEntity().put(
        new VegetableMeta('Tomato'),
        new GardenBedCellLink(cellX, cellY),
        vegetableState([previousState, death]),
        new TomatoExplosion(explosion.neighboursNumber, explosion.timeInMillis)
    ).addTags('exploded');
    manager.bindEntity(vegetable);
    grid.write(cellX, cellY, vegetable);
    return vegetable;
}

describe.each([
    {
        initVegetablesState: [
            {cellX: 0, cellY: 0, currentState: death, previousState: adult, explosion: null},
            {cellX: 1, cellY: 0, currentState: death, previousState: youth, explosion: null},
            {cellX: 0, cellY: 1, currentState: death, previousState: child, explosion: null},
            {cellX: 1, cellY: 1, currentState: death, previousState: adult, explosion: null},
            {cellX: 2, cellY: 1, currentState: sprout, previousState: seed, explosion: null},
            {cellX: 1, cellY: 2, currentState: seed, previousState: sleepingSeed, explosion: null},
            {cellX: 2, cellY: 2, currentState: sleepingSeed, previousState: sleepingSeed, explosion: null},
            {cellX: 0, cellY: 2, currentState: death, previousState: sprout, explosion: null}
        ],
        elapsedTime: 1000,
        expectedVegetablesState: [
            {cellX: 0, cellY: 0, isAlive: true, isCellEmpty: false, hasTomatoExplosionComp: true, hasGrowComps: false},
            {cellX: 1, cellY: 0, isAlive: true, isCellEmpty: false, hasTomatoExplosionComp: true, hasGrowComps: false},
            {cellX: 0, cellY: 1, isAlive: true, isCellEmpty: false, hasTomatoExplosionComp: true, hasGrowComps: false},
            {cellX: 1, cellY: 1, isAlive: true, isCellEmpty: false, hasTomatoExplosionComp: true, hasGrowComps: false},
            {cellX: 2, cellY: 1, isAlive: false, isCellEmpty: true, hasTomatoExplosionComp: false, hasGrowComps: false},
            {cellX: 1, cellY: 2, isAlive: false, isCellEmpty: true, hasTomatoExplosionComp: false, hasGrowComps: false},
            {cellX: 2, cellY: 2, isAlive: false, isCellEmpty: true, hasTomatoExplosionComp: false, hasGrowComps: false},
            {cellX: 0, cellY: 2, isAlive: false, isCellEmpty: true, hasTomatoExplosionComp: false, hasGrowComps: false}
        ]
    },
    {
        initVegetablesState: [
            {cellX: 0, cellY: 0, currentState: death, previousState: adult, explosion: null},
            {cellX: 1, cellY: 0, currentState: death, previousState: youth, explosion: null},
            {cellX: 0, cellY: 1, currentState: death, previousState: child, explosion: null},
            {cellX: 1, cellY: 1, currentState: death, previousState: adult, explosion: null},
            {cellX: 2, cellY: 1, currentState: sprout, previousState: seed, explosion: null},
            {cellX: 1, cellY: 2, currentState: seed, previousState: sleepingSeed, explosion: null},
            {cellX: 2, cellY: 2, currentState: sleepingSeed, previousState: sleepingSeed, explosion: null},
            {cellX: 0, cellY: 2, currentState: death, previousState: sprout, explosion: null}
        ],
        elapsedTime: 1001,
        expectedVegetablesState: [
            {cellX: 0, cellY: 0, isAlive: false, isCellEmpty: true, hasTomatoExplosionComp: true, hasGrowComps: false},
            {cellX: 1, cellY: 0, isAlive: false, isCellEmpty: true, hasTomatoExplosionComp: true, hasGrowComps: false},
            {cellX: 0, cellY: 1, isAlive: false, isCellEmpty: true, hasTomatoExplosionComp: true, hasGrowComps: false},
            {cellX: 1, cellY: 1, isAlive: false, isCellEmpty: true, hasTomatoExplosionComp: true, hasGrowComps: false},
            {cellX: 2, cellY: 1, isAlive: false, isCellEmpty: true, hasTomatoExplosionComp: false, hasGrowComps: false},
            {cellX: 1, cellY: 2, isAlive: false, isCellEmpty: true, hasTomatoExplosionComp: false, hasGrowComps: false},
            {cellX: 2, cellY: 2, isAlive: false, isCellEmpty: true, hasTomatoExplosionComp: false, hasGrowComps: false},
            {cellX: 0, cellY: 2, isAlive: false, isCellEmpty: true, hasTomatoExplosionComp: false, hasGrowComps: false}
        ]
    },
    {
        initVegetablesState: [
            {cellX: 0, cellY: 0, currentState: death, previousState: adult, explosion: {neighboursNumber: 8, timeInMillis: 2000}},
            {cellX: 1, cellY: 0, currentState: death, previousState: youth, explosion: {neighboursNumber: 8, timeInMillis: 2000}},
            {cellX: 0, cellY: 1, currentState: death, previousState: child, explosion: {neighboursNumber: 8, timeInMillis: 2000}},
            {cellX: 1, cellY: 1, currentState: death, previousState: adult, explosion: null},
            {cellX: 2, cellY: 1, currentState: sprout, previousState: seed, explosion: null},
            {cellX: 1, cellY: 2, currentState: seed, previousState: sleepingSeed, explosion: null},
            {cellX: 2, cellY: 2, currentState: sleepingSeed, previousState: sleepingSeed, explosion: null},
            {cellX: 0, cellY: 2, currentState: death, previousState: sprout, explosion: null}
        ],
        elapsedTime: 1001,
        expectedVegetablesState: [
            {cellX: 0, cellY: 0, isAlive: true, isCellEmpty: false, hasTomatoExplosionComp: true, hasGrowComps: false},
            {cellX: 1, cellY: 0, isAlive: true, isCellEmpty: false, hasTomatoExplosionComp: true, hasGrowComps: false},
            {cellX: 0, cellY: 1, isAlive: true, isCellEmpty: false, hasTomatoExplosionComp: true, hasGrowComps: false},
            {cellX: 1, cellY: 1, isAlive: false, isCellEmpty: true, hasTomatoExplosionComp: true, hasGrowComps: false},
            {cellX: 2, cellY: 1, isAlive: false, isCellEmpty: true, hasTomatoExplosionComp: false, hasGrowComps: false},
            {cellX: 1, cellY: 2, isAlive: false, isCellEmpty: true, hasTomatoExplosionComp: false, hasGrowComps: false},
            {cellX: 2, cellY: 2, isAlive: false, isCellEmpty: true, hasTomatoExplosionComp: false, hasGrowComps: false},
            {cellX: 0, cellY: 2, isAlive: false, isCellEmpty: true, hasTomatoExplosionComp: false, hasGrowComps: false}
        ]
    },
    {
        initVegetablesState: [
            {cellX: 0, cellY: 0, currentState: death, previousState: adult, explosion: null},
            {cellX: 1, cellY: 0, currentState: death, previousState: youth, explosion: null},
            {cellX: 0, cellY: 1, currentState: death, previousState: child, explosion: null},
            {cellX: 1, cellY: 1, currentState: death, previousState: adult, explosion: null},
            {cellX: 2, cellY: 1, currentState: sprout, previousState: seed, explosion: null},
            {cellX: 1, cellY: 2, currentState: seed, previousState: sleepingSeed, explosion: null},
            {cellX: 2, cellY: 2, currentState: sleepingSeed, previousState: sleepingSeed, explosion: null},
            {cellX: 0, cellY: 2, currentState: death, previousState: sprout, explosion: null}
        ],
        elapsedTime: 1002,
        expectedVegetablesState: [
            {cellX: 0, cellY: 0, isAlive: false, isCellEmpty: true, hasTomatoExplosionComp: true, hasGrowComps: false},
            {cellX: 1, cellY: 0, isAlive: false, isCellEmpty: true, hasTomatoExplosionComp: true, hasGrowComps: false},
            {cellX: 0, cellY: 1, isAlive: false, isCellEmpty: true, hasTomatoExplosionComp: true, hasGrowComps: false},
            {cellX: 1, cellY: 1, isAlive: false, isCellEmpty: true, hasTomatoExplosionComp: true, hasGrowComps: false},
            {cellX: 2, cellY: 1, isAlive: false, isCellEmpty: true, hasTomatoExplosionComp: false, hasGrowComps: false},
            {cellX: 1, cellY: 2, isAlive: false, isCellEmpty: true, hasTomatoExplosionComp: false, hasGrowComps: false},
            {cellX: 2, cellY: 2, isAlive: false, isCellEmpty: true, hasTomatoExplosionComp: false, hasGrowComps: false},
            {cellX: 0, cellY: 2, isAlive: false, isCellEmpty: true, hasTomatoExplosionComp: false, hasGrowComps: false}
        ]
    },
    {
        initVegetablesState: [
            {cellX: 0, cellY: 0, currentState: death, previousState: adult, explosion: {neighboursNumber: 8, timeInMillis: 999}},
            {cellX: 1, cellY: 0, currentState: death, previousState: youth, explosion: {neighboursNumber: 8, timeInMillis: 999}},
            {cellX: 0, cellY: 1, currentState: death, previousState: child, explosion: {neighboursNumber: 8, timeInMillis: 999}},
            {cellX: 1, cellY: 1, currentState: death, previousState: adult, explosion: {neighboursNumber: 8, timeInMillis: 999}},
            {cellX: 2, cellY: 1, currentState: sprout, previousState: seed, explosion: null},
            {cellX: 1, cellY: 2, currentState: seed, previousState: sleepingSeed, explosion: null},
            {cellX: 2, cellY: 2, currentState: sleepingSeed, previousState: sleepingSeed, explosion: null},
            {cellX: 0, cellY: 2, currentState: death, previousState: sprout, explosion: null}
        ],
        elapsedTime: 1000,
        expectedVegetablesState: [
            {cellX: 0, cellY: 0, isAlive: false, isCellEmpty: true, hasTomatoExplosionComp: true, hasGrowComps: false},
            {cellX: 1, cellY: 0, isAlive: false, isCellEmpty: true, hasTomatoExplosionComp: true, hasGrowComps: false},
            {cellX: 0, cellY: 1, isAlive: false, isCellEmpty: true, hasTomatoExplosionComp: true, hasGrowComps: false},
            {cellX: 1, cellY: 1, isAlive: false, isCellEmpty: true, hasTomatoExplosionComp: true, hasGrowComps: false},
            {cellX: 2, cellY: 1, isAlive: true, isCellEmpty: false, hasTomatoExplosionComp: false, hasGrowComps: true},
            {cellX: 1, cellY: 2, isAlive: true, isCellEmpty: false, hasTomatoExplosionComp: false, hasGrowComps: true},
            {cellX: 2, cellY: 2, isAlive: true, isCellEmpty: false, hasTomatoExplosionComp: false, hasGrowComps: true},
            {cellX: 0, cellY: 2, isAlive: true, isCellEmpty: false, hasTomatoExplosionComp: false, hasGrowComps: false}
        ]
    }
])(`update(groupName, world):`,
    ({initVegetablesState, elapsedTime, expectedVegetablesState}) => {
        beforeEach(beforeEachTest);

        test(`initVegetablesState: [${JSON.stringify(initVegetablesState)}],
            elapsedTime: ${elapsedTime},
            => expectedVegetablesState: [${JSON.stringify(expectedVegetablesState)}]`,
        () => {
            let vegetables = initVegetablesState.map(state => {
                if(!state.explosion) return createAndPrepareTomato(state.cellX, state.cellY, state.currentState, state.previousState);
                else return createAndPrepareExplodedTomato(state.cellX, state.cellY, state.previousState, state.explosion);
            });
            worldMock.elapsedTime = elapsedTime;

            let system  = new TomatoDeathSystem(manager, () => 0.1);
            system.update('update', worldMock);

            expectedVegetablesState.forEach((expected, index) => {
                let vegetable = vegetables[index];
                expect(manager.isAlive(vegetable)).toBe(expected.isAlive);
                expect(grid.get(expected.cellX, expected.cellY) == null).toBe(expected.isCellEmpty);
                expect(vegetable.hasComponents(TomatoExplosion)).toBe(expected.hasTomatoExplosionComp);
                expect(vegetable.hasComponents(Immunity)).toBe(expected.hasGrowComps);
                expect(vegetable.hasComponents(Satiety)).toBe(expected.hasGrowComps);
                expect(vegetable.hasComponents(Thirst)).toBe(expected.hasGrowComps);
            });
        });
    }
);
