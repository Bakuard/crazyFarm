const {Game} = require('../../../src/code/model/logic/game.js');

test(`init game:
        doesn't thow any exceptions`,
    () => {
        expect(() => new Game(data => {})).not.toThrow();
    }); 