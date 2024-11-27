// index.js
import swc from "@swc/core";
const result = swc.transformFileSync("./app.jsx", {
  jsc: {
    parser: {
      syntax: "ecmascript",
      jsx: true,
    },
  },
});

fs.writeFileSync("./app.output.js", result.code);
