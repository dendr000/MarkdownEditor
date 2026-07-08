import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 아래 server 블록을 추가해 주세요!
  server: {
    port: 8989, // 원하는 포트 번호로 변경
  }
})