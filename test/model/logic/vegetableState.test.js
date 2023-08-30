const {VegetableState, GrowSystem, lifeCycleStates, StateDetail} = require('../../../src/code/model/logic/vegetableState.js');
const {EntityComponentManager} = require('../../../src/code/model/gameEngine/entityComponentManager.js');
const {ComponentIdGenerator} = require('../../../src/code/model/gameEngine/componentIdGenerator.js');
const {EntityManager} = require('../../../src/code/model/gameEngine/entityManager.js');
const {EventManager} = require('../../../src/code/model/gameEngine/eventManager.js');
const {Fabric} = require('../../../src/code/model/logic/fabric.js');
const {VegetableMeta} = require('../../../src/code/model/logic/vegetableMeta.js');
const {Immunity} = require('../../../src/code/model/logic/immunity.js');
const {Satiety} = require('../../../src/code/model/logic/satiety.js');
const {Thirst} = require('../../../src/code/model/logic/thirst.js');

let fabric = null;
let manager = null;
let eventManager = null;
let worldMock = null;
function beforeEachSetting() {
    fabric = new Fabric({
        potato: {
            immunity: {
                max: 60,
                alertLevel1: 30,
                declineRatePerSeconds: 1,
                probability: 0.2
            },
            satiety: {
                max: 60,
                alertLevel1: 30,
                declineRatePerSeconds: 1
            },
            thirst: {
                max: 60,
                alertLevel1: 30,
                declineRatePerSeconds: 1
            }
        }
    });
    manager = new EntityComponentManager(new EntityManager(), new ComponentIdGenerator());
    manager.putSingletonEntity('fabric', fabric);

    eventManager = new EventManager();
    
    worldMock = {
        elapsedTime: 1000000,
        getEntityComponentManager: () => manager,
        getEventManager: () => eventManager,
        getGameLoop: function() {
            const et = this.elapsedTime;
            return {
                getElapsedTime: () => et
            }
        },
    };
};
beforeEach(beforeEachSetting);

describe.each([
    {hasBailerEvent: true, hasGrowcomps: true, nextState: lifeCycleStates.seed},
    {hasBailerEvent: false, hasGrowcomps: false, nextState: lifeCycleStates.sleepingSeed}
])(`update(groupName, world): vegetables state is 'sleepigSeed`,
    ({hasBailerEvent, hasGrowcomps, nextState}) => {
        beforeEach(beforeEachSetting);

        test(`vegetables state is 'sleepingSeed',
              hasBailerEvent ${hasBailerEvent}
              => nextState'${nextState.name}'`,
        () => {
            let entity = manager.createEntity();
            entity.put(vegetableState(lifeCycleStates.sleepingSeed, 1), new VegetableMeta('Potato'));
            manager.bindEntity(entity);
            if(hasBailerEvent) eventManager.writeEvent('bailer', {tool: 'bailer', cell: 'center'});
    
            let system = new GrowSystem(manager);
            system.update('udpate', worldMock);
    
            expect(entity.get(VegetableState).history.at(-1)).toBe(nextState);
            expect(entity.hasComponents(Immunity, Satiety, Thirst)).toBe(hasGrowcomps);
        });
    }
);

describe.each([
    {state: lifeCycleStates.seed, nextState: lifeCycleStates.seed, intervalInSeconds: 1, elapsedTime: 999},
    {state: lifeCycleStates.sprout, nextState: lifeCycleStates.sprout, intervalInSeconds: 1, elapsedTime: 999},
    {state: lifeCycleStates.child, nextState: lifeCycleStates.child, intervalInSeconds: 1, elapsedTime: 999},
    {state: lifeCycleStates.youth, nextState: lifeCycleStates.youth, intervalInSeconds: 1, elapsedTime: 999},

    {state: lifeCycleStates.seed, nextState: lifeCycleStates.sprout, intervalInSeconds: 1, elapsedTime: 1000},
    {state: lifeCycleStates.sprout, nextState: lifeCycleStates.child, intervalInSeconds: 1, elapsedTime: 1000},
    {state: lifeCycleStates.child, nextState: lifeCycleStates.youth, intervalInSeconds: 1, elapsedTime: 1000},
    {state: lifeCycleStates.youth, nextState: lifeCycleStates.adult, intervalInSeconds: 1, elapsedTime: 1000},

    {state: lifeCycleStates.seed, nextState: lifeCycleStates.sprout, intervalInSeconds: 1, elapsedTime: 1001},
    {state: lifeCycleStates.sprout, nextState: lifeCycleStates.child, intervalInSeconds: 1, elapsedTime: 1001},
    {state: lifeCycleStates.child, nextState: lifeCycleStates.youth, intervalInSeconds: 1, elapsedTime: 1001},
    {state: lifeCycleStates.youth, nextState: lifeCycleStates.adult, intervalInSeconds: 1, elapsedTime: 1001},

    {state: lifeCycleStates.adult, nextState: lifeCycleStates.adult, intervalInSeconds: 1, elapsedTime: 1000000},
    {state: lifeCycleStates.death, nextState: lifeCycleStates.death, intervalInSeconds: 1, elapsedTime: 1000000}
])(`update(groupName, world):`,
    ({state, nextState, intervalInSeconds, elapsedTime}) => {
        beforeEach(beforeEachSetting);

        test(`vegetables state is '${state.name}',
              intervalInSeconds ${intervalInSeconds},
              elapsedTime ${elapsedTime},
              currentState ${state}
              => nextState'${nextState.name}'`,
        () => {
            let entity = manager.createEntity();
            entity.put(vegetableState(state, intervalInSeconds));
            manager.bindEntity(entity);
            worldMock.elapsedTime = elapsedTime;
    
            let system = new GrowSystem(manager);
            system.update('udpate', worldMock);
    
            expect(entity.get(VegetableState).history.at(-1)).toBe(nextState);
        });
    }
);

function vegetableState(state, intervalInSeconds) {
    let result = VegetableState.of(
        StateDetail.of(intervalInSeconds, lifeCycleStates.seed),
        StateDetail.of(intervalInSeconds, lifeCycleStates.sprout),
        StateDetail.of(intervalInSeconds, lifeCycleStates.child),
        StateDetail.of(intervalInSeconds, lifeCycleStates.youth)
    );
    result.history.push(state);

    return result;
}