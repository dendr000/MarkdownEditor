// src/components/editor/toolbar/sqlBuilder/DclMatrixPanel.jsx v1.0
/*
 * 파일 위치: src/components/editor/toolbar/sqlBuilder/DclMatrixPanel.jsx
 * 파일 설명: 시각적 SQL 쿼리 빌더의 DCL(GRANT/REVOKE) 모드 전용 메인 패널입니다.
 * 세로축에 사용자, 가로축에 권한을 나열한 매트릭스(Matrix) 폼을 통해 직관적인 권한 제어를 수행합니다.
 * 연결 위치: src/components/editor/toolbar/SqlQueryBuilderModal.jsx
 */
import React, { useState, useMemo } from 'react';
import { ShieldCheck, UserPlus, Database, Trash2 } from 'lucide-react';
import { generateDclQuery } from '../../../../utils/editor/sqlDclGenerator';
import { highlightCode } from '../../../../utils/editor/syntaxHighlighter';

function DclMatrixPanel() {
  const permissions = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'EXECUTE'];
  
  const [users, setUsers] = useState(["'admin'@'localhost'", "'developer'@'%'"]);
  const [newUserInput, setNewUserInput] = useState('');
  const [targetObject, setTargetObject] = useState('*.*');
  
  // matrix: { "'admin'@'localhost'": { SELECT: true, INSERT: true, ... }, ... }
  const [matrix, setMatrix] = useState({
    "'admin'@'localhost'": { SELECT: true, INSERT: true, UPDATE: true, DELETE: true, EXECUTE: true },
    "'developer'@'%'": { SELECT: true, INSERT: false, UPDATE: false, DELETE: false, EXECUTE: false }
  });

  console.log("[DclMatrixPanel v1.0] DCL 권한 매트릭스 패널 렌더링", { users, targetObject });

  // 특정 사용자 및 특정 권한 토글 핸들러
  const handleTogglePermission = (user, perm, isChecked) => {
    console.log(`[DclMatrixPanel v1.0] 권한 토글 - 계정: ${user}, 권한: ${perm}, 상태: ${isChecked}`);
    setMatrix(prev => ({
      ...prev,
      [user]: {
        ...prev[user],
        [perm]: isChecked
      }
    }));
  };

  // 신규 사용자 추가 핸들러
  const handleAddUser = () => {
    if (!newUserInput || newUserInput.trim() === '') return;
    
    // SQL 계정명 포맷 자동 보정 ('username'@'host')
    let formattedUser = newUserInput.trim();
    if (!formattedUser.includes('@')) {
      formattedUser = `'${formattedUser}'@'%'`;
    }

    if (users.includes(formattedUser)) {
      console.log(`[DclMatrixPanel v1.0] 이미 존재하는 사용자입니다: ${formattedUser}`);
      return;
    }

    console.log(`[DclMatrixPanel v1.0] 신규 사용자 추가: ${formattedUser}`);
    setUsers([...users, formattedUser]);
    setMatrix(prev => ({
      ...prev,
      [formattedUser]: {} // 초기 권한은 모두 false(undefined)
    }));
    setNewUserInput('');
  };

  // 사용자 삭제 핸들러
  const handleRemoveUser = (userToRemove) => {
    console.log(`[DclMatrixPanel v1.0] 사용자 삭제: ${userToRemove}`);
    setUsers(users.filter(u => u !== userToRemove));
    
    setMatrix(prev => {
      const newMatrix = { ...prev };
      delete newMatrix[userToRemove];
      return newMatrix;
    });
  };

  // 전체 선택/해제 헬퍼 함수 (특정 사용자의 모든 권한 토글)
  const handleToggleAllForUser = (user, isChecked) => {
    console.log(`[DclMatrixPanel v1.0] ${user} 계정의 모든 권한을 ${isChecked ? '부여' : '회수'}합니다.`);
    const newPerms = {};
    permissions.forEach(p => { newPerms[p] = isChecked; });
    
    setMatrix(prev => ({
      ...prev,
      [user]: newPerms
    }));
  };

  // 실시간 SQL 컴파일 및 구문 강조 (메모이제이션)
  const compiledSql = useMemo(() => {
    return generateDclQuery(users, permissions, matrix, targetObject);
  }, [users, permissions, matrix, targetObject]);

  const highlightedSql = useMemo(() => {
    return highlightCode(compiledSql, 'sql');
  }, [compiledSql]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
      
      {/* 상단 컨트롤 바 (타겟 객체 및 계정 추가) */}
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

      {/* 권한 매트릭스(표) 영역 */}
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
              <div key={user} style={{ display: 'grid', gridTemplateColumns: '250px repeat(5, 1fr) 100px 60px', backgroundColor: index % 2 === 0 ? '#ffffff' : '#fcfcfc', borderBottom: '1px solid #e1e4e8' }}>
                
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
                      onChange={(e) => handleTogglePermission(user, perm, e.target.checked)}
                      style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                    />
                  </div>
                ))}
                
                {/* 일괄 토글 컨트롤 */}
                <div style={{ padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRight: '1px solid #d0d7de' }}>
                  <input 
                    type="checkbox" 
                    checked={isAllChecked}
                    onChange={(e) => handleToggleAllForUser(user, e.target.checked)}
                    style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#8250df' }}
                    title="전체 권한 부여/회수"
                  />
                </div>

                {/* 계정 삭제 */}
                <div style={{ padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <button 
                    onClick={() => handleRemoveUser(user)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cf222e', padding: '4px' }}
                    title="계정 권한 설정 삭제"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 하단 실시간 DCL 컴파일 뷰어 패널 */}
      <div style={{ height: '220px', backgroundColor: '#24292f', borderRadius: '8px', border: '1px solid #d0d7de', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '8px 16px', backgroundColor: '#32383f', borderBottom: '1px solid #1b1f24', fontSize: '12px', fontWeight: 'bold', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>DCL 권한 스크립트 뷰어 (Live Preview)</span>
        </div>
        <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
          <pre style={{ margin: 0, padding: 0, backgroundColor: 'transparent', color: '#e6edf3', fontSize: '13px', fontFamily: 'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, monospace', lineHeight: '1.6', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            <code dangerouslySetInnerHTML={{ __html: highlightedSql }} style={{ display: 'block', whiteSpace: 'pre-wrap' }} />
          </pre>
        </div>
      </div>
      
    </div>
  );
}

export default DclMatrixPanel;