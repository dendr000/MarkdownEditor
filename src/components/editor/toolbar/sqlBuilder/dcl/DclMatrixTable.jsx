// src/components/editor/toolbar/sqlBuilder/dcl/DclMatrixTable.jsx v1.0
/*
 * 파일 위치: src/components/editor/toolbar/sqlBuilder/dcl/DclMatrixTable.jsx
 * 파일 설명: 사용자 계정과 권한을 2차원 표(Matrix) 형태로 배치하는 뷰 영역입니다.
 * 연결 위치: src/components/editor/toolbar/sqlBuilder/dcl/DclMatrixPanel.jsx
 */
import React from 'react';
import { ShieldCheck } from 'lucide-react';
import DclMatrixRow from './DclMatrixRow';

function DclMatrixTable({ users, matrix, permissions, handleTogglePermission, handleToggleAllForUser, handleRemoveUser }) {
  console.log("[DclMatrixTable v1.0] 매트릭스 표 렌더링", { userCount: users.length });

  return (
    <div style={{ flex: 1, backgroundColor: '#ffffff', border: '1px solid #d0d7de', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      
      {/* 매트릭스 헤더 (권한 목록) */}
      <div style={{ display: 'grid', gridTemplateColumns: '250px repeat(5, 1fr) 100px 60px', backgroundColor: '#f3f4f6', borderBottom: '1px solid #d0d7de', fontSize: '13px', fontWeight: 'bold', color: '#57606a' }}>
        <div style={{ padding: '12px 16px', borderRight: '1px solid #d0d7de', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={16} /> 대상 사용자 (User)
        </div>
        {permissions.map(perm => (
          <div key={perm} style={{ padding: '12px', textAlign: 'center', borderRight: '1px solid #d0d7de' }}>
            {perm}
          </div>
        ))}
        <div style={{ padding: '12px', textAlign: 'center', borderRight: '1px solid #d0d7de' }}>일괄 제어</div>
        <div style={{ padding: '12px', textAlign: 'center' }}>삭제</div>
      </div>

      {/* 매트릭스 바디 (사용자 목록) */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {users.length === 0 && (
          <div style={{ padding: '32px', textAlign: 'center', color: '#8c959f', fontSize: '13px' }}>
            권한을 관리할 계정이 없습니다. 상단에서 계정을 추가해 주세요.
          </div>
        )}
        {users.map((user, index) => {
          const userPerms = matrix[user] || {};
          const isAllChecked = permissions.every(p => userPerms[p]);
          
          return (
            <DclMatrixRow
              key={user}
              user={user}
              index={index}
              permissions={permissions}
              userPerms={userPerms}
              isAllChecked={isAllChecked}
              onTogglePermission={handleTogglePermission}
              onToggleAllForUser={handleToggleAllForUser}
              onRemoveUser={handleRemoveUser}
            />
          );
        })}
      </div>
    </div>
  );
}

export default DclMatrixTable;