const { build } = require('esbuild')
const define = {}

for (const k in process.env) {
  define[`process.env.${k}`] = JSON.stringify(process.env[k])
}

const options = {
  stdio: 'inherit',
  entryPoints: ['./src/main.ts'],
  outfile: './dist/main.js',
  bundle: true,
  define,
}

build(options).catch(() => process.exit(1))