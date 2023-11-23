'use strict'

const {Entity} = require('./entity.js');

module.exports.EntityManager = class EntityManager {
    #entities;
    #reusableEntityId;

    constructor() {
        this.#entities = [];
        this.#reusableEntityId = [];
    }

    create() {
        if(this.#reusableEntityId.length > 0) {
            return this.#entities[this.#reusableEntityId.pop()];
        } else {
            let entity = new Entity(this.#entities.length, 0);
            this.#entities[this.#entities.length] = entity;
            return entity;
        }
    }

    remove(entity) {
        if(this.isAlive(entity)) {
            this.#reusableEntityId.push(entity.personalId);
            this.#entities[entity.personalId] = new Entity(entity.personalId, entity.generation + 1);
        }
    }

    clear() {
        this.#entities = [];
        this.#reusableEntityId = [];
    }

    isAlive(entity) {
        return entity.equals(this.#entities[entity.personalId]);
    }

    snapshot() {
        let liveEntities = this.#entities.filter(entity => !this.#reusableEntityId.includes(entity.personalId));
        let deadEntities = this.#entities.filter(entity => this.#reusableEntityId.includes(entity.personalId));
        return {liveEntities, deadEntities};
    }

    restore(snapshot) {
        this.#entities = new Array(snapshot.liveEntities.length + snapshot.deadEntities.length);
        snapshot.liveEntities.forEach(entity => this.#entities[entity.personalId] = entity);
        snapshot.deadEntities.reverse().forEach(entity => {
            this.#entities[entity.personalId] = entity;
            this.#reusableEntityId.push(entity.personalId);
        });

        return this;
    }

};