// src/components/explorer/FileExplorer.jsx v1.8
/*
 * 파일 설명: 로컬 백엔드 서버와 통신하여 파일/폴더 트리를 렌더링하고 워크스페이스 경로를 제어하는 좌측 탐색기 메인 컨테이너입니다.
 * (v1.8 수정사항): 여러 노드의 툴팁이 중복되어 뜨는 현상을 방지하기 위해 툴팁 활성화 상태를 중앙에서 관리합니다.
 * 연결 위치: src/App.jsx 내부
 */
import React, { useState, useEffect, useRef } from 'react';
import { FilePlus, FolderPlus } from 'lucide-react';
import { fetchTreeData, createFileOrFolder, fetchWorkspacePath, updateWorkspacePath } from '../../api/fileApi';
import WorkspaceConfig from './WorkspaceConfig';
import ExplorerTreeNode from './ExplorerTreeNode';

function FileExplorer({ isExplorerOpen, onSelectFile, selectedFile }) {
  const [treeData, setTreeData] = useState({ name: 'root', isFolder: true, children: [], path: '' });
  const [workspacePath, setWorkspacePath] = useState(''); 
  const [isEditingWorkspace, setIsEditingWorkspace] = useState(false); 
  const [tempWorkspacePath, setTempWorkspacePath] = useState(''); 
  const [workspaceHistory, setWorkspaceHistory] = useState([]); 
  
  // [신규] 툴팁 중앙 제어 상태
  const [activeTooltipNode, setActiveTooltipNode] = useState(null);
  const tooltipHideTimer = useRef(null);

  const loadTree = async () => {
    try {
      console.log('[FileExplorer v1.8] 최신 트리 데이터를 서버에 요청합니다.');
      const data = await fetchTreeData();
      setTreeData(data);
    } catch (error) {
      console.error('[FileExplorer v1.8] 트리 데이터 로드 실패:', error);
    }
  };

  const loadWorkspacePath = async () => {
    try {
      console.log('[FileExplorer v1.8] 서버에 현재 워크스페이스 경로 및 히스토리 조회를 요청합니다.');
      const data = await fetchWorkspacePath();
      setWorkspacePath(data.path);
      setTempWorkspacePath(data.path);
      setWorkspaceHistory(data.history || []); 
    } catch (error) {
      console.error('[FileExplorer v1.8] 워크스페이스 데이터 로드 실패:', error);
    }
  };

  const submitWorkspacePath = async (targetPath) => {
    if (!targetPath || targetPath.trim() === '') return;
    try {
      console.log(`[FileExplorer v1.8] 워크스페이스 경로 변경 승인 요청: ${targetPath}`);
      const data = await updateWorkspacePath(targetPath);
      setWorkspacePath(data.path);
      setTempWorkspacePath(data.path);
      setWorkspaceHistory(data.history || []);
      setIsEditingWorkspace(false);
      loadTree();
    } catch (error) {
      console.error('[FileExplorer v1.8] 경로 변경 거부됨:', error);
      alert(`경로 변경 실패: ${error.message}`);
    }
  };

  const handleWorkspaceSubmit = (e) => {
    e.preventDefault();
    submitWorkspacePath(tempWorkspacePath);
  };

  // 툴팁 제어 핸들러
  const handleTooltipOpen = (nodePath) => {
    if (tooltipHideTimer.current) clearTimeout(tooltipHideTimer.current);
    setActiveTooltipNode(nodePath);
  };

  const handleTooltipClose = () => {
    // 마우스가 떠나면 3초 뒤에 사라지도록 설정 (다른 노드에 마우스가 올라가면 위에서 타이머가 취소됨)
    tooltipHideTimer.current = setTimeout(() => {
      setActiveTooltipNode(null);
    }, 3000);
  };

  useEffect(() => {
    loadWorkspacePath();
    loadTree();
    return () => {
      if (tooltipHideTimer.current) clearTimeout(tooltipHideTimer.current);
    };
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
              console.log(`[FileExplorer v1.8] 루트 파일 생성 요청: ${name}`);
              createFileOrFolder(name, false).then(loadTree); 
            }
          }} title="루트 파일 추가" />
          <FolderPlus size={16} color="#0969da" onClick={() => {
            const name = window.prompt("루트에 생성할 새 폴더명");
            if (name) { 
              console.log(`[FileExplorer v1.8] 루트 폴더 생성 요청: ${name}`);
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

      {/* 탐색기 전용 얇고 깔끔한 스크롤바 커스텀 스타일 */}
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

      {/* 가로 스크롤(overflowX: hidden)을 차단하고 커스텀 스크롤 클래스 적용 */}
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
    </div>
  );
}

export default FileExplorer;