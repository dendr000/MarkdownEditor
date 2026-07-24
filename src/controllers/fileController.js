// src/controllers/fileController.js v1.0
/*
 * 파일 설명: 로컬 파일 시스템(fs)에 접근하여 파일과 디렉토리 CRUD를 수행하는 백엔드 컨트롤러입니다.
 * server.js에서 분리되었습니다.
 */
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 워크스페이스(루트 폴더) 경로 및 히스토리 전역 상태
export let DATA_DIR = path.join(__dirname, '..', 'data'); 
const CONFIG_PATH = path.join(__dirname, '..', 'workspace-config.json');
export let workspaceConfig = { workspace: DATA_DIR, history: [] }; 

// 허용할 파일 확장자 목록 (pdf, pptx 등 미지원 파일 확장자 추가)
const ALLOWED_EXTENSIONS = [
  '.md', '.txt', '.json', '.html', '.css', '.js', '.jsx', 
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.xlsx', '.csv',
  '.pdf', '.pptx', '.ppt', '.docx', '.doc', '.zip', '.tar', '.gz', '.rar', '.7z', '.exe'
];

// 서버 가동 시 기존 워크스페이스 정보 로드
export const loadWorkspaceConfig = () => {
  try {
    if (fsSync.existsSync(CONFIG_PATH)) {
      const configData = fsSync.readFileSync(CONFIG_PATH, 'utf8');
      const parsed = JSON.parse(configData);
      workspaceConfig = { ...workspaceConfig, ...parsed }; 
      
      if (workspaceConfig.workspace) {
        DATA_DIR = workspaceConfig.workspace;
        console.log(`[fileController v1.0] 저장된 워크스페이스 경로를 로드했습니다: ${DATA_DIR}`);
        console.log(`[fileController v1.0] 로드된 히스토리 개수: ${workspaceConfig.history ? workspaceConfig.history.length : 0}개`);
      }
    }
  } catch (error) {
    console.error(`[fileController v1.0] 설정 파일 로드 중 에러 발생, 기본 경로를 사용합니다:`, error);
  }
};

// 데이터 루트 폴더 초기화
export const initDataDir = async () => {
  try {
    await fs.access(DATA_DIR);
    console.log(`[fileController v1.0] 데이터 루트 폴더 확인 완료: ${DATA_DIR}`);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
    console.log(`[fileController v1.0] 데이터 루트 폴더 신규 생성: ${DATA_DIR}`);
  }
};

// 경로 검증 로직
export const getSafePath = (targetPath) => {
  const normalizedDataDir = DATA_DIR.replace(/\\/g, '/');
  if (!targetPath) return normalizedDataDir;
  
  const normalizedTarget = targetPath.replace(/\\/g, '/');
  const safePath = path.join(DATA_DIR, normalizedTarget).replace(/\\/g, '/');
  
  if (!safePath.startsWith(normalizedDataDir)) {
    throw new Error('보안 위반: 허용되지 않은 경로 접근입니다.');
  }
  return safePath;
};

// 트리 빌드 알고리즘
export const buildTree = async (currentPath, relativePath = '') => {
  try {
    const stats = await fs.stat(currentPath);
    const name = path.basename(currentPath);
    
    if (stats.isDirectory()) {
      if (name.startsWith('.') && relativePath !== '') return null;

      const children = [];
      const files = await fs.readdir(currentPath);
      
      for (const file of files) {
        try {
          const childPath = path.join(currentPath, file);
          const childStats = await fs.stat(childPath);
          const childRelPath = relativePath === '' ? file : `${relativePath}/${file}`;
          
          if (childStats.isDirectory()) {
            const childNode = await buildTree(childPath, childRelPath);
            if (childNode) children.push(childNode);
          } else {
            const ext = path.extname(file).toLowerCase();
            // .gitkeep 파일이거나 허용된 확장자인 경우 탐색기에 추가
            if (ALLOWED_EXTENSIONS.includes(ext) || file === '.gitkeep') {
              children.push({ path: childRelPath, name: file, isFolder: false });
            }
          }
        } catch (fileError) {
          console.warn(`[fileController v1.0] 파일 스캔 건너뜀: ${file}`, fileError.message);
        }
      }
      
      children.sort((a, b) => {
        if (a.isFolder === b.isFolder) return a.name.localeCompare(b.name);
        return a.isFolder ? -1 : 1;
      });
      return { path: relativePath, name: name || 'root', isFolder: true, children };
    }
    return null;
  } catch (dirError) {
    console.error(`[fileController v1.0] 디렉토리 스캔 에러 발생: ${currentPath}`, dirError.message);
    throw dirError;
  }
};

// 워크스페이스 경로 업데이트
export const updateWorkspaceConfig = async (newPath) => {
  const normalizedPath = newPath.replace(/\\/g, '/');
  const stats = await fs.stat(normalizedPath);
  
  if (!stats.isDirectory()) {
    throw new Error('지정된 경로는 폴더(디렉토리)가 아닙니다.');
  }

  DATA_DIR = normalizedPath;
  workspaceConfig.workspace = DATA_DIR;
  
  const currentHistory = workspaceConfig.history || [];
  const filteredHistory = currentHistory.filter(p => p !== DATA_DIR);
  workspaceConfig.history = [DATA_DIR, ...filteredHistory].slice(0, 10);

  await fs.writeFile(CONFIG_PATH, JSON.stringify(workspaceConfig, null, 2), 'utf8');
  return { path: DATA_DIR, history: workspaceConfig.history };
};