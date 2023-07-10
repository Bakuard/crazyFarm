'use strict'

const {Thirst} = require('./thirst.js');
const {Satiety} = require('./satiety.js');
const {Immunity} = require('./immunity.js');
const {VegetableMeta} = require('./vegetableMeta.js');
const {PotatoGhost} = require('./potatoDeath.js');
const {GrowTimer} = require('./growTimer.js');

module.exports.DeathSystem = class DeathSystem {
    liveFilter;
    constructor(entityComponentManager) {
        this.liveFilter = entityComponentManager.createFilter().all(Thirst, Satiety, Immunity, VegetableMeta);
    }

    update(groupName, world) {
        let manager = world.getEntityComponentManager();
        let buffer = manager.createCommandBuffer();

        for(let entity of manager.select(this.liveFilter)) {
            let vegetableMeta = entity.get(VegetableMeta);
            let thirst = entity.get(Thirst);
            let satiety = entity.get(Satiety);
            let immunity = entity.get(Immunity);

            if(thirst.current <= 0 || satiety.current <= 0 || immunity.current <= 0) {
                if(vegetableMeta.typeName == 'Potato') {
                    buffer.bind(entity.remove(Thirst, Satiety, Immunity, GrowTimer).
                        put(new PotatoGhost(10000)));
                }
            }
        }

        manager.flush(buffer);
    }
};