const {Entity} = require('../../src/code/model/gameEngine/entity.js');

class A {
    constructor(a, b) {
        this.a = a;
        this.b = b;
    }
}

test(`get and put component:
    component is not undefined,
    component has constructor
    => put and then return the same component`,
    () => {
        let component = new A(10, 20);
        let entity = new Entity(0, 0);

        entity.putComponent(component);
        let actual = entity.getComponent(A);

        expect(actual).toBe(component);
    });