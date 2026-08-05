// src/components/explorer/FileExplorer.jsx v6.1
/*
 * 파일 위치: src/components/explorer/FileExplorer.jsx
 * 연결 위치: src/App.jsx 내부 좌측 패널
 * 파일 설명: 파일/폴더 트리를 렌더링하고 탐색기 폭 조절 및 고정 기능을 제공하는 컴포넌트입니다.
 * (v6.1 수정사항): 마우스 호버 시 경로 팝업(툴팁)이 즉시 열리고 오래 남아 갑자기 메뉴가 펼쳐진 것처럼 보이던 불편함을 개선했습니다. (0.6초 딜레이 후 열림, 마우스 이탈 시 즉시 닫힘)
 */
import React, { useState, useEffect, useRef } from 'react';
import { FilePlus, FolderPlus, FolderTree, X } from 'lucide-react';
import { fetchTreeData, createFileOrFolder, fetchWorkspacePath, updateWorkspacePath } from '../../api/fileApi';
import WorkspaceConfig from './WorkspaceConfig';
import ExplorerTreeNode from './ExplorerTreeNode';

function FileExplorer({ isExplorerOpen, setIsExplorerOpen, onSelectFile, selectedFile, explorerWidth, setExplorerWidth, isExplorerPinned, setIsExplorerPinned, setIsResizing, storageMode }) {
  const [treeData, setTreeData] = useState({ name: 'root', isFolder: true, children: [], path: '' });
  const [workspacePath, setWorkspacePath] = useState(''); 
  const [isEditingWorkspace, setIsEditingWorkspace] = useState(false); 
  const [tempWorkspacePath, setTempWorkspacePath] = useState(''); 
  const [workspaceHistory, setWorkspaceHistory] = useState([]); 
  const [activeTooltipNode, setActiveTooltipNode] = useState(null);
  
  // 툴팁 등장 및 소멸 타이머 분리
  const tooltipShowTimer = useRef(null);
  const tooltipHideTimer = useRef(null);
  const resizeRef = useRef(null);

  const loadTree = async () => {
    try { console.log(`[FileExplorer v6.1] 트리 스캔`); setTreeData(await fetchTreeData()); }
    catch (e) { console.error('트리 로드 실패', e); }
  };

  const loadWorkspacePath = async () => {
    try {
      console.log(`[FileExplorer v6.1] 경로 조회`);
      const data = await fetchWorkspacePath();
      setWorkspacePath(data.path); setTempWorkspacePath(data.path); setWorkspaceHistory(data.history || []); 
    } catch (e) { console.error('경로 로드 실패', e); }
  };

  const submitWorkspacePath = async (targetPath) => {
    if (!targetPath || targetPath.trim() === '') return;
    try {
      console.log(`[FileExplorer v6.1] 경로 변경: ${targetPath}`);
      const data = await updateWorkspacePath(targetPath);
      setWorkspacePath(data.path); setTempWorkspacePath(data.path); setWorkspaceHistory(data.history || []);
      setIsEditingWorkspace(false); loadTree();
    } catch (e) { alert(`경로 변경 실패: ${e.message}`); }
  };

  useEffect(() => {
    const onMove = (e) => resizeRef.current && e.clientX >= 180 && e.clientX <= 500 && setExplorerWidth(e.clientX);
    const onUp = () => { setIsResizing(false); window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); document.body.style.userSelect = 'auto'; };
    const onDown = (e) => { if (e.target.dataset.resizer) { setIsResizing(true); setIsEditingWorkspace(false); document.body.style.userSelect = 'none'; window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp); } };
    window.addEventListener('mousedown', onDown);
    return () => window.removeEventListener('mousedown', onDown);
  }, [setExplorerWidth, setIsResizing]);

  useEffect(() => {
    loadWorkspacePath(); loadTree();
    return () => {
      clearTimeout(tooltipShowTimer.current);
      clearTimeout(tooltipHideTimer.current);
    };
  }, [storageMode]);

  // 툴팁 제어 로직 모듈화 (0.6초 이상 머물러야 열림)
  const handleTooltipOpen = (nodePath) => {
    clearTimeout(tooltipHideTimer.current);
    if (activeTooltipNode !== nodePath) {
      clearTimeout(tooltipShowTimer.current);
      tooltipShowTimer.current = setTimeout(() => setActiveTooltipNode(nodePath), 600);
    }
  };

  // 마우스가 벗어나면 즉시(0.1초) 닫힘
  const handleTooltipClose = () => {
    clearTimeout(tooltipShowTimer.current);
    tooltipHideTimer.current = setTimeout(() => setActiveTooltipNode(null), 100);
  };

  return (
    <>
      <button 
        onClick={() => { 
          console.log(`[FileExplorer v6.2] 토글 버튼 클릭. 변경 후 상태: ${!isExplorerOpen}`); 
          setIsExplorerOpen(!isExplorerOpen); 
        }} 
        title={isExplorerOpen ? "탐색기 닫기" : "탐색기 열기"} 
        style={{ 
          position: 'absolute', left: 0, top: 0, width: '46px', height: '46px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
          backgroundColor: '#24292f', borderBottomRightRadius: '16px', border: 'none', outline: 'none', cursor: 'pointer', zIndex: 3901, transition: 'background-color 0.2s ease'
        }}
      >
        {isExplorerOpen ? <X size={20} color="#c9d1d9" /> : <FolderTree size={20} color="#c9d1d9" />}
        <div style={{ position: 'absolute', top: 0, right: '-16px', width: '16px', height: '16px', backgroundColor: 'transparent', borderTopLeftRadius: '16px', boxShadow: '-8px -8px 0 8px #24292f', pointerEvents: 'none' }} />
      </button>

      <div ref={resizeRef} className="file-explorer-container" style={{ position: 'absolute', left: isExplorerOpen ? '0px' : `-${explorerWidth}px`, top: '0', bottom: '0', width: `${explorerWidth}px`, borderRight: '1px solid var(--border-color, #d0d7de)', backgroundColor: 'var(--explorer-bg, #f6f8fa)', display: 'flex', flexDirection: 'column', boxShadow: isExplorerOpen && !isExplorerPinned ? '4px 0 16px rgba(0,0,0,0.1)' : 'none', transition: isExplorerPinned ? 'none' : 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease', zIndex: isExplorerPinned ? 1 : 3900, flexShrink: 0 }}>
        
        <div style={{ height: '46px', padding: '0 12px 0 54px', backgroundColor: '#24292f', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>탐색기 ({storageMode === 'SERVER' ? 'DB' : 'VFS'})</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={() => setIsExplorerPinned(!isExplorerPinned)} title="고정 토글" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', color: isExplorerPinned ? '#58a6ff' : '#8c959f' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill={isExplorerPinned ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="17" x2="12" y2="22"></line><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-.89 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"></path></svg>
            </button>
            <FilePlus size={16} color="#4ac26b" style={{ cursor: 'pointer' }} onClick={() => { const name = window.prompt("새 파일명"); if (name) createFileOrFolder(name, false).then(loadTree); }} />
            <FolderPlus size={16} color="#58a6ff" style={{ cursor: 'pointer' }} onClick={() => { const name = window.prompt("새 폴더명"); if (name) createFileOrFolder(name, true).then(loadTree); }} />
          </div>
        </div>
        
        {storageMode === 'SERVER' && <WorkspaceConfig workspacePath={workspacePath} tempWorkspacePath={tempWorkspacePath} setTempWorkspacePath={setTempWorkspacePath} isEditingWorkspace={isEditingWorkspace} setIsEditingWorkspace={setIsEditingWorkspace} handleWorkspaceSubmit={(e) => { e.preventDefault(); submitWorkspacePath(tempWorkspacePath); }} workspaceHistory={workspaceHistory} submitWorkspacePath={submitWorkspacePath} />}
        
        <style>{`.explorer-scroll::-webkit-scrollbar { width: 6px; height: 6px; } .explorer-scroll::-webkit-scrollbar-thumb { background-color: var(--border-color, #d0d7de); border-radius: 4px; } .explorer-scroll::-webkit-scrollbar-thumb:hover { background-color: var(--text-muted, #8c959f); }`}</style>
        
        <div className="explorer-scroll" style={{ flex: 1, overflowY: 'auto', padding: '8px', paddingBottom: '60px' }}>
          {treeData?.children?.map(child => child && (
            <ExplorerTreeNode 
              key={child.path} 
              node={child} 
              onSelect={onSelectFile} 
              onRefresh={loadTree} 
              selectedFile={selectedFile}
              workspacePath={workspacePath} 
              activeTooltipNode={activeTooltipNode} 
              onTooltipOpen={handleTooltipOpen} 
              onTooltipClose={handleTooltipClose} 
            />
          ))}
          {(!treeData?.children?.length) && <div style={{ fontSize: '12px', color: 'var(--text-muted, #8c959f)', textAlign: 'center', marginTop: '20px' }}>표시할 문서 파일이 없습니다.</div>}
        </div>
        
        <div data-resizer="true" style={{ position: 'absolute', right: '-3px', top: '0', bottom: '0', width: '6px', cursor: 'ew-resize', zIndex: 3900 }} title="폭 조절" />
      </div>
    </>
  );
}
export default FileExplorer;