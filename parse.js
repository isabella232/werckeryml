'use strict';

var bluebird = require('bluebird');
var yaml = require('js-yaml');

module.exports = function(input, options, cb) {
  if (typeof options === "function") {
    cb = options;
    options = {};
  }

  if (!input) {
    return bluebird.resolve(null).nodeify(cb);
  }

  var parsed = null;
  try {
    parsed = yaml.safeLoad(input);
  } catch ( e ) {
      // TODO(bvdberg): wrap, instead of replacing error
      return bluebird.resolve(new Error('Unable to parse yaml')).nodeify(cb);
  }

  var normalized = normalizeRoot(parsed);

  return bluebird.resolve(normalized).nodeify(cb);
};

var normalizeRoot = function(parsed) {
  if (parsed.box) {
    parsed.box = normalizeBox(parsed.box);
  }

  if (parsed.services) {
    parsed.services = normalizeServices(parsed.services);
  }

  var pipelines = processPipelines(parsed);
  if (pipelines) {
    parsed.pipelines = pipelines;
  }
  return parsed;
};

var normalizeBox = function(box) {
  if (typeof box === 'string') {
    return {
      id: box
    };
  }

  return box;
};

var normalizeServices = function(services) {
  return services.map(normalizeBox);
};

var processPipelines = function(parsed) {
  var pipelines = {};
  var hasPipelines = false;

  Object.keys(parsed).forEach(function(key) {
    if (skipKey(key)) {
      return;
    }

    pipelines[key] = normalizePipeline(parsed[key]);
    delete parsed[key];
    hasPipelines = true;
  });

  if (hasPipelines) {
    return pipelines;
  }

  return null;
};

var reservedKeys = ['box', 'services', 'command-timeout', 'source-dir', 'no-response-timeout'];
var skipKey = function(key) {
  return reservedKeys.indexOf(key) !== -1;
};

var normalizePipeline = function(pipeline) {
  if (!pipeline) {
    return null;
  }

  if (pipeline.box) {
    pipeline.box = normalizeBox(pipeline.box);
  }

  if (pipeline.services) {
    pipeline.services = normalizeServices(pipeline.services);
  }

  if (pipeline.steps) {
    pipeline.steps = normalizeSteps(pipeline.steps);
  }

  return pipeline;
};

var normalizeSteps = function(steps) {
  return steps.map(normalizeStep);
};

var normalizeStep = function(step) {
  if (typeof step === 'string') {
    return {
      id: step
    };
  }

  if (typeof step === 'object') {
    var keys = Object.keys(step);
    if (keys.length === 1 && typeof step[keys[0]] === 'object') {
      var o = step[keys[0]];
      o.id = keys[0];
      return o;
    }

    if (keys.length > 1) {
      var nullKeys = keys.filter(hasNullValue.bind(null, step));
      if (nullKeys.length === 1) {
        var id = nullKeys[0];
        step.id = id;
        delete step[id];
      }
    }
  }

  return step;
};

var hasNullValue = function(o, key) {
  return o[key] === null;
};
