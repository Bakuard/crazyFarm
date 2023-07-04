'use strict'

module.exports.ComponentIdGenerator = class ComponentIdGenerator {

    #tagsId;
    #lastId;

    constructor() {
        this.#tagsId = {};
        this.#lastId = 0;
    }

    getOrAssignIdForComponent(componentOrType) {
        let prototype = typeof(componentOrType) == 'function' ? 
                            componentOrType.prototype :
                            Object.getPrototypeOf(componentOrType);

        if(prototype.componentTypeId == undefined) prototype.componentTypeId = this.#lastId++;

        return prototype.componentTypeId;
    }

    getOrAssignIdForTag(tag) {
        if(this.#tagsId[tag] == undefined) {
            this.#tagsId[tag] = this.#lastId++;
        }
        return this.#tagsId[tag];
    }

    toString() {
        return `componentIdGenerator{tagsId:${JSON.stringify(this.#tagsId)}, lastId:${this.#lastId}}`
    }

};