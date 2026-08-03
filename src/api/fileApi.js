// src/api/fileApi.js v2.0
/*
 * 파일 설명: 로컬 백엔드(server.js)와 브라우저 내장 저장소(IndexedDB) 간의 통신을 
 * 어댑터 패턴으로 분기 처리하는 공통 API 유틸리티입니다.
 * (v2.0 수정사항): 스토리지 스위칭 기능 탑재 및 browserDb 연동
 */
import * as browserDb from './browserDb';

export const STORAGE_KEY = 'md_editor_storage_mode';
// 기본값은 로컬 파일(SERVER), 로컬 스토리지에 저장된 값이 있으면 복원
export let currentStorageMode = localStorage.getItem(STORAGE_KEY) || 'SERVER';

export const setStorageMode = (mode) => {
  console.log(`[fileApi v2.0] 스토리지 모드 변경 됨: ${mode}`);
  currentStorageMode = mode;
  localStorage.setItem(STORAGE_KEY, mode);
};

export const getStorageMode = () => currentStorageMode;

export const fetchTreeData = async () => {
  console.log(`[fileApi v2.0] 트리 스캔 API 호출 (모드: ${currentStorageMode})`);
  if (currentStorageMode === 'BROWSER') return await browserDb.fetchTreeData();
  
  const response = await fetch('/api/tree');
  if (!response.ok) throw new Error('트리 데이터를 불러오지 못했습니다.');
  return await response.json();
};

export const fetchFileContent = async (path) => {
  console.log(`[fileApi v2.0] 파일 읽기 API 호출 - 타겟: ${path} (모드: ${currentStorageMode})`);
  
  const extMatch = path.match(/\.([^.]+)$/);
  const ext = extMatch ? extMatch[1].toLowerCase() : '';
  const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext);
  const isBinary = ['xls', 'xlsx', 'csv', 'docx'].includes(ext); 

  if (isImage) {
    console.log(`[fileApi v2.0] 이미지 파일 감지, 마크다운 태그 반환`);
    const fileName = path.split('/').pop();
    return `![${fileName}](./${fileName})`; 
  }

  if (currentStorageMode === 'BROWSER') {
    if (isBinary) throw new Error('가상 DB 모드에서는 바이너리 문서 파싱을 지원하지 않습니다.');
    return await browserDb.fetchFileContent(path);
  }

  if (isBinary) {
    const response = await fetch(`/api/raw?target=${encodeURIComponent(path)}`);
    if (!response.ok) throw new Error('바이너리 파일을 읽지 못했습니다.');
    return await response.arrayBuffer(); 
  }

  const response = await fetch(`/api/file?target=${encodeURIComponent(path)}`);
  if (!response.ok) throw new Error('파일을 읽지 못했습니다.');
  return await response.text();
};

export const createFileOrFolder = async (path, isFolder) => {
  console.log(`[fileApi v2.0] 신규 생성 API 호출 - 타겟: ${path} (모드: ${currentStorageMode})`);
  if (currentStorageMode === 'BROWSER') return await browserDb.createFileOrFolder(path, isFolder);
  
  const response = await fetch('/api/file', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target: path, isFolder }),
  });
  if (!response.ok) throw new Error('생성에 실패했습니다.');
  return await response.json();
};

export const saveFileContent = async (path, content) => {
  console.log(`[fileApi v2.0] 파일 저장 API 호출 - 타겟: ${path} (모드: ${currentStorageMode})`);
  if (currentStorageMode === 'BROWSER') return await browserDb.saveFileContent(path, content);
  
  const response = await fetch('/api/file', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target: path, content }),
  });
  if (!response.ok) throw new Error('저장에 실패했습니다.');
  return await response.json();
};

export const deleteFileOrFolder = async (path) => {
  console.log(`[fileApi v2.0] 삭제 API 호출 - 타겟: ${path} (모드: ${currentStorageMode})`);
  if (currentStorageMode === 'BROWSER') return await browserDb.deleteFileOrFolder(path);
  
  const response = await fetch('/api/file', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ target: path }),
  });
  if (!response.ok) throw new Error('삭제에 실패했습니다.');
  return await response.json();
};

export const renameTarget = async (oldPath, newPath) => {
  console.log(`[fileApi v2.0] 이름 변경 API 호출 - 기존: ${oldPath}, 변경: ${newPath} (모드: ${currentStorageMode})`);
  if (currentStorageMode === 'BROWSER') return await browserDb.renameTarget(oldPath, newPath);
  
  const response = await fetch('/api/file', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ oldTarget: oldPath, newTarget: newPath }),
  });
  if (!response.ok) throw new Error('이름 변경에 실패했습니다.');
  return await response.json();
};

export const fetchWorkspacePath = async () => {
  console.log(`[fileApi v2.0] 워크스페이스 경로 조회 API 호출 (모드: ${currentStorageMode})`);
  if (currentStorageMode === 'BROWSER') {
    return { path: 'Browser Virtual File System (IndexedDB)', history: [] };
  }
  
  const response = await fetch('/api/workspace');
  if (!response.ok) throw new Error('워크스페이스 경로를 불러오지 못했습니다.');
  return await response.json();
};

export const updateWorkspacePath = async (newPath) => {
  if (currentStorageMode === 'BROWSER') throw new Error('가상 DB 모드에서는 워크스페이스 변경을 지원하지 않습니다.');
  
  console.log(`[fileApi v2.1] 워크스페이스 경로 업데이트 API 호출 - 새로운 경로: ${newPath}`);
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

export const globalSearch = async (query, useRegex, matchCase) => {
  console.log(`[fileApi v2.1] 전역 검색 API 호출 - 쿼리: ${query}`);
  if (currentStorageMode === 'BROWSER') throw new Error('가상 DB 모드(IndexedDB)에서는 전역 검색을 지원하지 않습니다.');
  
  const response = await fetch('/api/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, useRegex, matchCase }),
  });
  
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || '검색에 실패했습니다.');
  }
  return await response.json();
};

export const globalReplace = async (query, replaceText, useRegex, matchCase) => {
  console.log(`[fileApi v2.1] 전역 치환 API 호출 - 쿼리: ${query} -> ${replaceText}`);
  if (currentStorageMode === 'BROWSER') throw new Error('가상 DB 모드(IndexedDB)에서는 전역 치환을 지원하지 않습니다.');
  
  const response = await fetch('/api/replace', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, replaceText, useRegex, matchCase }),
  });
  
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || '치환에 실패했습니다.');
  }
  return await response.json();
};