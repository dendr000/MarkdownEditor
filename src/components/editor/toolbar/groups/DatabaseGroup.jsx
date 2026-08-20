// src/components/editor/toolbar/groups/DatabaseGroup.jsx v1.1
/*
 * 파일 위치: src/components/editor/toolbar/groups/DatabaseGroup.jsx
 * 기능 요약: SQL 더미 데이터 생성기 및 시각적 SQL 쿼리 빌더를 호출하는 데이터베이스 특화 툴바 버튼 그룹입니다. (배포를 위해 콘솔 로그 출력 기능이 제거되었습니다.)
 */
import { Database, TableProperties } from 'lucide-react';

export const DatabaseGroup = ({ onOpenMockModal, onOpenQueryBuilderModal }) => (
  <div className="toolbar-group">
    <button onClick={() => onOpenMockModal()} title="SQL 더미 데이터 / 프로시저 생성기"><Database size={18} /></button>
    <button onClick={() => { onOpenQueryBuilderModal(); }} title="시각적 SQL 쿼리 빌더"><TableProperties size={18} /></button>
  </div>
);