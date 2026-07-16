// src/components/diagram/DiagramModal.jsx v3.0
/*
 * 파일 설명: STL 기본 템플릿을 가장 안정적인 표준 명세(cube_corner)로 복구하여 최초 오픈 시 즉각 렌더링되도록 수정했습니다.
 * 연결 위치: src/components/editor/Editor.jsx 내부
 */
import React, { useState, useEffect } from 'react';
import MermaidBlock from '../preview/MermaidBlock';
import GeoJsonBlock from '../preview/GeoJsonBlock';
import StlBlock from '../preview/StlBlock';
import './DiagramModal.css';

const TEMPLATES = {
  mermaid_flow: {
    label: '순서도 (Flowchart)',
    lang: 'mermaid',
    code: `graph TD;\n    A[시작] --> B{조건};\n    B -- Yes --> C[완료];\n    B -- No --> D[재시도];\n    D --> B;`
  },
  mermaid_seq: {
    label: '시퀀스 다이어그램',
    lang: 'mermaid',
    code: `sequenceDiagram\n    participant 클라이언트\n    participant 서버\n    클라이언트->>서버: 데이터 요청\n    서버-->>클라이언트: 응답 반환`
  },
  mermaid_pie: {
    label: '원형 차트 (Pie Chart)',
    lang: 'mermaid',
    code: `pie title 프로젝트 언어 비중\n    "JavaScript" : 65\n    "CSS" : 20\n    "HTML" : 15`
  },
  geojson: {
    label: '지도 (GeoJSON)',
    lang: 'geojson',
    code: `{\n  "type": "FeatureCollection",\n  "features": [\n    {\n      "type": "Feature",\n      "properties": {\n        "name": "Seoul"\n      },\n      "geometry": {\n        "type": "Point",\n        "coordinates": [126.9780, 37.5665]\n      }\n    }\n  ]\n}`
  },
  stl: {
    label: '3D 모델 (STL)',
    lang: 'stl',
    // 완벽한 부피와 소수점을 가진 표준 템플릿으로 복구
    code: `solid cube_corner\n  facet normal 0.0 -1.0 0.0\n    outer loop\n      vertex 0.0 0.0 0.0\n      vertex 1.0 0.0 0.0\n      vertex 0.0 0.0 1.0\n    endloop\n  endfacet\n  facet normal 0.0 0.0 -1.0\n    outer loop\n      vertex 0.0 0.0 0.0\n      vertex 0.0 1.0 0.0\n      vertex 1.0 0.0 0.0\n    endloop\n  endfacet\n  facet normal -1.0 0.0 0.0\n    outer loop\n      vertex 0.0 0.0 0.0\n      vertex 0.0 0.0 1.0\n      vertex 0.0 1.0 0.0\n    endloop\n  endfacet\n  facet normal 0.577 0.577 0.577\n    outer loop\n      vertex 1.0 0.0 0.0\n      vertex 0.0 1.0 0.0\n      vertex 0.0 0.0 1.0\n    endloop\n  endfacet\nendsolid`
  }
};

function DiagramModal({ isOpen, onClose, onInsert }) {
  const [activeTemplate, setActiveTemplate] = useState('mermaid_flow');
  const [code, setCode] = useState(TEMPLATES['mermaid_flow'].code);

  useEffect(() => {
    if (isOpen) {
      setCode(TEMPLATES[activeTemplate].code);
    }
  }, [activeTemplate, isOpen]);

  if (!isOpen) return null;

  const currentLang = TEMPLATES[activeTemplate].lang;

  const handleInsertSubmit = () => {
    const formattedCodeBlock = `\n\`\`\`${currentLang}\n${code}\n\`\`\`\n`;
    onInsert(formattedCodeBlock);
    onClose();
  };

  const renderPreview = () => {
    if (!code.trim()) return <div className="preview-placeholder">코드를 입력하면 미리보기가 렌더링됩니다.</div>;

    if (currentLang === 'mermaid') {
      return <MermaidBlock chart={code} />;
    }
    if (currentLang === 'geojson') {
      return <GeoJsonBlock dataString={code} isTopoJson={false} />;
    }
    if (currentLang === 'stl') {
      return <StlBlock stlString={code} />;
    }
    return null;
  };

  return (
    <div className="diagram-modal-backdrop" onClick={onClose}>
      <div className="diagram-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="diagram-modal-header">
          <h3>다이어그램 및 시각화 작성기</h3>
          <button className="close-x-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="diagram-modal-body">
          <div className="diagram-editor-panel">
            <div className="panel-title-label">템플릿 선택</div>
            <select 
              className="template-select"
              value={activeTemplate}
              onChange={(e) => setActiveTemplate(e.target.value)}
            >
              <optgroup label="Mermaid 다이어그램">
                <option value="mermaid_flow">{TEMPLATES['mermaid_flow'].label}</option>
                <option value="mermaid_seq">{TEMPLATES['mermaid_seq'].label}</option>
                <option value="mermaid_pie">{TEMPLATES['mermaid_pie'].label}</option>
              </optgroup>
              <optgroup label="고급 시각화">
                <option value="geojson">{TEMPLATES['geojson'].label}</option>
                <option value="stl">{TEMPLATES['stl'].label}</option>
              </optgroup>
            </select>

            <div className="panel-title-label" style={{ marginTop: '16px' }}>구문 편집</div>
            <textarea
              className="diagram-code-textarea"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck="false"
              placeholder={`${TEMPLATES[activeTemplate].label} 코드를 작성하세요...`}
            />
          </div>

          <div className="diagram-preview-panel">
            <div className="panel-title-label">실시간 렌더링 미리보기</div>
            <div className="preview-render-container">
              {renderPreview()}
            </div>
          </div>
        </div>

        <div className="diagram-modal-footer">
          <button className="cancel-btn" onClick={onClose}>취소</button>
          <button className="submit-btn" onClick={handleInsertSubmit}>에디터에 삽입</button>
        </div>
      </div>
    </div>
  );
}

export default DiagramModal;