import nodeResolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
const globby = require('globby');

const plugins = [
  nodeResolve({
    extensions: [".js", ".ts"]
  }),
  babel({
    extensions: [".js", ".ts", ".tsx", ".jsx"],
    exclude: "node_modules/**",
    babelHelpers: "bundled",
    presets: ['solid', '@babel/preset-typescript']
  }),
];

export default globby.sync("lib/*/index.tsx").map(inputFile => ({
      input: inputFile,
      output: [
        {
          //file: inputFile.replace("lib/", "dist/").replace("/index.jsx", "/index.js"),
          file: inputFile.replace("/index.tsx", "/index.js"),
          format: "es",
        }
      ],
      external: ["solid-js", "solid-js/web"],
      plugins,
    }));
