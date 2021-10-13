import { babel } from '@rollup/plugin-babel';
//import { terser } from "rollup-plugin-terser";

export default {
    input: 'dist/index.js',
    output: {
        file: 'build/js/aufgabenpool.min.js',
        format: 'iife',
        name: 'aufgabenpool',
        globals: {
            "jquery": '$'
        }
    },
    external: [
        "jquery"
    ],
    plugins: [
        babel({ babelHelpers: 'bundled' })
        //,terser()  TODO!!!!
    ]
};
