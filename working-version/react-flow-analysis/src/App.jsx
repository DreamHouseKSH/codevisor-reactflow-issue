import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  useReactFlow
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

// 커스텀 노드 컴포넌트
const CustomNode = ({ data, id }) => {
  return (
    <div className={`custom-node ${data.nodeType}`} data-node-id={id}>
      <div className="node-label">{data.label}</div>
      <div className="node-type">{data.nodeType}</div>
    </div>
  )
}

const nodeTypes = {
  custom: CustomNode
}

// 테스트용 샘플 데이터 - 명확하게 다른 위치들
const testNodes = [
  {
    id: 'MainPage.jsx',
    type: 'custom',
    position: { x: 300, y: 50 },
    data: { label: 'MainPage', nodeType: 'component' },
    draggable: true
  },
  {
    id: 'App.jsx',
    type: 'custom',
    position: { x: 100, y: 200 },
    data: { label: 'App', nodeType: 'component' },
    draggable: true
  },
  {
    id: 'GraphViewer.jsx',
    type: 'custom',
    position: { x: 300, y: 200 },
    data: { label: 'GraphViewer', nodeType: 'component' },
    draggable: true
  },
  {
    id: 'DetailPanel.jsx',
    type: 'custom',
    position: { x: 500, y: 200 },
    data: { label: 'DetailPanel', nodeType: 'component' },
    draggable: true
  },
  {
    id: 'GraphService.js',
    type: 'custom',
    position: { x: 200, y: 350 },
    data: { label: 'GraphService', nodeType: 'module' },
    draggable: true
  },
  {
    id: 'CustomNode.jsx',
    type: 'custom',
    position: { x: 400, y: 350 },
    data: { label: 'CustomNode', nodeType: 'component' },
    draggable: true
  },
  {
    id: 'utils.js',
    type: 'custom',
    position: { x: 150, y: 500 },
    data: { label: 'utils', nodeType: 'module' },
    draggable: true
  },
  {
    id: 'config.js',
    type: 'custom',
    position: { x: 350, y: 500 },
    data: { label: 'config', nodeType: 'config' },
    draggable: true
  }
]

const testEdges = [
  { id: 'MainPage->App', source: 'MainPage.jsx', target: 'App.jsx', type: 'smoothstep' },
  { id: 'MainPage->GraphViewer', source: 'MainPage.jsx', target: 'GraphViewer.jsx', type: 'smoothstep' },
  { id: 'MainPage->DetailPanel', source: 'MainPage.jsx', target: 'DetailPanel.jsx', type: 'smoothstep' },
  { id: 'GraphViewer->GraphService', source: 'GraphViewer.jsx', target: 'GraphService.js', type: 'smoothstep' },
  { id: 'GraphViewer->CustomNode', source: 'GraphViewer.jsx', target: 'CustomNode.jsx', type: 'smoothstep' },
  { id: 'App->utils', source: 'App.jsx', target: 'utils.js', type: 'smoothstep' },
  { id: 'utils->config', source: 'utils.js', target: 'config.js', type: 'smoothstep' }
]

