'use strict'

const {EventManager} = require('../../../src/code/model/gameEngine/eventManager.js');

test(`writeEvent(name, event) and readEvent(name, index):
        there are not events with this name
        => readEvent(name, index) must return this event by index 0`,
    () => {
        let eventManager = new EventManager();

        eventManager.writeEvent('event', {key: 'value'});
        let actual = eventManager.readEvent('event', 0);

        expect(actual).toEqual({key: 'value'});
    });

test(`writeEvent(name, event) and readEvent(name, index):
        there are events with this name
        => readEvent(name, index) must return correct event for each index`,
    () => {
        let eventManager = new EventManager();

        eventManager.writeEvent('event', {key: 'value1'});
        eventManager.writeEvent('event', {key: 'value2'});
        eventManager.writeEvent('event', {key: 'value3'});
        let actual1 = eventManager.readEvent('event', 0);
        let actual2 = eventManager.readEvent('event', 1);
        let actual3 = eventManager.readEvent('event', 2);

        expect(actual1).toEqual({key: 'value1'});
        expect(actual2).toEqual({key: 'value2'});
        expect(actual3).toEqual({key: 'value3'});
    });

test(`readEvent(name, index):
        index = 0,
        there are not events with such name
        => return null`,
    () => {
        let eventManager = new EventManager();

        eventManager.writeEvent('event', {key: 'value'});
        let actual = eventManager.readEvent('unknown event', 0);

        expect(actual).toBe(null);
    });

test(`readEvent(name, index):
        index > 0,
        there are not events with such name
        => return null`,
    () => {
        let eventManager = new EventManager();

        eventManager.writeEvent('event', {key: 'value'});
        let actual = eventManager.readEvent('unknown event', 1);

        expect(actual).toBe(null);
    });

test(`readEvent(name, index):
        index < 0,
        there are not events with such name
        => return null`,
    () => {
        let eventManager = new EventManager();

        eventManager.writeEvent('event', {key: 'value'});
        let actual = eventManager.readEvent('unknown event', -1);

        expect(actual).toBe(null);
    });

test(`readEvent(name, index):
        index < 0,
        there are events with such name
        => return null`,
    () => {
        let eventManager = new EventManager();

        eventManager.writeEvent('event', {key: 'value'});
        let actual = eventManager.readEvent('event', -1);

        expect(actual).toBe(null);
    });

test(`readEvent(name, index):
        index = events number with such name,
        there are events with such name
        => return null`,
    () => {
        let eventManager = new EventManager();

        eventManager.writeEvent('event', {key: 'value1'});
        eventManager.writeEvent('event', {key: 'value2'});
        eventManager.writeEvent('event', {key: 'value3'});
        let actual = eventManager.readEvent('event', 3);

        expect(actual).toBe(null);
    });

test(`readEvent(name, index):
        index > events number with such name,
        there are events with such name
        => return null`,
    () => {
        let eventManager = new EventManager();

        eventManager.writeEvent('event', {key: 'value1'});
        eventManager.writeEvent('event', {key: 'value2'});
        eventManager.writeEvent('event', {key: 'value3'});
        let actual = eventManager.readEvent('event', 4);

        expect(actual).toBe(null);
    });