const {Thirst} = require('../../../src/code/model/logic/thirst.js');
const {Satiety} = require('../../../src/code/model/logic/satiety.js');
const {Immunity} = require('../../../src/code/model/logic/immunity.js');
const {TomatoDeathSystem} = require('../../../src/code/model/logic/tomatoDeath.js');
const {EntityComponentManager} = require('../../../src/code/model/gameEngine/entityComponentManager.js');
const {ComponentIdGenerator} = require('../../../src/code/model/gameEngine/componentIdGenerator.js');
const {VegetableMeta} = require('../../../src/code/model/logic/vegetableMeta.js');
const {EntityManager} = require('../../../src/code/model/gameEngine/entityManager.js');
const {GardenBedCellLink} = require('../../../src/code/model/logic/gardenBedCellLink.js');
const {Fabric} = require('../../../src/code/model/logic/fabric.js');
const {VegetableState, lifeCycleStates, StateDetail} = require('../../../src/code/model/logic/vegetableState.js');
const {Grid} = require('../../../src/code/model/logic/store/grid.js');

let fabric = null;
let manager = null;
let worldMock = null;
let grid = null;
function beforeEachTest() {
    manager = new EntityComponentManager(new EntityManager(), new ComponentIdGenerator());
    fabric = new Fabric({
        tomato: {
            explosion: {
                child: 1,
                youth: 3,
                adult: 6
            }
        }
    });
    grid = new Grid(4, 3);
    manager.putSingletonEntity('fabric', fabric);
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

function createAndPrepareVegetable({cellX, cellY, typeName, currentState, previousState}) {
    let vegetable = manager.createEntity().put(
        new VegetableMeta(typeName),
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

describe.each([
    {
        vegetablesParam: [
            {
                cellX: 0,
                cellY: 0,
                typeName: 'Tomato',
                currentState: lifeCycleStates.death,
                previousState: lifeCycleStates.adult
            },
            {
                cellX: 1,
                cellY: 0,
                typeName: 'Tomato',
                currentState: lifeCycleStates.adult,
                previousState: lifeCycleStates.youth
            },
            {
                cellX: 0,
                cellY: 1,
                typeName: 'Potato',
                currentState: lifeCycleStates.adult,
                previousState: lifeCycleStates.youth
            },
            {
                cellX: 1,
                cellY: 1,
                typeName: 'Tomato',
                currentState: lifeCycleStates.adult,
                previousState: lifeCycleStates.youth
            },
        ],
        randomValueForChoosingNeighbours: 0.1,
        expectedVegetables: [
            {cellX: 0, cellY: 0, isAlive: false},
            {cellX: 1, cellY: 0, isAlive: false},
            {cellX: 0, cellY: 1, isAlive: true},
            {cellX: 1, cellY: 1, isAlive: false}
        ]
    },
    {
        vegetablesParam: [
            {
                cellX: 3,
                cellY: 1,
                typeName: 'Tomato',
                currentState: lifeCycleStates.death,
                previousState: lifeCycleStates.sprout
            }
        ],
        randomValueForChoosingNeighbours: 0.1,
        expectedVegetables: [
            {cellX: 3, cellY: 1, isAlive: true, hasGrowComps: false}
        ]
    }
])(`update(groupName, world):`,
    ({vegetablesParam, randomValueForChoosingNeighbours, expectedVegetables}) => {
        beforeEach(beforeEachTest);

        test(`vegetablesParam ${vegetablesParam.map(JSON.stringify)},
              randomValueForChoosingNeighbours ${randomValueForChoosingNeighbours}
              => expectedVegetables ${expectedVegetables.map(JSON.stringify)}`,
        () => {
            vegetablesParam.map(p => createAndPrepareVegetable(p));
            let actualVegetables = grid.clone(entity => entity);

            let system = new TomatoDeathSystem(manager, () => randomValueForChoosingNeighbours);
            system.update('update', worldMock);

            expectedVegetables.forEach(exp => {
                let vegetable = actualVegetables.get(exp.cellX, exp.cellY);
                expect(grid.get(exp.cellX, exp.cellY) != null).toBe(exp.isAlive);
                expect(manager.isAlive(vegetable)).toBe(exp.isAlive);
            });
        });
    }
);
