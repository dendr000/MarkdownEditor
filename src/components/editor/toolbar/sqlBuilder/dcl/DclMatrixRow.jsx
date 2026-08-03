// src/components/editor/toolbar/sqlBuilder/dcl/DclMatrixRow.jsx v1.0
/*
 * 파일 위치: src/components/editor/toolbar/sqlBuilder/dcl/DclMatrixRow.jsx
 * 파일 설명: DCL 권한 매트릭스 내 특정 사용자의 개별 행을 렌더링하고 상태를 제어하는 컴포넌트입니다.
 * 연결 위치: src/components/editor/toolbar/sqlBuilder/dcl/DclMatrixTable.jsx
 */
import React from 'react';
import { Trash2 } from 'lucide-react';

function DclMatrixRow({ user, index, permissions, userPerms, isAllChecked, onTogglePermission, onToggleAllForUser, onRemoveUser }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '250px repeat(5, 1fr) 100px 60px', backgroundColor: index % 2 === 0 ? '#ffffff' : '#fcfcfc', borderBottom: '1px solid #e1e4e8' }}>
      
      {/* 사용자명 */}
      <div style={{ padding: '12px 16px', borderRight: '1px solid #d0d7de', fontSize: '13px', fontWeight: '600', color: '#24292f', display: 'flex', alignItems: 'center' }}>
        {user}
      </div>
      
      {/* 각 권한 체크박스 */}
      {permissions.map(perm => (
        <div key={`${user}-${perm}`} style={{ padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRight: '1px solid #d0d7de' }}>
          <input 
            type="checkbox" 
            checked={!!userPerms[perm]} 
            onChange={(e) => onTogglePermission(user, perm, e.target.checked)}
            style={{ cursor: 'pointer', width: '16px', height: '16px' }}
          />
        </div>
      ))}
      
      {/* 일괄 토글 컨트롤 */}
      <div style={{ padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRight: '1px solid #d0d7de' }}>
        <input 
          type="checkbox" 
          checked={isAllChecked}
          onChange={(e) => onToggleAllForUser(user, e.target.checked)}
          style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#8250df' }}
          title="전체 권한 부여/회수"
        />
      </div>

      {/* 계정 삭제 */}
      <div style={{ padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <button 
          onClick={() => onRemoveUser(user)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cf222e', padding: '4px' }}
          title="계정 권한 설정 삭제"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

export default DclMatrixRow;