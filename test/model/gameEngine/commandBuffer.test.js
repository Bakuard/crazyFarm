const {CommandBuffer} = require('../../../src/code/model/gameEngine/commandBuffer.js');
const {EntityComponentManager} = require('../../../src/code/model/gameEngine/entityComponentManager.js');
const {ComponentIdGenerator} = require('../../../src/code/model/gameEngine/componentIdGenerator.js');
const {EntityManager} = require('../../../src/code/model/gameEngine/entityManager.js');


let A = function A() {}
let B = function B() {}
let C = function C() {}
let D = function D() {}
let E = function E() {}

test(`CommandBuffer:
        create entity,
        buffer hasn't been flushed
        => isAlive(entity) must return true`,
        () => {
            let manager = new EntityComponentManager(new EntityManager(), new ComponentIdGenerator());

            let buffer = manager.createCommandBuffer();
            let entity = buffer.create();
            let actual = manager.isAlive(entity);

            expect(actual).toBe(true);
        });
    
test(`CommandBuffer:
        create entity,
        buffer has been flushed
        => isAlive(entity) must return true`,
        () => {
            let manager = new EntityComponentManager(new EntityManager(), new ComponentIdGenerator());

            let buffer = manager.createCommandBuffer();
            let entity = buffer.create();
            manager.flush(buffer);
            let actual = manager.isAlive(entity);

            expect(actual).toBe(true);
        });

test(`CommandBuffer:
        create entities,
        bind new entites,
        entites haven't any components,
        buffer hasn't been flushed
        => select doesn't return entity that was created with not flushed buffer`,
        () => {
            let manager = new EntityComponentManager(new EntityManager(), new ComponentIdGenerator());

            let buffer = manager.createCommandBuffer();
            let entity1 = buffer.create();
            let entity2 = buffer.create();
            let entity3 = buffer.create();
            let entity4 = buffer.create();
            buffer.bind(entity1);
            buffer.bind(entity2);
            buffer.bind(entity3);
            buffer.bind(entity4);
            let filter = manager.createFilter();
            let generator = manager.select(filter);
            let actual = [...generator];

            expect(actual).toHaveLength(0);
        });

test(`CommandBuffer:
        create entities,
        bind new entites,
        entites haven't any components,
        buffer has been flushed
        => select must return entity that was created with flushed buffer`,
        () => {
            let manager = new EntityComponentManager(new EntityManager(), new ComponentIdGenerator());

            let buffer = manager.createCommandBuffer();
            let entity1 = buffer.create();
            let entity2 = buffer.create();
            let entity3 = buffer.create();
            let entity4 = buffer.create();
            buffer.bind(entity1);
            buffer.bind(entity2);
            buffer.bind(entity3);
            buffer.bind(entity4);
            manager.flush(buffer);
            let filter = manager.createFilter();
            let generator = manager.select(filter);
            let actual = [...generator];

            expect(actual).containsEntities(entity1, entity2, entity3, entity4);
        });

test(`CommandBuffer:
        create entities,
        bind new entites,
        entites have some components,
        buffer hasn't been flushed
        => select doesn't return entity that was created with not flushed buffer`,
        () => {
            let manager = new EntityComponentManager(new EntityManager(), new ComponentIdGenerator());

            let buffer = manager.createCommandBuffer();
            let entity1 = buffer.create().put(new A(), new B(), new C());
            let entity2 = buffer.create().put(new A(), new B(), new D());
            let entity3 = buffer.create().put(new A(), new D(), new E());
            let entity4 = buffer.create().put(new B(), new C(), new D());
            buffer.bind(entity1);
            buffer.bind(entity2);
            buffer.bind(entity3);
            buffer.bind(entity4);
            let filter = manager.createFilter();
            let generator = manager.select(filter);
            let actual = [...generator];

            expect(actual).toHaveLength(0);
        });

test(`CommandBuffer:
        create entities,
        bind new entites,
        entites have some components,
        buffer has been flushed
        => select must return entity that was created with flushed buffer`,
        () => {
            let manager = new EntityComponentManager(new EntityManager(), new ComponentIdGenerator());

            let buffer = manager.createCommandBuffer();
            let entity1 = buffer.create().put(new A(), new B(), new C());
            let entity2 = buffer.create().put(new A(), new B(), new D());
            let entity3 = buffer.create().put(new A(), new D(), new E());
            let entity4 = buffer.create().put(new B(), new C(), new D());
            buffer.bind(entity1);
            buffer.bind(entity2);
            buffer.bind(entity3);
            buffer.bind(entity4);
            manager.flush(buffer);
            let filter = manager.createFilter();
            let generator = manager.select(filter);
            let actual = [...generator];

            expect(actual).containsEntities(entity1, entity2, entity3, entity4);
        });

