// src/components/diagram/DiagramModal.jsx v5.0
/*
 * 파일 설명: 300줄 이상의 비대화된 코드를 분리하기 위해 개별 다이어그램 폼 컴포넌트들을 불러와 렌더링하며, 미리보기의 시각적 요소(노드) 클릭 상태를 관리하는 메인 모달 컨트롤러입니다.
 * 연결 위치: src/components/editor/Editor.jsx 내부
 */
import React, { useState, useEffect } from 'react';
import { Edit2, Layout } from 'lucide-react';
import MermaidBlock from '../preview/MermaidBlock';
import GeoJsonBlock from '../preview/GeoJsonBlock';
import StlBlock from '../preview/StlBlock';
import PieChartForm from './forms/PieChartForm';
import FlowchartForm from './forms/FlowchartForm';
import GeoJsonForm from './forms/GeoJsonForm';
import StlForm from './forms/StlForm';
import './DiagramModal.css';

function DiagramModal({ isOpen, onClose, onInsert }) {
  console.log("DiagramModal 컴포넌트(v5.0) 렌더링 활성화 - 폼 모듈 분리 및 상호작용 지원 적용");

  if (!isOpen) return null;

  const [editMode, setEditMode] = useState('gui');
  const [diagramType, setDiagramType] = useState('mermaid_pie');
  const [rawCode, setRawCode] = useState('');
  
  // 시각적 상호작용 상태 (순서도 노드 클릭 감지용)
  const [activeNodeId, setActiveNodeId] = useState(null);

  const [pieTitle, setPieTitle] = useState('프로젝트 언어 비중');
  const [pieItems, setPieItems] = useState([
    { id: 'pie-1', label: 'JavaScript', value: 65 },
    { id: 'pie-2', label: 'CSS', value: 20 },
    { id: 'pie-3', label: 'HTML', value: 15 }
  ]);

  const [flowOrientation, setFlowOrientation] = useState('TD');
  const [flowSteps, setFlowSteps] = useState([
    { id: 'flow-1', from: 'A', fromText: '시작', arrow: '-->', to: 'B', toText: '조건 판별' },
    { id: 'flow-2', from: 'B', fromText: '조건 판별', arrow: '-->', to: 'C', toText: '처리 완료' }
  ]);

  const [geoFeatures, setGeoFeatures] = useState([
    { id: 'geo-1', name: 'Seoul', lat: 37.5665, lng: 126.9780 },
    { id: 'geo-2', name: 'Busan', lat: 35.1796, lng: 129.0756 }
  ]);

  const [boxWidth, setBoxWidth] = useState(1.0);
  const [boxHeight, setBoxHeight] = useState(1.0);
  const [boxDepth, setBoxDepth] = useState(1.0);

  const generateBoxSTL = (wVal, hVal, dVal) => {
    const w = parseFloat(wVal) / 2;
    const h = parseFloat(hVal) / 2;
    const d = parseFloat(dVal) / 2;
    return `solid custom_box\n  facet normal 0.0 0.0 1.0\n    outer loop\n      vertex ${-w} ${-h} ${d}\n      vertex ${w} ${-h} ${d}\n      vertex ${w} ${h} ${d}\n    endloop\n  endfacet\n  facet normal 0.0 0.0 1.0\n    outer loop\n      vertex ${-w} ${-h} ${d}\n      vertex ${w} ${h} ${d}\n      vertex ${-w} ${h} ${d}\n    endloop\n  endfacet\n  facet normal 0.0 0.0 -1.0\n    outer loop\n      vertex ${-w} ${-h} ${-d}\n      vertex ${-w} ${h} ${-d}\n      vertex ${w} ${h} ${-d}\n    endloop\n  endfacet\n  facet normal 0.0 0.0 -1.0\n    outer loop\n      vertex ${-w} ${-h} ${-d}\n      vertex ${w} ${h} ${-d}\n      vertex ${w} ${-h} ${-d}\n    endloop\n  endfacet\n  facet normal 1.0 0.0 0.0\n    outer loop\n      vertex ${w} ${-h} ${-d}\n      vertex ${w} ${h} ${-d}\n      vertex ${w} ${h} ${d}\n    endloop\n  endfacet\n  facet normal 1.0 0.0 0.0\n    outer loop\n      vertex ${w} ${-h} ${-d}\n      vertex ${w} ${h} ${d}\n      vertex ${w} ${-h} ${d}\n    endloop\n  endfacet\n  facet normal -1.0 0.0 0.0\n    outer loop\n      vertex ${-w} ${-h} ${-d}\n      vertex ${-w} ${-h} ${d}\n      vertex ${-w} ${h} ${d}\n    endloop\n  endfacet\n  facet normal -1.0 0.0 0.0\n    outer loop\n      vertex ${-w} ${-h} ${-d}\n      vertex ${-w} ${h} ${d}\n      vertex ${-w} ${h} ${-d}\n    endloop\n  endfacet\n  facet normal 0.0 1.0 0.0\n    outer loop\n      vertex ${-w} ${h} ${-d}\n      vertex ${-w} ${h} ${d}\n      vertex ${w} ${h} ${d}\n    endloop\n  endfacet\n  facet normal 0.0 1.0 0.0\n    outer loop\n      vertex ${-w} ${h} ${-d}\n      vertex ${w} ${h} ${d}\n      vertex ${w} ${h} ${-d}\n    endloop\n  endfacet\n  facet normal 0.0 -1.0 0.0\n    outer loop\n      vertex ${-w} ${-h} ${-d}\n      vertex ${w} ${-h} ${-d}\n      vertex ${w} ${-h} ${d}\n    endloop\n  endfacet\n  facet normal 0.0 -1.0 0.0\n    outer loop\n      vertex ${-w} ${-h} ${-d}\n      vertex ${w} ${-h} ${d}\n      vertex ${-w} ${-h} ${d}\n    endloop\n  endfacet\nendsolid`;
  };

  const buildCurrentCode = () => {
    if (diagramType === 'mermaid_pie') {
      let code = `pie title ${pieTitle}\n`;
      pieItems.forEach(item => { code += `    "${item.label}" : ${item.value}\n`; });
      return code.trim();
    }
    if (diagramType === 'mermaid_flow') {
      let code = `graph ${flowOrientation};\n`;
      flowSteps.forEach(step => { code += `    ${step.from}[${step.fromText}] ${step.arrow} ${step.to}[${step.toText}]\n`; });
      return code.trim();
    }
    if (diagramType === 'geojson') {
      const geoObj = {
        type: "FeatureCollection",
        features: geoFeatures.map(f => ({
          type: "Feature",
          properties: { name: f.name },
          geometry: { type: "Point", coordinates: [parseFloat(f.lng || 0), parseFloat(f.lat || 0)] }
        }))
      };
      return JSON.stringify(geoObj, null, 2);
    }
    if (diagramType === 'stl') {
      return generateBoxSTL(boxWidth, boxHeight, boxDepth);
    }
    return '';
  };

  const activeCode = editMode === 'gui' ? buildCurrentCode() : rawCode;

  useEffect(() => {
    if (editMode === 'raw') setRawCode(buildCurrentCode());
    // 다이어그램 타입이 변경될 때 활성화된 상호작용 노드 상태를 초기화
    setActiveNodeId(null);
  }, [editMode, diagramType]);

  const handleInsertSubmit = () => {
    console.log("[DiagramModal] 최종 컴파일된 텍스트 에디터 본문 삽입");
    const outputLang = diagramType === 'mermaid_pie' || diagramType === 'mermaid_flow' ? 'mermaid' : diagramType;
    const formattedCodeBlock = `\n\`\`\`${outputLang}\n${activeCode}\n\`\`\`\n`;
    onInsert(formattedCodeBlock);
    onClose();
  };

  // 자식 컴포넌트(MermaidBlock)에서 발송된 노드 클릭 이벤트를 수신하는 핸들러
  const handlePreviewNodeClick = (nodeId) => {
    console.log(`[DiagramModal] 뷰어 상호작용 감지 - 수신된 노드 ID: ${nodeId}`);
    setActiveNodeId(nodeId);
  };

  const renderPreview = () => {
    if (!activeCode.trim()) return <div className="preview-placeholder">데이터를 구성하면 미리보기가 실행됩니다.</div>;
    try {
      if (diagramType === 'mermaid_pie' || diagramType === 'mermaid_flow') {
        return <MermaidBlock chart={activeCode} onNodeClick={handlePreviewNodeClick} />;
      }
      if (diagramType === 'geojson') return <GeoJsonBlock dataString={activeCode} isTopoJson={false} />;
      if (diagramType === 'stl') return <StlBlock stlString={activeCode} />;
    } catch (err) {
      console.error("[DiagramModal Preview] 내부 렌더링 오류:", err);
    }
    return null;
  };

  return (
    <div className="diagram-modal-backdrop" onClick={onClose}>
      <div className="diagram-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="diagram-modal-header">
          <div className="header-title-section">
            <h3>다이어그램 & 시각화 빌더 (v5.0)</h3>
            <div className="mode-toggle-group">
              <button 
                className={`mode-tab-btn ${editMode === 'gui' ? 'active' : ''}`}
                onClick={() => setEditMode('gui')}
              ><Layout size={14} style={{ marginRight: '4px' }} /> GUI 빌더</button>
              <button 
                className={`mode-tab-btn ${editMode === 'raw' ? 'active' : ''}`}
                onClick={() => setEditMode('raw')}
              ><Edit2 size={14} style={{ marginRight: '4px' }} /> 직접 편집 (코드)</button>
            </div>
          </div>
          <button className="close-x-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="diagram-modal-body">
          <div className="diagram-editor-panel">
            <div className="panel-title-label">시각화 포맷 선택</div>
            <select 
              className="template-select"
              value={diagramType}
              onChange={(e) => setDiagramType(e.target.value)}
            >
              <option value="mermaid_pie">원형 차트 (Pie Chart)</option>
              <option value="mermaid_flow">순서도 (Flowchart)</option>
              <option value="geojson">대화형 지도 (GeoJSON)</option>
              <option value="stl">3D 상자 모델 (STL Generator)</option>
            </select>
            <div className="panel-divider" />

            {editMode === 'gui' ? (
              <div className="gui-fields-scroller">
                {diagramType === 'mermaid_pie' && (
                  <PieChartForm 
                    pieTitle={pieTitle} setPieTitle={setPieTitle} pieItems={pieItems}
                    handleAddPieItem={() => setPieItems(prev => [...prev, { id: `pie-${Date.now()}`, label: 'New Label', value: 10 }])}
                    handleRemovePieItem={(id) => setPieItems(prev => prev.filter(item => item.id !== id))}
                    handleUpdatePieItem={(id, field, value) => setPieItems(prev => prev.map(item => item.id === id ? { ...item, [field]: field === 'value' ? parseFloat(value) || 0 : value } : item))}
                  />
                )}
                {diagramType === 'mermaid_flow' && (
                  <FlowchartForm 
                    flowOrientation={flowOrientation} setFlowOrientation={setFlowOrientation} flowSteps={flowSteps} activeNodeId={activeNodeId}
                    handleAddFlowStep={() => setFlowSteps(prev => [...prev, { id: `flow-${Date.now()}`, from: 'A', fromText: 'Node', arrow: '-->', to: 'B', toText: 'Next Node' }])}
                    handleRemoveFlowStep={(id) => setFlowSteps(prev => prev.filter(step => step.id !== id))}
                    handleUpdateFlowStep={(id, field, value) => setFlowSteps(prev => prev.map(step => step.id === id ? { ...step, [field]: value } : step))}
                  />
                )}
                {diagramType === 'geojson' && (
                  <GeoJsonForm 
                    geoFeatures={geoFeatures}
                    handleAddGeoFeature={() => setGeoFeatures(prev => [...prev, { id: `geo-${Date.now()}`, name: 'New Point', lat: 37.5, lng: 127.0 }])}
                    handleRemoveGeoFeature={(id) => setGeoFeatures(prev => prev.filter(f => f.id !== id))}
                    handleUpdateGeoFeature={(id, field, value) => setGeoFeatures(prev => prev.map(f => f.id === id ? { ...f, [field]: field === 'name' ? value : parseFloat(value) || 0 } : f))}
                  />
                )}
                {diagramType === 'stl' && (
                  <StlForm 
                    boxWidth={boxWidth} setBoxWidth={setBoxWidth} boxHeight={boxHeight} setBoxHeight={setBoxHeight} boxDepth={boxDepth} setBoxDepth={setBoxDepth}
                  />
                )}
              </div>
            ) : (
              <textarea
                className="diagram-raw-textarea"
                value={rawCode}
                onChange={(e) => setRawCode(e.target.value)}
                spellCheck="false"
                placeholder="코드를 직접 작성하세요..."
              />
            )}
          </div>

          <div className="diagram-preview-panel">
            <div className="panel-title-label">실시간 미리보기 {activeNodeId && <span style={{ color: '#0969da', marginLeft: '8px', textTransform: 'none' }}>(활성 노드: {activeNodeId})</span>}</div>
            <div className="preview-render-wrapper">
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