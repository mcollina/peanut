/**
 * Module dependencies.
 */

var path = require('path');
var _ = require('underscore')._;
var formatGherkin = require('./brain/format_gherkin');

/**
 * Utils.
 */

var deepCopy = exports.deepCopy = function(obj) {
  return JSON.parse(JSON.stringify(obj));
};

var nil = exports.nil = function(attr) {
  return _.isUndefined(attr) || _.isEmpty(attr);
};

exports.replaceKeyWithVal = function(str, key, val) {
  var replacedKey = str.replace(new RegExp('<'+key+'>','g'), val);
  return replacedKey;
};

exports.toVarName = function(fileName) {
  var fileName = path.normalize(fileName);
  return fileName.replace('.feature','').replace('/','_').replace(' ','_');
};

exports.createStepCallback =
function(step, timeoutId, isRunning, scenarioState, callback) {
  return {
    done: function() {
      if (isRunning) {
        clearTimeout(timeoutId);
        if (scenarioState._state !== 'failed') {
          __peanut__.formatter.step.success(step);
          callback();
        }
      }
    },
    pending: function() {
      if (isRunning) {
        clearTimeout(timeoutId);
        scenarioState._state = 'failed';
        __peanut__.formatter.step.pending(step);
        callback();
      }
    }
  };
};

exports.selectStepDefinition = function(step) {
  var stepName = nil(step[3]) ? step[0] : step[3];
  var stepDef = _(__peanut__.stepDefinitions).select(function(stepDefinition) {
    return stepDefinition.step === stepName &&
           stepDefinition.pattern.exec(step[2]) !== null;
  })[0];

  if(stepDef !== undefined) {
    var callback = stepDef.callback;

    stepDef = deepCopy(stepDef);
    stepDef.callback = callback;
  }

  return stepDef;
};
