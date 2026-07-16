// src/components/diagram/DiagramModal.jsx v9.0
/*
 * 파일 설명: 외부 유입 마크다운(initialDiagramMarkdown) 데이터를 스캔하여 폼의 실시간 구조 배열 데이터로 자동 환원해 주는 역파싱 컴파일러 엔진이 탑재된 다이어그램 메인 모달입니다.
 */
import React, { useState, useEffect } from 'react';
import { Edit2, Layout } from 'lucide-react';
import MermaidBlock from '../preview/MermaidBlock';
import GeoJsonBlock from '../preview/GeoJsonBlock';
import StlBlock from '../preview/StlBlock';
import PieChartForm from './forms/PieChartForm';
import FlowchartForm from './forms/FlowchartForm';
import SequenceForm from './forms/SequenceForm';
import GeoJsonForm from './forms/GeoJsonForm';
import StlForm from './forms/StlForm';
import './DiagramModal.css';

function DiagramModal({ isOpen, onClose, onInsert, initialDiagramMarkdown = '' }) {
  console.log("DiagramModal 컴포넌트(v9.0) 마운트 시작 - 역파싱 가동 검증 단계 진입");

  const [editMode, setEditMode] = useState('gui');
  const [diagramType, setDiagramType] = useState('mermaid_flow');
  const [rawCode, setRawCode] = useState('');
  const [activeNodeId, setActiveNodeId] = useState(null);

  // A. 원형 차트 기본 상태 구조
  const [pieTitle, setPieTitle] = useState('프로젝트 언어 비중');
  const [pieItems, setPieItems] = useState([
    { id: 'pie-1', label: 'JavaScript', value: 65 },
    { id: 'pie-2', label: 'CSS', value: 20 },
    { id: 'pie-3', label: 'HTML', value: 15 }
  ]);

  // B. 순서도 기본 상태 구조
  const [flowOrientation, setFlowOrientation] = useState('LR');
  const [flowSteps, setFlowSteps] = useState([
    { id: 'flow-1', from: 'A', fromShape: '[]', fromText: '원천 데이터', fromDesc: 'EMS · 인사 · 안전', arrow: '-->', arrowText: '', to: 'B', toShape: '[]', toText: '월별 수집', toDesc: '사업장·월 기준' },
    { id: 'flow-2', from: 'B', fromShape: '[]', fromText: '월별 수집', fromDesc: '사업장·월 기준', arrow: '-->', arrowText: '', to: 'C', toShape: '{}', toText: '검증/AI', toDesc: '누락·이상치 확인' }
  ]);

  // C. 시퀀스 다이어그램 기본 상태 구조
  const [seqParticipants, setSeqParticipants] = useState([
    { id: 'seq-p1', type: 'actor', name: 'User', alias: '사용자' },
    { id: 'seq-p2', type: 'participant', name: 'Server', alias: 'API 서버' }
  ]);
  const [seqMessages, setSeqMessages] = useState([
    { id: 'seq-m1', from: 'User', arrow: '->>', to: 'Server', text: '데이터 요청', isActivate: true },
    { id: 'seq-m2', from: 'Server', arrow: '-->>', to: 'User', text: 'JSON 응답', isActivate: false }
  ]);

  // D. 지도 기본 상태 구조
  const [geoFeatures, setGeoFeatures] = useState([{ id: 'geo-1', name: 'Seoul', lat: 37.5665, lng: 126.9780 }]);

  // E. 3D 박스 기본 상태 구조
  const [boxWidth, setBoxWidth] = useState(1.0);
  const [boxHeight, setBoxHeight] = useState(1.0);
  const [boxDepth, setBoxDepth] = useState(1.0);

  // [역파싱 유틸] 문자열 내부 개별 노드의 ID, 모양 기호, 텍스트 타이틀, 설명을 역분석하는 함수
  const parseNodeToken = (token) => {
    if (!token) return null;
    const idMatch = token.match(/^([a-zA-Z0-9_\-]+)/);
    if (!idMatch) return null;
    
    const id = idMatch[1];
    let shape = '[]';
    let text = '';
    let desc = '';

    if (token.includes('{')) shape = '{}';
    else if (token.includes('((')) shape = '(())';
    else if (token.includes('()')) shape = '()';
    else if (token.includes('>')) shape = '>]';
    else if (token.includes('{{')) shape = '{{}}';

    // 마크다운 문자열 포맷팅(`**제목**<br/>설명`) 탐색
    const mdRegex = /`\*\*([\s\S]*?)\*\*<br\/>([\s\S]*?)`/;
    const mdMatch = token.match(mdRegex);
    
    if (mdMatch) {
      text = mdMatch[1].trim();
      desc = mdMatch[2].trim();
    } else {
      const normalMatch = token.match(/["\[\(\{>]([\s\S]*?)[\]\)\}"]/);
      if (normalMatch) {
        text = normalMatch[1].replace(/[`"]/g, '').trim();
      }
    }
    return { id, shape, text, desc };
  };

  // [역파싱 메인 엔진 이펙트] 외부 텍스트 감지 즉시 상태값 역환원 구동
  useEffect(() => {
    if (!isOpen || !initialDiagramMarkdown.trim()) return;

    console.log("[역파싱 엔진] 드래그 주입 문자열 분석 개시. 원문:\n", initialDiagramMarkdown);
    const cleanText = initialDiagramMarkdown.replace(/```mermaid/g, '').replace(/```/g, '').trim();
    const lines = cleanText.split('\n');

    // 1차 판별: 순서도(graph/flowchart) 구문 검증
    const flowHeaderMatch = cleanText.match(/(?:graph|flowchart)\s+(TD|BT|LR|RL);?/i);
    if (flowHeaderMatch) {
      console.log("[역파싱 엔진] 순서도(Flowchart) 식별 규격 확인 성공 - 방향 설정:", flowHeaderMatch[1]);
      setDiagramType('mermaid_flow');
      setFlowOrientation(flowHeaderMatch[1].toUpperCase());

      const arrowRegex = /(-->|--->|---|-.->|-.-|==>|--o|--x|~~~)/;
      const parsedSteps = [];

      lines.forEach((line, idx) => {
        if (!line.trim() || line.match(/(?:graph|flowchart|style)/i)) return;
        
        const segments = line.split(arrowRegex);
        if (segments.length >= 3) {
          const fromPart = segments[0].trim();
          const arrowType = segments[1].trim();
          let restPart = segments.slice(2).join('').trim();

          let arrowText = '';
          const arrowTextMatch = restPart.match(/^\|([\s\S]*?)\|/);
          if (arrowTextMatch) {
            arrowText = arrowTextMatch[1].trim();
            restPart = restPart.replace(/^\|[\s\S]*?\|/, '').trim();
          }

          const fromInfo = parseNodeToken(fromPart);
          const toInfo = parseNodeToken(restPart);

          if (fromInfo && toInfo) {
            parsedSteps.push({
              id: `flow-parsed-${idx}-${Math.random().toString(36).substr(2, 4)}`,
              from: fromInfo.id,
              fromShape: fromInfo.shape,
              fromText: fromInfo.text || fromInfo.id,
              fromDesc: fromInfo.desc,
              arrow: arrowType,
              arrowText: arrowText,
              to: toInfo.id,
              toShape: toInfo.shape,
              toText: toInfo.text || toInfo.id,
              toDesc: toInfo.desc
            });
          }
        }
      });

      if (parsedSteps.length > 0) {
        console.log(`[역파싱 엔진] 총 ${parsedSteps.length}개의 순서도 연결 흐름을 GUI 폼으로 성공적으로 복원했습니다.`);
        setFlowSteps(parsedSteps);
      }
      return;
    }

    // 2차 판별: 원형 차트(pie) 구문 검증
    if (cleanText.match(/^pie/i)) {
      console.log("[역파싱 엔진] 원형 차트(Pie Chart) 식별 규격 확인 성공");
      setDiagramType('mermaid_pie');
      
      const titleMatch = cleanText.match(/title\s+([\s\S]*?)\n/i);
      if (titleMatch) setPieTitle(titleMatch[1].trim());

      const parsedPieItems = [];
      lines.forEach(line => {
        const itemMatch = line.match(/"([\s\S]*?)"\s*:\s*([0-9.]+)/);
        if (itemMatch) {
          parsedPieItems.push({
            id: `pie-parsed-${Math.random().toString(36).substr(2, 4)}`,
            label: itemMatch[1].trim(),
            value: parseFloat(itemMatch[2]) || 0
          });
        }
      });

      if (parsedPieItems.length > 0) {
        setPieItems(parsedPieItems);
      }
      return;
    }

    // 3차 판별: 시퀀스 다이어그램(sequenceDiagram) 구문 검증
    if (cleanText.match(/^sequenceDiagram/i)) {
      console.log("[역파싱 엔진] 시퀀스 다이어그램 식별 규격 확인 성공");
      setDiagramType('mermaid_seq');

      const participants = [];
      const messages = [];

      lines.forEach((line, idx) => {
        const pMatch = line.trim().match(/^(participant|actor)\s+([a-zA-Z0-9_\-]+)(?:\s+as\s+([\s\S]*+))?/i);
        if (pMatch) {
          participants.push({
            id: `seq-p-${idx}`,
            type: pMatch[1].toLowerCase(),
            name: pMatch[2].trim(),
            alias: pMatch[3] ? pMatch[3].trim() : ''
          });
          return;
        }

        const mMatch = line.trim().match(/^([a-zA-Z0-9_\-]+)\s*(->|-->|->>|-->>|-x|--x|-\)|--\))(\+?)([a-zA-Z0-9_\-]+)\s*:\s*([\s\S]*)$/);
        if (mMatch) {
          messages.push({
            id: `seq-m-${idx}`,
            from: mMatch[1].trim(),
            arrow: mMatch[2].trim(),
            isActivate: mMatch[3] === '+',
            to: mMatch[4].trim(),
            text: mMatch[5].trim()
          });
        }
      });

      if (participants.length > 0) setSeqParticipants(participants);
      if (messages.length > 0) setSeqMessages(messages);
      return;
    }

    // 4차 판별: 기타 데이터는 로직부 충돌을 방지하기 위해 텍스트 편집기(Raw) 모드로 자동 가드 전환 처리합니다.
    console.log("[역파싱 엔진] 특이 포맷 구조 감지 - 직접 텍스트 편집기(Raw) 모드로 우회 설정합니다.");
    setEditMode('raw');
    setRawCode(cleanText);

  }, [isOpen, initialDiagramMarkdown]);

  const generateBoxSTL = (wVal, hVal, dVal) => {
    const w = parseFloat(wVal) / 2, h = parseFloat(hVal) / 2, d = parseFloat(dVal) / 2;
    return `solid custom_box\n  facet normal 0.0 0.0 1.0\n    outer loop\n      vertex ${-w} ${-h} ${d}\n      vertex ${w} ${-h} ${d}\n      vertex ${w} ${h} ${d}\n    endloop\n  endfacet\n  facet normal 0.0 0.0 1.0\n    outer loop\n      vertex ${-w} ${-h} ${d}\n      vertex ${w} ${h} ${d}\n      vertex ${-w} ${h} ${d}\n    endloop\n  endfacet\n  facet normal 0.0 0.0 -1.0\n    outer loop\n      vertex ${-w} ${-h} ${-d}\n      vertex ${-w} ${h} ${-d}\n      vertex ${w} ${h} ${-d}\n    endloop\n  endfacet\n  facet normal 0.0 0.0 -1.0\n    outer loop\n      vertex ${-w} ${-h} ${-d}\n      vertex ${w} ${h} ${-d}\n      vertex ${w} ${-h} ${-d}\n    endloop\n  endfacet\n  facet normal 1.0 0.0 0.0\n    outer loop\n      vertex ${w} ${-h} ${-d}\n      vertex ${w} ${h} ${-d}\n      vertex ${w} ${h} ${d}\n    endloop\n  endfacet\n  facet normal 1.0 0.0 0.0\n    outer loop\n      vertex ${w} ${-h} ${-d}\n      vertex ${w} ${h} ${d}\n      vertex ${w} ${-h} ${d}\n    endloop\n  endfacet\n  facet normal -1.0 0.0 0.0\n    outer loop\n      vertex ${-w} ${-h} ${-d}\n      vertex ${-w} ${-h} ${d}\n      vertex ${-w} ${h} ${d}\n    endloop\n  endfacet\n  facet normal -1.0 0.0 0.0\n    outer loop\n      vertex ${-w} ${-h} ${-d}\n      vertex ${-w} ${h} ${d}\n      vertex ${-w} ${h} ${-d}\n    endloop\n  endfacet\n  facet normal 0.0 1.0 0.0\n    outer loop\n      vertex ${-w} ${h} ${-d}\n      vertex ${-w} ${h} ${d}\n      vertex ${w} ${h} ${d}\n    endloop\n  endfacet\n  facet normal 0.0 1.0 0.0\n    outer loop\n      vertex ${-w} ${h} ${-d}\n      vertex ${w} ${h} ${d}\n      vertex ${w} ${h} ${-d}\n    endloop\n  endfacet\n  facet normal 0.0 -1.0 0.0\n    outer loop\n      vertex ${-w} ${-h} ${-d}\n      vertex ${w} ${-h} ${-d}\n      vertex ${w} ${-h} ${d}\n    endloop\n  endfacet\n  facet normal 0.0 -1.0 0.0\n    outer loop\n      vertex ${-w} ${-h} ${-d}\n      vertex ${w} ${-h} ${d}\n      vertex ${-w} ${-h} ${d}\n    endloop\n  endfacet\nendsolid`;
  };

  const getShapeSyntax = (id, text, desc, shape) => {
    let content = text || id;
    if (desc) {
      content = `"\`**${text}**<br/>${desc}\`"`;
    } else if (text && (text.includes(' ') || text.includes('<') || text.includes('>'))) {
      content = `"\`${text}\`"`;
    }
    switch(shape) {
      case '()': return `${id}(${content})`;
      case '[()]': return `${id}[(${content})]`;
      case '(())': return `${id}((${content}))`;
      case '>]': return `${id}>${content}]`;
      case '{}': return `${id}{${content}}`;
      case '{{}}': return `${id}{{${content}}}`;
      case '[//]': return `${id}[/${content}/]`;
      case '[\\\\]': return `${id}[\\${content}\\]`;
      case '[/\\\\]': return `${id}[/${content}\\]`;
      case '[\\\\/]': return `${id}[\\${content}/]`;
      case '((()))': return `${id}((({content})))`;
      case '[]':
      default: return `${id}[${content}]`;
    }
  };

  const buildCurrentCode = () => {
    if (diagramType === 'mermaid_pie') {
      let code = `pie title ${pieTitle}\n`;
      pieItems.forEach(item => { code += `    "${item.label}" : ${item.value}\n`; });
      return code.trim();
    }
    if (diagramType === 'mermaid_flow') {
      let code = `graph ${flowOrientation};\n`;
      flowSteps.forEach(step => { 
        const fromNode = getShapeSyntax(step.from, step.fromText, step.fromDesc, step.fromShape);
        const toNode = getShapeSyntax(step.to, step.toText, step.toDesc, step.toShape);
        const arrowStr = step.arrowText ? `${step.arrow}|${step.arrowText}|` : step.arrow;
        code += `    ${fromNode} ${arrowStr} ${toNode}\n`; 
      });
      return code.trim();
    }
    if (diagramType === 'mermaid_seq') {
      let code = `sequenceDiagram\n    autonumber\n`;
      seqParticipants.forEach(p => { code += `    ${p.type} ${p.name}${p.alias ? ` as ${p.alias}` : ''}\n`; });
      code += `\n`;
      seqMessages.forEach(msg => {
        if (!msg.from || !msg.to) return;
        const act = msg.isActivate ? '+' : '';
        code += `    ${msg.from}${msg.arrow}${act}${msg.to} : ${msg.text}\n`;
      });
      return code.trim();
    }
    if (diagramType === 'geojson') {
      const geoObj = { type: "FeatureCollection", features: geoFeatures.map(f => ({ type: "Feature", properties: { name: f.name }, geometry: { type: "Point", coordinates: [parseFloat(f.lng || 0), parseFloat(f.lat || 0)] } })) };
      return JSON.stringify(geoObj, null, 2);
    }
    if (diagramType === 'stl') return generateBoxSTL(boxWidth, boxHeight, boxDepth);
    return '';
  };

  const activeCode = editMode === 'gui' ? buildCurrentCode() : rawCode;

  if (!isOpen) return null;

  const handleInsertSubmit = () => {
    const isMermaid = diagramType.startsWith('mermaid_');
    const outputLang = isMermaid ? 'mermaid' : diagramType;
    const formattedCodeBlock = `\n\`\`\`${outputLang}\n${activeCode}\n\`\`\`\n`;
    onInsert(formattedCodeBlock);
    onClose();
  };

  const handleUpdateFlowStep = (id, field, value) => {
    setFlowSteps(prev => {
      const targetStep = prev.find(s => s.id === id);
      if (!targetStep) return prev;

      const updated = [...prev];
      const stepIndex = updated.findIndex(s => s.id === id);

      if (field === 'from' || field === 'to') {
        const newId = value;
        let newStep = { ...updated[stepIndex], [field]: newId };
        
        const existingNode = updated.find(s => s.from === newId || s.to === newId);
        if (existingNode && newId !== '') {
          const prefix = field;
          const sourcePrefix = existingNode.from === newId ? 'from' : 'to';
          newStep[`${prefix}Shape`] = existingNode[`${sourcePrefix}Shape`];
          newStep[`${prefix}Text`] = existingNode[`${sourcePrefix}Text`];
          newStep[`${prefix}Desc`] = existingNode[`${sourcePrefix}Desc`];
        }
        updated[stepIndex] = newStep;
        return updated;
      }

      if (['arrow', 'arrowText'].includes(field)) {
        updated[stepIndex] = { ...updated[stepIndex], [field]: value };
        return updated;
      }

      let targetNodeId = null;
      let propBase = ''; 
      
      if (field.startsWith('from')) {
        targetNodeId = targetStep.from;
        propBase = field.replace('from', ''); 
      } else if (field.startsWith('to')) {
        targetNodeId = targetStep.to;
        propBase = field.replace('to', '');
      }

      if (targetNodeId && propBase) {
        return updated.map(step => {
          let newStep = { ...step };
          if (newStep.from === targetNodeId) newStep[`from${propBase}`] = value;
          if (newStep.to === targetNodeId) newStep[`to${propBase}`] = value;
          return newStep;
        });
      }

      return updated;
    });
  };

  const renderPreview = () => {
    if (!activeCode.trim()) return <div className="preview-placeholder">데이터를 구성하면 미리보기가 실행됩니다.</div>;
    try {
      if (diagramType.startsWith('mermaid_')) {
        return <MermaidBlock chart={activeCode} onNodeClick={(id) => setActiveNodeId(id)} />;
      }
      if (diagramType === 'geojson') return <GeoJsonBlock dataString={activeCode} isTopoJson={false} />;
      if (diagramType === 'stl') return <StlBlock stlString={activeCode} />;
    } catch (err) {
      console.error("[DiagramModal Preview] 렌더링 오류:", err);
    }
    return null;
  };

  return (
    <div className="diagram-modal-backdrop" onClick={onClose}>
      <div className="diagram-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="diagram-modal-header">
          <div className="header-title-section">
            <h3>다이어그램 & 시각화 빌더 (v9.0)</h3>
            <div className="mode-toggle-group">
              <button className={`mode-tab-btn ${editMode === 'gui' ? 'active' : ''}`} onClick={() => setEditMode('gui')}><Layout size={14} style={{ marginRight: '4px' }} /> GUI 빌더</button>
              <button className={`mode-tab-btn ${editMode === 'raw' ? 'active' : ''}`} onClick={() => setEditMode('raw')}><Edit2 size={14} style={{ marginRight: '4px' }} /> 직접 편집 (코드)</button>
            </div>
          </div>
          <button className="close-x-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="diagram-modal-body">
          <div className="diagram-editor-panel">
            <div className="panel-title-label">시각화 포맷 선택</div>
            <select className="template-select" value={diagramType} onChange={(e) => setDiagramType(e.target.value)}>
              <optgroup label="Mermaid 다이어그램">
                <option value="mermaid_flow">순서도 (Flowchart)</option>
                <option value="mermaid_seq">시퀀스 (Sequence Diagram)</option>
                <option value="mermaid_pie">원형 차트 (Pie Chart)</option>
              </optgroup>
              <optgroup label="고급 시각화 렌더러">
                <option value="geojson">대화형 지도 (GeoJSON)</option>
                <option value="stl">3D 상자 모델 (STL Box)</option>
              </optgroup>
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
                    handleAddFlowStep={() => setFlowSteps(prev => [...prev, { id: `flow-${Date.now()}`, from: '', fromShape: '[]', fromText: '', fromDesc: '', arrow: '-->', arrowText: '', to: '', toShape: '[]', toText: '', toDesc: '' }])}
                    handleRemoveFlowStep={(id) => setFlowSteps(prev => prev.filter(step => step.id !== id))}
                    handleUpdateFlowStep={handleUpdateFlowStep}
                  />
                )}
                {diagramType === 'mermaid_seq' && (
                  <SequenceForm 
                    seqParticipants={seqParticipants} setSeqParticipants={setSeqParticipants}
                    handleAddSeqParticipant={() => setSeqParticipants(prev => [...prev, { id: `seq-p-${Date.now()}`, type: 'participant', name: `P_${prev.length+1}`, alias: '' }])}
                    handleRemoveSeqParticipant={(id) => setSeqParticipants(prev => p.id !== id)}
                    handleUpdateSeqParticipant={(id, field, value) => setSeqParticipants(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))}
                    seqMessages={seqMessages} setSeqMessages={setSeqMessages}
                    handleAddSeqMessage={() => setSeqMessages(prev => [...prev, { id: `seq-m-${Date.now()}`, from: '', arrow: '->>', to: '', text: 'New Message', isActivate: false }])}
                    handleRemoveSeqMessage={(id) => setSeqMessages(prev => prev.filter(m => m.id !== id))}
                    handleUpdateSeqMessage={(id, field, value) => setSeqMessages(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m))}
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
                  <StlForm boxWidth={boxWidth} setBoxWidth={setBoxWidth} boxHeight={boxHeight} setBoxHeight={setBoxHeight} boxDepth={boxDepth} setBoxDepth={setBoxDepth} />
                )}
              </div>
            ) : (
              <textarea className="diagram-raw-textarea" value={rawCode} onChange={(e) => setRawCode(e.target.value)} spellCheck="false" placeholder="코드를 직접 작성하세요..." />
            )}
          </div>

          <div className="diagram-preview-panel">
            <div className="panel-title-label">실시간 미리보기 {activeNodeId && <span style={{ color: '#0969da', marginLeft: '8px', textTransform: 'none' }}>(활성 노드: {activeNodeId})</span>}</div>
            <div className="preview-render-wrapper">{renderPreview()}</div>
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