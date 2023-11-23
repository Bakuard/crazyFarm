'use strict'

const {CommandBuffer} = require('./commandBuffer.js');
const BitSet = require('bitset');
const exceptions = require('../exception/exceptions.js');

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

    size() {
        return this.entities.length;
    }

    get(index) {
        return this.entities[index];
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

class EntityFilter {

    #componentIdGenerator;
    #allMatch;
    #oneOfMatch;
    #noneMatch;

    constructor(componentIdGenerator) {
        this.#componentIdGenerator = componentIdGenerator;
        this.#allMatch = new BitSet();
        this.#oneOfMatch = new BitSet();
        this.#noneMatch = new BitSet();
    }

    all(...componentTypes) {
        componentTypes.forEach(c => {
            let componentTypeId = this.#componentIdGenerator.getOrAssignIdForComponent(c);
            this.#allMatch.set(componentTypeId, 1);
        });
        return this;
    }

    oneOf(...componentTypes) {
        componentTypes.forEach(c => {
            let componentTypeId = this.#componentIdGenerator.getOrAssignIdForComponent(c);
            this.#oneOfMatch.set(componentTypeId, 1);
        });
        return this;
    }

    none(...componentTypes) {
        componentTypes.forEach(c => {
            let componentTypeId = this.#componentIdGenerator.getOrAssignIdForComponent(c);
            this.#noneMatch.set(componentTypeId, 1);
        });
        return this;
    }

    allTags(...tags) {
        tags.forEach(tag => {
            let tagId = this.#componentIdGenerator.getOrAssignIdForTag(tag);
            this.#allMatch.set(tagId, 1);
        });
        return this;
    }

    oneOfTags(...tags) {
        tags.forEach(tag => {
            let tagId = this.#componentIdGenerator.getOrAssignIdForTag(tag);
            this.#oneOfMatch.set(tagId, 1);
        });
        return this;
    }

    noneTags(...tags) {
        tags.forEach(tag => {
            let tagId = this.#componentIdGenerator.getOrAssignIdForTag(tag);
            this.#noneMatch.set(tagId, 1);
        });
        return this;
    }

    isMatch(componentsBitMask) {
        if(!this.#allMatch.isEmpty() && !this.#allMatch.and(componentsBitMask).equals(this.#allMatch))
            return false;

        if(!this.#oneOfMatch.isEmpty() && this.#oneOfMatch.and(componentsBitMask).isEmpty())
            return false;
        
        if(!this.#noneMatch.isEmpty() && !this.#noneMatch.and(componentsBitMask).isEmpty())
            return false;
        
        return true;
    }

    toString() {
        return `EntityFilter: all->${this.#allMatch.toString(2)}, oneOf->${this.#oneOfMatch.toString(2)}, none->${this.#noneMatch.toString(2)}`;
    }

};
module.exports.EntityFilter = EntityFilter;

module.exports.EntityComponentManager = class EntityComponentManager {

    #entityManager;
    #arhytypes;
    #archytypesByEntityId;
    #componentsIdGenerator;
    #singletonEntities;

    constructor(entityManager, componentsIdGenerator) {
        this.#entityManager = entityManager;
        this.#componentsIdGenerator = componentsIdGenerator;
        this.#arhytypes = [];
        this.#archytypesByEntityId = [];
        this.#singletonEntities = {};
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
            } else if(!mask.equals(archytype.bitmask)) {
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

    putSingletonEntity(name, entity) {
        this.#singletonEntities[name] = entity;
    }

    getSingletonEntity(name) {
        return this.#singletonEntities[name];
    }

    createCommandBuffer() {
        return new CommandBuffer(this.#entityManager);
    }

    flush(commandBuffer) {
        commandBuffer.forEach((command) => {
            if(command.type == 'bind') {
                this.bindEntity(command.entity);
            } else if(command.type == 'remove') {
                this.removeEntity(command.entity);
            }
        });
    }

    createFilter() {
        return new EntityFilter(this.#componentsIdGenerator);
    }

    clear() {
        this.#entityManager.clear();
        this.#arhytypes = [];
        this.#archytypesByEntityId = [];
        this.#singletonEntities = {};
    }

    getEntityManager() {
        return this.#entityManager;
    }


    #findOrCreateArhytype(bitmask) {
        let archytype = this.#arhytypes.find(archytype => bitmask.equals(archytype.bitmask));
        if(!archytype) {
            archytype = new Archetype(bitmask);
            this.#arhytypes.push(archytype);
        }
        return archytype;
    }

    #createBitMaskBy(entity) {
        let mask = new BitSet();
        entity.forEachComponent(component => {
            let componentTypeId = this.#componentsIdGenerator.getOrAssignIdForComponent(component);
            mask.set(componentTypeId, 1);
        });
        entity.forEachTag(tag => {
            let tagId = this.#componentsIdGenerator.getOrAssignIdForTag(tag);
            mask.set(tagId, 1);
        });
        return mask;
    }

};