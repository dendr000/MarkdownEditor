// src/server.js v1.2
/*
 * 파일 설명: 파일 기반 데이터베이스 역할을 수행하는 로컬 Express 서버입니다.
 * 'src/data' 폴더를 기준으로 폴더/파일의 CRUD(생성, 읽기, 수정, 삭제, 트리 조회) API를 제공합니다.
 */
import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// 루트 데이터 폴더 경로 설정 (src/data)
const DATA_DIR = path.join(__dirname, 'data');

app.use(cors());
app.use(express.json());

// 서버 시작 시 data 폴더가 없으면 자동 생성
const initDataDir = async () => {
  try {
    await fs.access(DATA_DIR);
    console.log(`[Server] 데이터 루트 폴더 확인 완료: ${DATA_DIR}`);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
    console.log(`[Server] 데이터 루트 폴더 신규 생성: ${DATA_DIR}`);
  }
};
initDataDir();

// 경로 조작(Directory Traversal) 해킹 방지 검증 로직
const getSafePath = (targetPath) => {
  if (!targetPath) return DATA_DIR;
  const safePath = path.join(DATA_DIR, targetPath);
  if (!safePath.startsWith(DATA_DIR)) {
    throw new Error('보안 위반: 허용되지 않은 경로 접근입니다.');
  }
  return safePath;
};

// 재귀적으로 폴더 구조를 스캔하여 트리 데이터(JSON)로 반환하는 알고리즘
const buildTree = async (currentPath, relativePath = '') => {
  const stats = await fs.stat(currentPath);
  const name = path.basename(currentPath);
  
  if (stats.isDirectory()) {
    const children = [];
    const files = await fs.readdir(currentPath);
    for (const file of files) {
      const childPath = path.join(currentPath, file);
      const childRelPath = path.join(relativePath, file);
      children.push(await buildTree(childPath, childRelPath));
    }
    // 폴더가 위로, 파일이 아래로 정렬되도록 소팅
    children.sort((a, b) => {
      if (a.isFolder === b.isFolder) return a.name.localeCompare(b.name);
      return a.isFolder ? -1 : 1;
    });
    return { path: relativePath, name: name || 'root', isFolder: true, children };
  } else {
    return { path: relativePath, name, isFolder: false };
  }
};

// [GET] 폴더 트리 전체 조회
app.get('/api/tree', async (req, res) => {
  console.log('[GET /api/tree] 폴더 트리 스캔 요청 수신');
  try {
    const tree = await buildTree(DATA_DIR);
    res.json(tree);
  } catch (error) {
    console.error('[GET /api/tree] 에러 발생:', error);
    res.status(500).json({ error: error.message });
  }
});

// [GET] 특정 파일 내용 읽기
app.get('/api/file', async (req, res) => {
  const { target } = req.query;
  console.log(`[GET /api/file] 파일 내용 조회 요청 - 타겟: ${target}`);
  try {
    const safePath = getSafePath(target);
    const content = await fs.readFile(safePath, 'utf8');
    res.send(content);
  } catch (error) {
    console.error(`[GET /api/file] 읽기 에러:`, error);
    res.status(500).json({ error: error.message });
  }
});

// [POST] 새 파일 또는 폴더 생성
app.post('/api/file', async (req, res) => {
  const { target, isFolder } = req.body;
  console.log(`[POST /api/file] 신규 생성 요청 - 타겟: ${target}, 폴더여부: ${isFolder}`);
  try {
    const safePath = getSafePath(target);
    if (isFolder) {
      await fs.mkdir(safePath, { recursive: true });
    } else {
      await fs.writeFile(safePath, '', 'utf8');
    }
    res.json({ success: true });
  } catch (error) {
    console.error(`[POST /api/file] 생성 에러:`, error);
    res.status(500).json({ error: error.message });
  }
});

// [PUT] 파일 내용 덮어쓰기 (자동/수동 저장)
app.put('/api/file', async (req, res) => {
  const { target, content } = req.body;
  console.log(`[PUT /api/file] 파일 저장(덮어쓰기) 요청 - 타겟: ${target}`);
  try {
    const safePath = getSafePath(target);
    await fs.writeFile(safePath, content, 'utf8');
    res.json({ success: true });
  } catch (error) {
    console.error(`[PUT /api/file] 저장 에러:`, error);
    res.status(500).json({ error: error.message });
  }
});

// [DELETE] 파일 또는 폴더 삭제
app.delete('/api/file', async (req, res) => {
  const { target } = req.body;
  console.log(`[DELETE /api/file] 삭제 요청 - 타겟: ${target}`);
  try {
    const safePath = getSafePath(target);
    const stats = await fs.stat(safePath);
    if (stats.isDirectory()) {
      await fs.rm(safePath, { recursive: true, force: true });
    } else {
      await fs.unlink(safePath);
    }
    res.json({ success: true });
  } catch (error) {
    console.error(`[DELETE /api/file] 삭제 에러:`, error);
    res.status(500).json({ error: error.message });
  }
});

// [PATCH] 파일 또는 폴더 이름 변경
app.patch('/api/file', async (req, res) => {
  const { oldTarget, newTarget } = req.body;
  console.log(`[PATCH /api/file] 이름 변경 요청 - 기존: ${oldTarget}, 변경: ${newTarget}`);
  try {
    const oldSafePath = getSafePath(oldTarget);
    const newSafePath = getSafePath(newTarget);
    await fs.rename(oldSafePath, newSafePath);
    res.json({ success: true });
  } catch (error) {
    console.error(`[PATCH /api/file] 이름 변경 에러:`, error);
    res.status(500).json({ error: error.message });
  }
});

// 502 Bad Gateway 방지를 위한 IPv4 바인딩
app.listen(PORT, '127.0.0.1', () => {
  console.log(`[Server v1.2] 파일 기반 DB 서버가 http://127.0.0.1:${PORT} 에서 성공적으로 가동되었습니다.`);
});