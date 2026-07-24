// src/server.js 상단 설정부 v1.3
/*
 * (v1.3 수정사항): 워크스페이스 경로를 동적으로 변경하고 상태를 유지하기 위해 fsSync 모듈과 JSON 설정 파일 연동 로직을 추가했습니다.
 */
import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import fsSync from 'fs'; // 동기 파일 처리를 위한 모듈 추가
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// 워크스페이스(루트 폴더) 경로 및 히스토리를 관리하기 위한 변수 및 설정 파일 경로 (v1.4)
let DATA_DIR = path.join(__dirname, 'data');
const CONFIG_PATH = path.join(__dirname, 'workspace-config.json');
let workspaceConfig = { workspace: DATA_DIR, history: [] }; // DB(JSON) 데이터를 담을 전역 객체

// 서버 가동 시 기존에 저장된 워크스페이스 경로 및 히스토리 데이터가 있다면 불러옵니다.
try {
  if (fsSync.existsSync(CONFIG_PATH)) {
    const configData = fsSync.readFileSync(CONFIG_PATH, 'utf8');
    const parsed = JSON.parse(configData);
    workspaceConfig = { ...workspaceConfig, ...parsed }; // 기존 DB 데이터 보존 및 병합
    
    if (workspaceConfig.workspace) {
      DATA_DIR = workspaceConfig.workspace;
      console.log(`[Server v1.4] 저장된 워크스페이스 경로를 로드했습니다: ${DATA_DIR}`);
      console.log(`[Server v1.4] 로드된 히스토리 개수: ${workspaceConfig.history ? workspaceConfig.history.length : 0}개`);
    }
  }
} catch (error) {
  console.error(`[Server v1.4] 설정 파일 로드 중 에러 발생, 기본 경로를 사용합니다:`, error);
}

app.use(cors());
app.use(express.json());

// 서버 시작 시 현재 지정된 워크스페이스 폴더가 없으면 자동 생성
const initDataDir = async () => {
  try {
    await fs.access(DATA_DIR);
    console.log(`[Server v1.3] 데이터 루트 폴더 확인 완료: ${DATA_DIR}`);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
    console.log(`[Server v1.3] 데이터 루트 폴더 신규 생성: ${DATA_DIR}`);
  }
};
initDataDir();

// 허용할 텍스트 기반 파일 확장자 목록
const ALLOWED_EXTENSIONS = ['.md', '.txt', '.json', '.html', '.css', '.js', '.jsx'];

// 경로 조작(Directory Traversal) 해킹 방지 및 Windows 슬래시 정규화 로직
const getSafePath = (targetPath) => {
  const normalizedDataDir = DATA_DIR.replace(/\\/g, '/');
  if (!targetPath) return normalizedDataDir;
  
  // 클라이언트에서 넘어온 경로에 역슬래시가 섞여 있을 경우를 대비해 사전 치환
  const normalizedTarget = targetPath.replace(/\\/g, '/');
  const safePath = path.join(DATA_DIR, normalizedTarget).replace(/\\/g, '/');
  
  if (!safePath.startsWith(normalizedDataDir)) {
    throw new Error('보안 위반: 허용되지 않은 경로 접근입니다.');
  }
  return safePath;
};

// 재귀적으로 폴더 구조를 스캔하여 트리 데이터(JSON)로 반환하는 알고리즘 [버전 1.6]
const buildTree = async (currentPath, relativePath = '') => {
  try {
    const stats = await fs.stat(currentPath);
    const name = path.basename(currentPath);
    
    if (stats.isDirectory()) {
      // 보안 차단: .git 같은 민감한 내부 숨김 폴더는 아예 스캔하지 않고 제외합니다.
      if (name.startsWith('.') && relativePath !== '') return null;

      const children = [];
      const files = await fs.readdir(currentPath);
      
      for (const file of files) {
        // 권한이 없거나 잠겨 있는 파일이 전체 트리를 무너뜨리지 않도록 개별 블록에 try-catch를 적용합니다.
        try {
          const childPath = path.join(currentPath, file);
          const childStats = await fs.stat(childPath);
          const childRelPath = relativePath === '' ? file : `${relativePath}/${file}`;
          
          if (childStats.isDirectory()) {
            const childNode = await buildTree(childPath, childRelPath);
            // 하위 폴더에 파일이 없어도 폴더 껍데기는 유지하여 트리가 깨지지 않도록 함
            if (childNode) children.push(childNode);
          } else {
            // 파일인 경우 허용된 확장자(md, txt 등)만 트리에 추가하여 이미지/엑셀 등 표기 제외
            const ext = path.extname(file).toLowerCase();
            if (ALLOWED_EXTENSIONS.includes(ext)) {
              children.push({ path: childRelPath, name: file, isFolder: false });
            }
          }
        } catch (fileError) {
          console.warn(`[buildTree v1.6] 파일 스캔 건너뜀 (권한 거부 또는 읽기 오류): ${file}`, fileError.message);
        }
      }
      
      // 폴더가 위로, 파일이 아래로 정렬되도록 소팅
      children.sort((a, b) => {
        if (a.isFolder === b.isFolder) return a.name.localeCompare(b.name);
        return a.isFolder ? -1 : 1;
      });
      return { path: relativePath, name: name || 'root', isFolder: true, children };
    }
    return null;
  } catch (dirError) {
    console.error(`[buildTree v1.6] 디렉토리 스캔 에러 발생: ${currentPath}`, dirError.message);
    throw dirError;
  }
};

