const {SystemManager} = require('../../../src/code/model/gameEngine/systemManager.js');

test(`putSystem(name, updateMethod, ...groups):
        there is not system with this name,
        add system to one group
        => updateGroup(groupName) must update this system`,
    () => {
        let worldMock = {};
        let systemManager = new SystemManager(worldMock);
        let systemMock = jest.fn((groupName, world) => {});

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
        let systemMock = jest.fn((groupName, world) => {});

        systemManager.putSystem('system1', systemMock, 'groupA', 'groupB', 'groupC');
        systemManager.updateGroup('groupA');
        systemManager.updateGroup('groupB');
        systemManager.updateGroup('groupC');

        expect(systemMock.mock.calls).toHaveLength(3);
        expect(systemMock.mock.calls[0][0]).toEqual('groupA');
        expect(systemMock.mock.calls[1][0]).toEqual('groupB');
        expect(systemMock.mock.calls[2][0]).toEqual('groupC');
    });

test(`putSystem(name, updateMethod, ...groups):
        add several systems to one group
        => updateGroup(groupName) must call each system one time in correct order`,
    () => {
        let worldMock = {};
        let systemManager = new SystemManager(worldMock);

        let actual = [];
        systemManager.putSystem('system1', (groupName, world) => actual.push('system1'), 'group');
        systemManager.putSystem('system2', (groupName, world) => actual.push('system2'), 'group');
        systemManager.putSystem('system3', (groupName, world) => actual.push('system3'), 'group');
        systemManager.updateGroup('group');

        expect(actual).toEqual(['system1', 'system2', 'system3']);
    });