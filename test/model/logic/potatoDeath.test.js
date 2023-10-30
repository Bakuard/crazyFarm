const {Thirst} = require('../../../src/code/model/logic/thirst.js');
const {Satiety} = require('../../../src/code/model/logic/satiety.js');
const {Immunity} = require('../../../src/code/model/logic/immunity.js');
const {PotatoGhost, PotatoDeathSystem} = require('../../../src/code/model/logic/potatoDeath.js');
const {EntityComponentManager} = require('../../../src/code/model/gameEngine/entityComponentManager.js');
const {ComponentIdGenerator} = require('../../../src/code/model/gameEngine/componentIdGenerator.js');
const {VegetableMeta} = require('../../../src/code/model/logic/vegetableMeta.js');
const {EntityManager} = require('../../../src/code/model/gameEngine/entityManager.js');
const {GardenBedCellLink} = require('../../../src/code/model/logic/gardenBedCellLink.js');
const {VegetableState, lifeCycleStates, StateDetail} = require('../../../src/code/model/logic/vegetableState.js');
const {Grid} = require('../../../src/code/model/logic/store/grid.js');

let manager = null;
let worldMock = null;
let grid = null;
function beforeEachTest() {
    manager = new EntityComponentManager(new EntityManager(), new ComponentIdGenerator());
    grid = new Grid(4, 3);
    manager.putSingletonEntity('fabric', {
        potatoGhost() {
            return new PotatoGhost(2000);
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

function vegetableState(...states) {
    let result = VegetableState.of(
        StateDetail.of(10, lifeCycleStates.seed),
        StateDetail.of(10, lifeCycleStates.sprout),
        StateDetail.of(10, lifeCycleStates.child),
        StateDetail.of(10, lifeCycleStates.youth)
    );
    result.history = states;

    return result;
}

describe.each([
    {elapsedTime: 100, ghostDurationInMillis: 100, isAlive: false, isCellEmpty: true},
    {elapsedTime: 101, ghostDurationInMillis: 100, isAlive: false, isCellEmpty: true},
    {elapsedTime: 99, ghostDurationInMillis: 100, isAlive: true, isCellEmpty: false}
])(`update(groupName, world):`,
    ({elapsedTime, ghostDurationInMillis, isAlive, isCellEmpty}) => {
        beforeEach(beforeEachTest);

        test(`elapsedTime ${elapsedTime}, 
              ghostDurationInMillis ${ghostDurationInMillis}
              => isAlive ${isAlive}`,
        () => {
            let entity = manager.createEntity().put(
                new PotatoGhost(ghostDurationInMillis),
                new GardenBedCellLink(0, 0)
            );
            manager.bindEntity(entity);
            grid.write(0, 0, entity);
            worldMock.elapsedTime = elapsedTime;

            let system = new PotatoDeathSystem(manager);
            system.update('update', worldMock);

            expect(manager.isAlive(entity)).toBe(isAlive);
            expect(grid.get(0, 0) === null).toBe(isCellEmpty);
        });
    }
);

describe.each([
    {state: lifeCycleStates.sleepingSeed, hasGrowComps: true, hasGhostComp: false},
    {state: lifeCycleStates.seed, previousState: lifeCycleStates.sleepingSeed, hasGrowComps: true, hasGhostComp: false},
    {state: lifeCycleStates.sprout, previousState: lifeCycleStates.seed, hasGrowComps: true, hasGhostComp: false},
    {state: lifeCycleStates.youth, previousState: lifeCycleStates.sprout, hasGrowComps: true, hasGhostComp: false},
    {state: lifeCycleStates.adult, previousState: lifeCycleStates.youth, hasGrowComps: true, hasGhostComp: false},

    {state: lifeCycleStates.death, previousState: lifeCycleStates.sleepingSeed, hasGrowComps: false, hasGhostComp: false},
    {state: lifeCycleStates.death, previousState: lifeCycleStates.seed, hasGrowComps: false, hasGhostComp: false},
    {state: lifeCycleStates.death, previousState: lifeCycleStates.sprout, hasGrowComps: false, hasGhostComp: false},
    {state: lifeCycleStates.death, previousState: lifeCycleStates.child, hasGrowComps: false, hasGhostComp: true},
    {state: lifeCycleStates.death, previousState: lifeCycleStates.youth, hasGrowComps: false, hasGhostComp: true},
    {state: lifeCycleStates.death, previousState: lifeCycleStates.adult, hasGrowComps: false, hasGhostComp: true}
])(`update(groupName, world):`,
    ({state, previousState, hasGrowComps, hasGhostComp}) => {
        beforeEach(beforeEachTest);

        test(`state ${state.name},
              previousState ${previousState?.name}
              => hasGrowComps ${hasGrowComps},
                 hasGhostComp ${hasGhostComp}`,
        () => {
            let entity = manager.createEntity().put(
                new VegetableMeta('Potato'),
                new GardenBedCellLink(0, 0),
                vegetableState(previousState, state),
                Immunity.of(60, 1, 0.2),
                Satiety.of(60, 1),
                Thirst.of(60, 1)
            );
            manager.bindEntity(entity);
            grid.write(0, 0, entity);

            let system = new PotatoDeathSystem(manager);
            system.update('update', worldMock);
            let generator = manager.select(manager.createFilter().all(VegetableMeta));
            let actual = [...generator][0];

            expect(actual.hasComponents(Immunity)).toBe(hasGrowComps);
            expect(actual.hasComponents(Satiety)).toBe(hasGrowComps);
            expect(actual.hasComponents(Thirst)).toBe(hasGrowComps);
            expect(actual.hasComponents(PotatoGhost)).toBe(hasGhostComp);
            expect(actual.hasComponents(VegetableState)).toBe(true);
            expect(actual.hasComponents(GardenBedCellLink)).toBe(true);
            expect(actual.hasComponents(VegetableMeta)).toBe(true);
        });
    }
);

describe.each([
    {state: lifeCycleStates.sleepingSeed, previousState: lifeCycleStates.sleepingSeed, isExploded: false, isAlive: true, isCellEmtpy: false},
    {state: lifeCycleStates.seed, previousState: lifeCycleStates.sleepingSeed, isExploded: false, isAlive: true, isCellEmtpy: false},
    {state: lifeCycleStates.sprout, previousState: lifeCycleStates.seed, isExploded: false, isAlive: true, isCellEmtpy: false},
    {state: lifeCycleStates.death, previousState: lifeCycleStates.sprout, isExploded: false, isAlive: true, isCellEmtpy: false},

    {state: lifeCycleStates.sleepingSeed, previousState: lifeCycleStates.sleepingSeed, isExploded: true, isAlive: false, isCellEmtpy: true},
    {state: lifeCycleStates.seed, previousState: lifeCycleStates.sleepingSeed, isExploded: true, isAlive: false, isCellEmtpy: true},
    {state: lifeCycleStates.sprout, previousState: lifeCycleStates.seed, isExploded: true, isAlive: false, isCellEmtpy: true},
    {state: lifeCycleStates.death, previousState: lifeCycleStates.sprout, isExploded: true, isAlive: false, isCellEmtpy: true},

    {state: lifeCycleStates.death, previousState: lifeCycleStates.adult, isExploded: true, isAlive: true, isCellEmtpy: false},
    {state: lifeCycleStates.death, previousState: lifeCycleStates.youth, isExploded: true, isAlive: true, isCellEmtpy: false},
    {state: lifeCycleStates.death, previousState: lifeCycleStates.child, isExploded: true, isAlive: true, isCellEmtpy: false},

    {state: lifeCycleStates.adult, previousState: lifeCycleStates.youth, isExploded: true, isAlive: true, isCellEmtpy: false},
    {state: lifeCycleStates.youth, previousState: lifeCycleStates.child, isExploded: true, isAlive: true, isCellEmtpy: false},
    {state: lifeCycleStates.child, previousState: lifeCycleStates.sprout, isExploded: true, isAlive: true, isCellEmtpy: false},
])(`update(groupName, world):`,
    ({state, previousState, isExploded, isAlive, isCellEmtpy}) => {
        beforeEach(beforeEachTest);

        test(`state: ${state.name},
            previousState: ${previousState.name},
            isExploded: ${isExploded}
            => isAlive: ${isAlive}, isCellEmtpy: ${isCellEmtpy}`,
        () => {
            let entity = manager.createEntity().put(
                new VegetableMeta('Potato'),
                new GardenBedCellLink(0, 0),
                vegetableState(previousState, state),
                Immunity.of(60, 1, 0.2),
                Satiety.of(60, 1),
                Thirst.of(60, 1)
            );
            if(isExploded) entity.addTags('exploded');
            manager.bindEntity(entity);
            grid.write(0, 0, entity);

            let system = new PotatoDeathSystem(manager);
            system.update('update', worldMock);

            expect(grid.get(0, 0) == null).toBe(isCellEmtpy);
            expect(manager.isAlive(entity)).toBe(isAlive);
        });
    }
);