const {SystemManager} = require('../../../src/code/model/gameEngine/systemManager.js');
const {UnknownSystemException} = require('../../../src/code/model/exception/exceptions.js');

function system(updateMethod) {
    return {
        update: updateMethod
    };
}

test(`putSystem(systemName, system), appendGroup(systemName, groupName):
        there is system with such name,
        system with such was added to several groups,
        add system to system manager
        => updateGroup(groupName) for any group must update new system and doesn't update old system`,
    () => {
        let worldMock = {};
        let systemManager = new SystemManager(worldMock);
        let oldSystemMock = system(jest.fn());
        let newSystemMock = system(jest.fn());

        systemManager.putSystem('system', oldSystemMock).
                    appendToGroup('group1', 'system').
                    appendToGroup('group2', 'system').
                    putSystem('system', newSystemMock);
        systemManager.updateGroup('group1');
        systemManager.updateGroup('group2');

        expect(oldSystemMock.update).toHaveBeenCalledTimes(0);
        expect(newSystemMock.update).toHaveBeenCalledTimes(2);
        expect(newSystemMock.update.mock.calls[0][0].groupName).toEqual('group1');
        expect(newSystemMock.update.mock.calls[1][0].groupName).toEqual('group2');
    });

test(`appendToGroup(systemName, groupName):
        there is not system with such name
        => exception`,
    () => {
        let worldMock = {};
        let systemManager = new SystemManager(worldMock);

        expect(() => systemManager.appendToGroup('system', 'group')).toThrow(UnknownSystemException);
    });

test(`appendToGroup(systemName, groupName):
        add system to several groups
        => updateGroup(groupName) must update this system one time for each groupName`,
    () => {
        let worldMock = {};
        let systemManager = new SystemManager(worldMock);
        let systemMock = system(jest.fn());
        systemManager.putSystem('system', systemMock);

        systemManager.appendToGroup('group1', 'system');
        systemManager.appendToGroup('group2', 'system');
        systemManager.appendToGroup('group3', 'system');
        systemManager.updateGroup('group1');
        systemManager.updateGroup('group2');
        systemManager.updateGroup('group3');

        expect(systemMock.update).toHaveBeenCalledTimes(3);
    });

test(`appendToGroup(systemName, groupName):
        add several systems to one group
        => updateGroup(groupName) must call each system one time in correct order`,
    () => {
        let actual = [];
        let worldMock = {};
        let systemManager = new SystemManager(worldMock);
        let systemMock1 = system((systemHandler, world) => actual.push(systemHandler.systemName));
        let systemMock2 = system((systemHandler, world) => actual.push(systemHandler.systemName));
        let systemMock3 = system((systemHandler, world) => actual.push(systemHandler.systemName));
        systemManager.putSystem('system1', systemMock1)
                    .putSystem('system2', systemMock2)
                    .putSystem('system3', systemMock3);

        systemManager.appendToGroup('group', 'system1')
                    .appendToGroup('group', 'system2')
                    .appendToGroup('group', 'system3');
        systemManager.updateGroup('group');

        expect(actual).toEqual(['system1', 'system2', 'system3']);
    });

test(`appendToGroup(systemName, groupName):
        add the same system to group several time
        => updateGroup(groupName) must call this system several time`,
    () => {
        let worldMock = {};
        let systemManager = new SystemManager(worldMock);
        let systemMock = system(jest.fn());
        systemManager.putSystem('system', systemMock);

        systemManager.appendToGroup('group', 'system')
                    .appendToGroup('group', 'system')
                    .appendToGroup( 'group', 'system');
        systemManager.updateGroup('group');

        expect(systemMock.update).toHaveBeenCalledTimes(3);
    });

test(`updateGroup(groupName):
        there is not group with this name
        => do nothing`,
    () => {
        let worldMock = {};
        let systemManager = new SystemManager(worldMock);
        let systemMock = system(jest.fn());
        systemManager.putSystem('system1', systemMock).appendToGroup('group1', 'system1');

        systemManager.updateGroup('group2');

        expect(systemMock.update).toHaveBeenCalledTimes(0);
    });

test(`removeSystem(name):
        there is not system with this name
        => don't change system manager state`,
    () => {
        let worldMock = {};
        let systemManager = new SystemManager(worldMock);
        let system1 = system(jest.fn());
        let system2 = system(jest.fn());
        let system3 = system(jest.fn());
        systemManager.putSystem('system1', system1).
                    appendToGroup('group1', 'system1').
                    appendToGroup('group2', 'system1').
                    appendToGroup('group3', 'system1');
        systemManager.putSystem('system2', system2).
                    appendToGroup('group1', 'system2').
                    appendToGroup('group2', 'system2');
        systemManager.putSystem('system3', system3).
                    appendToGroup('group1', 'system3');

        systemManager.removeSystem('unknown system');
        systemManager.updateGroup('group1');
        systemManager.updateGroup('group2');
        systemManager.updateGroup('group3');

        expect(system1.update).toHaveBeenCalledTimes(3);
        expect(system2.update).toHaveBeenCalledTimes(2);
        expect(system3.update).toHaveBeenCalledTimes(1);
    });

test(`removeSystem(name):
        there is system with this name
        => remove this system,
           don't change other systems`,
    () => {
        let worldMock = {};
        let systemManager = new SystemManager(worldMock);
        let system1 = system(jest.fn());
        let system2 = system(jest.fn());
        let system3 = system(jest.fn());
        systemManager.putSystem('system1', system1).
                    appendToGroup('group1', 'system1').
                    appendToGroup('group2', 'system1').
                    appendToGroup('group3', 'system1');
        systemManager.putSystem('system2', system2).
                    appendToGroup('group1', 'system2').
                    appendToGroup('group2', 'system2');
        systemManager.putSystem('system3', system3).
                    appendToGroup('group1', 'system3');

        systemManager.removeSystem('system2');
        systemManager.updateGroup('group1');
        systemManager.updateGroup('group2');
        systemManager.updateGroup('group3');

        expect(system1.update).toHaveBeenCalledTimes(3);
        expect(system2.update).toHaveBeenCalledTimes(0);
        expect(system3.update).toHaveBeenCalledTimes(1);
    });