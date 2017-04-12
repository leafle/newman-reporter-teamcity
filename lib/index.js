// @flow
'use strict';

class TeamcityReporter {
    reporterOptions: Object;
    options: Object;
    currItem: Object;

    constructor(emitter: Object, reporterOptions: Object, options: Object) {
        this.reporterOptions = reporterOptions;
        this.options = options;
        const events = 'start beforeIteration iteration beforeItem item beforePrerequest prerequest beforeScript script beforeRequest request beforeTest test beforeAssertion assertion console exception beforeDone done'.split(' ');
        // $FlowIgnore: no flow support for annotating "Indexable signatures"
        events.forEach((e) => { if (typeof this[e] == 'function') emitter.on(e, (err, args) => this[e](err, args)) });
    }

    start(err: Object, args: Object) {
        console.log(`##teamcity[testSuiteStarted name='${this.options.collection.name}']`);
    }

    beforeItem(err: Object, args: Object) {
        this.currItem = {name: args.item.name, passed: true, failedAssertions: []};
        console.log(`##teamcity[testStarted name='${this.currItem.name}' captureStandardOutput='true']`);
    }

    beforeRequest(err: Object, args: Object) {
        console.log(args.request.method, args.request.url.toString());
    }

    request(err: Object, args: Object) {
        if (err) {
            console.log('request error');
        } else {
            const sizeObj = args.response.size();
            const size = sizeObj && (sizeObj.header || 0) + (sizeObj.body || 0) || 0;
            console.log(`Response code: ${args.response.code}, duration: ${args.response.responseTime}ms, size: ${size} bytes`);
            this.currItem.response = args.response;
        }
    }

    assertion(err: Object, args: Object) {
        if (err) {
            this.currItem.passed = false;
            this.currItem.failedAssertions.push(args.assertion);
        }
    }

    item(err: Object, args: Object) {
        if (!this.currItem.passed) {
            const msg = this.currItem.failedAssertions.join(", ");
            const details = `Response code: ${this.currItem.response.code}, reason: ${this.currItem.response.reason()}`;
            console.log(`##teamcity[testFailed name='${args.item.name}' message='${msg}' details='${msg} - ${details}']`);
            let body;
            try { body = JSON.parse(this.currItem.response.body) } catch (e) { body = '' };
            console.log('Response body:', body);
            console.log(`##teamcity[testFinished name='${args.item.name}' duration='${this.currItem.response.responseTime}']`);
        } else {
            console.log(`##teamcity[testFailed name='${args.item.name}' errorDetails='${err}' status='ERROR']`);
        }
    }

    done(err: Object, args: Object) {
        console.log(`##teamcity[testSuiteFinished name='${this.options.collection.name}']`);
    }
}

module.exports = TeamcityReporter;
