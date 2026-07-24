// src/components/explorer/WorkspaceConfig.jsx v1.0
/*
 * 파일 설명: 탐색기 상단의 워크스페이스(루트 폴더) 경로를 설정하고 히스토리를 관리하는 컴포넌트입니다.
 * FileExplorer.jsx에서 분리되었습니다.
 * 연결 위치: src/components/explorer/FileExplorer.jsx 내부
 */
import React, { useState } from 'react';
import { Folder } from 'lucide-react';

function WorkspaceConfig({ 
  workspacePath, 
  tempWorkspacePath, 
  setTempWorkspacePath, 
  isEditingWorkspace, 
  setIsEditingWorkspace, 
  handleWorkspaceSubmit, 
  workspaceHistory,
  submitWorkspacePath
}) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [focusedHistoryIndex, setFocusedHistoryIndex] = useState(-1);

  const handleKeyDown = (e) => {
    if (!isHistoryOpen || workspaceHistory.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedHistoryIndex((prev) => (prev < workspaceHistory.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedHistoryIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      if (focusedHistoryIndex >= 0 && focusedHistoryIndex < workspaceHistory.length) {
        e.preventDefault();
        const selected = workspaceHistory[focusedHistoryIndex];
        setTempWorkspacePath(selected);
        submitWorkspacePath(selected);
        setIsHistoryOpen(false);
      } else {
        setIsHistoryOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsHistoryOpen(false);
      setFocusedHistoryIndex(-1);
    }
  };

  return (
    <div style={{ padding: '8px 12px', borderBottom: '1px solid #d0d7de', backgroundColor: '#ffffff', position: 'relative' }}>
      {isEditingWorkspace ? (
        <form onSubmit={handleWorkspaceSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#57606a' }}>루트 경로 설정 (예: D:/Folder)</span>
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              value={tempWorkspacePath} 
              onChange={(e) => setTempWorkspacePath(e.target.value)}
              onFocus={() => setIsHistoryOpen(true)}
              onBlur={() => setTimeout(() => setIsHistoryOpen(false), 150)} 
              onKeyDown={handleKeyDown}
              style={{ padding: '4px 8px', fontSize: '12px', borderRadius: '4px', border: '1px solid #0969da', outline: 'none', width: '100%', boxSizing: 'border-box' }}
              autoFocus
            />
            {isHistoryOpen && workspaceHistory.length > 0 && (
              <ul style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '4px',
                padding: 0,
                margin: 0,
                listStyle: 'none',
                backgroundColor: '#ffffff',
                border: '1px solid #d0d7de',
                borderRadius: '4px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                zIndex: 1000,
                maxHeight: '150px',
                overflowY: 'auto'
              }}>
                {workspaceHistory.map((histPath, idx) => (
                  <li 
                    key={idx}
                    onMouseDown={(e) => {
                      e.preventDefault(); 
                      setTempWorkspacePath(histPath);
                      submitWorkspacePath(histPath);
                    }}
                    onMouseEnter={() => setFocusedHistoryIndex(idx)}
                    style={{
                      padding: '6px 8px',
                      fontSize: '11px',
                      color: '#24292f',
                      cursor: 'pointer',
                      backgroundColor: focusedHistoryIndex === idx ? '#f3f4f6' : '#ffffff',
                      borderBottom: idx < workspaceHistory.length - 1 ? '1px solid #eaeef2' : 'none',
                      wordBreak: 'break-all'
                    }}
                  >
                    {histPath}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end', marginTop: '4px' }}>
            <button type="button" onClick={() => { setIsEditingWorkspace(false); setTempWorkspacePath(workspacePath); setIsHistoryOpen(false); }} style={{ padding: '4px 8px', fontSize: '11px', border: '1px solid #d0d7de', borderRadius: '4px', background: '#f6f8fa', cursor: 'pointer' }}>취소</button>
            <button type="submit" style={{ padding: '4px 8px', fontSize: '11px', border: 'none', borderRadius: '4px', background: '#0969da', color: '#fff', cursor: 'pointer' }}>적용</button>
          </div>
        </form>
      ) : (
        <div 
          onClick={() => { setIsEditingWorkspace(true); setFocusedHistoryIndex(-1); }} 
          title="클릭하여 워크스페이스 기준 폴더 변경"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '4px', borderRadius: '4px', transition: 'background 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <Folder size={14} color="#57606a" />
          <span style={{ fontSize: '11px', color: '#57606a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {workspacePath || '경로 불러오는 중...'}
          </span>
        </div>
      )}
    </div>
  );
}

export default WorkspaceConfig;