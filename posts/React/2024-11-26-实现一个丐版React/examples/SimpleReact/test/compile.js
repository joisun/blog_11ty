import swc from "@swc/core";
import fs from 'node:fs'
const result = swc.transformFileSync("./App.jsx", {
  
  jsc: {
    transform: {
      react: {
        runtime:'classic', 
        pragma: "SimpleReact.createElement", // 自定义 JSX 转换方法
      },
    },
    parser: {
      syntax: "ecmascript",
      jsx: true,
    },
  },
});


fs.writeFileSync("./output.js", result.code);
