// src/components/explorer/FileExplorer.jsx v1.6
/*
 * 파일 설명: 로컬 백엔드 서버와 통신하여 파일/폴더 트리를 렌더링하고 워크스페이스 경로를 제어하는 좌측 탐색기 컴포넌트입니다.
 * (v1.6 수정사항): 현재 열려있는 파일(selectedFile)을 기준으로 대상 파일 간의 마크다운 상대 경로를 계산하여 마우스 호버(title) 시 표시하는 기능을 추가했습니다.
 * 연결 위치: src/App.jsx 내부
 */
import React, { useState, useEffect } from 'react';
import { Folder, FolderOpen, FileText, FilePlus, FolderPlus, Trash2, Edit2, ChevronRight, ChevronDown } from 'lucide-react';
import { fetchTreeData, createFileOrFolder, deleteFileOrFolder, renameTarget, fetchWorkspacePath, updateWorkspacePath } from '../../api/fileApi';

// 현재 열려있는 파일과 대상 파일 간의 마크다운 상대 경로를 계산하는 유틸리티 함수
const getRelativePath = (currentPath, targetPath) => {
  if (!currentPath || !targetPath) return '';
  const currentParts = currentPath.split('/');
  currentParts.pop(); // 현재 파일의 파일명 제거 (디렉토리 기준)
  const targetParts = targetPath.split('/');

  let commonLength = 0;
  while (commonLength < currentParts.length && commonLength < targetParts.length && currentParts[commonLength] === targetParts[commonLength]) {
    commonLength++;
  }

  const upCount = currentParts.length - commonLength;
  const upString = upCount > 0 ? '../'.repeat(upCount) : './';
  const downString = targetParts.slice(commonLength).join('/');

  return upString + downString;
};

