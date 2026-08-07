// src/api/fileApi.js v2.0
/*
 * 파일 설명: 로컬 백엔드(server.js)와 브라우저 내장 저장소(IndexedDB) 간의 통신을 
 * 어댑터 패턴으로 분기 처리하는 공통 API 유틸리티입니다.
 * (v2.0 수정사항): 스토리지 스위칭 기능 탑재 및 browserDb 연동
 */
import * as browserDb from './browserDb';

// 클라우드 배포 환경에서는 무조건 BROWSER(VFS) 모드로만 동작하도록 강제합니다.
export const getStorageMode = () => 'BROWSER';
export const setStorageMode = () => {}; 

export const fetchTreeData = async () => {
  return await browserDb.fetchTreeData();
};

export const fetchFileContent = async (path) => {
  const extMatch = path.match(/\.([^.]+)$/);
  const ext = extMatch ? extMatch[1].toLowerCase() : '';
  const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext);
  const isBinary = ['xls', 'xlsx', 'csv', 'docx'].includes(ext); 

  if (isImage) {
    const fileName = path.split('/').pop();
    return `![${fileName}](./${fileName})`; 
  }

  if (isBinary) throw new Error('가상 DB 모드에서는 바이너리 문서 파싱을 지원하지 않습니다.');
  
  return await browserDb.fetchFileContent(path);
};

export const createFileOrFolder = async (path, isFolder) => {
  return await browserDb.createFileOrFolder(path, isFolder);
};

export const saveFileContent = async (path, content) => {
  return await browserDb.saveFileContent(path, content);
};

export const deleteFileOrFolder = async (path) => {
  return await browserDb.deleteFileOrFolder(path);
};

export const renameTarget = async (oldPath, newPath) => {
  return await browserDb.renameTarget(oldPath, newPath);
};

export const fetchWorkspacePath = async () => {
  return { path: 'Browser Virtual File System (IndexedDB)', history: [] };
};

export const updateWorkspacePath = async (newPath) => {
  throw new Error('가상 DB 모드에서는 워크스페이스 변경을 지원하지 않습니다.');
};

export const globalSearch = async (query, useRegex, matchCase) => {
  throw new Error('가상 DB 모드(IndexedDB)에서는 전역 검색을 지원하지 않습니다.');
};

export const globalReplace = async (query, replaceText, useRegex, matchCase) => {
  throw new Error('가상 DB 모드(IndexedDB)에서는 전역 치환을 지원하지 않습니다.');
};