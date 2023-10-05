const {EntityComponentManager} = require('../../../src/code/model/gameEngine/entityComponentManager.js');
const {ComponentIdGenerator} = require('../../../src/code/model/gameEngine/componentIdGenerator.js');
const {EntityManager} = require('../../../src/code/model/gameEngine/entityManager.js');
const {TimeUtil} = require('../../../src/code/model/gameEngine/timeUtil.js');

const {SaveGameSystem} = require('../../../src/code/model/logic/saveGame.js');
const {LoadGameSystem} = require('../../../src/code/model/logic/loadGame.js');

const {Wallet} = require('../../../src/code/model/logic/wallet.js');
const {VegetableState, StateDetail, lifeCycleStates} = require('../../../src/code/model/logic/vegetableState.js');
const {Immunity} = require('../../../src/code/model/logic/immunity.js');
const {Satiety} = require('../../../src/code/model/logic/satiety.js');
const {Thirst} = require('../../../src/code/model/logic/thirst.js');
const {PotatoGhost} = require('../../../src/code/model/logic/potatoDeath.js');
const {TomatoExplosion} = require('../../../src/code/model/logic/tomatoDeath.js');
const {GardenBedCellLink} = require('../../../src/code/model/logic/gardenBedCellLink.js');
const {VegetableMeta} = require('../../../src/code/model/logic/vegetableMeta.js');
const {Grid} = require('../../../src/code/model/logic/store/grid.js');
const {Fabric} = require('../../../src/code/model/logic/fabric.js');
const {settings} = require('../../resources/settings.js');

let mockGameRepository = null;
let manager = null;
let worldMock = null;
let wallet = null;
let grid = null;
let fabric = null;

function createNewEmptyGameWorld() {
    manager = new EntityComponentManager(new EntityManager(), new ComponentIdGenerator());
    mockGameRepository = {
        save: async function save(fullGameState) {
            mockGameRepository.fullGameState = fullGameState;
        },
        load: async function load(userId) {}
    }
    worldMock = {
        getEntityComponentManager: () => manager
    };
    wallet = manager.createEntity().put(new Wallet(10, 2, 2, 3));
    manager.putSingletonEntity('wallet', wallet);
    grid = new Grid(4, 3);
    manager.putSingletonEntity('grid', grid);
    fabric = new Fabric(settings);
    manager.putSingletonEntity('fabric', fabric);
}

function getEntitiesFromGrid() {
    return [
        grid.get(0, 0),
        grid.get(1, 0),
        grid.get(2, 0),
        grid.get(3, 0),
        grid.get(0, 1),
        grid.get(1, 1),
        grid.get(2, 1),
        grid.get(3, 1),
        grid.get(0, 2),
        grid.get(1, 2),
        grid.get(2, 2),
        grid.get(3, 2)
    ];
}

function vegetableState(currentTimeInMillis, intervalsInSeconds, stateHistory) {
    let result = VegetableState.of(
        new StateDetail(currentTimeInMillis[0], intervalsInSeconds[0], lifeCycleStates.seed),
        new StateDetail(currentTimeInMillis[1], intervalsInSeconds[1], lifeCycleStates.sprout),
        new StateDetail(currentTimeInMillis[2], intervalsInSeconds[2], lifeCycleStates.child),
        new StateDetail(currentTimeInMillis[3], intervalsInSeconds[3], lifeCycleStates.youth)
    );
    result.history = stateHistory;

    return result;
}

function createPotatoSleepingSeed({x, y}) {
    let entity = manager.createEntity().
            put(
                new VegetableMeta('Potato'),
                vegetableState([0, 30, 25, 15], [3, 40, 40, 40], [lifeCycleStates.sleepingSeed]),
                new GardenBedCellLink(x, y)
            );
    manager.bindEntity(entity);
    grid.write(x, y, entity);
    return entity;
}

function createGrowingPotato({x, y, stateHistory}) {
    let entity = manager.createEntity().
            put(
                new VegetableMeta('Potato'),
                vegetableState([0, 30, 25, 15], [3, 40, 40, 40], stateHistory),
                new GardenBedCellLink(x, y),
                new Immunity(60, 20, false, 1, 0.2),
                new Thirst(60, 20, 1),
                new Satiety(60, 47, 1)
            );
    manager.bindEntity(entity);
    grid.write(x, y, entity);
    return entity;
}

