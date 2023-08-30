const {Thirst} = require('../../../src/code/model/logic/thirst.js');
const {ThirstSystem} = require('../../../src/code/model/logic/thirst.js');
const {EntityComponentManager} = require('../../../src/code/model/gameEngine/entityComponentManager.js');
const {ComponentIdGenerator} = require('../../../src/code/model/gameEngine/componentIdGenerator.js');
const {EntityManager} = require('../../../src/code/model/gameEngine/entityManager.js');
const {EventManager} = require('../../../src/code/model/gameEngine/eventManager.js');
const {VegetableState, lifeCycleStates, StateDetail} = require('../../../src/code/model/logic/vegetableState.js');

let manager = null;
let eventManager = null;
let worldMock = null;
function beforeEachTest(){
    manager = new EntityComponentManager(new EntityManager(), new ComponentIdGenerator());
    eventManager = new EventManager();

    worldMock = {
        getGameLoop: () => {
            return {
                getElapsedTime: () => 1000
            }
        },
        getEntityComponentManager: () => manager,
        getEventManager: () => eventManager
    };
};

describe.each([
    {max: 10, declineRatePerSeconds: 1, expected: 9, updateNumber: 1, isDeath: false},
    {max: 10, declineRatePerSeconds: 2, expected: 9.5, updateNumber: 1, isDeath: false},
    {max: 10, declineRatePerSeconds: 4, expected: 9.75, updateNumber: 1, isDeath: false},
    {max: 10, declineRatePerSeconds: 1, expected: 0, updateNumber: 100, isDeath: true},
    {max: 10, declineRatePerSeconds: 2, expected: 0, updateNumber: 100, isDeath: true},
    {max: 10, declineRatePerSeconds: 4, expected: 0, updateNumber: 100, isDeath: true},
])(`update(groupName, world):`,
    ({max, declineRatePerSeconds, expected, updateNumber, isDeath}) => {
        beforeEach(beforeEachTest);

        test(`max ${max}, declineRatePerSeconds ${declineRatePerSeconds}, updateNumber ${updateNumber} 
              => expected ${expected}, is death ${isDeath}`,
        () => {
            let entity = manager.createEntity();
            entity.put(Thirst.of(max, declineRatePerSeconds), vegetableState());
            manager.bindEntity(entity); 

            let system = new ThirstSystem(manager);
            for(let i = 0; i < updateNumber; i++) system.update('update', worldMock);

            expect(entity.get(Thirst).current).toBe(expected);
            expect(entity.get(VegetableState).history.at(-1) == lifeCycleStates.death).toBe(isDeath);
        });
    }
);

function vegetableState() {
    return VegetableState.of(
        StateDetail.of(10, lifeCycleStates.seed),
        StateDetail.of(10, lifeCycleStates.sprout),
        StateDetail.of(10, lifeCycleStates.child),
        StateDetail.of(10, lifeCycleStates.youth)
    );
}