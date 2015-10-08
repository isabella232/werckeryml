'use strict';

var yaml = require('js-yaml');

module.exports = function(input) {
  if (!input) {
    return null;
  }

  var parsed = null;
  try {
    parsed = yaml.safeLoad(input);
  } catch ( e ) {
      // TODO(bvdberg): wrap, instead of replacing error
      throw new Error('Unable to parse yaml');
  }

  var normalized = normalizeRoot(parsed);

  return normalized;
};

// hasNullValue returns true if o[key] has a value of null.
var hasNullValue = function(o, key) {
  return o[key] === null;
};

// reservedRootKeys are the keys which should not be normalized as pipeline.
var reservedRootKeys = [
  'box',
  'services',
  'command-timeout',
  'source-dir',
  'no-response-timeout'
];

// shouldProcessPipelineKey returns true if key is not present in
// reservedRootKeys.
var shouldProcessPipelineKey = function(key) {
  return reservedRootKeys.indexOf(key) === -1;
};

// reservedPipelineKeys are the keys which should not be normalized as extra
// steps.
var reservedPipelineKeys = [
  'box',
  'services',
  'steps',
  'after-steps'
];

// shouldProcessExtraStepsKey returns true if key is not present in
// reservedPipelineKeys.
var shouldProcessExtraStepsKey = function(key) {
  return reservedPipelineKeys.indexOf(key) === -1;
};

// normalizeRoot normalize the root object of a wercker.yml. It will normalize
// all expected properties to their normalized forms (see reserved
// reservedRootKeys), and it will try to convert all non reserved keys to
// pipelines. All pipelines will be stored in the pipelines property.
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

// normalizeBox normalizes a box property (found in box, services, and
// pipelines) into the long format notation. It currently supports the
// following input formats:
// - Short form:
// box: "ubuntu"
// - Long form:
// box:
//   id: "ubuntu"
var normalizeBox = function(box) {
  if (typeof box === 'string') {
    return {
      id: box
    };
  }

  return box;
};

// normalizeServices takes an array of services, and runs them through
// normalizeBox.
var normalizeServices = function(services) {
  return services.map(normalizeBox);
};

// normalizePipeline takes an pipeline object and normalizes any properties.
// If any extra steps are present, then they will be moved in the extraSteps
// property.
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

  if (pipeline['after-steps']) {
    pipeline['after-steps'] = normalizeSteps(pipeline['after-steps']);
  }

  var extraSteps = processExtraSteps(pipeline);
  if (extraSteps) {
    pipeline.extraSteps = extraSteps;
  }

  return pipeline;
};

// normalizeSteps takes an array of steps, and runs them through normalizeStep.
var normalizeSteps = function(steps) {
  return steps.map(normalizeStep);
};

// normalizeStep takes an step object and normalizes it to to include the id
// property. The following formats are supported:
// - Short form (just a string):
// npm_install
// - Long form (map where the properties are indented):
// script:
//   name: sample
// - Long form (map where the properties are not indented):
// script:
// name: sample
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

// processPipelines takes a root object, and returns an array of normalized
// pipelines. It will ignore any reserved keys, and it will delete the original
// keys from the root object.
var processPipelines = function(parsed) {
  var pipelines = {};
  var hasPipelines = false;

  Object.keys(parsed)
    .filter(shouldProcessPipelineKey)
    .forEach(function(key) {
      pipelines[key] = normalizePipeline(parsed[key]);
      delete parsed[key];
      hasPipelines = true;
    });

  if (hasPipelines) {
    return pipelines;
  }

  return null;
};

// processExtraSteps takes a pipeline object, and returns an array of
// normalized extra steps. It will ignore any reserved keys, and it will delete
// the original keys from the root object.
var processExtraSteps = function(pipeline) {
  var extraSteps = {};
  var hasExtraSteps = false;

  Object.keys(pipeline)
    .filter(shouldProcessExtraStepsKey)
    .forEach(function(key) {
      extraSteps[key] = normalizeSteps(pipeline[key]);
      delete pipeline[key];
      hasExtraSteps = true;
    });

  if (hasExtraSteps) {
    return extraSteps;
  }

  return null;
};
