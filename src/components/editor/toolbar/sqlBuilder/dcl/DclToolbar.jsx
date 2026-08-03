// src/components/editor/toolbar/sqlBuilder/dcl/DclToolbar.jsx v1.0
/*
 * 파일 위치: src/components/editor/toolbar/sqlBuilder/dcl/DclToolbar.jsx
 * 파일 설명: DCL 권한 제어 패널의 상단 제어 바입니다. 
 * 대상 객체(Target) 지정 및 새로운 사용자 계정 추가 폼을 렌더링합니다.
 * 연결 위치: src/components/editor/toolbar/sqlBuilder/dcl/DclMatrixPanel.jsx
 */
import React from 'react';
import { Database, UserPlus } from 'lucide-react';

function DclToolbar({ targetObject, setTargetObject, newUserInput, setNewUserInput, handleAddUser }) {
  console.log("[DclToolbar v1.0] DCL 툴바 컴포넌트 렌더링");

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '16px', borderRadius: '8px', border: '1px solid #d0d7de' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Database size={20} style={{ color: '#57606a' }} />
        <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#24292f' }}>대상 객체 (Target):</label>
        <input 
          type="text" 
          value={targetObject}
          onChange={(e) => setTargetObject(e.target.value)}
          placeholder="예: *.* 또는 my_db.*"
          style={{ padding: '8px 12px', border: '1px solid #d0d7de', borderRadius: '6px', fontSize: '14px', outline: 'none', width: '200px' }}
        />
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <UserPlus size={18} style={{ color: '#57606a' }} />
        <input 
          type="text" 
          value={newUserInput}
          onChange={(e) => setNewUserInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAddUser(); }}
          placeholder="'user'@'host'"
          style={{ padding: '8px 12px', border: '1px solid #d0d7de', borderRadius: '6px', fontSize: '14px', outline: 'none', width: '180px' }}
        />
        <button 
          onClick={handleAddUser}
          style={{ padding: '8px 16px', backgroundColor: '#0969da', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
        >
          계정 추가
        </button>
      </div>
    </div>
  );
}

export default DclToolbar;