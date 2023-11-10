'use strict'

const {Wallet} = require('./wallet.js');

class Satiety {
    static of(max, declineRatePerSeconds, alarmLevel) {
        return new Satiety(max, max, declineRatePerSeconds, alarmLevel);
    }

    constructor(max, current, declineRatePerSeconds, alarmLevel) {
        this.max = max;
        this.current = current;
        this.declineRatePerSeconds = declineRatePerSeconds;
        this.alarmLevel = alarmLevel;
    }

    isAlarm() {
        return this.current <= this.alarmLevel;
    }
};
module.exports.Satiety = Satiety;

module.exports.SatietySystem = class SatietySystem {
    constructor(entityComponentManager) {
        this.filter = entityComponentManager.createFilter().all(Satiety).noneTags('dead');
    }

    update(systemHandler, world) {
        const manager = world.getEntityComponentManager();
        const eventManager = world.getEventManager();
        const elapsedTime = world.getGameLoop().getElapsedTime();
        const grid = manager.getSingletonEntity('grid');
        const wallet = manager.getSingletonEntity('wallet').get(Wallet);
        const buffer = manager.createCommandBuffer();
        
        for(let entity of manager.select(this.filter)) {
            const satiety = entity.get(Satiety);
            const isAlarm = satiety.isAlarm();

            satiety.current = Math.max(0, satiety.current - elapsedTime / 1000 / satiety.declineRatePerSeconds);

            if(satiety.current == 0) {
                entity.addTags('dead');
                buffer.bindEntity(entity);
            }

            if(satiety.isAlarm() != isAlarm) eventManager.setFlag('gameStateWasChangedEvent');
        }

        eventManager.forEachEvent('fertilizer', (event, index) => {
            const vegetable = grid.get(event.cellX, event.cellY);
            if(this.#canFertilize(vegetable, wallet)) {
                const satiety = vegetable.get(Satiety);

                satiety.current = satiety.max;
                wallet.sum -= wallet.fertilizerPrice;

                eventManager.setFlag('gameStateWasChangedEvent');
            }
        });

        manager.flush(buffer);
        eventManager.clearEventQueue('fertilizer');
    }

    #canFertilize(vegetable, wallet) {
        return Boolean(
            vegetable
            && vegetable.hasComponents(Satiety)
            && wallet.sum >= wallet.fertilizerPrice
        );
    }
};