// src/server.js v2.0
/*
 * 파일 설명: 파일 기반 DB 서버의 메인 진입점입니다.
 * (v2.0 수정사항): 라우팅과 컨트롤러 로직을 각각 routes/api.js 와 controllers/fileController.js로 분리하여 모듈화하였습니다.
 */
import express from 'express';
import cors from 'cors';
import { loadWorkspaceConfig, initDataDir } from './controllers/fileController.js';
import apiRoutes from './routes/api.js';

const app = express();
const PORT = 3001;

// 서버 가동 전 초기화 작업
loadWorkspaceConfig();
initDataDir();

// 미들웨어 등록
app.use(cors());
app.use(express.json());

// 모듈화된 API 라우트 연결
app.use('/api', apiRoutes);

// 서버 구동
app.listen(PORT, '127.0.0.1', () => {
  console.log(`[Server v2.0] 모듈화된 백엔드 서버가 http://127.0.0.1:${PORT} 에서 가동되었습니다.`);
});