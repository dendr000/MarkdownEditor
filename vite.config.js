// vite.config.js v2.3
/*
 * 파일 위치: vite.config.js
 * 파일 설명: Vite 번들러 설정 파일입니다.
 * (v2.3 수정사항): 워크스페이스를 루트 폴더로 설정하고 index.html, .md 등을 편집할 때 
 * Vite 개발 서버가 이를 감지하여 강제 새로고침(HMR)하는 현상을 원천 차단했습니다.
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    // [신규] src 폴더 외의 파일(루트 폴더의 index.html, .md 등)이 수정될 때 발생하는 강제 새로고침을 가로채어 차단하는 커스텀 플러그인
    {
      name: 'prevent-reload-for-workspace-files',
      handleHotUpdate({ file }) {
        // 수정된 파일 경로에 'src' 폴더가 포함되어 있지 않다면 (즉, 에디터로 일반 문서를 편집한 것이라면)
        if (!file.includes('/src/') && !file.includes('\\src\\')) {
          console.log(`[Vite 플러그인] 에디터 편집 감지 - 새로고침(HMR)을 차단합니다: ${file}`);
          return []; // 빈 배열을 반환하여 Vite의 업데이트 파이프라인을 취소시킴
        }
      }
    }
  ],
  server: {
    port: 8989,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001', 
        changeOrigin: true,
      }
    },
    watch: {
      // chokidar 파일 감시자 레벨에서 루트 폴더의 문서/설정 파일이 변경될 때 감지 자체를 무시
      ignored: [
        '**/*.md',
        '**/*.txt',
        '**/*.json',
        '**/index.html', // 사용자가 프로젝트 루트의 index.html을 직접 수정하더라도 감지 차단
        '**/data/**',
        '**/docs/**'
      ]
    }
  }
})