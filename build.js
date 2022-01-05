/**
 * AUFGABENPOOL - digiFellow Projekt
 * Author: Andreas Schwenk, TH Köln
 */

 const esbuild = require('esbuild');

 // --- node version ---
 esbuild.buildSync({
     platform: 'browser',
     globalName: 'pool',
     minify: true,
     target: 'es2020',
     entryPoints: ['src/index.ts'],
     bundle: true,
     outfile: 'build/js/aufgabenpool.min.js'
 });
