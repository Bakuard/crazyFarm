'use strict'

const {Entity} = require('./entity.js');
const {CommandBuffer} = require('./commandBuffer.js');
const BitSet = require('bitset');
const exceptions = require('../exception/exceptions.js');
const e = require('express');

class Archetype {
    bitmask;
    entities;

    constructor(bitmask) {
        this.bitmask = bitmask;
        this.entities = [];
    }

    add(entity) {
        this.entities.push(entity);
    }

    remove(entity) {
        let index = this.entities.findIndex(e => e.equals(entity));
        if(index >= 0) {
            this.entities[index] = this.entities.at(-1);
            --this.entities.length;
        }
    }

    isMatch(bitmask) {
        return this.bitmask.equals(bitmask);
    }

    [Symbol.iterator]() {
        return {
            currentIndex: 0,
            entities: this.entities,
            next() {
                return this.currentIndex < this.entities.length ?
                        {value: this.entities[this.currentIndex++], done: false} :
                        {done: true}
            }
        };
    }
}

module.exports.EntityFilter = class EntityFilter {
    #allMath;
    #oneOfMatch;
    #noneMatch;

    constructor() {
        this.#allMath = new BitSet();
        this.#oneOfMatch = new BitSet();
        this.#noneMatch = new BitSet();
    }

    all(...componentTypes) {
        componentTypes.forEach(c => this.#allMath.set(c.prototype.componentTypeId, 1));
        return this;
    }

    oneOf(...componentTypes) {
        componentTypes.forEach(c => this.#oneOfMatch.set(c.prototype.componentTypeId, 1));
        return this;
    }

    none(...componentTypes) {
        componentTypes.forEach(c => this.#noneMatch.set(c.prototype.componentTypeId, 1));
        return this;
    }

    isMatch(componentsBitMask) {
        if(!this.#allMath.isEmpty() && !this.#allMath.and(componentsBitMask).equals(this.#allMath))
            return false;

        if(!this.#oneOfMatch.isEmpty() && this.#oneOfMatch.and(componentsBitMask).isEmpty())
            return false;
        
        if(!this.#noneMatch.isEmpty() && !this.#noneMatch.and(componentsBitMask).isEmpty())
            return false;
        
        return true;
    }

};

module.exports.EntityComponentManager = class EntityComponentManager {

    #entityManager;

    #emptyArchetype;
    #arhytypes;
    #archytypesByEntityId;

    #lastComponentTypeId;

    constructor(entityManager) {
        this.#entityManager = entityManager;

        this.#emptyArchetype = new Archetype(new BitSet());
        this.#arhytypes = [this.#emptyArchetype];
        this.#archytypesByEntityId = [];
        this.#lastComponentTypeId = 0;
    }

    createEntity() {
        return this.#entityManager.create();
    }

    removeEntity(entity) {
        this.#entityManager.remove(entity);
        this.#archytypesByEntityId[entity.personalId]?.remove(entity);
        this.#archytypesByEntityId[entity.personalId] = null;
    }

    isAlive(entity) {
        return this.#entityManager.isAlive(entity);
    }

    bindEntity(entity) {
        if(this.#entityManager.isAlive(entity)) {
            let mask = this.#createBitMaskBy(entity);
            let archytype = this.#archytypesByEntityId[entity.personalId];
            if(!archytype) {
                archytype = this.#findOrCreateArhytype(mask);
                archytype.add(entity);
            } else if(!archytype.isMatch(mask)) {
                archytype.remove(entity);
                archytype = this.#findOrCreateArhytype(mask);
                archytype.add(entity);
            }
            this.#archytypesByEntityId[entity.personalId] = archytype;
        }
    }

    *select(entityFilter) {
        for(let archetype of this.#arhytypes) {
            if(entityFilter.isMatch(archetype.bitmask)) {
                for(let entity of archetype) {
                    yield entity;
                }
            }
        }
    }

    createCommandBuffer() {
        return new CommandBuffer(this.#entityManager);
    }

    flush(commandBuffer) {
        
    }

    registerComponents(componentTypes) {
        for(let componentType of componentTypes) {
            componentType.prototype.componentTypeId = this.#lastComponentTypeId++;
        }
    }


    #findOrCreateArhytype(bitmask) {
        let archytype = this.#arhytypes.find(archytype => archytype.isMatch(bitmask));
        if(!archytype) {
            archytype = new Archetype(bitmask);
            this.#arhytypes.push(archytype);
        }
        return archytype;
    }

    #createBitMaskBy(entity) {
        let mask = new BitSet();
        Object.entries(entity).
            filter(pair => !Entity.undeletableKeys.includes(pair[0])).
            map(pair => pair[1]).
            forEach(component => {
                let prototype = Object.getPrototypeOf(component);
                if(prototype.componentTypeId === undefined) {
                    throw new exceptions.UnregisteredComponentException(
                        'unexpectedException',
                        `Unregister componentType=${prototype.constructor.name}`
                    );
                }
                mask.set(prototype.componentTypeId, 1);
            });
        return mask;
    }

};