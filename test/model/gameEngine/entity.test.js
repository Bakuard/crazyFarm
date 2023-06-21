const {Entity} = require('../../../src/code/model/gameEngine/entity.js');

class A {
    constructor(a, b) {
        this.a = a;
        this.b = b;
    }
}
class B {}
class C {}
class D {}

test(`get and put component:
    put single component,
    component is not undefined,
    component has constructor
    => get must return this component`,
    () => {
        let component = new A(10, 20);
        let entity = new Entity(0, 0);

        entity.put(component);
        let actual = entity.get(A);

        expect(actual).toBe(component);
    });

test(`get and put component:
    put several components,
    there are not undefined components
    => put and then return the same component`,
    () => {
        let components = [new A(10, -10), new B(), new C(), new D()];
        let entity = new Entity(0, 0);

        entity.put(...components);
        let actual = [entity.get(A), entity.get(B), entity.get(C), entity.get(D)];

        expect(actual).toEqual(components);
    });

test(`remove component:
    entity contains removed component
    => remove it`,
    () => {
        let entity = new Entity(0, 0);
        entity.put(new A(10, -10), new B(), new C(), new D());

        entity.remove(A);
        let actual = entity.get(A);

        expect(actual).toBeUndefined();
    });

test(`removeAll component:
    entity contains removed component
    => remove all aomponents`,
    () => {
        let entity = new Entity(0, 0);
        entity.put(new A(10, -10), new B(), new C(), new D());

        entity.removeAll();
        let actual = [entity.get(A), entity.get(B), entity.get(C), entity.get(D)];

        expect(actual).toEqual([undefined, undefined, undefined, undefined]);
    });

test(`removeAll component:
    entity contains removed component
    => doesn't remove entity necessary fields and methods`,
    () => {
        let entity = new Entity(0, 0);
        entity.put(new A(10, -10), new B(), new C(), new D());

        entity.removeAll();
        let actual = [entity.personalId, entity.generation, entity.get, 
                        entity.put, entity.remove, entity.equals, 
                        entity.toString, entity.removeAll];

        expect(actual.some(value => value == undefined)).toBe(false);
    });