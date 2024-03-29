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

test(`clear:
    entity contains several tags
    => remove all tags`,
    () => {
        let entity = new Entity(0, 0);
        entity.addTags('tag1', 'tag2', 'tag3');

        entity.clear();
        let actual = [];
        entity.forEachTag(tag => actual.push(tag));

        expect(actual).toHaveLength(0);
    });

test(`clone:
    entity doesn't contain components
    => return correct copy`,
    () => {
        let entity = new Entity(0, 0);

        let actual = entity.clone();

        expect(actual).toEqualEntity(entity);
    });

test(`clone:
    entity contains components
    => return correct copy`,
    () => {
        let entity = new Entity(0, 0);
        entity.put(new A(10, -10), new B(), new C(), new D(), new E());

        let actual = entity.clone();

        expect(actual).toEqualEntity(entity);
    });

test(`addTags:
    add one tag to entity
    => hasTags must return true for this tag`,
    () => {
        let entity = new Entity(0, 0);
        
        entity.addTags('tag');
        let actual = entity.hasTags('tag');

        expect(actual).toBe(true);
    });

test(`addTags:
    add several tags to entity
    => hasTags must return true for each of this tag`,
    () => {
        let entity = new Entity(0, 0);
        
        entity.addTags('tag1', 'tag2', 'tag3');
        let actual1 = entity.hasTags('tag1');
        let actual2 = entity.hasTags('tag2');
        let actual3 = entity.hasTags('tag3');

        expect(actual1).toBe(true);
        expect(actual2).toBe(true);
        expect(actual3).toBe(true);
    });

test(`hasTags:
    entity contains all of this tags,
    entity tags number > hasTags arguments number
    => return true`,
    () => {
        let entity = new Entity(0, 0);
        entity.addTags('tag1', 'tag2', 'tag3');

        let actual = entity.hasTags('tag1', 'tag2');

        expect(actual).toBe(true);
    });

test(`hasTags:
    entity contains all of this tags,
    entity tags number = hasTags arguments number
    => return true`,
    () => {
        let entity = new Entity(0, 0);
        entity.addTags('tag1', 'tag2', 'tag3');

        let actual = entity.hasTags('tag1', 'tag2', 'tag3');

        expect(actual).toBe(true);
    });

test(`hasTags:
    one of tags is not contained in the entity
    => return false`,
    () => {
        let entity = new Entity(0, 0);
        entity.addTags('tag1', 'tag2', 'tag3');

        let actual = entity.hasTags('tag1', 'tag2', 'tag3', 'uknown tag');

        expect(actual).toBe(false);
    });

test(`hasTags:
    all tags are not contained in the entity
    => return false`,
    () => {
        let entity = new Entity(0, 0);
        entity.addTags('tag1', 'tag2', 'tag3');

        let actual = entity.hasTags('uknown tag1', 'uknown tag2');

        expect(actual).toBe(false);
    });

test(`hasComponents:
    entity contains all of this components,
    entity components number > hasComponents arguments number
    => return true`,
    () => {
        let entity = new Entity(0, 0);
        entity.put(new A(), new B(), new C());

        let actual = entity.hasComponents(A, B);

        expect(actual).toBe(true);
    });

test(`hasComponents:
    entity contains all of this components,
    entity components number = hasComponents arguments number
    => return true`,
    () => {
        let entity = new Entity(0, 0);
        entity.put(new A(), new B(), new C());

        let actual = entity.hasComponents(A, B, C);

        expect(actual).toBe(true);
    });

test(`hasComponents:
    one of components is not contained in entity
    => return false`,
    () => {
        let entity = new Entity(0, 0);
        entity.put(new A(), new B(), new C());

        let actual = entity.hasComponents(A, B, C, D);

        expect(actual).toBe(false);
    });

test(`hasComponents:
    all components are not contained in entity
    => return false`,
    () => {
        let entity = new Entity(0, 0);
        entity.put(new A(), new B(), new C());

        let actual = entity.hasComponents(D, E);

        expect(actual).toBe(false);
    });

test(`deepEquals:
    entities haven't any components,
    entities haven't any tags,
    entities indexes is equal,
    entities generations is equal
    => return true`,
    () => {
        let entity1 = new Entity(100, 10);
        let entity2 = new Entity(100, 10);

        let actual = entity1.deepEquals(entity2);

        expect(actual).toBe(true);
    });

test(`deepEquals:
    entities haven't any components,
    entities haven't any tags,
    entities indexes is equal,
    entities generations is not equal
    => return false`,
    () => {
        let entity1 = new Entity(100, 10);
        let entity2 = new Entity(100, 11);

        let actual = entity1.deepEquals(entity2);

        expect(actual).toBe(false);
    });

test(`deepEquals:
    entities haven't any components,
    entities haven't any tags,
    entities indexes is not equal,
    entities generations is equal
    => return false`,
    () => {
        let entity1 = new Entity(100, 10);
        let entity2 = new Entity(101, 10);

        let actual = entity1.deepEquals(entity2);

        expect(actual).toBe(false);
    });

test(`deepEquals:
    entities have the same components with equal states,
    entities haven't any tags,
    entities indexes is equal,
    entities generations is equal
    => return true`,
    () => {
        let entity1 = new Entity(100, 10).put(new A(0, 1), new B(), new C(), new D());
        let entity2 = new Entity(100, 10).put(new A(0, 1), new B(), new C(), new D());

        let actual = entity1.deepEquals(entity2);

        expect(actual).toBe(true);
    });

test(`deepEquals:
    entities have the same components with different states,
    entities haven't any tags,
    entities indexes is equal,
    entities generations is equal
    => return false`,
    () => {
        let entity1 = new Entity(100, 10).put(new A(0, 10), new B(), new C(), new D());
        let entity2 = new Entity(100, 10).put(new A(0, 1), new B(), new C(), new D());

        let actual = entity1.deepEquals(entity2);

        expect(actual).toBe(false);
    });

test(`deepEquals:
    entities have the different components,
    entities haven't any tags,
    entities indexes is equal,
    entities generations is equal
    => return false`,
    () => {
        let entity1 = new Entity(100, 10).put(new B(), new C(), new D(), new E());
        let entity2 = new Entity(100, 10).put(new A(0, 1), new B(), new C(), new D());

        let actual = entity1.deepEquals(entity2);

        expect(actual).toBe(false);
    });

test(`deepEquals:
    entities haven't any components,
    entities have the same tags,
    entities indexes is equal,
    entities generations is equal
    => return true`,
    () => {
        let entity1 = new Entity(100, 10).addTags('a', 'b', 'c', 'd');
        let entity2 = new Entity(100, 10).addTags('a', 'b', 'c', 'd');

        let actual = entity1.deepEquals(entity2);

        expect(actual).toBe(true);
    });

test(`deepEquals:
    entities haven't any components,
    entities have different tags,
    entities indexes is equal,
    entities generations is equal
    => return false`,
    () => {
        let entity1 = new Entity(100, 10).addTags('a', 'b', 'c', 'd');
        let entity2 = new Entity(100, 10).addTags('b', 'c', 'd', 'e');

        let actual = entity1.deepEquals(entity2);

        expect(actual).toBe(false);
    });

test(`deepEquals:
    compared entity is clone
    => return true`,
    () => {
        let entity = new Entity(100, 10).
                        addTags('a', 'b', 'c', 'd').
                        put(new A(0, 1), new B(), new C(), new D());

        global.debug = true;
        let clone = entity.clone();
        let actual = entity.deepEquals(clone);
        global.debug = false;

        expect(actual).toBe(true);
    });