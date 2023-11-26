const {VegetableState, lifeCycleStates, StateDetail} = require('../../../src/code/model/logic/vegetableState.js');
const {PlantNewVegetableSystem} = require('../../../src/code/model/logic/plantNewVegetable.js');
const {EntityComponentManager} = require('../../../src/code/model/gameEngine/entityComponentManager.js');
const {ComponentIdGenerator} = require('../../../src/code/model/gameEngine/componentIdGenerator.js');
const {EntityManager} = require('../../../src/code/model/gameEngine/entityManager.js');
const {EventManager} = require('../../../src/code/model/gameEngine/eventManager.js');
const {GardenBedCellLink} = require('../../../src/code/model/logic/gardenBedCellLink.js');
const {VegetableMeta} = require('../../../src/code/model/logic/vegetableMeta.js');
const {Wallet} = require('../../../src/code/model/logic/wallet.js');
const {Grid} = require('../../../src/code/model/logic/store/grid.js');
const {SystemHandler} = require('../../../src/code/model/gameEngine/systemManager.js');

let manager = null;
let eventManager = null;
let wallet = null;
let grid = null;
function beforeEachTest() {
    manager = new EntityComponentManager(new EntityManager(), new ComponentIdGenerator());
    wallet = manager.createEntity().put(new Wallet(20, 2, 2, 3));
    grid = new Grid(4, 3);
    manager.putSingletonEntity('wallet', wallet);
    manager.putSingletonEntity('grid', grid);

    eventManager = new EventManager();
    
    worldMock = {
        getEntityComponentManager: () => manager,
        getEventManager: () => eventManager
    };
};

function p(x, y) {
    return {x, y, toString() {return `{x: ${this.x}, y: ${this.y}}`}};
}

function createVegetableState() {
    let result = VegetableState.of(
        StateDetail.of(3, lifeCycleStates.seed),
        StateDetail.of(40, lifeCycleStates.sprout),
        StateDetail.of(40, lifeCycleStates.child),
        StateDetail.of(40, lifeCycleStates.youth)
    );
    result.pushState(lifeCycleStates.sleepingSeed);

    return result;
}

function createVegetable(x, y) {
    let metaComp = new VegetableMeta('Potato');
    let cellLinkComp = new GardenBedCellLink(x, y);
    let vegetableState = createVegetableState();
    let vegetable = manager.createEntity().put(metaComp, cellLinkComp, vegetableState);
    manager.bindEntity(vegetable);
    return vegetable;
}

function systemHandler(system) {
    return new SystemHandler('PlantNewVegetableSystem', 'update', system, 0, 1);
}

describe.each([
    {seedsEventsCoordinates: [p(0, 0), p(1, 1), p(3, 2)],
    notEmptyCellsCoordinates: [p(0, 0), p(1, 1), p(3, 2)],
    money: 20, 
    seedsPrice: 2, 
    expectedNewVegetablesCoordinates: [], 
    expectedMoney: 20},

    {seedsEventsCoordinates: [],
    notEmptyCellsCoordinates: [],
    money: 20, 
    seedsPrice: 2, 
    expectedNewVegetablesCoordinates: [], 
    expectedMoney: 20},

    {seedsEventsCoordinates: [p(0, 0), p(1, 1), p(3, 2)],
    notEmptyCellsCoordinates: [],
    money: 20, 
    seedsPrice: 21, 
    expectedNewVegetablesCoordinates: [], 
    expectedMoney: 20},

    {seedsEventsCoordinates: [p(0, 0), p(1, 1), p(3, 2)],
    notEmptyCellsCoordinates: [],
    money: 20, 
    seedsPrice: 2, 
    expectedNewVegetablesCoordinates: [p(0, 0), p(1, 1), p(3, 2)], 
    expectedMoney: 14}
])(`update(groupName, world):`,
    ({seedsEventsCoordinates, notEmptyCellsCoordinates, money, seedsPrice, expectedNewVegetablesCoordinates, expectedMoney}) => {
        beforeEach(beforeEachTest);

        test(`seedsEventsCoordinates [${seedsEventsCoordinates}],
              notEmptyCellsCoordinates [${notEmptyCellsCoordinates}],
              money ${money},
              seedPrice ${seedsPrice}
              => expected new vegetables coordinates: ${expectedNewVegetablesCoordinates},
                 expectedMoney: ${expectedMoney},
                 not empty cells mustn't be changed,
                 grid cell has link to new vegetable,
                 new vegetable must have VegetableMeta, GardenBedCellLink and VegetableState components`,
        () => {
            seedsEventsCoordinates.forEach(pos => eventManager.writeEvent('seeds', {tool: 'seeds', cellX: pos.x, cellY: pos.y}));
            notEmptyCellsCoordinates.forEach(pos => grid.write(pos.x, pos.y, createVegetable(pos.x, pos.y)));
            wallet.get(Wallet).sum = money;
            wallet.get(Wallet).seedsPrice = seedsPrice;
            let gridClone = grid.map((x, y, entity) => entity);

            let system = new PlantNewVegetableSystem(() => new VegetableMeta('Potato'), () => createVegetableState());
            system.update(systemHandler(system), worldMock);

            expectedNewVegetablesCoordinates.forEach(pos => {
                expect(grid.get(pos.x, pos.y)).not.toBe(gridClone.get(pos.x, pos.y));
                expect(grid.get(pos.x, pos.y).hasComponents(VegetableMeta, GardenBedCellLink, VegetableState)).toBe(true);
            });
            expect(wallet.get(Wallet).sum).toEqual(expectedMoney);
            notEmptyCellsCoordinates.forEach(pos => {
                expect(grid.get(pos.x, pos.y)).toBe(gridClone.get(pos.x, pos.y));
            });
        });
    }
);