'use strict';

var werckeryml = require('./');
var test = require('tape');

test('invalid yaml should throw', function(t) {
  var input = '---\n' +
    '   box ubuntu\n' +
    '  box ubuntu\n';

  t.throws(werckeryml.parse.bind(null, input), /Unable to parse yaml/);
  t.end();
});

test('should return null on empty input', function(t) {
  var w = werckeryml.parse('');
  t.equal(w, null);
  t.end();
});

test('should expand box property', function(t) {
  var input = '---\n' +
    'box: ubuntu\n';
  var expected = {
    box: {
      id: 'ubuntu'
    }
  };

  var w = werckeryml.parse(input);
  t.deepEqual(w, expected);
  t.end();
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

  var w = werckeryml.parse(input);
  t.deepEqual(w, expected);
  t.end();
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

  var w = werckeryml.parse(input);
  t.deepEqual(w, expected);
  t.end();
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

  var w = werckeryml.parse(input);
  t.deepEqual(w, expected);
  t.end();
});

test('should handle pipelines', function(t) {
  var input = '---\n' +
    'build:\n' +
    '  box: ubuntu\n' +
    'deploy:\n' +
    '  box: ubuntu\n';
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
      }
    }
  };

  var w = werckeryml.parse(input);
  t.deepEqual(w, expected);
  t.end();
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

  var w = werckeryml.parse(input);
  t.deepEqual(w, expected);
  t.end();
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

  var w = werckeryml.parse(input);
  t.deepEqual(w, expected);
  t.end();
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

  var w = werckeryml.parse(input);
  t.deepEqual(w, expected);
  t.end();
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

  var w = werckeryml.parse(input);
  t.deepEqual(w, expected);
  t.end();
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

  var w = werckeryml.parse(input);
  t.deepEqual(w, expected);
  t.end();
});

test('should handle after steps in pipelines', function(t) {
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
    '  after-steps:\n' +
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
        'after-steps': [
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
  };

  var w = werckeryml.parse(input);
  t.deepEqual(w, expected);
  t.end();
});

test('should only support objects for root', function(t) {
  var input = '---\n' +
    '- item1\n' +
    '- item2';
  t.throws(werckeryml.parse.bind(null, input), /root object should be an object/);
  t.end();
});

test('should only support strings and objects for box', function(t) {
  var input = '---\n' +
    'box: 1234\n';

  t.throws(werckeryml.parse.bind(null, input), /box \(or service item\) should be object or string/);
  t.end();
});

test('should only support an array for services', function(t) {
  var input = '---\n' +
    'services: 1234\n';

  t.throws(werckeryml.parse.bind(null, input), /services should be an array/);
  t.end();
});

test('should only support objects for pipelines', function(t) {
  var input = '---\n' +
    'build: 1234\n';

  t.throws(werckeryml.parse.bind(null, input), /pipeline should be an object/);
  t.end();
});

test('should only support objects for pipelines (not array)', function(t) {
  var input = '---\n' +
    'build:\n' +
    '  - 1234';

  t.throws(werckeryml.parse.bind(null, input), /pipeline should be an object/);
  t.end();
});

test('should only support an array for steps', function(t) {
  var input = '---\n' +
    'build:\n' +
    '  steps: 1234\n';

  t.throws(werckeryml.parse.bind(null, input), /steps should be an array/);
  t.end();
});

test('should only support strings or objects for step', function(t) {
  var input = '---\n' +
    'build:\n' +
    '  steps:\n' +
    '    - 123';

  t.throws(werckeryml.parse.bind(null, input), /step should be object or string/);
  t.end();
});

test('should only support strings or objects for step (not array)', function(t) {
  var input = '---\n' +
    'build:\n' +
    '  steps:\n' +
    '    - [ "foo", "bar" ]';

  t.throws(werckeryml.parse.bind(null, input), /step should be object or string/);
  t.end();
});

test('should only support strings or objects for step (not array as inner object)', function(t) {
  var input = '---\n' +
    'build:\n' +
    '  steps:\n' +
    '    - script:\n' +
    '        - 123';

  t.throws(werckeryml.parse.bind(null, input), /step should be object or string/);
  t.end();
});

test('should only support a single null value for flat steps', function(t) {
  var input = '---\n' +
    'build:\n' +
    '  steps:\n' +
    '    - script:\n' +
    '      key2:';

  t.throws(werckeryml.parse.bind(null, input), /only a single null value is supported/);
  t.end();
});
