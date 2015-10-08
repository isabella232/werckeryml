'use strict';

var parser = require('./');
var test = require('tape');

test('should return null on empty input', function(t) {
  parser.parse('', function(err, w) {
    t.error(err);
    t.equal(w, null);
    t.end();
  });
});

test('should expand box property', function(t) {
  var input = '---\n' +
    'box: ubuntu\n';
  var expected = {
    box: {
      id: 'ubuntu'
    }
  };

  parser.parse(input, function(err, w) {
    t.error(err);
    t.deepEqual(w, expected);
    t.end();
  });
});

test('should keep expanded box property', function(t) {
  var input = '---\n' +
    'box: \n' +
    '  id: ubuntu\n';
  var expected = {
    box: {
      id: 'ubuntu'
    }
  };

  parser.parse(input, function(err, w) {
    t.error(err);
    t.deepEqual(w, expected);
    t.end();
  });
});

test('should expand services property', function(t) {
  var input = '---\n' +
    'services:\n' +
    '  - ubuntu';
  var expected = {
    services: [
      {
        id: 'ubuntu'
      }
    ]
  };

  parser.parse(input, function(err, w) {
    t.error(err);
    t.deepEqual(w, expected);
    t.end();
  });
});

test('should keep expanded services property', function(t) {
  var input = '---\n' +
    'services:\n' +
    '  - id: ubuntu';
  var expected = {
    services: [
      {
        id: 'ubuntu'
      }
    ]
  };

  parser.parse(input, function(err, w) {
    t.error(err);
    t.deepEqual(w, expected);
    t.end();
  });
});

test('should handle pipelines', function(t) {
  var input = '---\n' +
    'build:\n' +
    'deploy:\n';
  var expected = {
    pipelines: {
      build: null,
      deploy: null
    }
  };

  parser.parse(input, function(err, w) {
    t.error(err);
    t.deepEqual(w, expected);
    t.end();
  });
});

test('should handle box in pipelines', function(t) {
  var input = '---\n' +
    'build:\n' +
    '  box: ubuntu\n' +
    'deploy:\n' +
    '  box:\n' +
    '    id: ubuntu';
  var expected = {
    pipelines: {
      build: {
        box: {
          id: 'ubuntu'
        }
      },
      deploy: {
        box: {
          id: 'ubuntu'
        }
      },
    }
  };

  parser.parse(input, function(err, w) {
    t.error(err);
    t.deepEqual(w, expected);
    t.end();
  });
});

test('should handle services in pipelines', function(t) {
  var input = '---\n' +
    'build:\n' +
    '  services: \n' +
    '    - mysql\n' +
    '    - id: mongodb\n' +
    'deploy:\n' +
    '  box:\n' +
    '    id: ubuntu';
  var expected = {
    pipelines: {
      build: {
        services: [
          {
            id: 'mysql'
          },
          {
            id: 'mongodb'
          },
        ]
      },
      deploy: {
        box: {
          id: 'ubuntu'
        }
      },
    }
  };

  parser.parse(input, function(err, w) {
    t.error(err);
    t.deepEqual(w, expected);
    t.end();
  });
});

test('should handle steps in pipelines', function(t) {
  var input = '---\n' +
    'build:\n' +
    '  steps:\n' +
    '    - npm-install\n' +
    '    - script:\n' +
    '      name: echo foo\n' +
    '      code: echo foo\n' +
    '    - script:\n' +
    '        name: echo bar\n' +
    '        code: echo bar';
  var expected = {
    pipelines: {
      build: {
        steps: [
          {
            id: 'npm-install',
          },
          {
            id: 'script',
            name: 'echo foo',
            code: 'echo foo',
          },
          {
            id: 'script',
            name: 'echo bar',
            code: 'echo bar',
          },
        ]
      },
    }
  };

  parser.parse(input, function(err, w) {
    t.error(err);
    t.deepEqual(w, expected);
    t.end();
  });
});

test('should not process reserved keys as pipelines', function(t) {
  var input = '---\n' +
    'box: ubuntu\n' +
    'services:\n' +
    '  - mysql\n' +
    'command-timeout: 60\n' +
    'no-response-timeout: 60\n' +
    'source-dir: src';
  var expected = {
    box: {
      id: 'ubuntu'
    },
    services: [
      {
        id: 'mysql'
      },
    ],
    'command-timeout': 60,
    'no-response-timeout': 60,
    'source-dir': 'src',
  };

  parser.parse(input, function(err, w) {
    t.error(err);
    t.deepEqual(w, expected);
    t.end();
  });
});

test('should handle extra steps in pipelines', function(t) {
  var input = '---\n' +
    'build:\n' +
    '  steps:\n' +
    '    - npm-install\n' +
    '    - script:\n' +
    '      name: echo foo\n' +
    '      code: echo foo\n' +
    '    - script:\n' +
    '        name: echo bar\n' +
    '        code: echo bar\n' +
    '  custom-section:\n' +
    '    - npm-install\n' +
    '    - script:\n' +
    '      name: echo foo\n' +
    '      code: echo foo\n' +
    '    - script:\n' +
    '        name: echo bar\n' +
    '        code: echo bar';
  var expected = {
    pipelines: {
      build: {
        steps: [
            {
              id: 'npm-install',
            },
            {
              id: 'script',
              name: 'echo foo',
              code: 'echo foo',
            },
            {
              id: 'script',
              name: 'echo bar',
              code: 'echo bar',
            },
          ],
        extraSteps: {
          'custom-section': [
            {
              id: 'npm-install',
            },
            {
              id: 'script',
              name: 'echo foo',
              code: 'echo foo',
            },
            {
              id: 'script',
              name: 'echo bar',
              code: 'echo bar',
            },
          ],
        },
      }
    }
  };

  parser.parse(input, function(err, w) {
    t.error(err);
    t.deepEqual(w, expected);
    t.end();
  });
});
