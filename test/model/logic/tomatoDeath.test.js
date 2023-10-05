const {Thirst} = require('../../../src/code/model/logic/thirst.js');
const {Satiety} = require('../../../src/code/model/logic/satiety.js');
const {Immunity} = require('../../../src/code/model/logic/immunity.js');
const {TomatoExplosion, TomatoDeathSystem} = require('../../../src/code/model/logic/tomatoDeath.js');
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
    fabric = new Fabric({
        tomato: {
            explosion: {
                child: 1,
                youth: 3,
                adult: 6
            }
        }
    });
    manager = new EntityComponentManager(new EntityManager(), new ComponentIdGenerator());
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
    {state: lifeCycleStates.sleepingSeed, hasGrowComps: true, hasTomatoExplosionComp: false},
    {state: lifeCycleStates.seed, previousState: lifeCycleStates.sleepingSeed, hasGrowComps: true, hasTomatoExplosionComp: false},
    {state: lifeCycleStates.sprout, previousState: lifeCycleStates.seed, hasGrowComps: true, hasTomatoExplosionComp: false},
    {state: lifeCycleStates.child, previousState: lifeCycleStates.sprout, hasGrowComps: true, hasTomatoExplosionComp: false},
    {state: lifeCycleStates.youth, previousState: lifeCycleStates.child, hasGrowComps: true, hasTomatoExplosionComp: false},
    {state: lifeCycleStates.adult, previousState: lifeCycleStates.youth, hasGrowComps: true, hasTomatoExplosionComp: false},

    {state: lifeCycleStates.death, previousState: lifeCycleStates.sleepingSeed, hasGrowComps: false, hasTomatoExplosionComp: false},
    {state: lifeCycleStates.death, previousState: lifeCycleStates.seed, hasGrowComps: false, hasTomatoExplosionComp: false},
    {state: lifeCycleStates.death, previousState: lifeCycleStates.sprout, hasGrowComps: false, hasTomatoExplosionComp: false},
    {state: lifeCycleStates.death, previousState: lifeCycleStates.child, hasGrowComps: false, hasTomatoExplosionComp: true},
    {state: lifeCycleStates.death, previousState: lifeCycleStates.youth, hasGrowComps: false, hasTomatoExplosionComp: true},
    {state: lifeCycleStates.death, previousState: lifeCycleStates.adult, hasGrowComps: false, hasTomatoExplosionComp: true}
])(`update(groupName, world):`,
    ({state, previousState, hasGrowComps, hasTomatoExplosionComp}) => {
        beforeEach(beforeEachTest);

        test(`state ${state},
              previousState ${previousState}
              => hasGrowComps ${hasGrowComps},
                 hasTomatoExplosionComp ${hasTomatoExplosionComp}`,
        () => {
            let entity = manager.createEntity().put(
                new VegetableMeta('Tomato'),
                new GardenBedCellLink(0, 0),
                vegetableState(previousState, state),
                Immunity.of(60, 1, 0.2),
                Satiety.of(60, 1),
                Thirst.of(60, 1)
            );
            manager.bindEntity(entity);
            grid.write(0, 0, entity);

            let system = new TomatoDeathSystem(manager, fabric);
            system.update('update', worldMock);

            expect(entity.hasComponents(Immunity)).toBe(hasGrowComps);
            expect(entity.hasComponents(Satiety)).toBe(hasGrowComps);
            expect(entity.hasComponents(Thirst)).toBe(hasGrowComps);
            expect(entity.hasComponents(TomatoExplosion)).toBe(hasTomatoExplosionComp);
            expect(entity.hasComponents(VegetableState)).toBe(true);
            expect(entity.hasComponents(GardenBedCellLink)).toBe(true);
            expect(entity.hasComponents(VegetableMeta)).toBe(true);
        });
    }
);
