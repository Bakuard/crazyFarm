const {JwsService} = require('../../src/code/service/jwsService.js');

test(`generate and parse jws:
       use the same key for generate and parse
       => parser must return the same payload`, 
    () => {
        const jwsService = new JwsService();
        const expected = {
            id: '123456789',
            value: 'some value',
            arr: ['a', 'b', 'c', 'd', 'e', 'f']
        };

        let jws = jwsService.generateJws(expected, 'key1', 1000000);
        let actual = jwsService.parseJws(jws, 'key1');

        expect(expected).toEqual(actual);
    });

test(`generate and parse token:
        generate several JWS for different jws bodies,
        use unique key-pair for each JWS
        => parser must return correct JWS body for each JWS`, 
    () => {
        const jwsService = new JwsService();
        const expected1 = {
            id: '123456789',
            value: 'some value',
            arr: ['a', 'b', 'c', 'd', 'e', 'f']
        };
        const expected2 = {
            id: '1010101010',
            value: 'other value',
            arr: [1, 2, 34, 100]
        };

        let jws1 = jwsService.generateJws(expected1, 'key1', 1000000);
        let jws2 = jwsService.generateJws(expected2, 'key2', 1000000);
        let actual1 = jwsService.parseJws(jws1, 'key1');
        let actual2 = jwsService.parseJws(jws2, 'key2');

        expect(expected1).toEqual(actual1);
        expect(expected2).toEqual(actual2);
    });