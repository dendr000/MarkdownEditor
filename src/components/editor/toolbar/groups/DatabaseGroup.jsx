/*
 * 파일 위치: src/components/editor/toolbar/groups/DatabaseGroup.jsx
 * 기능 요약: SQL 더미 데이터 생성기 및 시각적 SQL 쿼리 빌더를 호출하는 데이터베이스 특화 툴바 버튼 그룹입니다.
 */
import { Database, TableProperties } from 'lucide-react';

export const DatabaseGroup = ({ onOpenMockModal, onOpenQueryBuilderModal }) => (
  <div className="toolbar-group">
    <button onClick={() => onOpenMockModal()} title="SQL 더미 데이터 / 프로시저 생성기"><Database size={18} /></button>
    <button onClick={() => { console.log("시각적 SQL 쿼리 빌더 호출"); onOpenQueryBuilderModal(); }} title="시각적 SQL 쿼리 빌더"><TableProperties size={18} /></button>
  </div>
);