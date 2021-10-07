import { terser } from "rollup-plugin-terser";

export default {
    input: 'src/index.js',
    output: {
        file: 'build/js/aufgabenpool.min.js',
        format: 'iife',
        name: 'aufgabenpool',
    },
    external: [
    ],
    plugins: [
        terser()
    ]
};
