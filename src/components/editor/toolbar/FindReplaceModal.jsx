// src/components/editor/toolbar/FindReplaceModal.jsx v1.4
/*
 * 파일 설명: 텍스트 내 특정 문자열을 찾아 일괄 치환하는 찾아 바꾸기(Find and Replace) 모달입니다.
 * 줄바꿈 문자인 리터럴 '\n' 입력을 지원합니다.
 * (v1.4 수정사항): 클립보드 붙여넣기 시 줄바꿈 자동 변환 로직을 유지하고, 한글 유니코드 정규화(NFC) 적용 및 markdown props 누락 방어 로직을 추가했습니다.
 * 연결 위치: src/components/editor/Editor.jsx 내부
 */
import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

function FindReplaceModal({ isOpen, onClose, onReplaceAll, markdown }) {
  // 찾을 문자열 상태 관리
  const [findText, setFindText] = useState('');
  // 바꿀 문자열 상태 관리
  const [replaceText, setReplaceText] = useState('');
  // 입력창 포커스를 위한 Ref
  const inputRef = useRef(null);

  // 모달이 열릴 때마다 상태를 초기화하고 '찾을 내용' 입력창에 포커스를 부여합니다.
  useEffect(() => {
    if (isOpen) {
      console.log("[FindReplaceModal v1.4] 찾아 바꾸기 모달 활성화");
      setFindText('');
      setReplaceText('');
      setTimeout(() => {
        if (inputRef.current) {
          console.log("[FindReplaceModal v1.4] 찾을 내용 입력창 포커스 완료");
          inputRef.current.focus();
        }
      }, 0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 본문 내에서 검색어와 일치하는 개수를 계산하는 함수
  const getMatchCount = () => {
    // markdown prop이 정상적으로 전달되지 않았을 경우의 방어 로직
    if (typeof markdown !== 'string') {
      console.log("[FindReplaceModal v1.4] 오류: 에디터 본문(markdown) 데이터가 모달로 전달되지 않았습니다. Editor.jsx의 props 연결을 확인하세요.");
      return 0;
    }

    if (!findText) return 0;
    
    // 사용자가 입력한 \n을 실제 줄바꿈 문자로 변환 및 Mac/Windows 한글 자소 분리 방지를 위한 NFC 정규화 적용
    const parsedFind = findText.replace(/\\n/g, '\n').normalize('NFC');
    if (!parsedFind) return 0;
    
    // 본문 텍스트 또한 NFC 정규화를 거친 후 split을 통해 정확한 일치 항목 개수 산출
    const count = markdown.normalize('NFC').split(parsedFind).length - 1;
    return count;
  };

  const matchCount = getMatchCount();

  // 모두 바꾸기 버튼 클릭 이벤트 핸들러
  const handleReplaceAllClick = () => {
    if (!findText) {
      console.log("[FindReplaceModal v1.4] 찾을 내용이 비어있어 치환 실행을 취소합니다.");
      return;
    }
    console.log(`[FindReplaceModal v1.4] 모두 바꾸기 요청 - 찾을 내용: '${findText}', 바꿀 내용: '${replaceText}'`);
    onReplaceAll(findText, replaceText);
  };

  // 클립보드에서 텍스트를 붙여넣을 때 실제 줄바꿈 문자를 '\n' 문자열로 변환하는 핸들러
  const handlePaste = (e, setter, currentValue) => {
    e.preventDefault();
    const clipboardText = e.clipboardData.getData('text');
    if (!clipboardText) {
      console.log("[FindReplaceModal v1.4] 클립보드에 텍스트 데이터가 없습니다.");
      return;
    }

    console.log("[FindReplaceModal v1.4] 클립보드 붙여넣기 감지 - 줄바꿈 문자 변환 실행");
    // 정규식을 사용하여 캐리지 리턴(\r\n), 맥OS 구형 줄바꿈(\r), 기본 줄바꿈(\n)을 모두 찾아 변환
    const convertedText = clipboardText.replace(/\r\n|\r|\n/g, '\\n');
    
    const input = e.target;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    
    // 커서 위치를 기준으로 기존 텍스트 사이에 변환된 텍스트를 삽입
    const newValue = currentValue.substring(0, start) + convertedText + currentValue.substring(end);
    setter(newValue);
    
    // 텍스트 삽입 후 커서를 붙여넣은 텍스트의 끝으로 이동시켜 연속적인 작업이 가능하도록 조정
    setTimeout(() => {
      console.log("[FindReplaceModal v1.4] 붙여넣기 완료 후 커서 위치 조정");
      input.setSelectionRange(start + convertedText.length, start + convertedText.length);
    }, 0);
  };

  return (
    <div className="diagram-modal-backdrop" onClick={onClose} style={{ zIndex: 3000 }}>
      <div className="diagram-modal-content" style={{ width: '400px', height: 'auto' }} onClick={(e) => e.stopPropagation()}>
        
        <div className="diagram-modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid #d0d7de', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="header-title-section" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={18} style={{ color: '#57606a' }} />
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>찾아 바꾸기 v1.4</h3>
          </div>
          <button className="close-x-btn" onClick={() => {
            console.log("[FindReplaceModal v1.4] 모달 닫기 버튼 클릭");
            onClose();
          }} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#57606a' }}>&times;</button>
        </div>

        <div className="diagram-modal-body" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: '#f6f8fa' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#24292f' }}>찾을 내용</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
              <input 
                ref={inputRef}
                type="text" 
                value={findText} 
                onChange={(e) => setFindText(e.target.value)}
                onPaste={(e) => handlePaste(e, setFindText, findText)}
                placeholder="찾을 문자열 입력 (줄바꿈은 \n 입력)"
                style={{ 
                  padding: '8px 50px 8px 12px', 
                  border: '1px solid #d0d7de', 
                  borderRadius: '6px', 
                  fontSize: '13px',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              />
              {findText && (
                <span style={{ 
                  position: 'absolute', 
                  right: '12px', 
                  fontSize: '12px', 
                  fontWeight: 'bold', 
                  color: matchCount > 0 ? '#0969da' : '#cf222e', 
                  pointerEvents: 'none' 
                }}>
                  {matchCount}개
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#24292f' }}>바꿀 내용</label>
            <input 
              type="text" 
              value={replaceText} 
              onChange={(e) => setReplaceText(e.target.value)}
              onPaste={(e) => handlePaste(e, setReplaceText, replaceText)}
              placeholder="바꿀 문자열 입력 (줄바꿈은 \n 입력)"
              style={{ padding: '8px 12px', border: '1px solid #d0d7de', borderRadius: '6px', fontSize: '13px', width: '100%', boxSizing: 'border-box' }}
            />
          </div>

          <p style={{ fontSize: '11px', color: '#57606a', margin: 0, lineHeight: '1.4' }}>
            * <strong>\n</strong>을 입력하면 줄바꿈(엔터)으로 인식하여 처리됩니다.<br/>
            * 다중 줄바꿈 텍스트를 복사하여 붙여넣을 시 자동으로 \n 문자로 변환됩니다.<br/>
            * 실행 취소(Ctrl+Z)를 통해 되돌릴 수 있습니다.
          </p>
        </div>

        <div className="diagram-modal-footer" style={{ padding: '16px 20px', borderTop: '1px solid #d0d7de', display: 'flex', justifyContent: 'flex-end', gap: '8px', backgroundColor: '#ffffff' }}>
          <button onClick={() => {
            console.log("[FindReplaceModal v1.4] 취소/닫기 버튼 클릭");
            onClose();
          }} style={{ padding: '6px 12px', border: '1px solid #d0d7de', borderRadius: '6px', backgroundColor: '#f6f8fa', cursor: 'pointer', fontSize: '13px' }}>닫기</button>
          <button onClick={handleReplaceAllClick} style={{ padding: '6px 12px', border: 'none', borderRadius: '6px', backgroundColor: '#2da44e', color: '#ffffff', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>모두 바꾸기</button>
        </div>
      </div>
    </div>
  );
}

export default FindReplaceModal;