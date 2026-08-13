// C:\dev\MarkdownEditor\src\hooks\editor\core\useModalState.js
/*
 * 파일 위치: src/hooks/editor/core/useModalState.js
 * 파일 설명: useEditor에서 분리됨. 10여 개에 달하는 팝업/모달의 개폐 상태와 선택 영역(Selection) 상태를 전담하여 관리합니다.
 */
import { useState } from 'react';

export const useModalState = () => {
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isHtmlTableModalOpen, setIsHtmlTableModalOpen] = useState(false);
  const [isFolderTreeModalOpen, setIsFolderTreeModalOpen] = useState(false);
  const [isDiagramModalOpen, setIsDiagramModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isMathModalOpen, setIsMathModalOpen] = useState(false);
  const [isCommitGuideOpen, setIsCommitGuideOpen] = useState(false);
  const [isFindReplaceOpen, setIsFindReplaceOpen] = useState(false);
  const [isMockModalOpen, setIsMockModalOpen] = useState(false);
  
  const [replaceSelectionRange, setReplaceSelectionRange] = useState({ start: 0, end: 0 });
  const [selectedTableText, setSelectedTableText] = useState('');
  const [selectionRange, setSelectionRange] = useState({ start: 0, end: 0 });
  const [openDropdown, setOpenDropdown] = useState(null);

  return {
    isTableModalOpen, setIsTableModalOpen,
    isHtmlTableModalOpen, setIsHtmlTableModalOpen,
    isFolderTreeModalOpen, setIsFolderTreeModalOpen,
    isDiagramModalOpen, setIsDiagramModalOpen,
    isDetailsModalOpen, setIsDetailsModalOpen,
    isTemplateModalOpen, setIsTemplateModalOpen,
    isMathModalOpen, setIsMathModalOpen,
    isCommitGuideOpen, setIsCommitGuideOpen,
    isFindReplaceOpen, setIsFindReplaceOpen,
    isMockModalOpen, setIsMockModalOpen,
    replaceSelectionRange, setReplaceSelectionRange,
    selectedTableText, setSelectedTableText,
    selectionRange, setSelectionRange,
    openDropdown, setOpenDropdown
  };
};