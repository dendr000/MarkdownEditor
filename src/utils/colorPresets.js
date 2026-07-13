// src/utils/colorPresets.js v1.0
/*
 * 파일 설명: 표 셀 배경색 및 글자색 지정 시 깃허브 스타일에 어울리는 추천 색상 팔레트를 제공하는 상수 파일입니다.
 * 연결 위치: src/components/html-table/ToolbarStyle.jsx 에서 색상 선택 버튼 렌더링에 사용됩니다.
 */

export const PRESET_COLORS = {
  text: [
    { label: '기본(검정)', value: 'inherit' },
    { label: '빨강', value: '#cf222e' },
    { label: '파랑', value: '#0550ae' },
    { label: '초록', value: '#1a7f37' },
    { label: '주황', value: '#9a6700' },
    { label: '회색', value: '#57606a' }
  ],
  bg: [
    { label: '투명', value: 'transparent' },
    { label: '빨강 바탕', value: '#ffebe9' },
    { label: '파랑 바탕', value: '#ddf4ff' },
    { label: '초록 바탕', value: '#dafbe1' },
    { label: '노랑 바탕', value: '#fff8c5' },
    { label: '회색 바탕', value: '#f6f8fa' }
  ]
};