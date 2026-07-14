/* src/components/editor/Editor.jsx v2.1 */
/*
 * 파일 설명: 마크다운 원문을 작성하는 텍스트 편집 창과 깃허브 마크다운 서식을 지원하는 SVG 아이콘 기반의 고정형 툴바 컴포넌트입니다.
 * 연결 위치: src/App.jsx 파일의 메인 레이아웃 내부 우측 영역에 배정되며, 자식 팝업 레이어로 TableModal.jsx 및 HtmlTableModal.jsx를 제어합니다.
 */
import { useRef, useState, useEffect } from 'react';
import { 
  Heading1, Heading2, Heading3, Bold, Italic, Strikethrough, 
  CheckSquare, Code, Table, FileCode2, Quote, List, ListOrdered, 
  Link, Image as ImageIcon, MessageSquareWarning, FileDiff, Baseline
} from 'lucide-react';
import TableModal from '../table/TableModal';
import HtmlTableModal from '../table/HtmlTableModal';
import './Editor.css'; 

function Editor({ markdown, setMarkdown }) {
  console.log("Editor 컴포넌트(v2.1 도메인 격리 아키텍처) 렌더링을 시작합니다.");
  
  // 텍스트 선택 영역 및 커서 포커스 제어를 위한 textarea DOM 참조 객체
  const textareaRef = useRef(null);
  
  // 기본 마크다운 표 생성 팝업창의 화면 표시 여부 상태 변수
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  
  // 고급 정밀 제어 HTML 표 편집기 팝업창의 화면 표시 여부 상태 변수
  const [isHtmlTableModalOpen, setIsHtmlTableModalOpen] = useState(false);
  
  // 본문에서 드래그하여 표 모달로 연동시킬 전송용 마크다운/HTML 문자열 상태 변수
  const [selectedTableText, setSelectedTableText] = useState('');
  
  // 표 삽입 후 기존 드래그 구역을 정확히 대체하기 위해 기억하는 커서 인덱스 범위 상태 객체
  const [selectionRange, setSelectionRange] = useState({ start: 0, end: 0 });

  // 특수 얼럿(Alerts) 및 디프(Diff) 템플릿 하위 서브 메뉴 활성화 제어 상태 변수
  const [openDropdown, setOpenDropdown] = useState(null);

  // 문서의 임의 영역을 클릭하였을 때 활성화된 드롭다운 서브 서식 메뉴가 자동으로 닫히도록 유도하는 이펙트 훅
  useEffect(() => {
    console.log("Editor 컴포넌트 마운트 완료 - 외부 영역 마우스 클릭 감지 리스너 등록 수행");
    const handleClickOutside = (e) => {
      if (!e.target.closest('.dropdown-container')) {
        console.log("드롭다운 컨테이너 외부 구역 클릭 감지됨 - 열린 메뉴 초기화");
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      console.log("Editor 컴포넌트 언마운트 - 외부 클릭 감지 리스너 해제 처리");
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  // 일반 인라인 서식 및 블록 요소를 계산하여 본문에 기호를 삽입하는 핵심 서식 제어 함수
  const handleFormat = (prefix, suffix = '', isBlock = false) => {
    console.log(`handleFormat 함수 실행 요청됨 -> 접두사: "${prefix}", 접미사: "${suffix}", 블록속성: ${isBlock}`);
    
    if (!textareaRef.current) {
      console.log("인스턴스 오류: textareaRef가 DOM 요소에 정상 바인딩되지 않아 포맷 연산을 중단합니다.");
      return;
    }

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = markdown.substring(start, end);

    console.log(`현재 선택 구역 스캔 완료 -> 시작지점: ${start}, 종료지점: ${end}, 드래그내용: "${selectedText}"`);

    const beforeText = markdown.substring(0, start);
    const afterText = markdown.substring(end);

    let newText = '';
    let newCursorPos = 0;

    if (isBlock) {
      console.log("블록형 서식 규칙 적용 프로세스 가동");
      const defaultPlaceholder = '내용을 입력하세요';
      newText = beforeText + prefix + (selectedText || defaultPlaceholder) + suffix + afterText;
      newCursorPos = start + prefix.length + (selectedText ? selectedText.length : defaultPlaceholder.length);
    } else {
      console.log("인라인형 서식 규칙 적용 프로세스 가동");
      newText = beforeText + prefix + selectedText + suffix + afterText;
      newCursorPos = start + prefix.length + selectedText.length;
    }
    
    console.log("마크다운 원문 텍스트 데이터 갱신 반영");
    setMarkdown(newText);
    setOpenDropdown(null);

    setTimeout(() => {
      console.log(`텍스트 영역 포커스 복원 및 선택 블록 재지정 실행 -> 타겟 위치: ${newCursorPos}`);
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, newCursorPos);
    }, 0);
  };

  // 깃허브 공식 안내 블록(Alerts) 문법 기호 주입 가동 함수
  const insertAlert = (type) => {
    console.log(`insertAlert 기능 실행 단계 진입 -> 요청된 지정 타입: [${type}]`);
    const alertPrefix = `> [!${type}]\n> `;
    handleFormat(alertPrefix, '\n', true);
  };

  // 비교 분석용 디프(Diff) 전용 코드 블록 서식 서체 생성 함수
  const insertDiff = () => {
    console.log("insertDiff 기능 실행 단계 진입 -> Diff 구문 스니펫 템플릿 생성");
    const diffTemplate = "\n```diff\n+ 추가된 줄 (초록색 배경 표시)\n- 삭제된 줄 (빨간색 배경 표시)\n! 변경 내용 기호 사양 명세\n@@ -1,3 +1,4 @@\n```\n";
    handleFormat(diffTemplate, '', false);
  };

  // 팝업 레이어가 오픈되기 직전 현재 커서의 좌표 상태와 드래그 텍스트를 파싱용 상태값으로 이전 저장하는 준비 함수
  const prepareModalState = (modalType) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      console.log(`prepareModalState 구동 처리 -> 대상 모달: ${modalType}, 인덱스 기록: ${start} ~ ${end}`);
      
      setSelectionRange({ start, end });

      if (start !== end) {
        const text = markdown.substring(start, end);
        console.log(`선택 영역 내부에서 텍스트 감지 성공 -> 파서 연동 데이터 크기: ${text.length}글자`);
        setSelectedTableText(text);
      } else {
        console.log("드래그 선택 영역이 없으므로 파서 연동 문자열을 빈 값으로 초기화합니다.");
        setSelectedTableText('');
      }
    }
  };

  // 마크다운 기본 테이블 빌더 오픈 핸들러
  const handleOpenTableModal = () => {
    console.log("handleOpenTableModal 실행 -> 마크다운 기본 표 생성 창 오픈 프로세스 가동");
    prepareModalState('MD Table');
    setIsTableModalOpen(true);
  };

  // 정밀 구조 제어가 탑재된 HTML 고급 표 편집기 오픈 핸들러
  const handleOpenHtmlTableModal = () => {
    console.log("handleOpenHtmlTableModal 실행 -> 고급 HTML 표 편집기 생성 창 오픈 프로세스 가동");
    prepareModalState('HTML Table');
    setIsHtmlTableModalOpen(true);
  };

  // 모달 내부 편집 연산이 완료되어 추출된 소스코드를 편집 창 원문에 치환 및 삽입하는 콜백 실행 함수
  const handleInsertTable = (tableOutput) => {
    console.log("handleInsertTable 콜백 수신 완료 -> 본문 데이터 치환 및 강제 삽입 단계 전개");
    
    if (!textareaRef.current) {
      console.log("인스턴스 오류: 치환 렌더링 단계에서 textareaRef 참조에 실패하였습니다.");
      return;
    }

    const textarea = textareaRef.current;
    const { start, end } = selectionRange;

    const beforeText = markdown.substring(0, start);
    const afterText = markdown.substring(end);

    const newText = beforeText + tableOutput + afterText;
    
    console.log("표 소스코드가 삽입된 전체 데이터 원문 업데이트 진행");
    setMarkdown(newText);

    setTimeout(() => {
      console.log("텍스트 입력 창 포커스 인가 및 표 코드 종료 지점으로 커서 위치 동기화");
      textarea.focus();
      const newCursorPos = start + tableOutput.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <div className="editor-container">
      <div className="editor-toolbar-wrapper">
        <div className="editor-toolbar">
          {/* 문단 제목(Heading) 서식 제어 영역 */}
          <button onClick={() => { console.log("H1 아이콘 단추 클릭 이벤트 발생"); handleFormat('# '); }} title="제목 1 (H1)"><Heading1 size={18} /></button>
          <button onClick={() => { console.log("H2 아이콘 단추 클릭 이벤트 발생"); handleFormat('## '); }} title="제목 2 (H2)"><Heading2 size={18} /></button>
          <button onClick={() => { console.log("H3 아이콘 단추 클릭 이벤트 발생"); handleFormat('### '); }} title="제목 3 (H3)"><Heading3 size={18} /></button>
          
          <div className="toolbar-divider"></div>

          {/* 폰트 장식용 인라인 스타일 체계 영역 */}
          <button onClick={() => { console.log("Bold 아이콘 단추 클릭 이벤트 발생"); handleFormat('**', '**'); }} title="굵게"><Bold size={18} /></button>
          <button onClick={() => { console.log("Italic 아이콘 단추 클릭 이벤트 발생"); handleFormat('*', '*'); }} title="기울임"><Italic size={18} /></button>
          <button onClick={() => { console.log("Strikethrough 아이콘 단추 클릭 이벤트 발생"); handleFormat('~~', '~~'); }} title="취소선"><Strikethrough size={18} /></button>
          
          <div className="toolbar-divider"></div>

          {/* 인용 및 구조 리스트 서식 체계 영역 */}
          <button onClick={() => { console.log("Quote 아이콘 단추 클릭 이벤트 발생"); handleFormat('> '); }} title="인용구"><Quote size={18} /></button>
          <button onClick={() => { console.log("List 아이콘 단추 클릭 이벤트 발생"); handleFormat('- '); }} title="글머리 기호 목록"><List size={18} /></button>
          <button onClick={() => { console.log("ListOrdered 아이콘 단추 클릭 이벤트 발생"); handleFormat('1. '); }} title="번호 매기기 목록"><ListOrdered size={18} /></button>
          <button onClick={() => { console.log("CheckSquare 아이콘 단추 클릭 이벤트 발생"); handleFormat('- [ ] '); }} title="할 일 목록"><CheckSquare size={18} /></button>
          
          <div className="toolbar-divider"></div>

          {/* 하이퍼미디어 연결 및 특수 코드 영역 */}
          <button onClick={() => { console.log("Link 아이콘 단추 클릭 이벤트 발생"); handleFormat('[', '](url)'); }} title="하이퍼링크 삽입"><Link size={18} /></button>
          <button onClick={() => { console.log("ImageIcon 아이콘 단추 클릭 이벤트 발생"); handleFormat('![alt](', ')'); }} title="이미지 링크 삽입"><ImageIcon size={18} /></button>
          <button onClick={() => { console.log("Code 아이콘 단추 클릭 이벤트 발생"); handleFormat('\n```\n', '\n```\n'); }} title="코드 블록"><Code size={18} /></button>
          <button onClick={() => { console.log("Baseline 각주 아이콘 단추 클릭 이벤트 발생"); handleFormat('[^1]', ''); }} title="문서 하단 각주 지정"><Baseline size={18} /></button>

          <div className="toolbar-divider"></div>

          {/* 깃허브 고유 컴포넌트 기능군: Alerts 알림 상자 드롭다운 */}
          <div className="dropdown-container">
            <button 
              onClick={() => { console.log("Alerts 대화형 메뉴 토글 명령 실행"); setOpenDropdown(openDropdown === 'alert' ? null : 'alert'); }} 
              title="GitHub Alerts 기능 컨텍스트 개방"
              className={openDropdown === 'alert' ? 'active-dropdown-btn' : ''}
            >
              <MessageSquareWarning size={18} />
            </button>
            {openDropdown === 'alert' && (
              <div className="dropdown-menu">
                <button className="dropdown-item alert-note" onClick={() => { console.log("NOTE 알림 블록 매핑"); insertAlert('NOTE'); }}>블루 (NOTE)</button>
                <button className="dropdown-item alert-tip" onClick={() => { console.log("TIP 알림 블록 매핑"); insertAlert('TIP'); }}>그린 (TIP)</button>
                <button className="dropdown-item alert-important" onClick={() => { console.log("IMPORTANT 알림 블록 매핑"); insertAlert('IMPORTANT'); }}>퍼플 (IMPORTANT)</button>
                <button className="dropdown-item alert-warning" onClick={() => { console.log("WARNING 알림 블록 매핑"); insertAlert('WARNING'); }}>오렌지 (WARNING)</button>
                <button className="dropdown-item alert-caution" onClick={() => { console.log("CAUTION 알림 블록 매핑"); insertAlert('CAUTION'); }}>레드 (CAUTION)</button>
              </div>
            )}
          </div>

          {/* 깃허브 고유 컴포넌트 기능군: Diff 색상 코드 블록 드롭다운 */}
          <div className="dropdown-container">
            <button 
              onClick={() => { console.log("Diff 대화형 메뉴 토글 명령 실행"); setOpenDropdown(openDropdown === 'diff' ? null : 'diff'); }} 
              title="GitHub Diff 코드 블록 삽입"
              className={openDropdown === 'diff' ? 'active-dropdown-btn' : ''}
            >
              <FileDiff size={18} />
            </button>
            {openDropdown === 'diff' && (
              <div className="dropdown-menu">
                <button className="dropdown-item diff-template" onClick={() => { console.log("Diff 스니펫 서식 생성 트리거"); insertDiff(); }}>Diff 템플릿 삽입</button>
              </div>
            )}
          </div>

          <div className="toolbar-divider"></div>

          {/* 팝업 레이어 표 삽입 도구 연동 영역 */}
          <button onClick={() => { console.log("표준 마크다운 표 빌더 모달 호출 실행"); handleOpenTableModal(); }} title="마크다운 표준 표 삽입"><Table size={18} /></button>
          <button onClick={() => { console.log("고급 정밀 제어 HTML 표 빌더 모달 호출 실행"); handleOpenHtmlTableModal(); }} title="고급 HTML 구조/스타일 표 삽입"><FileCode2 size={18} /></button>
        </div>
      </div>
      
      {/* 본문 에디터 원문 작성 텍스트 코어 필드 */}
      <textarea
        ref={textareaRef}
        className="editor-textarea"
        value={markdown}
        onChange={(e) => {
          console.log("textarea 입력 변경 감지 - 마크다운 실시간 상태 업데이트");
          setMarkdown(e.target.value);
        }}
        placeholder="여기에 마크다운을 작성하세요..."
        spellCheck="false"
      />

      {/* 마크다운 표준 형태 표 관리 모달 인스턴스 레이어 */}
      <TableModal 
        isOpen={isTableModalOpen} 
        onClose={() => { console.log("MD 표 생성 모달 종료 감지"); setIsTableModalOpen(false); }} 
        onInsert={handleInsertTable} 
        initialTableMarkdown={selectedTableText}
      />

      {/* 개별 정렬 및 정밀 셀 구조 관장 HTML 고급형 표 관리 모달 인스턴스 레이어 */}
      <HtmlTableModal 
        isOpen={isHtmlTableModalOpen} 
        onClose={() => { console.log("고급 HTML 표 생성 모달 종료 감지"); setIsHtmlTableModalOpen(false); }} 
        onInsert={handleInsertTable} 
        initialTableHtml={selectedTableText}
      />
    </div>
  );
}

export default Editor;