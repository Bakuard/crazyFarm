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

const {sleepingSeed, seed, sprout, child, youth, adult, death} = lifeCycleStates;
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
            system.update('PotatoDeathSystem', 'update', worldMock);

            expect(manager.isAlive(entity)).toBe(isAlive);
            expect(grid.get(0, 0) === null).toBe(isCellEmpty);
        });
    }
);

describe.each([
    {
        state: sleepingSeed, previousState: sleepingSeed, isExploded: false, hasGrowComps: false, alreadyHasGhostComp: false,
        expectedHasGrowComps: false, expectedHasGhostComp: false, expcetedAlive: true, expectedCellEmpty: false
    },
    {
        state: seed, previousState: sleepingSeed, isExploded: false, hasGrowComps: true, alreadyHasGhostComp: false,
        expectedHasGrowComps: true, expectedHasGhostComp: false, expcetedAlive: true, expectedCellEmpty: false
    },
    {
        state: sprout, previousState: seed, isExploded: false, hasGrowComps: true, alreadyHasGhostComp: false,
        expectedHasGrowComps: true, expectedHasGhostComp: false, expcetedAlive: true, expectedCellEmpty: false
    },
    {
        state: child, previousState: sprout, isExploded: false, hasGrowComps: true, alreadyHasGhostComp: false,
        expectedHasGrowComps: true, expectedHasGhostComp: false, expcetedAlive: true, expectedCellEmpty: false
    },
    {
        state: youth, previousState: child, isExploded: false, hasGrowComps: true, alreadyHasGhostComp: false,
        expectedHasGrowComps: true, expectedHasGhostComp: false, expcetedAlive: true, expectedCellEmpty: false
    },
    {
        state: adult, previousState: youth, isExploded: false, hasGrowComps: true, alreadyHasGhostComp: false,
        expectedHasGrowComps: true, expectedHasGhostComp: false, expcetedAlive: true, expectedCellEmpty: false
    },


    {
        state: sleepingSeed, previousState: sleepingSeed, isExploded: true, hasGrowComps: false, alreadyHasGhostComp: false,
        expcetedAlive: false, expectedCellEmpty: true
    },
    {
        state: seed, previousState: sleepingSeed, isExploded: true, hasGrowComps: true, alreadyHasGhostComp: false,
        expcetedAlive: false, expectedCellEmpty: true
    },
    {
        state: sprout, previousState: seed, isExploded: true, hasGrowComps: true, alreadyHasGhostComp: false,
        expcetedAlive: false, expectedCellEmpty: true
    },
    {
        state: child, previousState: sprout, isExploded: true, hasGrowComps: true, alreadyHasGhostComp: false,
        expectedHasGrowComps: false, expectedHasGhostComp: true, expcetedAlive: true, expectedCellEmpty: false
    },
    {
        state: youth, previousState: child, isExploded: true, hasGrowComps: true, alreadyHasGhostComp: false,
        expectedHasGrowComps: false, expectedHasGhostComp: true, expcetedAlive: true, expectedCellEmpty: false
    },
    {
        state: adult, previousState: youth, isExploded: true, alreadyHasGhostComp: false,
        expectedHasGrowComps: false, expectedHasGhostComp: true, expcetedAlive: true, expectedCellEmpty: false
    },


    {
        state: death, previousState: sleepingSeed, isExploded: false, hasGrowComps: false, alreadyHasGhostComp: false,
        expcetedAlive: false, expectedCellEmpty: true
    },
    {
        state: death, previousState: seed, isExploded: false, hasGrowComps: true, alreadyHasGhostComp: false,
        expcetedAlive: false, expectedCellEmpty: true
    },
    {
        state: death, previousState: sprout, isExploded: false, hasGrowComps: true, alreadyHasGhostComp: false,
        expectedHasGrowComps: false, expectedHasGhostComp: false, expcetedAlive: true, expectedCellEmpty: false
    },
    {
        state: death, previousState: child, isExploded: false, hasGrowComps: true, alreadyHasGhostComp: false,
        expectedHasGrowComps: false, expectedHasGhostComp: true, expcetedAlive: true, expectedCellEmpty: false
    },
    {
        state: death, previousState: youth, isExploded: false, hasGrowComps: true, alreadyHasGhostComp: false,
        expectedHasGrowComps: false, expectedHasGhostComp: true, expcetedAlive: true, expectedCellEmpty: false
    },
    {
        state: death, previousState: adult, isExploded: false, hasGrowComps: true, alreadyHasGhostComp: false,
        expectedHasGrowComps: false, expectedHasGhostComp: true, expcetedAlive: true, expectedCellEmpty: false
    },


    {
        state: death, previousState: sleepingSeed, isExploded: true, hasGrowComps: false, alreadyHasGhostComp: false,
        expcetedAlive: false, expectedCellEmpty: true
    },
    {
        state: death, previousState: seed, isExploded: true, hasGrowComps: true, alreadyHasGhostComp: false,
        expcetedAlive: false, expectedCellEmpty: true
    },
    {
        state: death, previousState: sprout, isExploded: true, hasGrowComps: false, alreadyHasGhostComp: false,
        expcetedAlive: false, expectedCellEmpty: true
    },
    {
        state: death, previousState: child, isExploded: true, hasGrowComps: false, alreadyHasGhostComp: true,
        expectedHasGrowComps: false, expectedHasGhostComp: true, expcetedAlive: true, expectedCellEmpty: false
    },
    {
        state: death, previousState: youth, isExploded: true, hasGrowComps: false, alreadyHasGhostComp: true,
        expectedHasGrowComps: false, expectedHasGhostComp: true, expcetedAlive: true, expectedCellEmpty: false
    },
    {
        state: death, previousState: adult, isExploded: true, hasGrowComps: false, alreadyHasGhostComp: true,
        expectedHasGrowComps: false, expectedHasGhostComp: true, expcetedAlive: true, expectedCellEmpty: false
    },


    {
        state: death, previousState: sleepingSeed, isExploded: true, hasGrowComps: true, alreadyHasGhostComp: false,
        expcetedAlive: false, expectedCellEmpty: true
    },
    {
        state: death, previousState: seed, isExploded: true, hasGrowComps: true, alreadyHasGhostComp: false,
        expcetedAlive: false, expectedCellEmpty: true
    },
    {
        state: death, previousState: sprout, isExploded: true, hasGrowComps: true, alreadyHasGhostComp: false,
        expcetedAlive: false, expectedCellEmpty: true
    },
    {
        state: death, previousState: child, isExploded: true, hasGrowComps: true, alreadyHasGhostComp: false,
        expectedHasGrowComps: false, expectedHasGhostComp: true, expcetedAlive: true, expectedCellEmpty: false
    },
    {
        state: death, previousState: youth, isExploded: true, hasGrowComps: true, alreadyHasGhostComp: false,
        expectedHasGrowComps: false, expectedHasGhostComp: true, expcetedAlive: true, expectedCellEmpty: false
    },
    {
        state: death, previousState: adult, isExploded: true, hasGrowComps: true, alreadyHasGhostComp: false,
        expectedHasGrowComps: false, expectedHasGhostComp: true, expcetedAlive: true, expectedCellEmpty: false
    }
])(`update(groupName, world):`,
    ({state, previousState, isExploded, hasGrowComps, alreadyHasGhostComp,
        expectedHasGrowComps, expectedHasGhostComp, expcetedAlive, expectedCellEmpty}) => {
        beforeEach(beforeEachTest);

        test(`state: ${state.name},
              previousState: ${previousState.name},
              isExploded: ${isExploded},
              hasGrowComps: ${hasGrowComps},
              alreadyHasGhostComp: ${alreadyHasGhostComp}
              => expectedHasGrowComps: ${expectedHasGrowComps},
                expectedHasGhostComp: ${expectedHasGhostComp},
                expcetedAlive: ${expcetedAlive},
                expectedCellEmpty: ${expectedCellEmpty}`,
        () => {
            let entity = manager.createEntity().put(
                new VegetableMeta('Potato'),
                new GardenBedCellLink(0, 0),
                vegetableState(previousState, state)
            );
            if(hasGrowComps) entity.put( Immunity.of(60, 1, 0.2, 30), Satiety.of(60, 1, 30), Thirst.of(60, 1, 30) );
            if(isExploded) entity.addTags('exploded');
            if(alreadyHasGhostComp) entity.put( new PotatoGhost(10000) );
            manager.bindEntity(entity);
            grid.write(0, 0, entity);

            let system = new PotatoDeathSystem(manager);
            system.update('PotatoDeathSystem', 'update', worldMock);
            let generator = manager.select(manager.createFilter().all(VegetableMeta));
            let entityAfterUpdate = [...generator][0];

            expect(manager.isAlive(entity)).toBe(expcetedAlive);
            expect(grid.get(0, 0) == null).toBe(expectedCellEmpty);
            if(expcetedAlive) {
                expect(entityAfterUpdate.hasComponents(Immunity)).toBe(expectedHasGrowComps);
                expect(entityAfterUpdate.hasComponents(Satiety)).toBe(expectedHasGrowComps);
                expect(entityAfterUpdate.hasComponents(Thirst)).toBe(expectedHasGrowComps);
                expect(entityAfterUpdate.hasComponents(PotatoGhost)).toBe(expectedHasGhostComp);
                expect(entityAfterUpdate.hasComponents(VegetableState)).toBe(true);
                expect(entityAfterUpdate.hasComponents(GardenBedCellLink)).toBe(true);
                expect(entityAfterUpdate.hasComponents(VegetableMeta)).toBe(true);
            }
        });
    }
);
