'use strict'

const {EntityFilter} = require('../gameEngine/entityComponentManager.js');
const {Thirst} = require('./thirst.js');
const {Satiety} = require('./satiety.js');
const {Immunity} = require('./immunity.js');
const {EntityMeta} = require('./entityMeta.js');

module.exports.PotatoGhost = class PotatoGhost {
    constructor(timeInMillis) {
        this.timeInMillis = timeInMillis;
    }
};

let liveFilter = new EntityFilter().all(Thirst, Satiety, Immunity, EntityMeta);
let deadFilter = new EntityFilter().all(PotatoGhost);
module.exports.PotatoDeathSystem = class PotatoDeathSystem {
    update(groupName, world) {
        for(let entity of world.getEntityComponentManager().select(liveFilter)) {
            let entityMeta = entity.get(EntityMeta);
            let thirst = entity.get(Thirst);
            let satiety = entity.get(Satiety);
            let immunity = entity.get(Immunity);

            if(entityMeta.typeName == 'Potato'
               && (thirst.current <= 0 || satiety.current <= 0 || immunity.current <= 0)) {
                entity.clear();
                entity.put(new PotatoGhost(5000));
                world.getEntityComponentManager().bindEntity(entity);
            }
        }

        let elapsedTime = world.getGameLoop().getElapsedTime();
        let entityComponentManager = world.getEntityComponentManager();
        for(let entity of entityComponentManager.select(deadFilter)) {
            let potatoGhost = entity.get(PotatoGhost);

            potatoGhost.timeInMillis = Math.max(0, potatoGhost.timeInMillis - elapsedTime);
            if(potatoGhost.timeInMillis == 0) {
                entityComponentManager.removeEntity(entity);
            }
        }
    }
};