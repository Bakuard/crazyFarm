'use strict' 

module.exports.Entity = class Entity {
    personalId;
    generation;

    constructor(personalId, generation) {
        this.personalId = personalId;
        this.generation = generation;
        Object.defineProperties(this, {
            personalId: {writable: false, configurable: false, enumerable: true},
            generation: {writable: false, configurable: false, enumerable: true},
            equals: {writable: false, configurable: false, enumerable: true, value: Object.getPrototypeOf(this).equals},
            toString: {writable: false, configurable: false, enumerable: true, value: Object.getPrototypeOf(this).toString}
        });
    }

    putComponent(component) {
        let key = Object.getPrototypeOf(component).constructor.name;
        this[key] = component;
    }

    getComponent(componentConstructor) {
        let key = componentConstructor.name;
        return this[key];
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