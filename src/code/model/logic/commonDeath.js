'use strict'

const {EntityFilter} = require('../gameEngine/entityComponentManager.js');
const {Thirst} = require('./thirst.js');
const {Satiety} = require('./satiety.js');
const {Immunity} = require('./immunity.js');
const {EntityMeta} = require('./entityMeta.js');
const {PotatoGhost} = require('./potatoDeath.js');

module.exports.DeathSystem = class DeathSystem {
    liveFilter;
    constructor() {
        this.liveFilter = new EntityFilter().all(Thirst, Satiety, Immunity, EntityMeta);
    }

    update(groupName, world) {
        let manager = world.getEntityComponentManager();
        let buffer = manager.createCommandBuffer();

        for(let entity of manager.select(this.liveFilter)) {
            let entityMeta = entity.get(EntityMeta);
            let thirst = entity.get(Thirst);
            let satiety = entity.get(Satiety);
            let immunity = entity.get(Immunity);

            if(thirst.current <= 0 || satiety.current <= 0 || immunity.current <= 0) {
                if(entityMeta.typeName == 'Potato') {
                    buffer.bind(entity.clone().clear().put(new PotatoGhost(5000)));
                }
            }
        }

        manager.flush(buffer);
    }
};