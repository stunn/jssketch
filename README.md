jssketch-fe
===========

Getting Started (Dev on the FE)
-----

 1. `git clone git@github.com:mattlunn/jssketch-fe.git`
 2. `cd jssketch-fe`
 3. `git submodule update --init`
 4. `mkdir public/codemirror; cp vendor/codemirror/lib/* public/codemirror; cp vendor/{mode, theme} public/codemirror`
 5. `npm install`

Getting Started (Dev on the BE)
-----

 1. Perform above steps
 2. `cd ..`
 3. `git clone git@github.com:mattlunn/jssketch-be.git`
 4. `cd jssketch-be`
 5. `npm link`
 6. `cd ../jssketch-fe`
 7. `npm link jssketch-be`

To Run
-----

 1. `cd jssketch-fe`
 2. `node app.js`
 3. Visit "http://jssketch.local.mattlunn.me.uk:3000
