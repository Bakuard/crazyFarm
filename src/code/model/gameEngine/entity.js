'use strict' 

module.exports.Entity = class Entity {
    personalId;
    generation;
    #components;

    constructor(personalId, generation) {
        this.personalId = personalId;
        this.generation = generation;
        this.#components = {};
        Object.defineProperties(this, {
            personalId: {writable: false, configurable: false, enumerable: true},
            generation: {writable: false, configurable: false, enumerable: true}
        });
    }

    clone() {
        let entity = new Entity(this.personalId, this.generation);
        entity.#components = structuredClone(this.#components);
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

    remove(...componentConstructors) {
        for(let componentConstructor of componentConstructors) {
            let key = componentConstructor.name;
            delete this.#components[key];
        }
        return this;
    }

    clear() {
        this.#components = {};
        return this;
    }

    get(componentConstructor) {
        let key = componentConstructor.name;
        return this.#components[key];
    }

    forEachComponent(callback) {
        Object.values(this.#components).forEach(component => callback(component));
    }

    equals(otherEntity) {
        return Boolean(otherEntity) && 
            this.personalId === otherEntity.personalId &&
            this.generation === otherEntity.generation;
    }

    toString() {
        return `{personalId=${this.personalId}, generation=${this.generation}}`;
    }
    
};