/*
 * (v1.3 수정사항): 프론트엔드에서 현재 경로를 조회하고 새로운 경로로 업데이트할 수 있는 워크스페이스 전용 API가 추가되었습니다.
 */

// [GET] 현재 설정된 워크스페이스 경로 및 히스토리 내역 조회 (v1.4)
app.get('/api/workspace', (req, res) => {
  console.log(`[GET /api/workspace] 현재 워크스페이스 경로 및 히스토리 조회 요청 수신. 반환 값: ${DATA_DIR}`);
  res.json({ path: DATA_DIR, history: workspaceConfig.history || [] });
});

// [POST] 새로운 워크스페이스 경로 설정 및 히스토리 저장 (v1.4)
app.post('/api/workspace', async (req, res) => {
  const { newPath } = req.body;
  console.log(`[POST /api/workspace] 워크스페이스 경로 변경 요청 수신 - 타겟: ${newPath}`);
  
  try {
    // 윈도우 환경 대응을 위해 입력받은 역슬래시(\)를 슬래시(/)로 일괄 치환
    const normalizedPath = newPath.replace(/\\/g, '/');
    const stats = await fs.stat(normalizedPath);
    
    if (stats.isDirectory()) {
      DATA_DIR = normalizedPath;
      workspaceConfig.workspace = DATA_DIR;
      
      // 기존 히스토리에 새 경로를 최상단에 추가하고 중복을 제거 (최대 10개 유지)
      const currentHistory = workspaceConfig.history || [];
      const filteredHistory = currentHistory.filter(p => p !== DATA_DIR);
      workspaceConfig.history = [DATA_DIR, ...filteredHistory].slice(0, 10);

      // 변경된 설정(경로 및 히스토리 배열)을 JSON 파일(DB)에 안전하게 덮어쓰기하여 영구 저장
      await fs.writeFile(CONFIG_PATH, JSON.stringify(workspaceConfig, null, 2), 'utf8');
      console.log(`[Server v1.4] 워크스페이스 경로 및 히스토리가 성공적으로 영구 저장되었습니다: ${DATA_DIR}`);
      
      res.json({ success: true, path: DATA_DIR, history: workspaceConfig.history });
    } else {
      console.log(`[Server v1.4] 변경 실패: 해당 경로는 디렉토리가 아닙니다.`);
      res.status(400).json({ error: '지정된 경로는 폴더(디렉토리)가 아닙니다.' });
    }
  } catch (error) {
    console.error(`[Server v1.4] 워크스페이스 경로 변경 중 에러 발생 (경로가 존재하지 않음):`, error);
    res.status(400).json({ error: '유효하지 않거나 존재하지 않는 경로입니다.' });
  }
});

// [GET] 폴더 트리 전체 조회
app.get('/api/tree', async (req, res) => {
  console.log(`[GET /api/tree] 폴더 트리 스캔 요청 수신 (기준 경로: ${DATA_DIR})`);
  try {
    const tree = await buildTree(DATA_DIR);
    res.json(tree);
  } catch (error) {
    console.error('[GET /api/tree] 에러 발생:', error);
    res.status(500).json({ error: error.message });
  }
});

// [GET] 특정 파일 내용 읽기 [버전 1.2]
app.get('/api/file', async (req, res) => {
  const { target } = req.query;
  console.log(`[GET /api/file v1.2] 파일 내용 조회 요청 - 타겟: ${target}`);
  try {
    const safePath = getSafePath(target);
    const content = await fs.readFile(safePath, 'utf8');
    res.send(content);
  } catch (error) {
    console.error(`[GET /api/file v1.2] 읽기 에러 발생:`, error.message);
    // 파일이 존재하지 않는 경우(ENOENT) 500 에러 대신 404를 반환하여 프론트엔드가 인지하도록 합니다.
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: '해당 파일이 존재하지 않습니다.' });
    } else {
      res.status(500).json({ error: error.message });
    }
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