// src/server.js v2.2
/*
 * 파일 위치: src/server.js
 * 기능 요약: Express 기반의 모듈화된 백엔드 서버 엔트리 파일입니다. (배포를 위해 콘솔 로그 출력 기능이 제거되었습니다.)
 */

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
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

// 프론트엔드에서 전송한 좌표 데이터를 지정된 로컬 폴더에 자동 저장하는 API
app.post('/api/save-coords', (req, res) => {
  try {
    const { fileName, coords } = req.body;
    if (!fileName || !coords) {
      return res.status(400).json({ error: '파일명 또는 좌표 데이터가 누락되었습니다.' });
    }

    // 파일이 저장될 하드코딩된 절대 경로입니다.
    const targetDir = path.join('C:', 'dev', 'MarkdownEditor', 'src', 'data', 'coordinate');
    
    // 폴더가 존재하지 않으면 재귀적으로 생성합니다.
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const filePath = path.join(targetDir, fileName);
    
    // 지정된 경로에 JSON 파일을 기록합니다.
    fs.writeFileSync(filePath, JSON.stringify(coords, null, 2), 'utf8');

    return res.status(200).json({ success: true });
  } catch (error) {
    // 에러 발생 시 콘솔 로그 생략 및 500 에러 반환
    return res.status(500).json({ error: '서버 내부 오류' });
  }
});

// 서버 구동
app.listen(PORT, '127.0.0.1', () => {
  // 배포를 위해 서버 구동 확인용 콘솔 로그 제거
});