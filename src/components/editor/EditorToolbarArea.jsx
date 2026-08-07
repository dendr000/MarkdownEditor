/*
 * 파일 위치: src/components/editor/EditorToolbarArea.jsx
 * 파일 설명: 메인 에디터의 상단 툴바 영역을 렌더링하고 가로 스크롤 이벤트를 제어합니다.
 * 연결 위치: src/components/editor/Editor.jsx
 */
import React, { useRef, useEffect } from 'react';
import { Table, FileCode2, FolderTree, Workflow, Library, GitCommit } from 'lucide-react';
import { HeadingGroup, FormatGroup, ListGroup, MediaGroup, GithubGroup, DatabaseGroup } from './toolbar/ToolbarGroups';

function EditorToolbarArea({ state, actions, setIsQueryBuilderModalOpen }) {
  const toolbarRef = useRef(null);

  useEffect(() => {
    const toolbar = toolbarRef.current;
    if (!toolbar) return;

    const handleWheel = (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault(); 
        toolbar.scrollLeft += e.deltaY;
      }
    };

    toolbar.addEventListener('wheel', handleWheel, { passive: false });
    return () => toolbar.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <div className="editor-toolbar-wrapper" ref={toolbarRef}>
      <div className="editor-toolbar">
        <HeadingGroup handleFormat={actions.handleFormat} />
        <div className="toolbar-divider" />
        <FormatGroup handleFormat={actions.handleFormat} onOpenMathModal={() => actions.setIsMathModalOpen(true)} />
        <div className="toolbar-divider" />
        <ListGroup handleFormat={actions.handleFormat} />
        <div className="toolbar-divider" />
        <MediaGroup handleFormat={actions.handleFormat} />
        <div className="toolbar-divider" />
        <GithubGroup handleFormat={actions.handleFormat} openDropdown={state.openDropdown} setOpenDropdown={actions.setOpenDropdown} onOpenDetailsModal={() => { actions.prepareModalState('Details'); actions.setIsDetailsModalOpen(true); }} />
        <div className="toolbar-divider" />
        
        {/* DB 툴링 버튼 마운트 (더미 데이터 생성기 및 쿼리 빌더) */}
        <DatabaseGroup 
          onOpenMockModal={() => actions.setIsMockModalOpen(true)} 
          onOpenQueryBuilderModal={() => {
            // 동작이 확실히 보장된 기존 모달 키('Diagram')를 빌려 텍스트 스냅샷을 강제로 캡처합니다.
            actions.prepareModalState('Diagram'); 
            setIsQueryBuilderModalOpen(true);
          }}
        />
        <div className="toolbar-divider" />
        
        <div className="toolbar-group">
          <button onClick={() => actions.setIsTemplateModalOpen(true)} title="템플릿 보관함"><Library size={18} /></button>
          <button onClick={() => actions.setIsCommitGuideOpen(true)} title="Git 커밋 가이드"><GitCommit size={18} /></button>
          <button onClick={() => { actions.prepareModalState('MD Table'); actions.setIsTableModalOpen(true); }} title="마크다운 표 삽입"><Table size={18} /></button>
          <button onClick={() => { actions.prepareModalState('HTML Table'); actions.setIsHtmlTableModalOpen(true); }} title="고급 HTML 표 삽입"><FileCode2 size={18} /></button>
          <button onClick={() => { actions.prepareModalState('Folder Tree'); actions.setIsFolderTreeModalOpen(true); }} title="폴더 트리 생성"><FolderTree size={18} /></button>
          <button onClick={() => { actions.prepareModalState('Diagram'); actions.setIsDiagramModalOpen(true); }} title="다이어그램 작성기"><Workflow size={18} /></button>
        </div>
      </div>
    </div> 
  );
}

export default EditorToolbarArea;