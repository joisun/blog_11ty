import fs from 'node:fs'
// index.js
import Babel from '@babel/core'
import react from '@babel/preset-react'

const file = fs.readFileSync('./app.jsx', 'utf8')
const result = Babel.transform(file, {
  presets: [
    react,
  ],
})

fs.writeFileSync('./app.output.js', result.code)
