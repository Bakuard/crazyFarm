'use strict' 

module.exports.Entity = function Entity(personalId, generation) {
    this.personalId = personalId;
    this.generation = generation;
    this.equals = function(otherEntity) {
        return Boolean(otherEntity) && 
               this.personalId === otherEntity.personalId &&
               this.generation === otherEntity.generation;
    };
    this.toString = function() {
        return `{personalId=${this.personalId}, generation=${this.generation}}`;
    };
    Object.defineProperties(this, {
        personalId: {writable: false, configurable: false, enumerable: true},
        generation: {writable: false, configurable: false, enumerable: true},
        equals: {writable: false, configurable: false, enumerable: true},
        toString: {writable: false, configurable: false, enumerable: true}
    });
}