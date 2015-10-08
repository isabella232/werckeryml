# werckeryml

A wercker.yml parser and dumper. This will parse a input string to a
normalized object model.

## Usage

```javascript
var werckeryml = require('werckeryml');

var raw = 'box: ubuntu';

werckeryml.parse(raw, function(err, obj) {
  if (err) {
    console.log(err);
    return;
  }
  console.dir(obj);
});
```

## API

### parse(input, options, cb)

`input` needs to be a string. Supports either a `cb` or a promise based
pattern. Returns a normalized object model. `options` is currently empty.

