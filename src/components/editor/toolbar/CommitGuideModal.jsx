// src/components/editor/toolbar/CommitGuideModal.jsx v1.1
/*
 * 파일 설명: 깃허브 커밋 메시지 컨벤션을 시각적으로 안내하고, 클릭 시 해당 태그를 에디터에 삽입하거나 복사할 수 있는 가이드 모달입니다.
 * (v1.1 수정사항): 불필요한 안내 텍스트 제거 및 바둑판(Grid) 배열로 UI 레이아웃 변경.
 * 연결 위치: src/components/editor/Editor.jsx 내부
 */
import React from 'react';
import { GitCommit, Copy, Check } from 'lucide-react';
import { copyToClipboard } from '../../../utils/clipboard';

const COMMIT_TYPES = [
  { type: 'feat', color: '#2da44e', desc: '새로운 기능 추가', ex: 'feat: 환경 데이터 등록 API 구현' },
  { type: 'fix', color: '#cf222e', desc: '버그 수정', ex: 'fix: 승인 완료 후 버튼 상태 오류 수정' },
  { type: 'refactor', color: '#8250df', desc: '코드 리팩토링 (기능 변화 없음)', ex: 'refactor: ESG 점수 계산 로직 분리' },
  { type: 'docs', color: '#0969da', desc: '문서 추가 및 수정', ex: 'docs: ERD 문서 추가' },
  { type: 'test', color: '#bf8700', desc: '테스트 코드 추가/수정', ex: 'test: 환경 데이터 서비스 단위 테스트 추가' },
  { type: 'chore', color: '#57606a', desc: '빌드, 패키지, 잡무 수정', ex: 'chore: 불필요한 주석 정리' },
  { type: 'build', color: '#1f2328', desc: '빌드 시스템 및 외부 라이브러리 추가', ex: 'build: PostgreSQL 드라이버 추가' },
  { type: 'ci', color: '#0969da', desc: 'CI/CD 배포 스크립트 수정', ex: 'ci: 백엔드 빌드 워크플로 추가' },
  { type: 'infra', color: '#2da44e', desc: '인프라/서버 설정 관련', ex: 'infra: Nginx 리버스 프록시 설정' },
  { type: 'style', color: '#bf3989', desc: '코드 포맷팅 (로직 변경 없음)', ex: 'style: 세미콜론 누락 및 들여쓰기 수정' },
];

function CommitGuideModal({ isOpen, onClose, onInsert }) {
  // 복사 상태를 관리하는 State 선언
  const [copiedType, setCopiedType] = React.useState(null);

  // 모달이 열려있지 않으면 렌더링을 중단
  if (!isOpen) return null;

  // 클립보드 복사 아이콘 클릭 시 실행되는 핸들러
  const handleCopy = async (e, typeStr) => {
    e.stopPropagation(); // 부모 엘리먼트의 클릭 이벤트(에디터 삽입) 방지
    const success = await copyToClipboard(typeStr + ': ');
    if (success) {
      console.log(`[CommitGuideModal v1.1] 클립보드 복사 성공: ${typeStr}`);
      setCopiedType(typeStr);
      setTimeout(() => setCopiedType(null), 1500);
    } else {
      console.error(`[CommitGuideModal v1.1] 클립보드 복사 실패. 권한 문제 발생`);
    }
  };

  // 컨벤션 항목 클릭 시 에디터에 텍스트를 삽입하는 핸들러
  const handleInsert = (typeStr) => {
    console.log(`[CommitGuideModal v1.1] 에디터 본문 삽입: ${typeStr}`);
    onInsert(typeStr + ': ');
    onClose();
  };

  return (
    <div className="diagram-modal-backdrop" onClick={onClose} style={{ zIndex: 3000 }}>
      {/* 2열 배열을 여유롭게 수용하기 위해 width를 800px로 확장 및 높이 자동 조절 */}
      <div className="diagram-modal-content" style={{ width: '800px', height: 'auto', maxHeight: '700px' }} onClick={(e) => e.stopPropagation()}>
        
        <div className="diagram-modal-header">
          <div className="header-title-section">
            <GitCommit size={18} style={{ color: '#57606a', marginRight: '8px' }} />
            <h3>Git 커밋 메시지 컨벤션 가이드 v1.1</h3>
          </div>
          <button className="close-x-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="diagram-modal-body" style={{ padding: '24px', overflowY: 'auto', backgroundColor: '#f6f8fa' }}>
          
          {/* 불필요한 p 태그 텍스트 제거 및 2열 Grid 바둑판 배열 적용 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {COMMIT_TYPES.map((item) => (
              <div 
                key={item.type}
                onClick={() => handleInsert(item.type)}
                style={{ 
                  backgroundColor: '#ffffff', border: '1px solid #d0d7de', borderRadius: '8px', 
                  padding: '16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                  cursor: 'pointer', transition: 'border-color 0.1s, box-shadow 0.1s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#0969da';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(9, 105, 218, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#d0d7de';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ 
                      backgroundColor: item.color, color: '#ffffff', fontSize: '12px', fontWeight: 'bold', 
                      padding: '3px 10px', borderRadius: '12px' 
                    }}>
                      {item.type}
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#24292f' }}>{item.desc}</span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#57606a', fontFamily: 'ui-monospace, SFMono-Regular, monospace' }}>
                    예시) {item.ex}
                  </span>
                </div>

                <button 
                  onClick={(e) => handleCopy(e, item.type)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: copiedType === item.type ? '#2da44e' : '#57606a' }}
                  title="클립보드에 복사"
                >
                  {copiedType === item.type ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

export default CommitGuideModal;