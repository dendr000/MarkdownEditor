// src/components/editor/toolbar/sqlBuilder/dcl/DclMatrixPanel.jsx v2.0
/*
 * 파일 위치: src/components/editor/toolbar/sqlBuilder/dcl/DclMatrixPanel.jsx
 * 파일 설명: 시각적 SQL 쿼리 빌더의 DCL(GRANT/REVOKE) 모드 전용 메인 패널입니다.
 * 유지보수를 위해 Toolbar, Table, Preview로 뷰 컴포넌트를 분할하고, 상태 및 연산만을 조율하는 오케스트레이터입니다.
 * 연결 위치: src/components/editor/toolbar/SqlQueryBuilderModal.jsx
 */
import React, { useState, useMemo } from 'react';
import { generateDclQuery } from '../../../../../utils/editor/sqlDclGenerator';
import { highlightCode } from '../../../../../utils/editor/syntaxHighlighter';

// 하위 뷰 컴포넌트 임포트
import DclToolbar from './DclToolbar';
import DclMatrixTable from './DclMatrixTable';
import DclPreview from './DclPreview';

function DclMatrixPanel({ onInsert }) {
  const permissions = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'EXECUTE'];
  
  const [users, setUsers] = useState(["'admin'@'localhost'", "'developer'@'%'"]);
  const [newUserInput, setNewUserInput] = useState('');
  const [targetObject, setTargetObject] = useState('*.*');
  
  const [matrix, setMatrix] = useState({
    "'admin'@'localhost'": { SELECT: true, INSERT: true, UPDATE: true, DELETE: true, EXECUTE: true },
    "'developer'@'%'": { SELECT: true, INSERT: false, UPDATE: false, DELETE: false, EXECUTE: false }
  });

  const handleTogglePermission = (user, perm, isChecked) => {
    setMatrix(prev => ({
      ...prev,
      [user]: {
        ...prev[user],
        [perm]: isChecked
      }
    }));
  };

  const handleAddUser = () => {
    if (!newUserInput || newUserInput.trim() === '') return;
    
    let formattedUser = newUserInput.trim();
    if (!formattedUser.includes('@')) {
      formattedUser = `'${formattedUser}'@'%'`;
    }

    if (users.includes(formattedUser)) return;

    setUsers([...users, formattedUser]);
    setMatrix(prev => ({
      ...prev,
      [formattedUser]: {} 
    }));
    setNewUserInput('');
  };

  const handleRemoveUser = (userToRemove) => {
    setUsers(users.filter(u => u !== userToRemove));
    setMatrix(prev => {
      const newMatrix = { ...prev };
      delete newMatrix[userToRemove];
      return newMatrix;
    });
  };

  const handleToggleAllForUser = (user, isChecked) => {
    const newPerms = {};
    permissions.forEach(p => { newPerms[p] = isChecked; });
    
    setMatrix(prev => ({
      ...prev,
      [user]: newPerms
    }));
  };

  const compiledSql = useMemo(() => {
    return generateDclQuery(users, permissions, matrix, targetObject);
  }, [users, permissions, matrix, targetObject]);

  const highlightedSql = useMemo(() => {
    return highlightCode(compiledSql, 'sql');
  }, [compiledSql]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
      
      <DclToolbar 
        targetObject={targetObject}
        setTargetObject={setTargetObject}
        newUserInput={newUserInput}
        setNewUserInput={setNewUserInput}
        handleAddUser={handleAddUser}
      />

      <DclMatrixTable 
        users={users}
        matrix={matrix}
        permissions={permissions}
        handleTogglePermission={handleTogglePermission}
        handleToggleAllForUser={handleToggleAllForUser}
        handleRemoveUser={handleRemoveUser}
      />

      <DclPreview 
        compiledSql={compiledSql}
        highlightedSql={highlightedSql}
        onInsert={onInsert}
      />
      
    </div>
  );
}

export default DclMatrixPanel;