// src/components/explorer/FileExplorer.jsx v1.9
/*
 * 파일 설명: 로컬 백엔드 서버와 통신하여 파일/폴더 트리를 렌더링하고 탐색기 폭 조절 및 고정(Pin) 기능을 제공하는 컴포넌트입니다.
 * (v1.9 수정사항): 마우스 드래그를 통한 가로 폭 리사이징(Resizable) 기능과 SVG 핀 토글 버튼이 추가되었습니다.
 * 연결 위치: src/App.jsx 내부
 */
import React, { useState, useEffect, useRef } from 'react';
import { FilePlus, FolderPlus } from 'lucide-react';
import { fetchTreeData, createFileOrFolder, fetchWorkspacePath, updateWorkspacePath } from '../../api/fileApi';
import WorkspaceConfig from './WorkspaceConfig';
import ExplorerTreeNode from './ExplorerTreeNode';

function FileExplorer({ isExplorerOpen, onSelectFile, selectedFile, explorerWidth, setExplorerWidth, isExplorerPinned, setIsExplorerPinned, setIsResizing }) {
  const [treeData, setTreeData] = useState({ name: 'root', isFolder: true, children: [], path: '' });
  const [workspacePath, setWorkspacePath] = useState(''); 
  const [isEditingWorkspace, setIsEditingWorkspace] = useState(false); 
  const [tempWorkspacePath, setTempWorkspacePath] = useState(''); 
  const [workspaceHistory, setWorkspaceHistory] = useState([]); 
  
  const [activeTooltipNode, setActiveTooltipNode] = useState(null);
  const tooltipHideTimer = useRef(null);
  const resizeRef = useRef(null);

  const loadTree = async () => {
    try {
      console.log('[FileExplorer v1.9] 최신 트리 데이터를 서버에 요청합니다.');
      const data = await fetchTreeData();
      setTreeData(data);
    } catch (error) {
      console.error('[FileExplorer v1.9] 트리 데이터 로드 실패:', error);
    }
  };

  const loadWorkspacePath = async () => {
    try {
      console.log('[FileExplorer v1.9] 서버에 현재 워크스페이스 경로 및 히스토리 조회를 요청합니다.');
      const data = await fetchWorkspacePath();
      setWorkspacePath(data.path);
      setTempWorkspacePath(data.path);
      setWorkspaceHistory(data.history || []); 
    } catch (error) {
      console.error('[FileExplorer v1.9] 워크스페이스 데이터 로드 실패:', error);
    }
  };

  const submitWorkspacePath = async (targetPath) => {
    if (!targetPath || targetPath.trim() === '') return;
    try {
      console.log(`[FileExplorer v1.9] 워크스페이스 경로 변경 승인 요청: ${targetPath}`);
      const data = await updateWorkspacePath(targetPath);
      setWorkspacePath(data.path);
      setTempWorkspacePath(data.path);
      setWorkspaceHistory(data.history || []);
      setIsEditingWorkspace(false);
      loadTree();
    } catch (error) {
      console.error('[FileExplorer v1.9] 경로 변경 거부됨:', error);
      alert(`경로 변경 실패: ${error.message}`);
    }
  };

  const handleWorkspaceSubmit = (e) => {
    e.preventDefault();
    submitWorkspacePath(tempWorkspacePath);
  };

  const handleTooltipOpen = (nodePath) => {
    if (tooltipHideTimer.current) clearTimeout(tooltipHideTimer.current);
    setActiveTooltipNode(nodePath);
  };

  const handleTooltipClose = () => {
    tooltipHideTimer.current = setTimeout(() => {
      setActiveTooltipNode(null);
    }, 3000);
  };

  // [신규] 탐색기 우측 경계 마우스 드래그 리사이징 로직
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!resizeRef.current) return;
      const newWidth = e.clientX;
      if (newWidth >= 180 && newWidth <= 500) { // 최소 180px, 최대 500px 제한
        setExplorerWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'auto'; // 드래그 중 텍스트 선택 방지 해제
    };

    const handleMouseDown = (e) => {
      if (e.target.dataset.resizer) {
        setIsResizing(true);
        setIsEditingWorkspace(false);
        document.body.style.userSelect = 'none'; // 드래그 중 텍스트 선택 방지
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [setExplorerWidth, setIsResizing]);

  useEffect(() => {
    loadWorkspacePath();
    loadTree();
    return () => {
      if (tooltipHideTimer.current) clearTimeout(tooltipHideTimer.current);
    };
  }, []);

  return (
    <div 
      ref={resizeRef}
      className="file-explorer-container"
      style={{ 
        position: isExplorerPinned ? 'relative' : 'absolute',
        left: isExplorerOpen ? '0px' : `-${explorerWidth}px`,
        top: '0', 
        bottom: '0', 
        width: `${explorerWidth}px`, 
        borderRight: '1px solid #d0d7de', 
        backgroundColor: '#f6f8fa', 
        display: 'flex', 
        flexDirection: 'column',
        boxShadow: isExplorerOpen && !isExplorerPinned ? '4px 0 16px rgba(0,0,0,0.1)' : 'none',
        transition: isExplorerPinned ? 'none' : 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease',
        zIndex: isExplorerPinned ? 1 : 9999,
        flexShrink: 0
      }}
    >
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #d0d7de', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '14px', fontWeight: '600', color: '#24292f' }}>탐색기 (DB)</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* [신규] SVG 핀(Pin) 고정 토글 버튼 */}
          <button 
            onClick={() => setIsExplorerPinned(!isExplorerPinned)}
            title={isExplorerPinned ? "오버레이 모드로전환 (화면 덮기)" : "고정 모드로 전환 (화면 밀어내기)"}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              padding: '2px', 
              display: 'flex', 
              alignItems: 'center', 
              color: isExplorerPinned ? '#0969da' : '#8c959f',
              transition: 'color 0.2s'
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill={isExplorerPinned ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="17" x2="12" y2="22"></line>
              <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-.89 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path>
            </svg>
          </button>
          
          <FilePlus size={16} color="#2da44e" style={{ cursor: 'pointer' }} onClick={() => {
            const name = window.prompt("루트에 생성할 새 파일명 (.md 권장)");
            if (name) { 
              console.log(`[FileExplorer v1.9] 루트 파일 생성 요청: ${name}`);
              createFileOrFolder(name, false).then(loadTree); 
            }
          }} title="루트 파일 추가" />
          <FolderPlus size={16} color="#0969da" style={{ cursor: 'pointer' }} onClick={() => {
            const name = window.prompt("루트에 생성할 새 폴더명");
            if (name) { 
              console.log(`[FileExplorer v1.9] 루트 폴더 생성 요청: ${name}`);
              createFileOrFolder(name, true).then(loadTree); 
            }
          }} title="루트 폴더 추가" />
        </div>
      </div>
      
      <WorkspaceConfig 
        workspacePath={workspacePath}
        tempWorkspacePath={tempWorkspacePath}
        setTempWorkspacePath={setTempWorkspacePath}
        isEditingWorkspace={isEditingWorkspace}
        setIsEditingWorkspace={setIsEditingWorkspace}
        handleWorkspaceSubmit={handleWorkspaceSubmit}
        workspaceHistory={workspaceHistory}
        submitWorkspacePath={submitWorkspacePath}
      />

      <style>{`
        .explorer-scroll::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .explorer-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .explorer-scroll::-webkit-scrollbar-thumb {
          background-color: #d0d7de;
          border-radius: 4px;
        }
        .explorer-scroll::-webkit-scrollbar-thumb:hover {
          background-color: #8c959f;
        }
      `}</style>

      <div className="explorer-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px', paddingBottom: '60px' }}>
        {treeData && treeData.children && treeData.children.map(child => (
          child ? <ExplorerTreeNode 
                    key={child.path} 
                    node={child} 
                    onSelect={onSelectFile} 
                    onRefresh={loadTree} 
                    selectedFile={selectedFile}
                    activeTooltipNode={activeTooltipNode}
                    onTooltipOpen={handleTooltipOpen}
                    onTooltipClose={handleTooltipClose}
                  /> : null
        ))}
        {(!treeData || !treeData.children || treeData.children.length === 0) && (
          <div style={{ fontSize: '12px', color: '#8c959f', textAlign: 'center', marginTop: '20px' }}>표시할 문서 파일이 없습니다.</div>
        )}
      </div>

      {/* [신규] 우측 경계 마우스 리사이징 핸들 (Drag Handle) */}
      <div 
        data-resizer="true"
        style={{
          position: 'absolute',
          right: '-3px',
          top: '0',
          bottom: '0',
          width: '6px',
          cursor: 'ew-resize',
          zIndex: 10000,
          backgroundColor: 'transparent'
        }}
        title="드래그하여 탐색기 너비 조절"
      />
    </div>
  );
}

export default FileExplorer;