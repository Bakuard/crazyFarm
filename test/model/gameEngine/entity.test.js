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
class E {
    constructor() {
        this.valueA = {
            x: 100,
            y: 200
        };
        this.valueB = ['a', 1200, {x: 10, y: 15}, [1, 2, 3, 4]];
        this.valueC = new Set().add('a').add('b').add('c');
    }
}

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

test(`clear:
    entity contains removed component
    => remove all components`,
    () => {
        let entity = new Entity(0, 0);
        entity.put(new A(10, -10), new B(), new C(), new D());

        entity.clear();
        let actual = [entity.get(A), entity.get(B), entity.get(C), entity.get(D)];

        expect(actual).toEqual([undefined, undefined, undefined, undefined]);
    });

test(`clone:
    entity doesn't contain components
    => return correct copy`,
    () => {
        let entity = new Entity(0, 0);

        let actual = entity.clone();

        expect(actual).toEqual(entity);
    });

test(`clone:
    entity contains components
    => return correct copy`,
    () => {
        let entity = new Entity(0, 0);
        entity.put(new A(10, -10), new B(), new C(), new D(), new E());

        let actual = entity.clone();

        expect(actual).toEqual(entity);
    });