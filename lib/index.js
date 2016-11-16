'use strict';

class TeamcityReporter {
    constructor(emitter, reporterOptions, options) {
        this.reporterOptions = reporterOptions;
        this.options = options;
        const events = 'start beforeIteration iteration beforeItem item beforePrerequest prerequest beforeScript script beforeRequest request beforeTest test beforeAssertion assertion console exception beforeDone done'.split(' ');
        events.forEach((e) => { if (typeof this[e] == 'function') emitter.on(e, (err, args) => this[e](err, args)) });
    }

    start(err, args) {
        console.log(`##teamcity[testSuiteStarted name='${this.options.collection.name}']`);
    }

    beforeItem(err, args) {
        this.currItem = {name: args.item.name, passed: true, failedAssertions: []};
        console.log(`##teamcity[testStarted name='${this.currItem.name}' captureStandardOutput='true']`);
    }

    beforeRequest(err, args) {
        console.log(args.request.method, args.request.url.toString());
    }

    request(err, args) {
        if (err) {
            console.log('request error');
        } else {
            const sizeObj = args.response.size();
            const size = sizeObj && (sizeObj.header || 0) + (sizeObj.body || 0) || 0;
            console.log(`Response code: ${args.response.code}, duration: ${args.response.responseTime}ms, size: ${size} bytes`);
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
            const details = `Response code: ${this.currItem.response.code}, reason: ${this.currItem.response.reason()}`;
            console.log(`##teamcity[testFailed name='${args.item.name}' message='${msg}' details='${msg}\n${details}']`);
            let body;
            try { body = JSON.parse(this.currItem.response) } catch (e) { body = '' };
            console.log('Response body:', body);
        }
        console.log(`##teamcity[testFinished name='${args.item.name}' duration='${this.currItem.response.responseTime}']`);
    }

    done(err, args) {
        console.log(`##teamcity[testSuiteFinished name='${this.options.collection.name}']`);
    }
}

module.exports = TeamcityReporter;
