// src/api/fileApi.js v1.0
/*
 * 파일 설명: 로컬 백엔드(server.js)와 통신하여 파일/폴더 CRUD를 수행하는 fetch 래퍼(Wrapper) 유틸리티입니다.
 * 컴포넌트 비대화를 막기 위해 모든 네트워크 요청 로직을 이곳에 캡슐화했습니다.
 */

// 폴더 트리 데이터 가져오기
export const fetchTreeData = async () => {
  console.log("[fileApi v1.0] 트리 데이터 스캔 API 호출");
  const response = await fetch('/api/tree');
  if (!response.ok) throw new Error('트리 데이터를 불러오지 못했습니다.');
  return await response.json();
};

// 특정 파일의 내용을 가져오기 (확장자에 따라 텍스트 또는 바이너리 분기 처리) [버전 1.4]
export const fetchFileContent = async (path) => {
  console.log(`[fileApi v1.4] 파일 읽기 API 호출 - 타겟: ${path}`);
  
  const extMatch = path.match(/\.([^.]+)$/);
  const ext = extMatch ? extMatch[1].toLowerCase() : '';
  const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext);
  const isBinary = ['xls', 'xlsx', 'csv', 'docx'].includes(ext); // [수정] docx 확장자 추가 및 변수명 범용화

  if (isImage) {
    console.log(`[fileApi v1.4] 이미지 파일 감지, 텍스트 변환 생략 후 마크다운 태그 반환`);
    const fileName = path.split('/').pop();
    // 뷰어 컴포넌트가 가로채어 렌더링할 수 있도록 마크다운 이미지 문법을 반환합니다.
    return `![${fileName}](./${fileName})`; 
  }

  if (isBinary) {
    console.log(`[fileApi v1.4] 바이너리 파일(엑셀, 워드 등) 감지, 파싱을 위해 ArrayBuffer 요청`);
    const response = await fetch(`/api/raw?target=${encodeURIComponent(path)}`);
    if (!response.ok) throw new Error('바이너리 파일을 읽지 못했습니다.');
    return await response.arrayBuffer(); 
  }

  const response = await fetch(`/api/file?target=${encodeURIComponent(path)}`);
  if (!response.ok) throw new Error('파일을 읽지 못했습니다.');
  return await response.text();
};

// 새 파일 또는 폴더 생성
export const createFileOrFolder = async (path, isFolder) => {
  console.log(`[fileApi v1.0] 신규 생성 API 호출 - 타겟: ${path}, 폴더여부: ${isFolder}`);
  const response = await fetch('/api/file', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target: path, isFolder }),
  });
  if (!response.ok) throw new Error('생성에 실패했습니다.');
  return await response.json();
};

// 파일 덮어쓰기 (자동/수동 저장용)
export const saveFileContent = async (path, content) => {
  console.log(`[fileApi v1.0] 파일 저장 API 호출 - 타겟: ${path}`);
  const response = await fetch('/api/file', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target: path, content }),
  });
  if (!response.ok) throw new Error('저장에 실패했습니다.');
  return await response.json();
};

// 파일 또는 폴더 삭제
export const deleteFileOrFolder = async (path) => {
  console.log(`[fileApi v1.0] 삭제 API 호출 - 타겟: ${path}`);
  const response = await fetch('/api/file', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target: path }),
  });
  if (!response.ok) throw new Error('삭제에 실패했습니다.');
  return await response.json();
};

// 이름 변경 (이동)
export const renameTarget = async (oldPath, newPath) => {
  console.log(`[fileApi v1.1] 이름 변경 API 호출 - 기존: ${oldPath}, 변경: ${newPath}`);
  const response = await fetch('/api/file', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ oldTarget: oldPath, newTarget: newPath }),
  });
  if (!response.ok) throw new Error('이름 변경에 실패했습니다.');
  return await response.json();
};

// [신규] 현재 서버의 워크스페이스 경로 가져오기
export const fetchWorkspacePath = async () => {
  console.log("[fileApi v1.1] 현재 워크스페이스 경로 조회 API 호출");
  const response = await fetch('/api/workspace');
  if (!response.ok) throw new Error('워크스페이스 경로를 불러오지 못했습니다.');
  return await response.json();
};

// [신규] 서버의 워크스페이스 경로 변경하기
export const updateWorkspacePath = async (newPath) => {
  console.log(`[fileApi v1.1] 워크스페이스 경로 업데이트 API 호출 - 새로운 경로: ${newPath}`);
  const response = await fetch('/api/workspace', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newPath }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || '경로 변경에 실패했습니다.');
  }
  return await response.json();
};