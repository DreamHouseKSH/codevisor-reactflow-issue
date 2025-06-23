/**
 * @brief React Flow 기반 그래프 시각화 컴포넌트
 * @details CodeVisor의 핵심 시각화 인터페이스
 * @author CodeVisor Team
 * @date 2025-06-20
 */

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import CustomNode from './CustomNode';
import GraphControls from './GraphControls';
import GraphMinimap from './GraphMinimap';

/**
 * @brief 내부 그래프 컴포넌트 (ReactFlow 훅 사용을 위해 분리)
 */
const GraphViewerInner = ({
  initialNodes = [],
  initialEdges = [],
  onNodeClick,
  onNodeSelect,
  filterOptions = {},
  onFilterChange,
  onLayoutChange,
  isLoading = false,
  noDataComponent = null,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodes, setSelectedNodes] = useState(new Set());
  const [isInitialized, setIsInitialized] = useState(false);
  
  // ReactFlow 인스턴스 사용
  const reactFlowInstance = useReactFlow();

  // 레이아웃 변경 핸들러
  const handleLayoutChange = useCallback(async (layoutType) => {
    console.log('🔄 GraphViewer: 레이아웃 변경 요청:', layoutType, '현재 노드 수:', nodes.length);
    
    // 부모 컴포넌트의 핸들러가 있으면 그것을 사용 (MainPage에서 전달된 것)
    if (onLayoutChange) {
      console.log('📞 GraphViewer: 부모 컴포넌트 레이아웃 핸들러 호출');
      onLayoutChange(layoutType);
      return;
    }
    
    // 백업용 자체 처리 (부모 핸들러가 없는 경우)
    if (nodes.length === 0) {
      console.log('⚠️ GraphViewer: 노드가 없어 레이아웃 변경 건너뜀');
      return;
    }
    
    try {
      // 현재 그래프 데이터를 준비
      const graphData = {
        nodes: nodes.map(node => ({
          id: node.id,
          name: node.data?.label || node.id,
          filePath: node.data?.filePath || '',
          type: node.data?.nodeType || 'module',
          exports: node.data?.exports || [],
          imports: node.data?.imports || [],
          functions: node.data?.functions || [],
          components: node.data?.components || [],
          metadata: node.data?.metadata || {}
        })),
        edges: edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: edge.data?.edgeType || 'import',
          imports: edge.data?.imports || []
        }))
      };
      
      console.log('📊 GraphViewer: 그래프 데이터 준비됨:', graphData.nodes.length, '노드');
      
      // 직접 Electron API 호출
      if (window.electronAPI && window.electronAPI.graph) {
        console.log('🔌 GraphViewer: Electron API 호출 시작');
        const layoutResult = await window.electronAPI.graph.generateLayout(
          { dependencyGraph: graphData },
          layoutType
        );
        
        console.log('📦 GraphViewer: API 응답:', layoutResult);
        
        if (layoutResult.success && layoutResult.nodes) {
          console.log('✅ GraphViewer: 레이아웃 변경 성공, 노드 업데이트:', layoutResult.nodes.length);
          console.log('🎯 GraphViewer: 첫 번째 노드 새 위치:', layoutResult.nodes[0]?.position);
          setNodes(layoutResult.nodes);
          setEdges(layoutResult.edges || []);
          
          // 레이아웃 변경 후 React Flow 재초기화
          setTimeout(() => {
            console.log('🔄 레이아웃 변경 후 React Flow 재초기화');
            setReactFlowKey(prev => prev + 1);
            
            setTimeout(() => {
              reactFlowInstance.fitView({ duration: 800, padding: 0.1 });
            }, 100);
          }, 100);
        } else {
          console.error('❌ GraphViewer: 레이아웃 변경 실패:', layoutResult.error);
        }
      } else {
        console.error('❌ GraphViewer: Electron API를 사용할 수 없습니다');
        console.error('   window.electronAPI 존재:', !!window.electronAPI);
        console.error('   window.electronAPI.graph 존재:', !!window.electronAPI?.graph);
      }
    } catch (error) {
      console.error('GraphViewer: 레이아웃 변경 실패:', error);
    }
  }, [nodes, edges, setNodes, setEdges, reactFlowInstance, onLayoutChange]);

  // 커스텀 노드 타입 정의
  const nodeTypes = useMemo(
    () => ({
      custom: CustomNode,
    }),
    []
  );

  // 노드 데이터 업데이트 - React Flow key 재설정으로 완전 재초기화
  useEffect(() => {
    console.log('🔄 GraphViewer: initialNodes 변경됨:', initialNodes.length, '개 노드');
    
    if (initialNodes.length > 0) {
      // 첫 번째 노드 위치 확인
      console.log('📍 GraphViewer: 첫 번째 노드 위치:', initialNodes[0].position);
      
      // 즉시 노드 설정 (더 이상 지연 없음)
      console.log('🎯 GraphViewer: 즉시 노드 설정');
      setNodes(initialNodes);
      setIsInitialized(true);
    } else {
      setNodes([]);
      setIsInitialized(false);
    }
  }, [initialNodes, setNodes]);

  // 엣지 데이터 업데이트 
  useEffect(() => {
    console.log('🔄 GraphViewer: initialEdges 변경됨:', initialEdges.length, '개 엣지');
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  // React Flow 완전 재초기화를 위한 키 상태
  const [reactFlowKey, setReactFlowKey] = useState(0);

  // 초기화 후 자동 뷰 맞춤
  useEffect(() => {
    if (isInitialized && nodes.length > 0 && reactFlowInstance) {
      console.log('🎯 GraphViewer: 초기화 완료, 노드 위치 확인');
      
      // 현재 노드들의 위치 로깅
      nodes.forEach(node => {
        console.log(`📍 노드 ${node.id}: position(${node.position.x}, ${node.position.y})`);
      });
      
      // React Flow 완전 재초기화로 클러스터링 해결
      console.log('🔄 React Flow 완전 재초기화');
      setReactFlowKey(prev => prev + 1);
      
      // 자동 뷰 맞춤
      setTimeout(() => {
        reactFlowInstance.fitView({ duration: 800, padding: 0.1 });
        console.log('📌 자동 뷰포트 맞춤 완료');
      }, 300);
    }
  }, [isInitialized, nodes.length, reactFlowInstance]);

  // 필터 적용
  const filteredNodes = useMemo(() => {
    if (!filterOptions || Object.keys(filterOptions).length === 0) {
      return nodes;
    }

    return nodes.filter(node => {
      // 노드 타입 필터
      if (filterOptions.nodeTypes && filterOptions.nodeTypes.length > 0) {
        if (!filterOptions.nodeTypes.includes(node.data.nodeType)) {
          return false;
        }
      }

      // 검색어 필터
      if (filterOptions.searchTerm) {
        const searchTerm = filterOptions.searchTerm.toLowerCase();
        const nodeName = node.data.label.toLowerCase();
        const filePath = node.data.filePath?.toLowerCase() || '';
        
        if (!nodeName.includes(searchTerm) && !filePath.includes(searchTerm)) {
          return false;
        }
      }

      // 복잡도 필터
      if (filterOptions.minComplexity !== undefined || filterOptions.maxComplexity !== undefined) {
        const complexity = node.data.metadata?.complexity || 0;
        
        if (filterOptions.minComplexity !== undefined && complexity < filterOptions.minComplexity) {
          return false;
        }
        
        if (filterOptions.maxComplexity !== undefined && complexity > filterOptions.maxComplexity) {
          return false;
        }
      }

      return true;
    });
  }, [nodes, filterOptions]);

  // 필터된 노드에 해당하는 엣지만 표시
  const filteredEdges = useMemo(() => {
    const filteredNodeIds = new Set(filteredNodes.map(node => node.id));
    return edges.filter(edge => 
      filteredNodeIds.has(edge.source) && filteredNodeIds.has(edge.target)
    );
  }, [edges, filteredNodes]);

  // 노드 연결 핸들러
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // 노드 클릭 핸들러
  const handleNodeClick = useCallback((event, node) => {
    // 다중 선택 처리
    if (event.ctrlKey || event.metaKey) {
      setSelectedNodes(prev => {
        const newSet = new Set(prev);
        if (newSet.has(node.id)) {
          newSet.delete(node.id);
        } else {
          newSet.add(node.id);
        }
        return newSet;
      });
    } else {
      setSelectedNodes(new Set([node.id]));
    }

    // 외부 핸들러 호출
    if (onNodeClick) {
      onNodeClick(node, Array.from(selectedNodes));
    }
  }, [onNodeClick, selectedNodes]);

  // 노드 선택 변경 핸들러
  const handleSelectionChange = useCallback((elements) => {
    const selectedNodeIds = elements.nodes?.map(node => node.id) || [];
    setSelectedNodes(new Set(selectedNodeIds));
    
    if (onNodeSelect) {
      onNodeSelect(selectedNodeIds);
    }
  }, [onNodeSelect]);

  // 그래프 컨트롤 핸들러들
  const handleZoomIn = useCallback(() => {
    const currentZoom = reactFlowInstance.getZoom();
    reactFlowInstance.setViewport({ zoom: currentZoom * 1.5 });
  }, [reactFlowInstance]);

  const handleZoomOut = useCallback(() => {
    const currentZoom = reactFlowInstance.getZoom();
    reactFlowInstance.setViewport({ zoom: currentZoom * 0.7 });
  }, [reactFlowInstance]);

  const handleFitView = useCallback(() => {
    reactFlowInstance.fitView({ duration: 800, padding: 0.4, maxZoom: 0.6 });
  }, [reactFlowInstance]);

  const handleCenterNode = useCallback((nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node && node.position) {
      reactFlowInstance.setCenter(node.position.x, node.position.y, { 
        duration: 800, 
        zoom: 1.5 
      });
    }
  }, [nodes, reactFlowInstance]);

  // 노드 스타일 업데이트 (선택 상태 반영)
  const styledNodes = useMemo(() => {
    // 노드 위치 중복 확인
    const positionMap = new Map();
    filteredNodes.forEach(node => {
      const key = `${node.position?.x},${node.position?.y}`;
      if (!positionMap.has(key)) {
        positionMap.set(key, []);
      }
      positionMap.get(key).push(node.id);
    });
    
    // 중복 위치 경고
    positionMap.forEach((nodeIds, position) => {
      if (nodeIds.length > 1) {
        console.warn(`⚠️ 노드 위치 중복 발견! 위치 ${position}에 ${nodeIds.length}개 노드:`, nodeIds);
      }
    });
    
    return filteredNodes.map(node => ({
      ...node,
      selected: selectedNodes.has(node.id),
      draggable: true,
      style: {
        ...node.style,
        opacity: selectedNodes.size === 0 || selectedNodes.has(node.id) ? 1 : 0.3,
        transform: selectedNodes.has(node.id) ? 'scale(1.1)' : 'scale(1)',
        transition: 'all 0.2s ease-in-out',
      }
    }));
  }, [filteredNodes, selectedNodes]);

  // 엣지 스타일 업데이트 (선택된 노드와 연결된 엣지 강조)
  const styledEdges = useMemo(() => {
    return filteredEdges.map(edge => {
      const isConnectedToSelected = selectedNodes.has(edge.source) || selectedNodes.has(edge.target);
      
      return {
        ...edge,
        style: {
          ...edge.style,
          opacity: selectedNodes.size === 0 || isConnectedToSelected ? 1 : 0.2,
          strokeWidth: isConnectedToSelected ? 3 : edge.style?.strokeWidth || 2,
        }
      };
    });
  }, [filteredEdges, selectedNodes]);

  // 창 크기 변경 시 React Flow 업데이트 - 모든 조건부 return 이전에 위치
  useEffect(() => {
    const handleResize = () => {
      if (reactFlowInstance) {
        reactFlowInstance.fitView({ duration: 300 });
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [reactFlowInstance]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">그래프를 생성하고 있습니다...</p>
        </div>
      </div>
    );
  }

  console.log('GraphViewer 렌더링 - nodes:', nodes.length, ', edges:', edges.length);
  console.log('GraphViewer 렌더링 - filteredNodes:', filteredNodes.length, ', styledNodes:', styledNodes.length);
  if (styledNodes.length > 0) {
    console.log('GraphViewer: 렌더링할 첫 번째 노드:', JSON.stringify(styledNodes[0], null, 2));
  }
  
  // 노드가 없고 noDataComponent가 제공된 경우
  if (nodes.length === 0 && noDataComponent && !isLoading) {
    return noDataComponent;
  }
  
  return (
    <div className="graph-viewer" style={{ width: '100%', height: '100%', minHeight: '500px', position: 'relative' }}>
      <ReactFlow
        key={reactFlowKey}
        nodes={styledNodes}
        edges={styledEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onSelectionChange={handleSelectionChange}
        onNodeDrag={(event, node) => {
          console.log('노드 드래그 중:', node.id, node.position);
        }}
        onNodeDragStop={(event, node) => {
          console.log('노드 드래그 완료:', node.id, node.position);
          
          // React Flow 상태 업데이트 (transform은 자동으로 계산되도록)
          setNodes(prevNodes => 
            prevNodes.map(n => 
              n.id === node.id ? { ...n, position: node.position } : n
            )
          );
        }}
        nodeTypes={nodeTypes}
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
        panOnDrag={[1, 2]}
        panOnScroll={true}
        selectionOnDrag={false}
        nodeDragThreshold={1}
        fitView={true}
        fitViewOptions={{ duration: 200, padding: 0.1 }}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        minZoom={0.1}
        maxZoom={2}
        deleteKeyCode={['Backspace', 'Delete']}
        selectionKeyCode={['Meta', 'Ctrl']}
        multiSelectionKeyCode={['Meta', 'Ctrl']}
        className="bg-gray-50"
        proOptions={{ hideAttribution: true }}
        onInit={(instance) => {
          console.log('ReactFlow 초기화됨');
          console.log('현재 노드 수:', instance.getNodes().length);
        }}
      >
        {/* 배경 패턴 */}
        <Background 
          variant="dots" 
          gap={20} 
          size={1} 
          color="#e5e7eb"
        />

        {/* 미니맵 */}
        <GraphMinimap 
          nodes={filteredNodes}
          selectedNodes={selectedNodes}
        />

        {/* 기본 컨트롤 */}
        <Controls 
          showInteractive={false}
          className="bg-white shadow-lg border border-gray-200"
        />

        {/* 커스텀 컨트롤 패널 */}
        <Panel position="top-left" className="m-4">
          <GraphControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onFitView={handleFitView}
            onCenterNode={handleCenterNode}
            selectedNodes={Array.from(selectedNodes)}
            totalNodes={filteredNodes.length}
            totalEdges={filteredEdges.length}
            onLayoutChange={handleLayoutChange}
            onFilterChange={onFilterChange}
            filterOptions={filterOptions}
          />
        </Panel>

        {/* 통계 정보 패널 */}
        <Panel position="bottom-left" className="m-4">
          <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200 text-sm">
            <div className="flex gap-4 text-gray-600">
              <span>노드: {filteredNodes.length}</span>
              <span>엣지: {filteredEdges.length}</span>
              {selectedNodes.size > 0 && (
                <span className="text-blue-600 font-medium">
                  선택됨: {selectedNodes.size}
                </span>
              )}
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

/**
 * @brief 메인 그래프 시각화 컴포넌트 (Provider 포함)
 */
const GraphViewer = (props) => {
  // 항상 ReactFlow를 렌더링하여 초기화 문제 방지
  return (
    <ReactFlowProvider>
      <GraphViewerInner {...props} />
    </ReactFlowProvider>
  );
};

export default GraphViewer;