// C:\dev\MarkdownEditor\src\hooks\editor\core\useEditor.js
/*
 * 파일 위치: src/hooks/editor/core/useEditor.js
 * 파일 설명: 에디터 비즈니스 로직들을 하위 모듈로 완전히 분리하고, 이들을 조합하여 기존과 100% 동일한 형태의 인터페이스(state, actions)를 반환하는 오케스트레이터 파일입니다.
 */
import { useModalState } from './useModalState';
import { useAutoSave } from './useAutoSave';
import { useTextFormat } from './useTextFormat';
import { useKeyMap } from './useKeyMap';

export const useEditor = (markdown, setMarkdown, selectedFile, textareaRef, handleAutocompleteKeyDown) => {
  // 1. 모달 및 선택 영역 상태 관리 로직 가져오기
  const modalState = useModalState();
  
  // 2. 확장자 판별 및 파일 자동 저장 로직 가져오기
  const { fileExt, isReadOnly } = useAutoSave(markdown, selectedFile);
  
  // 3. 텍스트 삽입, 포맷팅, 치환 로직 가져오기
  const { 
    handleFormat, 
    prepareModalState, 
    handleInsertTable, 
    handleReplaceAll 
  } = useTextFormat(
    markdown, 
    textareaRef, 
    selectedFile,
    isReadOnly,
    modalState.setSelectionRange, 
    modalState.setSelectedTableText
  );
  
  // 4. 키보드 이벤트 라우팅 로직 가져오기
  const { handleKeyDown } = useKeyMap(
    markdown, 
    selectedFile, 
    textareaRef, 
    fileExt, 
    isReadOnly, 
    handleAutocompleteKeyDown, 
    handleFormat, 
    modalState.setReplaceSelectionRange, 
    modalState.setIsFindReplaceOpen
  );

  return {
    state: {
      fileExt,
      isReadOnly,
      isTableModalOpen: modalState.isTableModalOpen,
      isHtmlTableModalOpen: modalState.isHtmlTableModalOpen,
      isFolderTreeModalOpen: modalState.isFolderTreeModalOpen,
      isDiagramModalOpen: modalState.isDiagramModalOpen,
      isDetailsModalOpen: modalState.isDetailsModalOpen,
      isTemplateModalOpen: modalState.isTemplateModalOpen,
      isMathModalOpen: modalState.isMathModalOpen,
      isCommitGuideOpen: modalState.isCommitGuideOpen,
      isFindReplaceOpen: modalState.isFindReplaceOpen,
      isMockModalOpen: modalState.isMockModalOpen,
      replaceSelectionRange: modalState.replaceSelectionRange,
      selectedTableText: modalState.selectedTableText,
      openDropdown: modalState.openDropdown
    },
    actions: {
      setIsTableModalOpen: modalState.setIsTableModalOpen,
      setIsHtmlTableModalOpen: modalState.setIsHtmlTableModalOpen,
      setIsFolderTreeModalOpen: modalState.setIsFolderTreeModalOpen,
      setIsDiagramModalOpen: modalState.setIsDiagramModalOpen,
      setIsDetailsModalOpen: modalState.setIsDetailsModalOpen,
      setIsTemplateModalOpen: modalState.setIsTemplateModalOpen,
      setIsMathModalOpen: modalState.setIsMathModalOpen,
      setIsCommitGuideOpen: modalState.setIsCommitGuideOpen,
      setIsFindReplaceOpen: modalState.setIsFindReplaceOpen,
      setIsMockModalOpen: modalState.setIsMockModalOpen,
      setOpenDropdown: modalState.setOpenDropdown,
      handleFormat,
      prepareModalState,
      handleInsertTable: (output) => handleInsertTable(output, modalState.selectionRange),
      handleReplaceAll,
      handleKeyDown
    }
  };
};