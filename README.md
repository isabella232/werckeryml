# werckeryml-parser

A wercker.yml parser. This will parse a input string to a normalized object
model.

## Usage

```javascript
var parser = require('werckeryml-parser');

var raw = 'box: ubuntu';

parser.parse(raw, function(err, werckeryml) {
  if (err) {
    console.log(err);
    return;
  }
  console.dir
});
```

## API

### parse(input, options, cb)

`input` needs to be a string. Supports either a `cb` or a promise based
pattern. Returns a normalized object model. `options` is currently empty.

