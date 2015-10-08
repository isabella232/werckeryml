# werckeryml

A wercker.yml parser and dumper. This will parse a input string to a
normalized object model.

## Usage

```javascript
var werckeryml = require('werckeryml');

var raw = 'box: ubuntu';

try {
  var obj = werckeryml.parse(raw);
  console.dir(obj);
} catch (e) {
    console.log(err);
}
```

## API

### parse(input)

Takes a `wercker.yml` text representation and parses it into a normalized
representation. `input` needs to be a string. 
