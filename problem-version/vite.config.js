/**
 * @brief Vite 설정 파일
 * @details React 렌더러 프로세스 빌드 설정
 * @author CodeVisor Team
 * @date 2025-06-21
 */

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // .env 파일 로드
  const env = loadEnv(mode, process.cwd(), '');
  const port = parseInt(env.VITE_PORT || env.ELECTRON_MAIN_PORT || '5250');

  return {
    plugins: [react()],
    root: 'src/renderer',
    base: './',
    build: {
      outDir: '../../dist/renderer',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'src/renderer/index.html')
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src/renderer'),
        '@components': path.resolve(__dirname, 'src/renderer/components'),
        '@utils': path.resolve(__dirname, 'src/renderer/utils'),
        '@styles': path.resolve(__dirname, 'src/renderer/styles')
      }
    },
    define: {
      global: 'globalThis'
    },
    server: {
      port: port,
      strictPort: true,
      host: true
    },
    css: {
      devSourcemap: true
    }
  };
});