const TreeNode = ({ node, onSelect, onRefresh, selectedFile }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleAdd = async (isFolder) => {
    const name = window.prompt(`새 ${isFolder ? '폴더' : '파일'} 이름을 입력하세요.\n(파일은 .md 또는 .txt 확장자 권장)`);
    if (!name) return;
    const ext = !isFolder && !name.includes('.') ? '.md' : '';
    const newPath = node.path ? `${node.path}/${name}${ext}` : `${name}${ext}`;
    console.log(`[FileExplorer v1.6] 신규 ${isFolder ? '폴더' : '파일'} 생성 요청 - 경로: ${newPath}`);
    await createFileOrFolder(newPath, isFolder);
    setIsOpen(true);
    onRefresh();
  };

  const handleDelete = async () => {
    if (window.confirm(`'${node.name}'을(를) 정말 삭제하시겠습니까?`)) {
      console.log(`[FileExplorer v1.6] 삭제 요청 - 경로: ${node.path}`);
      await deleteFileOrFolder(node.path);
      onRefresh();
    }
  };

  const handleRename = async () => {
    const newName = window.prompt('새 이름을 입력하세요:', node.name);
    if (!newName || newName === node.name) return;
    const basePath = node.path.substring(0, node.path.lastIndexOf('/'));
    const newPath = basePath ? `${basePath}/${newName}` : newName;
    console.log(`[FileExplorer v1.6] 이름 변경 요청 - 기존: ${node.path}, 변경: ${newPath}`);
    await renameTarget(node.path, newPath);
    onRefresh();
  };

  // 마우스 호버 시 상대 경로를 안내하는 툴팁 문자열 생성
  const relativePathTooltip = (!node.isFolder && selectedFile && node.path !== selectedFile)
    ? `\n\n[현재 문서 기준 상대 경로]\n${getRelativePath(selectedFile, node.path)}`
    : '';

  return (
    <div style={{ marginLeft: node.path ? '12px' : '0' }}>
      <div 
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 6px', borderRadius: '4px', cursor: 'pointer', transition: 'background 0.1s' }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e1e4e8'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, overflow: 'hidden' }}
          onClick={() => node.isFolder ? setIsOpen(!isOpen) : onSelect(node.path)}
          title={node.name + relativePathTooltip}
        >
          {node.isFolder ? (
            <div style={{ display: 'flex', alignItems: 'center', color: '#57606a' }}>
              {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              {isOpen ? <FolderOpen size={14} color="#0969da" style={{ marginLeft: '4px' }} /> : <Folder size={14} color="#0969da" style={{ marginLeft: '4px' }} />}
            </div>
          ) : (
            <FileText size={14} color="#57606a" style={{ marginLeft: '18px' }} />
          )}
          <span style={{ fontSize: '13px', color: '#24292f', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {node.name}
          </span>
        </div>

        {node.path && (
          <div style={{ display: 'flex', gap: '4px', opacity: 0.7 }}>
            {node.isFolder && (
              <>
                <FilePlus size={14} color="#2da44e" onClick={(e) => { e.stopPropagation(); handleAdd(false); }} title="파일 추가" />
                <FolderPlus size={14} color="#0969da" onClick={(e) => { e.stopPropagation(); handleAdd(true); }} title="폴더 추가" />
              </>
            )}
            <Edit2 size={14} color="#57606a" onClick={(e) => { e.stopPropagation(); handleRename(); }} title="이름 변경" />
            <Trash2 size={14} color="#cf222e" onClick={(e) => { e.stopPropagation(); handleDelete(); }} title="삭제" />
          </div>
        )}
      </div>
      {isOpen && node.children && (
        <div>
          {node.children.map(child => (
            <TreeNode key={child.path} node={child} onSelect={onSelect} onRefresh={onRefresh} selectedFile={selectedFile} />
          ))}
        </div>
      )}
    </div>
  );
};

function FileExplorer({ isExplorerOpen, onSelectFile, selectedFile }) {
  const [treeData, setTreeData] = useState({ name: 'root', isFolder: true, children: [], path: '' });
  const [workspacePath, setWorkspacePath] = useState(''); 
  const [isEditingWorkspace, setIsEditingWorkspace] = useState(false); 
  const [tempWorkspacePath, setTempWorkspacePath] = useState(''); 
  const [workspaceHistory, setWorkspaceHistory] = useState([]); 
  const [isHistoryOpen, setIsHistoryOpen] = useState(false); 
  const [focusedHistoryIndex, setFocusedHistoryIndex] = useState(-1); 

  const loadTree = async () => {
    try {
      console.log('[FileExplorer v1.6] 최신 트리 데이터를 서버에 요청합니다.');
      const data = await fetchTreeData();
      setTreeData(data);
    } catch (error) {
      console.error('[FileExplorer v1.6] 트리 데이터 로드 실패:', error);
    }
  };

  const loadWorkspacePath = async () => {
    try {
      console.log('[FileExplorer v1.6] 서버에 현재 워크스페이스 경로 및 히스토리 조회를 요청합니다.');
      const data = await fetchWorkspacePath();
      setWorkspacePath(data.path);
      setTempWorkspacePath(data.path);
      setWorkspaceHistory(data.history || []); 
    } catch (error) {
      console.error('[FileExplorer v1.6] 워크스페이스 데이터 로드 실패:', error);
    }
  };

  const submitWorkspacePath = async (targetPath) => {
    if (!targetPath || targetPath.trim() === '') return;
    try {
      console.log(`[FileExplorer v1.6] 워크스페이스 경로 변경 승인 요청: ${targetPath}`);
      const data = await updateWorkspacePath(targetPath);
      setWorkspacePath(data.path);
      setTempWorkspacePath(data.path);
      setWorkspaceHistory(data.history || []);
      setIsEditingWorkspace(false);
      setIsHistoryOpen(false);
      loadTree();
    } catch (error) {
      console.error('[FileExplorer v1.6] 경로 변경 거부됨:', error);
      alert(`경로 변경 실패: ${error.message}`);
    }
  };

  const handleWorkspaceSubmit = (e) => {
    e.preventDefault();
    submitWorkspacePath(tempWorkspacePath);
  };

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

  useEffect(() => {
    loadWorkspacePath();
    loadTree();
  }, []);

  return (
    <div 
      style={{ 
        position: 'absolute',
        left: isExplorerOpen ? '0px' : '-260px',
        top: '0', 
        bottom: '0', 
        width: '260px', 
        borderRight: '1px solid #d0d7de', 
        backgroundColor: '#f6f8fa', 
        display: 'flex', 
        flexDirection: 'column',
        boxShadow: isExplorerOpen ? '4px 0 16px rgba(0,0,0,0.1)' : 'none',
        transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease',
        zIndex: 9999
      }}
    >
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #d0d7de', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '14px', fontWeight: '600', color: '#24292f' }}>탐색기 (DB)</span>
        <div style={{ display: 'flex', gap: '8px', cursor: 'pointer' }}>
          <FilePlus size={16} color="#2da44e" onClick={() => {
            const name = window.prompt("루트에 생성할 새 파일명 (.md 권장)");
            if (name) { 
              console.log(`[FileExplorer v1.6] 루트 파일 생성 요청: ${name}`);
              createFileOrFolder(name, false).then(loadTree); 
            }
          }} title="루트 파일 추가" />
          <FolderPlus size={16} color="#0969da" onClick={() => {
            const name = window.prompt("루트에 생성할 새 폴더명");
            if (name) { 
              console.log(`[FileExplorer v1.6] 루트 폴더 생성 요청: ${name}`);
              createFileOrFolder(name, true).then(loadTree); 
            }
          }} title="루트 폴더 추가" />
        </div>
      </div>
      
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

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {treeData && treeData.children && treeData.children.map(child => (
          child ? <TreeNode key={child.path} node={child} onSelect={onSelectFile} onRefresh={loadTree} selectedFile={selectedFile} /> : null
        ))}
        {(!treeData || !treeData.children || treeData.children.length === 0) && (
          <div style={{ fontSize: '12px', color: '#8c959f', textAlign: 'center', marginTop: '20px' }}>표시할 문서 파일이 없습니다.</div>
        )}
      </div>
    </div>
  );
}

export default FileExplorer;