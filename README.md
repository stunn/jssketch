jssketch-fe [![Build Status](https://travis-ci.org/stunn/jssketch.png?branch=master)](https://travis-ci.org/stunn/jssketch)
===========

Getting Started (Dev on the FE)
-----

 1. `git clone git@github.com:stunn/jssketch.git`
 2. `cd jssketch`
 3. `git submodule update --init`
 5. `npm install`

To Run
-----

 1. `cd jssketch-fe`
 2. `node bin/jssketch`
 3. Visit "http://jssketch.local.mattlunn.me.uk:3000

For development, you might want to ensure the `production` value in `config/config.json` is set to `false`; otherwise CSS
and JS files will get minified beyond recognition.
