const {ImmunitySystem, Immunity} = require('../../../src/code/model/logic/immunity.js');
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
    {max: 10, declineRatePerSeconds: 1, updateNumber: 1, probability: 0.5, random: 0.5, expectedImmunity: 9, isDeath: false},
    {max: 10, declineRatePerSeconds: 2, updateNumber: 1, probability: 0.5, random: 0.5, expectedImmunity: 9.5, isDeath: false},
    {max: 10, declineRatePerSeconds: 4, updateNumber: 1, probability: 0.5, random: 0.5, expectedImmunity: 9.75, isDeath: false},
    {max: 10, declineRatePerSeconds: 1, updateNumber: 100, probability: 0.5, random: 0.5, expectedImmunity: 0, isDeath: true},
    {max: 10, declineRatePerSeconds: 2, updateNumber: 100, probability: 0.5, random: 0.5, expectedImmunity: 0, isDeath: true},
    {max: 10, declineRatePerSeconds: 4, updateNumber: 100, probability: 0.5, random: 0.5, expectedImmunity: 0, isDeath: true},
    {max: 10, declineRatePerSeconds: 1, updateNumber: 100, probability: 0.5, random: 0.6, expectedImmunity: 10, isDeath: false},
    {max: 10, declineRatePerSeconds: 2, updateNumber: 100, probability: 0.5, random: 0.6, expectedImmunity: 10, isDeath: false},
    {max: 10, declineRatePerSeconds: 4, updateNumber: 100, probability: 0.5, random: 0.6, expectedImmunity: 10, isDeath: false}
])(`update(groupName, world):`,
    ({max, declineRatePerSeconds, updateNumber, probability, random, expectedImmunity, isDeath}) => {
        beforeEach(beforeEachTest);

        test(`max ${max}, 
              declineRatePerSeconds ${declineRatePerSeconds}, 
              updateNumber ${updateNumber},
              probability ${probability},
              random ${random}
              => expectedImmunity ${expectedImmunity}, is death ${isDeath}`,
        () => {
            let entity = manager.createEntity();
            entity.put(Immunity.of(max, declineRatePerSeconds, probability), vegetableState());
            manager.bindEntity(entity); 

            let system = new ImmunitySystem(manager, () => random);
            for(let i = 0; i < updateNumber; i++) system.update('update', worldMock);

            expect(entity.get(Immunity).current).toBe(expectedImmunity);
            expect(entity.get(VegetableState).history.at(-1) == lifeCycleStates.death).toBe(isDeath);
        });
    }
);

describe.each([
    {max: 10, declineRatePerSeconds: 1, thereIsSprayerEvent: false, money: 10, expectedImmunity: 9, expectedMoney: 10},
    {max: 10, declineRatePerSeconds: 1, thereIsSprayerEvent: true, money: 10, expectedImmunity: 10, expectedMoney: 8},
    {max: 10, declineRatePerSeconds: 1, thereIsSprayerEvent: true, money: 1, expectedImmunity: 9, expectedMoney: 1}
])(`update(groupName, world):`,
    ({max, declineRatePerSeconds, thereIsSprayerEvent, money, expectedImmunity, expectedMoney}) => {
        beforeEach(beforeEachTest);

        test(`max ${max}, declineRatePerSeconds ${declineRatePerSeconds}, thereIsSprayerEvent ${thereIsSprayerEvent}, money: ${money} 
              => expectedImmunity ${expectedImmunity}, expectedMoney ${expectedMoney}`,
        () => {
            let entity = manager.createEntity();
            entity.put(Immunity.of(max, declineRatePerSeconds, 0.5), vegetableState());
            manager.bindEntity(entity); 
            if(thereIsSprayerEvent) eventManager.writeEvent('sprayer', {tool: 'sprayer', cell: 'center'});
            wallet.get(Wallet).sum = money;

            let system = new ImmunitySystem(manager, () => 0.5);
            system.update('update', worldMock);

            expect(entity.get(Immunity).current).toBe(expectedImmunity);
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