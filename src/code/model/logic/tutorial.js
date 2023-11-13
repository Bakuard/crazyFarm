'use strict'

module.exports.TutorialSystem = class TutorialSystem {

    constructor(user, userRepository) {
        this.user = user;
        this.userRepository = userRepository;
        this.currentStep = 0;
    }

    update(systemHandler, world) {
        const manager = world.getEntityComponentManager();
        const eventManager = world.getEventManager();
        const systemManager = world.getSystemManager();

        if(this.currentStep == 0) {
            systemManager.putSystem('PlantNewVegetableSystem', fabric.plantNewVegetableSystem()()).
                        appendToGroup('PlantNewVegetableSystem', groups.update);
            this.currentStep == 1;
        } else if(this.currentStep == 1) {
            const event = eventManager.events('seeds').find(event => event.cellX == 1 && event.cellY == 0);
            eventManager.clearAll();
            if(event) {
                eventManager.writeEvent('seeds', event);
                this.currentStep = 2;
            }
        } else if(this.currentStep == 2) {
            
        }
    }
}
