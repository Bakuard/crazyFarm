'use strict'

module.exports.TutorialSystem = class TutorialSystem {

    constructor(user, userRepository) {
        this.user = user;
        this.userRepository = userRepository;
        this.currentStep = 1;
    }

    update(systemHandler, world) {
        const manager = world.getEntityComponentManager();
        const eventManager = world.getEventManager();

        if(this.currentStep == 1) {
            const event = eventManager.events('seeds').find(event => event.cellX == 0 && event.cellY == 1);

        }

        eventManager.clearAll();
    }
}
