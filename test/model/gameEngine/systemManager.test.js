const {SystemManager} = require('../../../src/code/model/gameEngine/systemManager.js');

test(`putSystem(name, updateMethod, ...groups):
        there is not system with this name,
        add system to one group
        => updateGroup(groupName) must update this system`,
    () => {
        let worldMock = {};
        let systemManager = new SystemManager(worldMock);
        let systemMock = jest.fn();

        systemManager.putSystem('system1', systemMock, 'groupA');
        systemManager.updateGroup('groupA');

        expect(systemMock.mock.calls).toHaveLength(1);
    });

test(`putSystem(name, updateMethod, ...groups):
        there is not system with this name,
        add system to several groups
        => updateGroup(groupName) for each group must update this system ont time`,
    () => {
        let worldMock = {};
        let systemManager = new SystemManager(worldMock);
        let systemMock = jest.fn();

        systemManager.putSystem('system1', systemMock, 'groupA', 'groupB', 'groupC');
        systemManager.updateGroup('groupA');
        systemManager.updateGroup('groupB');
        systemManager.updateGroup('groupC');

        expect(systemMock).toHaveBeenCalledTimes(3);
        expect(systemMock.mock.calls[0][1]).toEqual('groupA');
        expect(systemMock.mock.calls[1][1]).toEqual('groupB');
        expect(systemMock.mock.calls[2][1]).toEqual('groupC');
    });

test(`putSystem(name, updateMethod, ...groups):
        add several systems to one group
        => updateGroup(groupName) must call each system one time in correct order`,
    () => {
        let worldMock = {};
        let systemManager = new SystemManager(worldMock);

        let actual = [];
        systemManager.putSystem('system1', (systemName, groupName, world) => actual.push('system1'), 'group');
        systemManager.putSystem('system2', (systemName, groupName, world) => actual.push('system2'), 'group');
        systemManager.putSystem('system3', (systemName, groupName, world) => actual.push('system3'), 'group');
        systemManager.updateGroup('group');

        expect(actual).toEqual(['system1', 'system2', 'system3']);
    });

test(`putSystem(name, updateMethod, ...groups):
        there is system with such name
        => updateGroup(groupName) must call new updateMethod for each groupб
           don't call old updateMethod`,
    () => {
        let worldMock = {};
        let systemManager = new SystemManager(worldMock);
        let originalSystem = jest.fn();
        let newSystem = jest.fn();
        systemManager.putSystem('system', originalSystem, 'group1', 'group2', 'group3');

        systemManager.putSystem('system', newSystem, 'group3', 'group4', 'group5');
        systemManager.updateGroup('group1');
        systemManager.updateGroup('group2');
        systemManager.updateGroup('group3');
        systemManager.updateGroup('group4');
        systemManager.updateGroup('group5');

        expect(originalSystem).toHaveBeenCalledTimes(0);
        expect(newSystem).toHaveBeenCalledTimes(3);
        expect(newSystem.mock.calls[0][1]).toBe('group3');
        expect(newSystem.mock.calls[1][1]).toBe('group4');
        expect(newSystem.mock.calls[2][1]).toBe('group5');
    });

test(`updateMethod(groupName):
        there is not group with this name
        => do nothing`,
    () => {
        let worldMock = {};
        let systemManager = new SystemManager(worldMock);
        let system = jest.fn();
        systemManager.putSystem('system1', system, 'group1');

        systemManager.updateGroup('group2');

        expect(system).toHaveBeenCalledTimes(0);
    });

test(`removeSystem(name):
        there is not system with this name
        => don't change system manager state`,
    () => {
        let worldMock = {};
        let systemManager = new SystemManager(worldMock);
        let system1 = jest.fn();
        let system2 = jest.fn();
        let system3 = jest.fn();
        systemManager.putSystem('system1', system1, 'group1', 'group2', 'group3');
        systemManager.putSystem('system2', system2, 'group1', 'group2');
        systemManager.putSystem('system3', system3, 'group1');

        systemManager.removeSystem('unknown system');
        systemManager.updateGroup('group1');
        systemManager.updateGroup('group2');
        systemManager.updateGroup('group3');

        expect(system1).toHaveBeenCalledTimes(3);
        expect(system2).toHaveBeenCalledTimes(2);
        expect(system3).toHaveBeenCalledTimes(1);
    });

test(`removeSystem(name):
        there is system with this name
        => remove this system,
           don't change other systems`,
    () => {
        let worldMock = {};
        let systemManager = new SystemManager(worldMock);
        let system1 = jest.fn(() => {});
        let system2 = jest.fn(() => {});
        let system3 = jest.fn(() => {});
        systemManager.putSystem('system1', system1, 'group1', 'group2', 'group3');
        systemManager.putSystem('system2', system2, 'group1', 'group2');
        systemManager.putSystem('system3', system3, 'group1');

        systemManager.removeSystem('system2');
        systemManager.updateGroup('group1');
        systemManager.updateGroup('group2');
        systemManager.updateGroup('group3');

        expect(system1).toHaveBeenCalledTimes(3);
        expect(system2).toHaveBeenCalledTimes(0);
        expect(system3).toHaveBeenCalledTimes(1);
    });