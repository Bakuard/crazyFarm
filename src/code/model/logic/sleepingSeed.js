'use strict'

const {EntityMeta} = require('./growTimer.js');
const {Thirst} = require('./thirst.js');
const {Satiety} = require('./satiety.js');
const {Immunity} = require('./immunity.js');
const {GrowTimer, growStates} = require('./growTimer.js');

module.exports.SleepingSeedSystem = class SleepingSeedSystem {

    constructor(entityComponentManager) {
        this.filter = entityComponentManager.createFilter().allTags('sleeping seed');
    }

    update(groupName, world) {
        let manager = world.getEntityComponentManager();
        let buffer = manager.createCommandBuffer();
        let events = world.getEventManager();

        let event = events.readEvent('plant', 0);
        for(let i = 1; event != null; i++) {
            let entity = buffer.create();
            entity.put(new EntityMeta('Potato')).addTags('sleeping seed');
            buffer.bind(entity);
            event = events.readEvent('plant', i);
        }

        for(let entity of manager.select(this.filter)) {
            if(events.readEvent('water', 0)) {
                let updatedEntity = entity.clone().removeTags('sleeping seed').
                    put(
                        GrowTimer.of(growStates.seed, [10, 10, 10, 10, 10]),
                        Immunity.of(10, 1, 0.2),
                        Satiety.of(10, 1),
                        Thirst.of(10, 1)
                    );
                buffer.bind(updatedEntity);
            }
        }

        manager.flush(buffer);
        events.clearEventQueue('plant');
    }

};