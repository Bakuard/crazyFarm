'use strict'

module.exports.ComponentIdGenerator = class ComponentIdGenerator {

    #componentsId;
    #tagsId;
    #lastId;

    constructor() {
        this.#componentsId = {};
        this.#tagsId = {};
        this.#lastId = 0;
    }

    getOrAssignIdForComponent(componentOrType) {
        let typeName = typeof(componentOrType) == 'function' ? 
                            componentOrType.name :
                            Object.getPrototypeOf(componentOrType).constructor.name;

        if(this.#componentsId[typeName] == undefined) this.#componentsId[typeName] = this.#lastId++;

        return this.#componentsId[typeName];
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