const {Grid} = require('../../../../src/code/model/logic/store/grid.js');

describe.each([
    {x: 10, y: 10, gridWidth: 20, gridHeight: 20, inBound: true},

    {x: 0, y: 10, gridWidth: 20, gridHeight: 20, inBound: true},
    {x: 10, y: 0, gridWidth: 20, gridHeight: 20, inBound: true},
    {x: 19, y: 10, gridWidth: 20, gridHeight: 20, inBound: true},
    {x: 10, y: 19, gridWidth: 20, gridHeight: 20, inBound: true},

    {x: -1, y: 10, gridWidth: 20, gridHeight: 20, inBound: false},
    {x: 10, y: -1, gridWidth: 20, gridHeight: 20, inBound: false},
    {x: 20, y: 10, gridWidth: 20, gridHeight: 20, inBound: false},
    {x: 10, y: 20, gridWidth: 20, gridHeight: 20, inBound: false},

    {x: 0, y: 0, gridWidth: 0, gridHeight: 0, inBound: false}
])(`inBound(x, y):`,
    ({x, y, gridWidth, gridHeight, inBound}) => {
        test(`x ${x}, y ${y}, gridWidth ${gridWidth},gridHeight ${gridHeight}
              => expected return result ${inBound}`,
        () => {
            let grid = new Grid(gridWidth, gridHeight);

            expect(grid.inBound(x, y)).toBe(inBound);
        });
    }
);

describe.each([
    {x: 10, y: 10, gridWidth: 20, gridHeight: 20, expectResult: ['9|9',  '10|9',  '11|9',
                                                                 '9|10',          '11|10',
                                                                 '9|11', '10|11', '11|11']},
    {x: 0, y: 0, gridWidth: 20, gridHeight: 20, expectResult: [       '1|0',
                                                               '0|1', '1|1']},
    {x: 19, y: 19, gridWidth: 20, gridHeight: 20, expectResult: ['18|18', '19|18',
                                                                 '18|19']}
])(`getNeigboursFor(x, y):`,
    ({x, y, gridWidth, gridHeight, expectResult}) => {
        test(`x ${x}, y ${y}, gridWidth ${gridWidth}, gridHeight ${gridHeight}
              => expected return result ${expectResult}`,
        () => {
            let grid = new Grid(gridWidth, gridHeight);
            grid.forEach((currentX, currentY) => grid.write(currentX, currentY, currentX + '|' + currentY));

            let actual = grid.getNeigboursFor(x, y).map(cell => cell.value);

            expect(actual).toEqual(expectResult);
        });
    }
);