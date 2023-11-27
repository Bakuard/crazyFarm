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
    return new SystemHandler('PotatoDeathSystem', 'update', system, 0, 1);
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

            let system = new PotatoDeathSystem(manager, () => new PotatoGhost(2000));
            system.update(systemHandler(system), worldMock);

            expect(manager.isAlive(entity)).toBe(isAlive);
            expect(grid.get(0, 0) === null).toBe(isCellEmpty);
        });
    }
);

describe.each([
    {
        stateHistory: [sleepingSeed], isExploded: false, isDead: false, hasGrowComps: false, alreadyHasGhostComp: false,
        expectedHasGrowComps: false, expectedHasGhostComp: false, expcetedAlive: true, expectedCellEmpty: false, expectedState: sleepingSeed
    },
    {
        stateHistory: [seed], isExploded: false, isDead: false, hasGrowComps: true, alreadyHasGhostComp: false,
        expectedHasGrowComps: true, expectedHasGhostComp: false, expcetedAlive: true, expectedCellEmpty: false, expectedState: seed
    },
    {
        stateHistory: [sprout], isExploded: false, isDead: false, hasGrowComps: true, alreadyHasGhostComp: false,
        expectedHasGrowComps: true, expectedHasGhostComp: false, expcetedAlive: true, expectedCellEmpty: false, expectedState: sprout
    },
    {
        stateHistory: [child], isExploded: false, isDead: false, hasGrowComps: true, alreadyHasGhostComp: false,
        expectedHasGrowComps: true, expectedHasGhostComp: false, expcetedAlive: true, expectedCellEmpty: false, expectedState: child
    },
    {
        stateHistory: [youth], isExploded: false, isDead: false, hasGrowComps: true, alreadyHasGhostComp: false,
        expectedHasGrowComps: true, expectedHasGhostComp: false, expcetedAlive: true, expectedCellEmpty: false, expectedState: youth
    },
    {
        stateHistory: [adult], isExploded: false, isDead: false, hasGrowComps: true, alreadyHasGhostComp: false,
        expectedHasGrowComps: true, expectedHasGhostComp: false, expcetedAlive: true, expectedCellEmpty: false, expectedState: adult
    },


    {
        stateHistory: [sleepingSeed], isExploded: true, isDead: false, hasGrowComps: false, alreadyHasGhostComp: false,
        expcetedAlive: false, expectedCellEmpty: true
    },
    {
        stateHistory: [seed], isExploded: true, isDead: false, hasGrowComps: true, alreadyHasGhostComp: false,
        expcetedAlive: false, expectedCellEmpty: true
    },
    {
        stateHistory: [sprout], isExploded: true, isDead: false, hasGrowComps: true, alreadyHasGhostComp: false,
        expcetedAlive: false, expectedCellEmpty: true
    },
    {
        stateHistory: [child], isExploded: true, isDead: false, hasGrowComps: true, alreadyHasGhostComp: false,
        expectedHasGrowComps: false, expectedHasGhostComp: true, expcetedAlive: true, expectedCellEmpty: false, expectedState: death
    },
    {
        stateHistory: [youth], isExploded: true, isDead: false, hasGrowComps: true, alreadyHasGhostComp: false,
        expectedHasGrowComps: false, expectedHasGhostComp: true, expcetedAlive: true, expectedCellEmpty: false, expectedState: death
    },
    {
        stateHistory: [adult], isExploded: true, isDead: false, hasGrowComps: true, alreadyHasGhostComp: false,
        expectedHasGrowComps: false, expectedHasGhostComp: true, expcetedAlive: true, expectedCellEmpty: false, expectedState: death
    },
    {
        stateHistory: [sleepingSeed, death], isExploded: true, isDead: false, hasGrowComps: false, alreadyHasGhostComp: false,
        expcetedAlive: false, expectedCellEmpty: true
    },
    {
        stateHistory: [seed, death], isExploded: true, isDead: false, hasGrowComps: true, alreadyHasGhostComp: false,
        expcetedAlive: false, expectedCellEmpty: true
    },
    {
        stateHistory: [sprout, death], isExploded: true, isDead: false, hasGrowComps: true, alreadyHasGhostComp: false,
        expcetedAlive: false, expectedCellEmpty: true
    },
    {
        stateHistory: [child, death], isExploded: true, isDead: false, hasGrowComps: false, alreadyHasGhostComp: true,
        expectedHasGrowComps: false, expectedHasGhostComp: true, expcetedAlive: true, expectedCellEmpty: false, expectedState: death
    },
    {
        stateHistory: [youth, death], isExploded: true, isDead: false, hasGrowComps: false, alreadyHasGhostComp: true,
        expectedHasGrowComps: false, expectedHasGhostComp: true, expcetedAlive: true, expectedCellEmpty: false, expectedState: death
    },
    {
        stateHistory: [adult, death], isExploded: true, isDead: false, hasGrowComps: false, alreadyHasGhostComp: true,
        expectedHasGrowComps: false, expectedHasGhostComp: true, expcetedAlive: true, expectedCellEmpty: false, expectedState: death
    },


    {
        stateHistory: [sleepingSeed], isExploded: false, isDead: true, hasGrowComps: false, alreadyHasGhostComp: false,
        expcetedAlive: false, expectedCellEmpty: true
    },
    {
        stateHistory: [seed], isExploded: false, isDead: true, hasGrowComps: true, alreadyHasGhostComp: false,
        expcetedAlive: false, expectedCellEmpty: true
    },
    {
        stateHistory: [sprout], isExploded: false, isDead: true, hasGrowComps: true, alreadyHasGhostComp: false,
        expectedHasGrowComps: false, expectedHasGhostComp: false, expcetedAlive: true, expectedCellEmpty: false, expectedState: death
    },
    {
        stateHistory: [child], isExploded: false, isDead: true, hasGrowComps: true, alreadyHasGhostComp: false,
        expectedHasGrowComps: false, expectedHasGhostComp: true, expcetedAlive: true, expectedCellEmpty: false, expectedState: death
    },
    {
        stateHistory: [youth], isExploded: false, isDead: true, hasGrowComps: true, alreadyHasGhostComp: false,
        expectedHasGrowComps: false, expectedHasGhostComp: true, expcetedAlive: true, expectedCellEmpty: false, expectedState: death
    },
    {
        stateHistory: [adult], isExploded: false,  isDead: true, hasGrowComps: true, alreadyHasGhostComp: false,
        expectedHasGrowComps: false, expectedHasGhostComp: true, expcetedAlive: true, expectedCellEmpty: false, expectedState: death
    }
])(`update(groupName, world):`,
    ({stateHistory, isExploded, isDead, hasGrowComps, alreadyHasGhostComp,
        expectedHasGrowComps, expectedHasGhostComp, expcetedAlive, expectedCellEmpty, expectedState}) => {
        beforeEach(beforeEachTest);

        test(`stateHistory: [${stateHistory.map(state => state.name)}],
              isExploded: ${isExploded},
              isDead: ${isDead},
              hasGrowComps: ${hasGrowComps},
              alreadyHasGhostComp: ${alreadyHasGhostComp}
              => expectedHasGrowComps: ${expectedHasGrowComps},
                expectedHasGhostComp: ${expectedHasGhostComp},
                expcetedAlive: ${expcetedAlive},
                expectedCellEmpty: ${expectedCellEmpty},
                expectedState: ${expectedState?.name}`,
        () => {
            let entity = manager.createEntity().put(
                new VegetableMeta('Potato'),
                new GardenBedCellLink(0, 0),
                vegetableState(stateHistory)
            );
            if(hasGrowComps) entity.put( Immunity.of(60, 1, 0.2, 30), Satiety.of(60, 1, 30), Thirst.of(60, 1, 30) );
            if(isExploded) entity.addTags('exploded');
            if(isDead) entity.addTags('dead');
            if(alreadyHasGhostComp) entity.put( new PotatoGhost(10000) ).addTags( 'impossibleToDigUp' );
            manager.bindEntity(entity);
            grid.write(0, 0, entity);

            let system = new PotatoDeathSystem(manager, () => new PotatoGhost(2000));
            system.update(systemHandler(system), worldMock);
            let generator = manager.select(manager.createFilter().all(VegetableMeta));
            let entityAfterUpdate = [...generator][0];

            expect(manager.isAlive(entity)).toBe(expcetedAlive);
            expect(grid.get(0, 0) == null).toBe(expectedCellEmpty);
            if(expcetedAlive) {
                expect(entityAfterUpdate.hasComponents(Immunity)).toBe(expectedHasGrowComps);
                expect(entityAfterUpdate.hasComponents(Satiety)).toBe(expectedHasGrowComps);
                expect(entityAfterUpdate.hasComponents(Thirst)).toBe(expectedHasGrowComps);
                expect(entityAfterUpdate.hasComponents(PotatoGhost)).toBe(expectedHasGhostComp);
                expect(entityAfterUpdate.hasTags('impossibleToDigUp')).toBe(expectedHasGhostComp);
                expect(entityAfterUpdate.hasComponents(VegetableState)).toBe(true);
                expect(entityAfterUpdate.hasComponents(GardenBedCellLink)).toBe(true);
                expect(entityAfterUpdate.hasComponents(VegetableMeta)).toBe(true);
                expect(entityAfterUpdate.get(VegetableState).current()).toBe(expectedState);
            }
        });
    }
);
