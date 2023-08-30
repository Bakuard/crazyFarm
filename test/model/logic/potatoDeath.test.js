const {Thirst} = require('../../../src/code/model/logic/thirst.js');
const {Satiety} = require('../../../src/code/model/logic/satiety.js');
const {Immunity} = require('../../../src/code/model/logic/immunity.js');
const {PotatoGhost, PotatoDeathSystem} = require('../../../src/code/model/logic/potatoDeath.js');
const {EntityComponentManager} = require('../../../src/code/model/gameEngine/entityComponentManager.js');
const {ComponentIdGenerator} = require('../../../src/code/model/gameEngine/componentIdGenerator.js');
const {VegetableMeta} = require('../../../src/code/model/logic/vegetableMeta.js');
const {EntityManager} = require('../../../src/code/model/gameEngine/entityManager.js');
const {GardenBedCell} = require('../../../src/code/model/logic/gardenBedCell.js');
const {GardenBedCellLink} = require('../../../src/code/model/logic/gardenBedCellLink.js');
const {Fabric} = require('../../../src/code/model/logic/fabric.js');
const {VegetableState, lifeCycleStates, StateDetail} = require('../../../src/code/model/logic/vegetableState.js');

let fabric = null;
let manager = null;
let compGeneratorId = null;
let worldMock = null;
function beforeEachTest() {
    fabric = new Fabric({
        potato: {
            ghost: {
                timeInMillis: 2000
            }
        }
    });
    compGeneratorId = new ComponentIdGenerator();
    manager = new EntityComponentManager(new EntityManager(), compGeneratorId);
    manager.putSingletonEntity('fabric', fabric);

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
            let cell = manager.createEntity().put(new GardenBedCell(0, 0));
            let entity = manager.createEntity().put(
                new PotatoGhost(ghostDurationInMillis),
                new GardenBedCellLink(cell)
            );
            cell.get(GardenBedCell).entity = entity;
            manager.bindEntity(entity);
            manager.bindEntity(cell);
            worldMock.elapsedTime = elapsedTime;

            let system = new PotatoDeathSystem(manager, fabric);
            system.update('update', worldMock);

            expect(manager.isAlive(entity)).toBe(isAlive);
            expect(cell.get(GardenBedCell).entity === null).toBe(isCellEmpty);
        });
    }
);

describe.each([
    {state: lifeCycleStates.seed, hasGrowComps: true, hasGhostComp: false},
    {state: lifeCycleStates.cell, hasGrowComps: true, hasGhostComp: false},
    {state: lifeCycleStates.sprout, hasGrowComps: true, hasGhostComp: false},
    {state: lifeCycleStates.youth, hasGrowComps: true, hasGhostComp: false},
    {state: lifeCycleStates.adult, hasGrowComps: true, hasGhostComp: false},
    {state: lifeCycleStates.death, hasGrowComps: false, hasGhostComp: true}
])(`update(groupName, world):`,
    ({state, hasGrowComps, hasGhostComp}) => {
        beforeEach(beforeEachTest);

        test(`state ${state}
              => hasGrowComps ${hasGrowComps},
                 hasGhostComp ${hasGhostComp}`,
        () => {
            let cell = manager.createEntity().put(new GardenBedCell(0, 0));
            let entity = manager.createEntity().put(
                new VegetableMeta('Potato'),
                new GardenBedCellLink(cell),
                vegetableState(state),
                Immunity.of(60, 1, 0.2),
                Satiety.of(60, 1),
                Thirst.of(60, 1)
            );
            cell.get(GardenBedCell).entity = entity;
            manager.bindEntity(entity);
            manager.bindEntity(cell);

            let system = new PotatoDeathSystem(manager, fabric);
            system.update('update', worldMock);

            expect(entity.hasComponents(Immunity)).toBe(hasGrowComps);
            expect(entity.hasComponents(Satiety)).toBe(hasGrowComps);
            expect(entity.hasComponents(Thirst)).toBe(hasGrowComps);
            expect(entity.hasComponents(PotatoGhost)).toBe(hasGhostComp);
            expect(entity.hasComponents(VegetableState)).toBe(true);
            expect(entity.hasComponents(GardenBedCellLink)).toBe(true);
            expect(entity.hasComponents(VegetableMeta)).toBe(true);
        });
    }
);

function vegetableState(state) {
    let result = VegetableState.of(
        StateDetail.of(10, lifeCycleStates.seed),
        StateDetail.of(10, lifeCycleStates.sprout),
        StateDetail.of(10, lifeCycleStates.child),
        StateDetail.of(10, lifeCycleStates.youth)
    );
    result.history.push(state);

    return result;
}