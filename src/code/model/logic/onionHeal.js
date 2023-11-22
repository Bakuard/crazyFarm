'use strict'

const {GardenBedCellLink} = require("./gardenBedCellLink");
const {Immunity} = require("./immunity");
const {VegetableMeta} = require("./vegetableMeta");
const {VegetableState, lifeCycleStates} = require("./vegetableState");

class OnionHealer {
    constructor(cells, currentCellNumber, cellNumberForChild, cellNumberForYouth, cellNumberForAdult, cellNumberForDeath) {
        this.cells = cells;
        this.currentCellNumber = currentCellNumber;
        this.cellNumberForChild = cellNumberForChild;
        this.cellNumberForYouth = cellNumberForYouth;
        this.cellNumberForAdult = cellNumberForAdult;
        this.cellNumberForDeath = cellNumberForDeath;
    }
}
module.exports.OnionHealer = OnionHealer;

class OnionHealSystem {
    constructor(entityComponentManager, onionHealerComponentFabric) {
        this.onionHealerComponentFabric = onionHealerComponentFabric;
        this.onionWithoutHillerCompFilter = entityComponentManager.createFilter().
            all(VegetableState, VegetableMeta, GardenBedCellLink).
            none(OnionHealer);
        this.onionWithHillerCompFilter = entityComponentManager.createFilter().
            all(OnionHealer, VegetableState);
    }

    update(systemHandler, world) {
        const eventManager = world.getEventManager();
        const manager = world.getEntityComponentManager();
        const buffer = manager.createCommandBuffer();
        const grid = manager.getSingletonEntity('grid');

        this.#addOnionHealerComp(manager, buffer, grid);
        this.#changeCellNumber(manager);
        this.#healNeigbours(manager, grid, eventManager);

        manager.flush(buffer);
    }

    #addOnionHealerComp(manager, buffer, grid) {
        const {child, youth, adult} = lifeCycleStates;

        for(let vegetable of manager.select(this.onionWithoutHillerCompFilter)) {
            const state = vegetable.get(VegetableState);
            const meta = vegetable.get(VegetableMeta);
            const cellLink = vegetable.get(GardenBedCellLink);

            if(meta.typeName == 'Onion' && state.currentIsOneOf(child, youth, adult)) {
                vegetable.put(this.onionHealerComponentFabric(state.current(), grid, {x: cellLink.cellX, y: cellLink.cellY}));
                buffer.bindEntity(vegetable);
            }
        }
    }

    #changeCellNumber(manager) {
        const {youth, adult} = lifeCycleStates;

        for(let vegetable of manager.select(this.onionWithHillerCompFilter)) {
            const onionHealer = vegetable.get(OnionHealer);
            const state = vegetable.get(VegetableState);

            if(state.current() == youth && (onionHealer.currentCellNumber != onionHealer.cellNumberForYouth)) {
                onionHealer.currentCellNumber = onionHealer.cellNumberForYouth;
            } else if(state.current() == adult && (onionHealer.currentCellNumber != onionHealer.cellNumberForAdult)) {
                onionHealer.currentCellNumber = onionHealer.cellNumberForAdult;
            }
        }
    }

    #healNeigbours(manager, grid, eventManager) {
        for(let vegetable of manager.select(this.onionWithHillerCompFilter)) {
            const onionHealer = vegetable.get(OnionHealer);
            const cells = onionHealer.cells.slice(0, onionHealer.currentCellNumber);

            for(let cell of onionHealer.cells) {
                const vegetable = grid.get(cell.x, cell.y);
                if(this.#canBeHealed(vegetable)) {
                    const immuntity = vegetable.get(Immunity);

                    if(immuntity.isAlarm()) eventManager.setFlag('gameStateWasChangedEvent');
                    
                    immuntity.current = immuntity.max;
                    immuntity.isSick = false;
                }
            }
        }
    }

    #canBeHealed(vegetable) {
        return vegetable && vegetable.hasComponents(Immunity);
    }
}
module.exports.OnionHealSystem = OnionHealSystem;