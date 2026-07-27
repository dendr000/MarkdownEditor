// src/api/browserDb.js v1.0
/*
 * 파일 위치: src/api/browserDb.js
 * 기능 요약: 브라우저 내장 IndexedDB를 활용하여 로컬 파일 시스템을 대체하는 가상 파일 시스템(VFS) 모듈입니다.
 * 폴더/파일의 계층 구조 유지, 생성, 읽기, 수정, 삭제(CRUD) 및 트리 반환을 수행합니다.
 */

const DB_NAME = 'MarkdownEditor_VFS';
const DB_VERSION = 1;
const STORE_NAME = 'files';

// IndexedDB 연결 및 초기화
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = (e) => {
      console.log("[browserDb v1.0] IndexedDB 구조 초기화 및 오브젝트 스토어 생성");
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'path' });
      }
    };
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// 트리 데이터 빌드 (서버의 buildTree 알고리즘과 동일한 구조 반환)
export const fetchTreeData = async () => {
  console.log("[browserDb v1.0] 가상 파일 시스템 트리 구성 시작");
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const allRecords = request.result;
      const root = { name: 'root', isFolder: true, children: [], path: '' };
      const nodeMap = { '': root };

      // 1. 모든 레코드를 맵에 등록 (폴더는 children 배열 초기화)
      allRecords.forEach(record => {
        nodeMap[record.path] = { ...record, children: record.isFolder ? [] : undefined };
      });

      // 2. 부모-자식 관계 매핑
      allRecords.forEach(record => {
        const parts = record.path.split('/');
        parts.pop();
        const parentPath = parts.join('/');

        if (nodeMap[parentPath]) {
          nodeMap[parentPath].children.push(nodeMap[record.path]);
        } else {
          // 부모 경로가 유실된 고아 노드는 강제로 루트에 편입
          root.children.push(nodeMap[record.path]);
        }
      });

      // 3. 폴더 우선, 영문자 순 정렬 알고리즘 적용
      const sortChildren = (node) => {
        if (node.children) {
          node.children.sort((a, b) => {
            if (a.isFolder === b.isFolder) return a.name.localeCompare(b.name);
            return a.isFolder ? -1 : 1;
          });
          node.children.forEach(sortChildren);
        }
      };
      
      sortChildren(root);
      console.log("[browserDb v1.0] 가상 파일 시스템 트리 구성 완료");
      resolve(root);
    };
    
    request.onerror = () => reject(request.error);
  });
};

// 파일/폴더 생성
export const createFileOrFolder = async (path, isFolder) => {
  console.log(`[browserDb v1.0] 가상 개체 생성 시도 - 경로: ${path}, 폴더여부: ${isFolder}`);
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const name = path.split('/').pop();
    
    // 폴더면 content null, 파일이면 빈 문자열 할당
    const record = { path, name, isFolder, content: isFolder ? null : '' };
    const request = store.put(record);

    request.onsuccess = () => {
      console.log(`[browserDb v1.0] 개체 생성 완료: ${path}`);
      resolve({ success: true, path });
    };
    request.onerror = () => reject(request.error);
  });
};

// 텍스트 파일 읽기
export const fetchFileContent = async (path) => {
  console.log(`[browserDb v1.0] 가상 파일 읽기 요청: ${path}`);
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(path);

    request.onsuccess = () => {
      if (request.result) {
        console.log(`[browserDb v1.0] 파일 읽기 성공: ${path}`);
        resolve(request.result.content || '');
      } else {
        console.error(`[browserDb v1.0] 파일을 찾을 수 없음: ${path}`);
        reject(new Error('파일을 찾을 수 없습니다.'));
      }
    };
    request.onerror = () => reject(request.error);
  });
};

// 파일 덮어쓰기 (저장)
export const saveFileContent = async (path, content) => {
  console.log(`[browserDb v1.0] 가상 파일 덮어쓰기 요청: ${path}`);
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const getReq = store.get(path);
    
    getReq.onsuccess = () => {
      if (getReq.result) {
        const record = getReq.result;
        record.content = content;
        const putReq = store.put(record);
        putReq.onsuccess = () => {
          console.log(`[browserDb v1.0] 파일 저장 성공: ${path}`);
          resolve({ success: true });
        };
        putReq.onerror = () => reject(putReq.error);
      } else {
        reject(new Error('저장할 대상 파일이 존재하지 않습니다.'));
      }
    };
    getReq.onerror = () => reject(getReq.error);
  });
};

// 파일/폴더 삭제 (하위 디렉토리 연쇄 삭제 포함)
export const deleteFileOrFolder = async (path) => {
  console.log(`[browserDb v1.0] 가상 개체 삭제 요청: ${path}`);
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const allRecords = request.result;
      const prefix = path + '/';
      
      allRecords.forEach(record => {
        if (record.path === path || record.path.startsWith(prefix)) {
          store.delete(record.path);
          console.log(`[browserDb v1.0] 삭제됨: ${record.path}`);
        }
      });
      resolve({ success: true });
    };
    request.onerror = () => reject(request.error);
  });
};

// 파일/폴더 이름 변경 및 경로 갱신
export const renameTarget = async (oldPath, newPath) => {
  console.log(`[browserDb v1.0] 가상 개체 이름 변경: ${oldPath} -> ${newPath}`);
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const allRecords = request.result;
      const prefix = oldPath + '/';
      const newName = newPath.split('/').pop();

      allRecords.forEach(record => {
        // 본인 변경
        if (record.path === oldPath) {
          const newRecord = { ...record, path: newPath, name: newName };
          store.delete(record.path);
          store.put(newRecord);
        } 
        // 하위 자식들의 경로 연쇄 변경
        else if (record.path.startsWith(prefix)) {
          const remainder = record.path.substring(oldPath.length);
          const updatedPath = newPath + remainder;
          const newRecord = { ...record, path: updatedPath };
          store.delete(record.path);
          store.put(newRecord);
        }
      });
      resolve({ success: true });
    };
    request.onerror = () => reject(request.error);
  });
};