const FlowComponent = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(testNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(testEdges)
  const [debugInfo, setDebugInfo] = useState('')
  const [analysisMode, setAnalysisMode] = useState('live') // 'live' | 'manual'
  const reactFlowInstance = useReactFlow()
  const intervalRef = useRef(null)

  // 상세 분석 함수
  const analyzeNodePositions = useCallback(() => {
    const nodeElements = document.querySelectorAll('.react-flow__node')
    const viewport = document.querySelector('.react-flow__viewport')
    
    let analysis = `🔍 노드 위치 분석 (${new Date().toLocaleTimeString()})\n`
    analysis += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`
    
    // React Flow 상태 분석
    analysis += `📊 React Flow State (${nodes.length}개 노드):\n`
    nodes.forEach(node => {
      analysis += `  ${node.id}: position(${node.position.x}, ${node.position.y})\n`
    })
    analysis += '\n'

    // Viewport 정보
    if (viewport) {
      const viewportStyle = getComputedStyle(viewport)
      analysis += `🖼️ Viewport Transform: ${viewportStyle.transform}\n\n`
    }

    // DOM 요소 분석
    analysis += `🏗️ DOM 요소 Transform (${nodeElements.length}개):\n`
    const actualPositions = new Map()
    
    nodeElements.forEach((element, index) => {
      const id = element.getAttribute('data-id') || `node-${index}`
      const style = getComputedStyle(element)
      const transform = style.transform
      const rect = element.getBoundingClientRect()
      const isVisible = rect.width > 0 && rect.height > 0
      
      // transform에서 위치 추출
      let x = 0, y = 0
      if (transform && transform !== 'none') {
        const translateMatch = transform.match(/translate\(([^,]+)px,\s*([^)]+)px\)/)
        const matrixMatch = transform.match(/matrix\(.*?,\s*.*?,\s*.*?,\s*.*?,\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)\)/)
        
        if (translateMatch) {
          x = Math.round(parseFloat(translateMatch[1]))
          y = Math.round(parseFloat(translateMatch[2]))
        } else if (matrixMatch) {
          x = Math.round(parseFloat(matrixMatch[1]))
          y = Math.round(parseFloat(matrixMatch[2]))
        }
      }
      
      const posKey = `${x},${y}`
      if (!actualPositions.has(posKey)) {
        actualPositions.set(posKey, [])
      }
      actualPositions.get(posKey).push(id)
      
      const visibleIcon = isVisible ? '👁️' : '🚫'
      analysis += `  ${visibleIcon} ${id}:\n`
      analysis += `     Transform: ${transform === 'none' ? 'none' : `translate(${x}, ${y})`}\n`
      analysis += `     BoundingRect: (${Math.round(rect.x)}, ${Math.round(rect.y)}) ${Math.round(rect.width)}×${Math.round(rect.height)}\n`
    })
    analysis += '\n'

    // 위치 중복 분석
    analysis += `📍 위치 분석:\n`
    analysis += `  고유 위치 수: ${actualPositions.size} / ${nodeElements.length}\n`
    
    if (actualPositions.size === 1 && nodeElements.length > 1) {
      analysis += `  ❌ 모든 노드가 같은 위치에 있습니다!\n`
    } else if (actualPositions.size < nodeElements.length) {
      analysis += `  ⚠️ 일부 노드 위치 중복:\n`
      actualPositions.forEach((nodeIds, pos) => {
        if (nodeIds.length > 1) {
          analysis += `     위치 ${pos}: ${nodeIds.join(', ')}\n`
        }
      })
    } else {
      analysis += `  ✅ 모든 노드가 서로 다른 위치에 있습니다\n`
    }
    analysis += '\n'

    // React Flow 인스턴스 정보
    if (reactFlowInstance) {
      const viewport = reactFlowInstance.getViewport()
      const rfNodes = reactFlowInstance.getNodes()
      analysis += `⚙️ ReactFlow Instance:\n`
      analysis += `  Viewport: x=${viewport.x}, y=${viewport.y}, zoom=${viewport.zoom.toFixed(2)}\n`
      analysis += `  Nodes: ${rfNodes.length}개\n`
      analysis += `  첫 번째 노드: ${rfNodes[0]?.id} at (${rfNodes[0]?.position.x}, ${rfNodes[0]?.position.y})\n`
    }

    setDebugInfo(analysis)
  }, [nodes, reactFlowInstance])

  // 라이브 분석 토글
  useEffect(() => {
    if (analysisMode === 'live') {
      intervalRef.current = setInterval(analyzeNodePositions, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [analysisMode, analyzeNodePositions])

  // 초기 분석
  useEffect(() => {
    setTimeout(analyzeNodePositions, 500)
  }, [analyzeNodePositions])

  // 테스트 함수들
  const forceRepositionNodes = () => {
    const newNodes = nodes.map((node, index) => ({
      ...node,
      position: {
        x: (index % 3) * 200 + 100,
        y: Math.floor(index / 3) * 150 + 100
      }
    }))
    setNodes(newNodes)
    setTimeout(analyzeNodePositions, 100)
  }

  const resetToOriginal = () => {
    setNodes(testNodes)
    setTimeout(analyzeNodePositions, 100)
  }

  const randomizePositions = () => {
    const newNodes = nodes.map(node => ({
      ...node,
      position: {
        x: Math.random() * 600 + 50,
        y: Math.random() * 400 + 50
      }
    }))
    setNodes(newNodes)
    setTimeout(analyzeNodePositions, 100)
  }

  const onNodeDragStop = useCallback((event, node) => {
    console.log(`노드 ${node.id} 드래그 완료:`, node.position)
    setTimeout(analyzeNodePositions, 100)
  }, [analyzeNodePositions])

  return (
    <div className="container">
      {/* 헤더 */}
      <div className="header">
        <h1>🔬 React Flow v12 노드 위치 분석 도구</h1>
      </div>

      {/* 디버그 패널 */}
      <div className="debug-panel">
        <pre>{debugInfo}</pre>
      </div>

      {/* React Flow */}
      <div className="flow-container">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeDragStop={onNodeDragStop}
          nodeTypes={nodeTypes}
          fitView={false}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
          minZoom={0.1}
          maxZoom={3}
          nodesDraggable={true}
        >
          <Background variant="dots" gap={20} size={1} color="#e5e7eb" />
          <Controls />
          <MiniMap 
            nodeColor={(node) => {
              switch (node.data.nodeType) {
                case 'component': return '#10b981'
                case 'module': return '#f59e0b'
                case 'config': return '#8b5cf6'
                default: return '#6b7280'
              }
            }}
            maskColor="rgba(255, 255, 255, 0.2)"
            pannable
            zoomable
          />
        </ReactFlow>

        {/* 컨트롤 패널 */}
        <div className="controls-panel">
          <button 
            onClick={() => setAnalysisMode(analysisMode === 'live' ? 'manual' : 'live')}
            style={{ backgroundColor: analysisMode === 'live' ? '#10b981' : '#6b7280', color: 'white' }}
          >
            <span className={`status-indicator ${analysisMode === 'live' ? 'status-ok' : 'status-warning'}`}></span>
            {analysisMode === 'live' ? '라이브 분석' : '수동 분석'}
          </button>
          
          {analysisMode === 'manual' && (
            <button onClick={analyzeNodePositions}>
              🔍 지금 분석
            </button>
          )}
          
          <button onClick={forceRepositionNodes}>
            📐 격자 재배치
          </button>
          
          <button onClick={resetToOriginal}>
            🔄 원본 복원
          </button>
          
          <button onClick={randomizePositions}>
            🎲 랜덤 배치
          </button>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <ReactFlowProvider>
      <FlowComponent />
    </ReactFlowProvider>
  )
}

export default App