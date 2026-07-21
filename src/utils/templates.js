// src/utils/templates.js v1.0
/*
 * 파일 설명: 템플릿 보관함 초기 구동 시 사용자에게 기본적으로 제공될 하드코딩된 마크다운 템플릿 문자열 모음입니다.
 */

export const DEFAULT_TEMPLATES = [
  {
    id: 'default-pr',
    title: 'Pull Request 템플릿',
    isCustom: false,
    content: `## 💡 변경 사항\n- \n\n## 📸 스크린샷 (선택)\n- \n\n## 🔗 관련 이슈\n- Fixes #`
  },
  {
    id: 'default-bug',
    title: '버그 리포트 (Bug Report)',
    isCustom: false,
    content: `## 🐛 버그 설명\n- \n\n## 🔄 재현 방법\n1. \n2. \n\n## 🖥️ 환경\n- OS: \n- Browser: `
  },
  {
    id: 'default-meeting',
    title: '회의록 양식',
    isCustom: false,
    content: `## 📅 일시 및 참석자\n- 일시: \n- 참석자: \n\n## 📝 논의 안건\n1. \n\n## ✅ 결정 사항\n- `
  }
];