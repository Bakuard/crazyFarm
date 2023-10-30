'use strict' 

const util = require('util');
const equal = require('deep-equal');

module.exports.Entity = class Entity {
    personalId;
    generation;
    #components;
    #tags;

    constructor(personalId, generation) {
        this.personalId = personalId;
        this.generation = generation;
        this.#components = {};
        this.#tags = new Set();
        Object.defineProperties(this, {
            personalId: {writable: false, configurable: false, enumerable: true},
            generation: {writable: false, configurable: false, enumerable: true}
        });
    }

    clone() {
        let entity = new Entity(this.personalId, this.generation);
        entity.#components = structuredClone(this.#components);
        entity.#tags = structuredClone(this.#tags);
        return entity;
    }

    put(...components) {
        for(let component of components) {
            let key = Object.getPrototypeOf(component).constructor.name;
            this.#components[key] = component;
        }
        return this;
    }

    set(...components) {
        this.clear();
        for(let component of components) {
            let key = Object.getPrototypeOf(component).constructor.name;
            this.#components[key] = component;
        }
        return this;
    }

    addTags(...tags) {
        for(let tag of tags) this.#tags.add(tag);
        return this;
    }

    remove(...componentConstructors) {
        for(let componentConstructor of componentConstructors) {
            let key = componentConstructor.name;
            delete this.#components[key];
        }
        return this;
    }

    removeTags(...tags) {
        for(let tag of tags) this.#tags.delete(tag);
        return this;
    }

    clear() {
        this.#components = {};
        this.#tags.clear();
        return this;
    }

    get(componentConstructor) {
        let key = componentConstructor.name;
        return this.#components[key];
    }

    hasComponents(...componentConstructors) {
        let result = true;
        for(let i = 0; i < componentConstructors.length && result; i++) {
            result = result && (this.get(componentConstructors[i]) != undefined);
        }
        return result;
    }

    hasTags(...tags) {
        let result = true;
        for(let i = 0; i < tags.length && result; i++) {
            result &&= this.#tags.has(tags[i]);
        }
        return result;
    }

    forEachComponent(callback) {
        Object.values(this.#components).forEach(component => callback(component));
    }

    forEachTag(callback) {
        this.#tags.forEach(callback);
    }

    equals(otherEntity) {
        return Boolean(otherEntity) && 
            this.personalId === otherEntity.personalId &&
            this.generation === otherEntity.generation;
    }

    deepEquals(otherEntity) {
        return this.equals(otherEntity) &&
            equal(this.#components, otherEntity.#components) &&
            equal(this.#tags, otherEntity.#tags);
    }

    toString() {
        return `{personalId=${this.personalId}, generation=${this.generation}}`;
    }

    toDetailString() {
        let components = Array.from(Object.values(this.#components)).
                            map(c => util.formatWithOptions({breakLength: Infinity, compact: true, depth: 5}, '%O', c)).
                            join(', ');
        return `{personalId=${this.personalId}, generation=${this.generation}, tags=[${Array.from(this.#tags)}], ${components}}`;
    }

};