function createDeadPotato({x, y}) {
    let entity = manager.createEntity().
            put(
                new VegetableMeta('Potato'),
                vegetableState([0, 30, 25, 15], [3, 40, 40, 40], lifeCycleStates.slice(lifeCycleStates.sleepingSeed, lifeCycleStates.death)),
                new GardenBedCellLink(x, y),
                new PotatoGhost(25000),
                new TomatoExplosion(3)
            );
    manager.bindEntity(entity);
    grid.write(x, y, entity);
    return entity;
}

describe.each([
    {
        filled: 100,
        vegetables: [
            {x: 0, y: 0, type: 'sleepingSeed'},
            {x: 1, y: 0, type: 'sleepingSeed'},
            {x: 2, y: 0, type: 'sleepingSeed'},
            {x: 3, y: 0, type: 'sleepingSeed'},
            {x: 0, y: 1, type: 'growing', stateHistory: lifeCycleStates.slice(lifeCycleStates.sleepingSeed, lifeCycleStates.seed)},
            {x: 1, y: 1, type: 'growing', stateHistory: lifeCycleStates.slice(lifeCycleStates.sleepingSeed, lifeCycleStates.sprout)},
            {x: 2, y: 1, type: 'growing', stateHistory: lifeCycleStates.slice(lifeCycleStates.sleepingSeed, lifeCycleStates.child)},
            {x: 3, y: 1, type: 'growing', stateHistory: lifeCycleStates.slice(lifeCycleStates.sleepingSeed, lifeCycleStates.adult)},
            {x: 0, y: 2, type: 'dead'},
            {x: 1, y: 2, type: 'dead'},
            {x: 2, y: 2, type: 'dead'},
            {x: 3, y: 2, type: 'dead'}
        ]   
    },
    {
        filled: 50,
        vegetables: [
            {x: 0, y: 0, type: 'sleepingSeed'},
            {x: 1, y: 0, type: 'null'},
            {x: 2, y: 0, type: 'sleepingSeed'},
            {x: 3, y: 0, type: 'null'},
            {x: 0, y: 1, type: 'growing', stateHistory: lifeCycleStates.slice(lifeCycleStates.sleepingSeed, lifeCycleStates.seed)},
            {x: 1, y: 1, type: 'null'},
            {x: 2, y: 1, type: 'growing', stateHistory: lifeCycleStates.slice(lifeCycleStates.sleepingSeed, lifeCycleStates.child)},
            {x: 3, y: 1, type: 'null'},
            {x: 0, y: 2, type: 'dead'},
            {x: 1, y: 2, type: 'null'},
            {x: 2, y: 2, type: 'dead'},
            {x: 3, y: 2, type: 'null'}
        ]   
    },
    {
        filled: 0,
        vegetables: []
    }
])(`SaveGameSystem.update(groupName, world) and InitLogicSystem.update(groupName, world):`,
    ({filled, vegetables}) => {
        test(`the grid is ${filled}% full`,
        () => {
            createNewEmptyGameWorld();
            let expected = vegetables.map(v => {
                let result = null;
                if(v.type == 'sleepingSeed') result = createPotatoSleepingSeed(v);
                else if(v.type == 'growing') result = createGrowingPotato(v);
                else if(v.type == 'dead') result = createDeadPotato(v);
                return result;
            });
            let saveSystem = new SaveGameSystem(1, mockGameRepository, new TimeUtil());
            let loadSystem = new LoadGameSystem(1);
            
            saveSystem.update('stop', worldMock);
            let fullGameState = mockGameRepository.fullGameState;
            createNewEmptyGameWorld();
            manager.putSingletonEntity('fullGameState', fullGameState);
            loadSystem.update('start', worldMock);
        
            let actual = getEntitiesFromGrid();
            expect(actual).containsEntitiesInTheSameOrder(...expected); 
        });
    }
);

