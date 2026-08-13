// C:\dev\MarkdownEditor\src\components\editor\AutocompletePopup.jsx
/*
 * 파일 위치: src/components/editor/AutocompletePopup.jsx
 * 파일 설명: 텍스트 커서(Caret)의 좌표를 추적하여 코드 예약어 추천 리스트를 띄우는 플로팅 팝업 UI 컴포넌트입니다.
 */
import React from 'react';

function AutocompletePopup({ suggestState, currentSuggestList, onSelect }) {
  if (!suggestState.isOpen || currentSuggestList.length === 0) return null;

  console.log("[AutocompletePopup] 자동완성 팝업 렌더링 활성화");

  // Mirror Div에서 계산한 브라우저 화면상(Viewport) 고정 픽셀 좌표를 적용합니다.
  const popupStyle = {
    position: 'fixed',
    top: `${suggestState.top}px`,
    left: `${suggestState.left}px`,
    zIndex: 9999, // 다른 UI에 가려지지 않도록 최상단 보장
  };

  return (
    <div className="suggest-popup" style={popupStyle}>
      <div className="suggest-popup-header">
        코드 예약어 추천
      </div>
      <div className="suggest-popup-body">
        {currentSuggestList.map((item, idx) => (
          <div
            key={item.id}
            className={`suggest-item ${idx === suggestState.index ? 'active' : ''}`}
            // onMouseDown으로 처리해야 textarea의 onBlur(포커스 해제)보다 먼저 실행되어 입력이 유실되지 않습니다.
            onMouseDown={(e) => {
              e.preventDefault();
              onSelect(item);
            }}
          >
            <span className="suggest-item-title">
              {item.name || item.id}
            </span>
            {item.desc && <span className="suggest-item-desc">- {item.desc}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default AutocompletePopup;