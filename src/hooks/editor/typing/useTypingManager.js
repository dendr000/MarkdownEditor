// C:\dev\MarkdownEditor\src\hooks\editor\typing\useTypingManager.js
/*
 * 파일 위치: src/hooks/editor/typing/useTypingManager.js
 * 파일 설명: 5개의 텍스트 입력 및 포맷팅 보조 훅을 통합하여 단일 파이프라인으로 관리하는 매니저 훅입니다. 메인 컴포넌트의 다이어트를 위해 생성되었습니다.
 */
import { useAutoTyping } from './useAutoTyping';
import { useSqlFormatter } from './useSqlFormatter';
import { useCodeFormatter } from './useCodeFormatter';
import { useCommentToggle } from './useCommentToggle';
import { useSnippetExpand } from './useSnippetExpand';

export const useTypingManager = (markdown, setMarkdown, selectedFile, textareaRef) => {
  // 개별 훅들을 매니저 내부에서 모두 초기화합니다.
  const { handleSqlFormatKeyDown } = useSqlFormatter(markdown, setMarkdown, selectedFile, textareaRef);
  const { handleFormatCode } = useCodeFormatter(markdown, setMarkdown, selectedFile, textareaRef);
  const { handleToggleComment } = useCommentToggle(markdown, setMarkdown, selectedFile, textareaRef);
  const { handleSnippetAndReplace } = useSnippetExpand(markdown, setMarkdown, selectedFile, textareaRef);
  const { handleAutoTyping } = useAutoTyping(markdown, setMarkdown, selectedFile, textareaRef);

  // 릴레이 실행 파이프라인 함수
  const handleTypingEvents = (e) => {
    if (handleSqlFormatKeyDown && handleSqlFormatKeyDown(e)) return true;
    if (handleFormatCode && handleFormatCode(e)) return true;
    if (handleToggleComment && handleToggleComment(e)) return true;
    if (handleSnippetAndReplace && handleSnippetAndReplace(e)) return true;
    if (handleAutoTyping && handleAutoTyping(e)) return true;
    
    // 어떤 훅 조건에도 맞지 않아 처리되지 않았을 경우 false 반환
    return false; 
  };

  return { handleTypingEvents };
};