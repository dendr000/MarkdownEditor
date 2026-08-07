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
    // src 폴더 외의 파일(루트 폴더의 index.html, .md 등)이 수정될 때 발생하는 강제 새로고침을 가로채어 차단하는 커스텀 플러그인
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
  },
  // v2.4 수정사항: 빌드 시 500kB 초과 경고 해결을 위해 chunkSizeWarningLimit 상향 및 외부 모듈 청크 분할 적용
  // v2.5 수정사항: Vercel 배포 환경 호환성을 위해 빌드 출력 디렉터리를 'dist'에서 'build'로 변경
  build: {
    // 배포 플랫폼(Vercel 등)이 기본적으로 찾는 폴더명인 'build'로 출력 디렉터리를 변경합니다.
    outDir: 'build',
    // 경고를 발생시키는 파일 크기 기준을 500kB에서 1000kB로 상향 조정합니다.
    chunkSizeWarningLimit: 1000, 
    rollupOptions: {
      output: {
        manualChunks(id) {
          // node_modules 내부의 패키지들을 'vendor'라는 하나의 청크 파일로 분리하여 메인 번들 크기를 줄입니다.
          if (id.includes('node_modules')) {
            console.log(`[Vite 빌드 v2.5] 청크 분리 적용 대상 감지: ${id}`);
            return 'vendor';
          }
        }
      }
    }
  }
})