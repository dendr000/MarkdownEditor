// src/components/editor/AutocompletePopup.jsx v1.0
/*
 * 파일 설명: 깃허브 스타일 가상 자동완성 데이터를 렌더링하는 팝업 UI 컴포넌트입니다.
 * 연결 위치: src/components/editor/Editor.jsx 내부에 렌더링됩니다.
 */
function AutocompletePopup({ suggestState, currentSuggestList, onSelect }) {
  if (!suggestState.isOpen || currentSuggestList.length === 0) return null;

  console.log("[AutocompletePopup] 자동완성 팝업 렌더링 활성화 - 트리거:", suggestState.trigger);

  return (
    <div className="suggest-popup">
      <div className="suggest-popup-header">
        {suggestState.trigger === '@' && 'GitHub 멤버 언급하기'}
        {suggestState.trigger === '#' && 'GitHub 이슈 연계'}
        {suggestState.trigger === ':' && '이모티콘 단축 코드'}
      </div>
      <div className="suggest-popup-body">
        {currentSuggestList.map((item, idx) => (
          <div
            key={item.id}
            className={`suggest-item ${idx === suggestState.index ? 'active' : ''}`}
            onClick={() => {
              console.log("[AutocompletePopup] 마우스 클릭 항목 선택:", item.id);
              onSelect(item);
            }}
          >
            {suggestState.trigger === ':' && (
              <span className="suggest-emoji-char">{item.char}</span>
            )}
            <span className="suggest-item-title">
              {suggestState.trigger === ':' ? `:${item.name}:` : (item.name || item.id)}
            </span>
            {item.desc && <span className="suggest-item-desc">- {item.desc}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default AutocompletePopup;