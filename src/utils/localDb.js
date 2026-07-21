// src/utils/localDb.js v1.0
/*
 * 파일 설명: 백엔드 DB를 대신하여 브라우저의 localStorage를 미니 데이터베이스로 활용하는 CRUD 래퍼 유틸리티입니다.
 */
import { DEFAULT_TEMPLATES } from './templates';

const TEMPLATES_KEY = 'github_md_editor_templates';

// 로컬 스토리지에서 모든 템플릿 불러오기 (데이터가 없으면 기본값 반환)
export const getTemplates = () => {
  try {
    const stored = localStorage.getItem(TEMPLATES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("[localDb] 템플릿 파싱 에러:", error);
  }
  // 로컬 스토리지에 데이터가 없으면 하드코딩된 기본값 로드
  return DEFAULT_TEMPLATES;
};

// 신규 커스텀 템플릿 저장
export const saveTemplate = (title, content) => {
  const current = getTemplates();
  const newTemplate = {
    id: `custom-${Date.now()}`,
    title: title.trim() || '제목 없는 템플릿',
    content: content,
    isCustom: true // 사용자가 직접 만든 템플릿임을 표시
  };
  const updated = [...current, newTemplate];
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(updated));
  return updated;
};

// 기존 커스텀 템플릿 수정
export const updateTemplate = (id, newTitle, newContent) => {
  const current = getTemplates();
  const updated = current.map(t => 
    t.id === id 
      ? { ...t, title: newTitle.trim() || '제목 없는 템플릿', content: newContent }
      : t
  );
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(updated));
  return updated;
};

// 커스텀 템플릿 삭제
export const deleteTemplate = (id) => {
  const current = getTemplates();
  // 사용자가 추가한 템플릿만 삭제 가능
  const updated = current.filter(t => t.id !== id || !t.isCustom);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(updated));
  return updated;
};