// vite.config.js v2.1
/*
 * 파일 설명: Vite 번들러 설정 파일입니다.
 * (v2.1 수정사항): Node.js 17+ 환경에서 발생하는 localhost(IPv6/IPv4) DNS 해석 충돌로 인한 502 Bad Gateway 에러를 방지하기 위해 프록시 타겟을 127.0.0.1로 명시했습니다.
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8989,
    proxy: {
      // 프론트엔드에서 '/api'로 시작하는 요청을 백엔드 서버(3001)로 전달합니다.
      '/api': {
        target: 'http://127.0.0.1:3001', // localhost 대신 명시적 IPv4 주소 할당
        changeOrigin: true,
      }
    }
  }
})