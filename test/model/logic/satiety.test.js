const {SatietySystem, Satiety} = require('../../../src/code/model/logic/satiety.js');
const {EntityComponentManager} = require('../../../src/code/model/gameEngine/entityComponentManager.js');
const {ComponentIdGenerator} = require('../../../src/code/model/gameEngine/componentIdGenerator.js');
const {EntityManager} = require('../../../src/code/model/gameEngine/entityManager.js');
const {EventManager} = require('../../../src/code/model/gameEngine/eventManager.js');
const {Wallet} = require('../../../src/code/model/logic/wallet.js');
const {VegetableState, lifeCycleStates, StateDetail} = require('../../../src/code/model/logic/vegetableState.js');

let manager = null;
let eventManager = null;
let wallet = null;
let worldMock = null;
function beforeEachTest() {
    manager = new EntityComponentManager(new EntityManager(), new ComponentIdGenerator());
    wallet = manager.createEntity().put(new Wallet(10, 2, 2, 3));
    manager.putSingletonEntity('wallet', wallet);

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
    {max: 10, declineRatePerSeconds: 1, updateNumber: 1, expectedSatiety: 9, isDeath: false},
    {max: 10, declineRatePerSeconds: 2, updateNumber: 1, expectedSatiety: 9.5, isDeath: false},
    {max: 10, declineRatePerSeconds: 4, updateNumber: 1, expectedSatiety: 9.75, isDeath: false},
    {max: 10, declineRatePerSeconds: 1, updateNumber: 100, expectedSatiety: 0, isDeath: true},
    {max: 10, declineRatePerSeconds: 2, updateNumber: 100, expectedSatiety: 0, isDeath: true},
    {max: 10, declineRatePerSeconds: 4, updateNumber: 100, expectedSatiety: 0, isDeath: true},
])(`update(groupName, world):`,
    ({max, declineRatePerSeconds, updateNumber, expectedSatiety, isDeath}) => {
        beforeEach(beforeEachTest);

        test(`max ${max}, declineRatePerSeconds ${declineRatePerSeconds}, updateNumber ${updateNumber} 
              => expectedSatiety ${expectedSatiety}, is death ${isDeath}`,
        () => {
            let entity = manager.createEntity();
            entity.put(Satiety.of(max, declineRatePerSeconds), vegetableState());
            manager.bindEntity(entity); 

            let system = new SatietySystem(manager);
            for(let i = 0; i < updateNumber; i++) system.update('update', worldMock);

            expect(entity.get(Satiety).current).toBe(expectedSatiety);
            expect(entity.get(VegetableState).history.at(-1) == lifeCycleStates.death).toBe(isDeath);
        });
    }
);
    
describe.each([
    {max: 10, declineRatePerSeconds: 1, thereIsFertiLizerEvent: false, money: 10, expectedSatiety: 9, expectedMoney: 10},
    {max: 10, declineRatePerSeconds: 1, thereIsFertiLizerEvent: true, money: 10, expectedSatiety: 10, expectedMoney: 8},
    {max: 10, declineRatePerSeconds: 1, thereIsFertiLizerEvent: true, money: 1, expectedSatiety: 9, expectedMoney: 1}
])(`update(groupName, world):`,
    ({max, declineRatePerSeconds, thereIsFertiLizerEvent, money, expectedSatiety, expectedMoney}) => {
        beforeEach(beforeEachTest);

        test(`max ${max}, declineRatePerSeconds ${declineRatePerSeconds}, thereIsFertiLizerEvent ${thereIsFertiLizerEvent}, money: ${money} 
              => expectedSatiety ${expectedSatiety}, expectedMoney ${expectedMoney}`,
        () => {
            let entity = manager.createEntity();
            entity.put(Satiety.of(max, declineRatePerSeconds), vegetableState());
            manager.bindEntity(entity); 
            if(thereIsFertiLizerEvent) eventManager.writeEvent('fertilizer', {tool: 'fertilizer', cell: 'center'});
            wallet.get(Wallet).sum = money;

            let system = new SatietySystem(manager);
            system.update('update', worldMock);

            expect(entity.get(Satiety).current).toBe(expectedSatiety);
            expect(wallet.get(Wallet).sum).toBe(expectedMoney);
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