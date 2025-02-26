// import { defineConfig, loadEnv } from 'vite'
// import react from '@vitejs/plugin-react'
// import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
// import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'
// import rollupNodePolyFill from 'rollup-plugin-polyfill-node'

// export default defineConfig(({ mode }) => {
//   const env = loadEnv(mode, process.cwd(), '')
  
//   return {
//     plugins: [
//       react(),
//       rollupNodePolyFill()
//     ],
//     optimizeDeps: {
//       esbuildOptions: {
//         define: {
//           global: 'globalThis'
//         },
//         plugins: [
//           NodeGlobalsPolyfillPlugin({
//             process: true,
//             buffer: true
//           }),
//           NodeModulesPolyfillPlugin()
//         ]
//       }
//     },
//     define: {
//       'process.env.VITE_PRIVY_APP_ID': JSON.stringify(env.VITE_PRIVY_APP_ID),
//       'process.env': {},
//       global: {}
//     },
//     resolve: {
//       alias: {
//         process: 'process/browser',
//         stream: 'stream-browserify',
//         util: 'util'
//       }
//     }
//   }
// })

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      'Content-Security-Policy': "script-src 'self' 'unsafe-inline' 'unsafe-eval';"
    }
  },
  define: {
    'process.env': {
      VITE_PRIVY_APP_ID: JSON.stringify(process.env.VITE_PRIVY_APP_ID)
    },
    global: 'globalThis'
  }
})