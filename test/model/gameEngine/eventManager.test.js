'use strict'

const {EventManager} = require('../../../src/code/model/gameEngine/eventManager.js');

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

describe.each([
    {event: {key: 'some key'}, writableEventName: 'event', readableEventName: 'event', expected: {key: 'some key'}},
    {event: {key: 'some key'}, writableEventName: 'event', readableEventName: 'other event', expected: null}
])(`readEvent(name, index)::`,
    ({event, writableEventName, readableEventName, expected}) => {
        test(`event ${event}, writableEventName '${writableEventName}', readableEventName '${readableEventName}'
                => expected return result ${expected}`,
        () => {
            let eventManager = new EventManager();
            eventManager.writeEvent(writableEventName, event);

            let actual = eventManager.readEvent(readableEventName, 0);

            expect(actual).toEqual(expected);
        });
    }
);

describe.each([
    {index: -1, eventsNumber: 3, expected: null},
    {index: 3, eventsNumber: 3, expected: null},
    {index: 4, eventsNumber: 3, expected: null},

    {index: -1, eventsNumber: 0, expected: null},
    {index: 0, eventsNumber: 0, expected: null},
    {index: 1, eventsNumber: 0, expected: null}
])(`readEvent(name, index):`,
    ({index, eventsNumber, expected}) => {
        test(`index ${index}, eventsNumber ${eventsNumber}
                => expected return result ${expected}`,
        () => {
            let eventManager = new EventManager();
            for(let i = 0; i < eventsNumber; i++) {
                eventManager.writeEvent('event', {key: i});
            }

            let actual = eventManager.readEvent('event', index);

            expect(actual).toEqual(expected);
        });
    }
);

describe.each([
    {writableEventName: 'event',  readableEventName: 'event', expected: [0, 10, 20, 30, 40]},
    {writableEventName: 'event',  readableEventName: 'other event', expected: []}
])(`forEachEvent(name, callback):`,
    ({writableEventName, readableEventName, expected}) => {
        test(`writableEventName '${writableEventName}', readableEventName '${readableEventName}'
                => expected return result [${expected}]`,
        () => {
            let eventManager = new EventManager();
            eventManager.writeEvent(writableEventName, ...expected);

            let actual = [];
            eventManager.forEachEvent(readableEventName, (event, index) => actual.push(event));

            expect(actual).toEqual(expected);
        });
    }
);

describe.each([
    {writableEventName: 'event',  writableEvents: [0, 10, 20, 30, 40], readableEventName: 'event', expected: 5},
    {writableEventName: 'event',  writableEvents: [0, 10, 20, 30, 40], readableEventName: 'other event', expected: 0}
])(`eventsNumber(name, callback):`,
    ({writableEventName, writableEvents, readableEventName, expected}) => {
        test(`writableEventName '${writableEventName}', writableEvents [${writableEvents}], readableEventName '${readableEventName}'
                => expected return result ${expected}`,
        () => {
            let eventManager = new EventManager();
            eventManager.writeEvent(writableEventName, ...writableEvents);

            let actual = eventManager.eventsNumber(readableEventName);

            expect(actual).toEqual(expected);
        });
    }
);

describe.each([
    {eventNames: [], eventsByName: {}, expected: []},
    {eventNames: ['e1', 'e2', 'e3'], eventsByName: {e1: [1, 2, 3], e2: [10, 20, 30], e3: [100, 200, 300]}, 
     expected: [{e1: 1}, {e1: 2}, {e1: 3}, {e2: 10}, {e2: 20}, {e2: 30}, {e3: 100}, {e3: 200}, {e3: 300}]},
    {eventNames: ['e1'], eventsByName: {e1: [0, 1, 2, 3, 4, 5]},
     expected: [{e1: 0}, {e1: 1}, {e1: 2}, {e1: 3}, {e1: 4}, {e1: 5}]}
])(`forEach(callback):`,
    ({eventNames, eventsByName, expected}) => {
        test(`eventNames [${eventNames}], eventsByName ${JSON.stringify(eventsByName)}
              => expected [${expected}]`,
        () => {
            let eventManager = new EventManager();
            eventNames.forEach(eventName => eventManager.writeEvent(eventName, ...eventsByName[eventName]));

            let actual = [];
            eventManager.forEach((eventName, event) => actual.push({[eventName]: event}));

            expect(actual).toEqual(expected);
        });
    }
);