const {EventEmitter} = require('events');
const expect = require('expect.js');
const TeamcityReporter = require('../lib/TeamcityReporter');

describe('TeamcityReporter', () => {
    describe('#escape()', () => {
        it('should return the expected value', () => {
            const sut = new TeamcityReporter(new EventEmitter());
            const actual = sut.escape('Apostrophe: \', line feed: \n, carriage return: \r, Unicode: \ubabe, pipe: |, left bracket: [, right bracket: ]');
            expect(actual).to.equal('Apostrophe: |\', line feed: |n, carriage return: |r, Unicode: |0xbabe, pipe: ||, left bracket: |[, right bracket: |]');
        });
    });
});
