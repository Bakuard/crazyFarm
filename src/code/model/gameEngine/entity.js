'use strict' 

module.exports.Entity = class Entity {
    static undeletableKeys = 
        ['personalId', 'generation', 'put', 'get', 'remove', 'removeAll', 'equals', 'toString'];

    personalId;
    generation;

    constructor(personalId, generation) {
        this.personalId = personalId;
        this.generation = generation;
        Object.defineProperties(this, {
            personalId: {writable: false, configurable: false, enumerable: true},
            generation: {writable: false, configurable: false, enumerable: true}
        });
    }

    put(...components) {
        for(let component of components) {
            let key = Object.getPrototypeOf(component).constructor.name;
            this[key] = component;
        }
    }

    get(componentConstructor) {
        let key = componentConstructor.name;
        return this[key];
    }

    remove(componentConstructor) {
        let key = componentConstructor.name;
        delete this[key];
    }

    removeAll() {
        Object.keys(this).
            filter(key => !Entity.undeletableKeys.includes(key)).
            forEach(key => delete this[key]);
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