test(`CommandBuffer:
        create entities,
        don't bind new entites,
        buffer has been flushed
        => select doesn't return not binded entities`,
        () => {
            let manager = new EntityComponentManager(new EntityManager(), new ComponentIdGenerator());

            let buffer = manager.createCommandBuffer();
            let entity1 = buffer.create();
            let entity2 = buffer.create();
            let entity3 = buffer.create();
            let entity4 = buffer.create();
            manager.flush(buffer);
            let filter = manager.createFilter();
            let generator = manager.select(filter);
            let actual = [...generator];

            expect(actual).toHaveLength(0);
        });

test(`CommandBuffer:
        change existed entites,
        bind existed entites,
        buffer hasn't been flushed
        => select doesn't return not binded entities`,
        () => {
            let manager = new EntityComponentManager(new EntityManager(), new ComponentIdGenerator());
            let entity1 = manager.createEntity().put(new A(), new B(), new C());
            let entity2 = manager.createEntity().put(new A(), new B(), new C());
            let entity3 = manager.createEntity().put(new A(), new B(), new C());
            let entity4 = manager.createEntity().put(new A(), new B(), new C());
            manager.bindEntity(entity1);
            manager.bindEntity(entity2);
            manager.bindEntity(entity3);
            manager.bindEntity(entity4);

            let buffer = manager.createCommandBuffer();
            buffer.bind(entity1.set(new D(), new E()));
            buffer.bind(entity2.set(new D(), new E()));
            buffer.bind(entity3.set(new D(), new E()));
            buffer.bind(entity4.set(new D(), new E()));
            manager.flush(buffer);
            let filter = manager.createFilter().all(D, E);
            let generator = manager.select(filter);
            let actual = [...generator];

            expect(actual).containsEntities(entity1, entity2, entity3, entity4);
        });

test(`CommandBuffer:
        change existed entites,
        bind existed entites,
        buffer hasn been flushed
        => select must return entity that was changed with flushed buffer`,
        () => {
            let manager = new EntityComponentManager(new EntityManager(), new ComponentIdGenerator());
            let entity1 = manager.createEntity().put(new A(), new B(), new C());
            let entity2 = manager.createEntity().put(new A(), new B(), new C());
            let entity3 = manager.createEntity().put(new A(), new B(), new C());
            let entity4 = manager.createEntity().put(new A(), new B(), new C());
            manager.bindEntity(entity1);
            manager.bindEntity(entity2);
            manager.bindEntity(entity3);
            manager.bindEntity(entity4);

            let buffer = manager.createCommandBuffer();
            buffer.bind(entity1.set(new D(), new E()));
            buffer.bind(entity2.set(new D(), new E()));
            buffer.bind(entity3.set(new D(), new E()));
            buffer.bind(entity4.set(new D(), new E()));
            let filter = manager.createFilter().all(D, E);
            let generator = manager.select(filter);
            let actual = [...generator];

            expect(actual).toHaveLength(0);
        });

test(`CommandBuffer:
        remove some existed entity with buffer,
        buffer hasn't been flushed
        => isAlive(entity) for this entity must return true`,
        () => {
            let manager = new EntityComponentManager(new EntityManager(), new ComponentIdGenerator());
            let entity = manager.createEntity();

            let buffer = manager.createCommandBuffer();  
            buffer.remove(entity);
            let actual = manager.isAlive(entity);

            expect(actual).toBe(true);
        });

test(`CommandBuffer:
        remove some existed entity with buffer,
        buffer has been flushed
        => isAlive(entity) for this entity must return false`,
        () => {
            let manager = new EntityComponentManager(new EntityManager(), new ComponentIdGenerator());
            let entity = manager.createEntity();

            let buffer = manager.createCommandBuffer();  
            buffer.remove(entity);
            manager.flush(buffer);
            let actual = manager.isAlive(entity);

            expect(actual).toBe(false);
        });