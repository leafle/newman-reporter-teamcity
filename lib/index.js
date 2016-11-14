'use strict';

class TeamcityReporter {
    constructor(emitter, etc, options) {
        if (options.silent || reporterOptions.silent) {
            return;
        }

        const events = 'start beforeIteration iteration beforeItem item beforePrerequest prerequest beforeScript script beforeRequest request beforeTest test beforeAssertion assertion console exception beforeDone done'.split(' ');
        events.forEach((e) => { if (typeof this[e] == 'function') emitter.on(e, this[e]) });
    }

    start(err, args) {
        console.log('start', arguments);
    }

    done(err, args) {
        console.log('done', arguments);
    }
}

module.exports = TeamcityReporter;
