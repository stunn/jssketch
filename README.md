jssketch-fe [![Build Status](https://travis-ci.org/mattlunn/jssketch-fe.png?branch=master)](https://travis-ci.org/mattlunn/jssketch-fe)
===========

Getting Started (Dev on the FE)
-----

 1. `git clone git@github.com:mattlunn/jssketch-fe.git`
 2. `cd jssketch-fe`
 3. `git submodule update --init`
 5. `npm install`

To Run
-----

 1. `cd jssketch-fe`
 2. `node bin/jssketch`
 3. Visit "http://jssketch.local.mattlunn.me.uk:3000

For development, you might want to ensure the `production` value in `config/config.json` is set to `false`; otherwise CSS
and JS files will get minified beyond recognition. Also invoke `node` with the `--no-build` option to prevent the CSS
and JS files from being built on load; i.e. `node bin/jssketch --no-build`
