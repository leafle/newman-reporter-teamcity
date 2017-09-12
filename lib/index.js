'use strict';
const uuidv4 = require('uuid/v4');

class TeamcityReporter {
    constructor(emitter, reporterOptions, options) {
        this.reporterOptions = reporterOptions;
        this.options = options;
        this.flowId = uuidv4();
        const events = 'start beforeIteration iteration beforeItem item beforePrerequest prerequest beforeScript script beforeRequest request beforeTest test beforeAssertion assertion console exception beforeDone done'.split(' ');
        events.forEach((e) => { if (typeof this[e] == 'function') emitter.on(e, (err, args) => this[e](err, args)) });
    }

    start(err, args) {
        console.log(`##teamcity[testSuiteStarted name='${this.options.collection.name}' flowId='${this.flowId}']`);
    }

    beforeItem(err, args) {
        this.currItem = {name: args.item.name, passed: true, failedAssertions: []};
        console.log(`##teamcity[testStarted name='${this.currItem.name}' captureStandardOutput='true' flowId='${this.flowId}']`);
    }

    request(err, args) {
        if (!err) {
            this.currItem.response = args.response;
        }
    }

    assertion(err, args) {
        if (err) {
            this.currItem.passed = false;
            this.currItem.failedAssertions.push(args.assertion);
        }
    }

    item(err, args) {
        if (!this.currItem.passed) {
            const msg = this.currItem.failedAssertions.join(", ");
            const responseCode = (this.currItem.response && this.currItem.response.responseTime) || "-";
            const reason = (this.currItem.response && this.currItem.response.reason()) || "-";
            const details = `Response code: ${responseCode}, reason: ${reason}`;
            console.log(`##teamcity[testFailed name='${args.item.name}' message='${msg}' details='${msg} - ${details}' flowId='${this.flowId}']`);
        }
        const duration = (this.currItem.response && this.currItem.response.responseTime) || 0;
        console.log(`##teamcity[testFinished name='${args.item.name}' duration='${duration}' flowId='${this.flowId}']`);
    }

    done(err, args) {
        console.log(`##teamcity[testSuiteFinished name='${this.options.collection.name}' flowId='${this.flowId}']`);
    }
}

module.exports = TeamcityReporter;
