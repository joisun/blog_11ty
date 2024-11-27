// index.js
import Babel from "@babel/core";
import fs from "node:fs";
import react from "@babel/preset-react";
const file = fs.readFileSync("./App.jsx", "utf8");
const result = Babel.transform(file, {
  presets: [react],
});

fs.writeFileSync("./output.js", result.code);
