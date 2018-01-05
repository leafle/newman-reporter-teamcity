const {EventEmitter} = require('events');
const TeamcityReporter = require('./TeamcityReporter');

const reporterOptions = {};
const options = {
 collection: {name: "TestCollection"},
};
const err = undefined;
const args = {
  item: {name: "TestName", parent() { return {name: "FolderName"}; }},
};
let outputData = "";
const storeLog = inputs => (outputData += inputs + "~~~");

test('#escape() escapes special chars correctly', () => {
  const sut = new TeamcityReporter(new EventEmitter(), reporterOptions, options);
  const actual = sut.escape('Apostrophe: \', line feed: \n, carriage return: \r, Unicode: \ubabe, pipe: |, left bracket: [, right bracket: ]');
  expect(actual).toBe('Apostrophe: |\', line feed: |n, carriage return: |r, Unicode: |0xbabe, pipe: ||, left bracket: |[, right bracket: |]');
});

test('#beforeItem correctly handles tests within a folder', () => {
  const emitter = new EventEmitter();
  const reporter = new TeamcityReporter(emitter, reporterOptions, options);
  console["log"] = jest.fn(storeLog);

  emitter.emit('beforeItem', err, args);
  expect(outputData).toEqual(expect.stringMatching(/^##teamcity\[testStarted name='FolderName\/TestName' .*\]~~~$/));
});

test('reporter exclusively emits well-formatted TC messages', () => {
  const emitter = new EventEmitter();
  const reporter = new TeamcityReporter(emitter, reporterOptions, options);
  const events = 'start beforeIteration iteration beforeItem item beforePrerequest prerequest beforeScript script beforeRequest request beforeTest test beforeAssertion assertion console exception beforeDone done'.split(' ');

  console["log"] = jest.fn(storeLog);

  events.forEach((e) => { emitter.emit(e, err, args) });
  outputData.split("~~~") // separate into individual messages
            .slice(0, -1) // drop the last element which is an empty string
            .forEach((msg) => {
              expect(msg).toEqual(expect.stringMatching(/^##teamcity\[.*\]$/));
            });
});
