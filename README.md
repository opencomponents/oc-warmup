oc-warmup [![Build Status](https://secure.travis-ci.org/opencomponents/oc-warmup.png?branch=master)](http://travis-ci.org/opencomponents/oc-warmup)
===============

[![Greenkeeper badge](https://badges.greenkeeper.io/opencomponents/oc-warmup.svg)](https://greenkeeper.io/)

[![NPM](https://nodei.co/npm/oc-warmup.png?downloads=true)](https://npmjs.org/package/oc-warmup)

Allows to warmup all components for a given [OpenComponents](https://github.com/opentable/oc)' registry. In practice, given every registry's instance has an internal cache for components' compiled views and server.js' closures, the module performs the following actions:

* It scans the registry to retrieve components' list
* Requests info for each component (latest version only) in order to get components' API (mandatory parameters and example values)
* Makes a POST request for all components so that the cache is populated from S3
* Responds with the list of components that responded with a 200 or not

```js
var warmup = require('oc-warmup');

warmup({
  url: 'http://registry-01234.mycompany.com/',

  // optional params
  components: c => c.name === 'header' && c.oc.state !== 'deprecated',
  headers: { 'accept-language': 'en-US' },
  timeout: 20000
}, (error, result) => {
  console.log(error);
  // => something like 'error connecting to registry' or null

  console.log(result);
  // => something like { successful: ['a', 'b'], errors: ['* c: error blabla (500)']}
});
```

# License
MIT
