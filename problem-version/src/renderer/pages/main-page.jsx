/**
 * @brief CodeVisor 메인 페이지 컴포넌트
 * @details 그래프 시각화, 상세 정보, 컨트롤 패널을 통합한 메인 인터페이스
 * @author CodeVisor Team
 * @date 2025-06-20
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  FolderOpen,
  Settings,
  FileText,
  RotateCcw,
  Brain,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

import GraphViewer from '../components/graph/GraphViewer';
import DetailPanel from '../components/detail-panel/DetailPanel';
import SettingsPanel from '../components/settings/SettingsPanel';

/**
 * @brief 메인 페이지 컴포넌트
 */
const MainPage = () => {
  // 샘플 데이터 정의 (Dagre 스타일 계층형 레이아웃)
  const sampleGraphData = {
    nodes: [
      {
        id: 'MainPage.jsx',
        type: 'custom',
        position: { x: 200, y: 50 }, // 최상단 레벨
        data: {
          label: 'MainPage',
          filePath: '/src/pages/MainPage.jsx',
          nodeType: 'component',
          exports: ['MainPage'],
          imports: ['React', 'GraphViewer', 'DetailPanel'],
          components: ['MainPage'],
          functions: ['MainPage', 'handleLayoutChange', 'analyzeProject'],
          metadata: { complexity: 15 }
        },
        draggable: true
      },
      {
        id: 'App.jsx',
        type: 'custom',
        position: { x: 100, y: 150 }, // 레벨 1
        data: {
          label: 'App',
          filePath: '/src/App.jsx',
          nodeType: 'component',
          exports: ['App'],
          imports: ['React', 'GraphViewer'],
          components: ['App'],
          functions: ['App'],
          metadata: { complexity: 5 }
        },
        draggable: true
      },
      {
        id: 'GraphViewer.jsx',
        type: 'custom',
        position: { x: 300, y: 150 }, // 레벨 1
        data: {
          label: 'GraphViewer',
          filePath: '/src/components/GraphViewer.jsx',
          nodeType: 'component',
          exports: ['GraphViewer'],
          imports: ['React', 'ReactFlow'],
          components: ['GraphViewer'],
          functions: ['GraphViewer', 'useNodesState', 'useEdgesState'],
          metadata: { complexity: 12 }
        },
        draggable: true
      },
      {
        id: 'DetailPanel.jsx',
        type: 'custom',
        position: { x: 500, y: 150 }, // 레벨 1
        data: {
          label: 'DetailPanel',
          filePath: '/src/components/DetailPanel.jsx',
          nodeType: 'component',
          exports: ['DetailPanel'],
          imports: ['React'],
          components: ['DetailPanel'],
          functions: ['DetailPanel', 'formatMetadata'],
          metadata: { complexity: 8 }
        },
        draggable: true
      },
      {
        id: 'GraphService.js',
        type: 'custom',
        position: { x: 200, y: 250 }, // 레벨 2
        data: {
          label: 'GraphService',
          filePath: '/src/services/GraphService.js',
          nodeType: 'module',
          exports: ['GraphService'],
          imports: ['dagre'],
          components: [],
          functions: ['generateLayout', 'addNode', 'addEdge', '_generateDagreLayout'],
          metadata: { complexity: 18 }
        },
        draggable: true
      },
      {
        id: 'CustomNode.jsx',
        type: 'custom',
        position: { x: 400, y: 250 }, // 레벨 2
        data: {
          label: 'CustomNode',
          filePath: '/src/components/CustomNode.jsx',
          nodeType: 'component',
          exports: ['CustomNode'],
          imports: ['React'],
          components: ['CustomNode'],
          functions: ['CustomNode'],
          metadata: { complexity: 7 }
        },
        draggable: true
      },
      {
        id: 'utils.js',
        type: 'custom',
        position: { x: 100, y: 350 }, // 레벨 3
        data: {
          label: 'utils',
          filePath: '/src/utils/utils.js',
          nodeType: 'module',
          exports: ['formatData', 'validateInput'],
          imports: [],
          components: [],
          functions: ['formatData', 'validateInput', 'debounce'],
          metadata: { complexity: 4 }
        },
        draggable: true
      },
      {
        id: 'config.js',
        type: 'custom',
        position: { x: 300, y: 350 }, // 레벨 3
        data: {
          label: 'config',
          filePath: '/src/config/config.js',
          nodeType: 'config',
          exports: ['config'],
          imports: [],
          components: [],
          functions: [],
          metadata: { complexity: 1 }
        },
        draggable: true
      }
    ],
    edges: [
      {
        id: 'App->GraphViewer',
        source: 'App.jsx',
        target: 'GraphViewer.jsx',
        type: 'smoothstep',
        data: { edgeType: 'import' }
      },
      {
        id: 'GraphViewer->GraphService',
        source: 'GraphViewer.jsx',
        target: 'GraphService.js',
        type: 'smoothstep',
        data: { edgeType: 'import' }
      },
      {
        id: 'GraphViewer->CustomNode',
        source: 'GraphViewer.jsx',
        target: 'CustomNode.jsx',
        type: 'smoothstep',
        data: { edgeType: 'import' }
      },
      {
        id: 'MainPage->App',
        source: 'MainPage.jsx',
        target: 'App.jsx',
        type: 'smoothstep',
        data: { edgeType: 'import' }
      },
      {
        id: 'MainPage->GraphViewer',
        source: 'MainPage.jsx',
        target: 'GraphViewer.jsx',
        type: 'smoothstep',
        data: { edgeType: 'import' }
      },
      {
        id: 'MainPage->DetailPanel',
        source: 'MainPage.jsx',
        target: 'DetailPanel.jsx',
        type: 'smoothstep',
        data: { edgeType: 'import' }
      },
      {
        id: 'App->utils',
        source: 'App.jsx',
        target: 'utils.js',
        type: 'smoothstep',
        data: { edgeType: 'import' }
      },
      {
        id: 'utils->config',
        source: 'utils.js',
        target: 'config.js',
        type: 'smoothstep',
        data: { edgeType: 'import' }
      }
    ]
  };

  // 상태 관리
  const [projectPath, setProjectPath] = useState(null);
  const [graphData, setGraphData] = useState(sampleGraphData); // 샘플 데이터로 초기화
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [filterOptions, setFilterOptions] = useState({});
  const [currentLayout, setCurrentLayout] = useState('dagre'); // Dagre를 기본값으로 설정
  const [aiAnalysis, setAiAnalysis] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [settings, setSettings] = useState({
    theme: 'light',
    animations: true,
    cacheSize: 1000,
    maxNodes: 1000,
    hardwareAcceleration: true,
    ai: {
      openai: { apiKey: '', model: 'gpt-4' },
      anthropic: { apiKey: '', model: 'claude-3-sonnet' },
      ollama: { endpoint: 'http://localhost:11434/api', model: 'llama2' }
    }
  });
  const [connectionStatus, setConnectionStatus] = useState({});

  // Electron API 사용 가능성 체크
  const isElectronAvailable = typeof window !== 'undefined' && window.electronAPI;
  
  // 테스트 모드 체크
  const isTestMode = process.env.NODE_ENV === 'test' || window.__TEST_MODE__;

  // graphData 상태 변경 모니터링
  useEffect(() => {
    console.log('MainPage: graphData 상태 변경됨:', {
      nodes: graphData.nodes.length,
      edges: graphData.edges.length,
      firstNode: graphData.nodes[0]
    });
  }, [graphData]);

  // 샘플 데이터에 Dagre 레이아웃 자동 적용
  useEffect(() => {
    const applyDagreToSample = async () => {
      if (graphData.nodes.length === 0) {
        console.log('MainPage: 노드 없음, Dagre 적용 건너뜀');
        return;
      }

      console.log('🎯 MainPage: 샘플 데이터 확인됨:', {
        nodes: graphData.nodes.length,
        firstNode: graphData.nodes[0]?.id,
        isElectronAvailable
      });

      if (!isElectronAvailable) {
        console.log('MainPage: Electron API 없음, 클라이언트 사이드 Dagre 레이아웃 적용 건너뜀');
        // 일단 현재 샘플 데이터 그대로 사용 (이미 다른 위치로 설정됨)
        return;
      }

      try {
        console.log('🎯 MainPage: 샘플 데이터에 Dagre 레이아웃 적용 중...');
        
        // 샘플 데이터를 GraphService 형식으로 변환
        const dependencyGraph = {
          nodes: graphData.nodes.map(node => ({
            id: node.id,
            name: node.data.label,
            filePath: node.data.filePath,
            type: node.data.nodeType,
            exports: node.data.exports,
            imports: node.data.imports,
            components: node.data.components,
            functions: node.data.functions,
            metadata: node.data.metadata
          })),
          edges: graphData.edges.map(edge => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            type: edge.data?.edgeType || 'import'
          }))
        };

        const layoutResult = await window.electronAPI.graph.generateLayout(
          { dependencyGraph },
          'dagre'
        );

        if (layoutResult.success && layoutResult.nodes && layoutResult.nodes.length > 0) {
          console.log('✅ MainPage: Dagre 레이아웃 적용 성공!');
          console.log('📍 MainPage: 새로운 노드 위치들:');
          layoutResult.nodes.forEach(node => {
            console.log(`  ${node.id}: (${node.position.x}, ${node.position.y})`);
          });

          setGraphData({
            nodes: layoutResult.nodes || [],
            edges: layoutResult.edges || []
          });
        } else {
          console.warn('⚠️ MainPage: Dagre 레이아웃 적용 실패, 원본 샘플 데이터 유지:', layoutResult.error);
          // 실패하면 원본 샘플 데이터 그대로 유지 (setGraphData 호출하지 않음)
        }
      } catch (error) {
        console.error('❌ MainPage: Dagre 레이아웃 적용 중 오류:', error);
      }
    };

    // 컴포넌트 마운트 후 잠시 대기 후 적용 (React Flow 초기화 대기)
    const timer = setTimeout(applyDagreToSample, 1000);
    return () => clearTimeout(timer);
  }, []); // 한 번만 실행

  // 프로젝트 폴더 선택
  const handleSelectFolder = useCallback(async () => {
    if (!isElectronAvailable) {
      console.warn('Electron API를 사용할 수 없습니다');
      return;
    }

    try {
      const folderPath = await window.electronAPI.fileSystem.selectFolder();
      console.log('MainPage: 폴더 선택됨:', folderPath);
      if (folderPath) {
        setProjectPath(folderPath);
        await analyzeProject(folderPath);
      }
    } catch (error) {
      console.error('폴더 선택 실패:', error);
    }
  }, [isElectronAvailable, currentLayout]);

  // 프로젝트 분석 - useCallback 제거하여 순환 의존성 해결
  const analyzeProject = async (folderPath) => {
    if (!isElectronAvailable) return;

    setIsLoading(true);
    setLoadingStep('프로젝트를 분석하고 있습니다...');

    try {
      // 1. 프로젝트 분석 (파일 스캔, 파싱, 의존성 분석을 한번에)
      const projectResult = await window.electronAPI.project.analyzeProject(folderPath);
      
      if (!projectResult.success) {
        throw new Error(projectResult.error || '프로젝트 분석에 실패했습니다');
      }

      if (!projectResult.dependencyGraph || 
          !projectResult.dependencyGraph.nodes || 
          projectResult.dependencyGraph.nodes.length === 0) {
        throw new Error('분석할 파일을 찾을 수 없습니다');
      }

      console.log('프로젝트 분석 완료:', {
        nodes: projectResult.dependencyGraph.nodes.length,
        edges: projectResult.dependencyGraph.edges.length
      });

      // 2. 그래프 레이아웃 생성
      setLoadingStep('그래프 레이아웃을 생성하고 있습니다...');
      const layoutResult = await window.electronAPI.graph.generateLayout(
        { dependencyGraph: projectResult.dependencyGraph },
        currentLayout
      );

      if (!layoutResult.success) {
        throw new Error(layoutResult.error || '레이아웃 생성에 실패했습니다');
      }

      // 3. 그래프 데이터 설정
      console.log('MainPage: 그래프 데이터 설정 - nodes:', layoutResult.nodes?.length, ', edges:', layoutResult.edges?.length);
      if (layoutResult.nodes && layoutResult.nodes.length > 0) {
        console.log('MainPage: 첫 번째 노드:', JSON.stringify(layoutResult.nodes[0], null, 2));
        
        // 노드 위치 분석
        const positions = new Map();
        layoutResult.nodes.forEach(node => {
          const key = `${Math.round(node.position?.x || 0)},${Math.round(node.position?.y || 0)}`;
          if (!positions.has(key)) {
            positions.set(key, 0);
          }
          positions.set(key, positions.get(key) + 1);
        });
        
        console.log('MainPage: 고유 위치 수:', positions.size);
        if (positions.size === 1 && layoutResult.nodes.length > 1) {
          console.error('⚠️ MainPage: 모든 노드가 같은 위치에 있습니다!');
          positions.forEach((count, pos) => {
            console.error(`  위치 ${pos}: ${count}개 노드`);
          });
        }
      }
      
      const newGraphData = {
        nodes: layoutResult.nodes || [],
        edges: layoutResult.edges || []
      };
      
      console.log('MainPage: setGraphData 호출 전, 새 데이터:', newGraphData);
      setGraphData(newGraphData);
      console.log('MainPage: setGraphData 호출 완료');

      setLoadingStep('완료!');
      
    } catch (error) {
      console.error('프로젝트 분석 실패:', error);
      setLoadingStep(`오류: ${error.message}`);
      
      // 에러 상태를 잠시 표시 후 초기화
      setTimeout(() => {
        setIsLoading(false);
        setLoadingStep('');
      }, 3000);
      return;
    }

    setIsLoading(false);
    setLoadingStep('');
  };

  // 노드 클릭 핸들러
  const handleNodeClick = useCallback((node, selectedNodesList) => {
    setSelectedNode(node);
    setSelectedNodes(selectedNodesList);
    setShowDetailPanel(true);
    
    // AI 분석 결과 초기화
    setAiAnalysis(prev => ({ ...prev, [node.id]: null }));
  }, []);

  // 노드 선택 핸들러
  const handleNodeSelect = useCallback((nodeIds) => {
    if (nodeIds.length === 1) {
      const node = graphData.nodes.find(n => n.id === nodeIds[0]);
      if (node) {
        setSelectedNode(node);
        setSelectedNodes([node]);
        setShowDetailPanel(true);
      }
    } else if (nodeIds.length > 1) {
      const nodes = graphData.nodes.filter(n => nodeIds.includes(n.id));
      setSelectedNodes(nodes);
      setSelectedNode(null);
      setShowDetailPanel(true);
    } else {
      setSelectedNode(null);
      setSelectedNodes([]);
      setShowDetailPanel(false);
    }
  }, [graphData.nodes]);

  // 레이아웃 변경 핸들러
  const handleLayoutChange = useCallback(async (layoutType) => {
    if (!isElectronAvailable || !projectPath || graphData.nodes.length === 0) return;

    setCurrentLayout(layoutType);
    setIsLoading(true);
    setLoadingStep('레이아웃을 변경하고 있습니다...');

    try {
      // 현재 그래프 데이터를 사용하여 새 레이아웃 생성
      const dependencyGraph = {
        nodes: graphData.nodes.map(node => ({
          id: node.id,
          name: node.data.label,
          filePath: node.data.filePath,
          type: node.data.nodeType,
          exports: node.data.exports,
          imports: node.data.imports,
          components: node.data.components,
          functions: node.data.functions,
          metadata: node.data.metadata
        })),
        edges: graphData.edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: edge.data?.edgeType || 'import'
        }))
      };

      const layoutResult = await window.electronAPI.graph.generateLayout(
        { dependencyGraph },
        layoutType
      );

      if (layoutResult.success) {
        setGraphData({
          nodes: layoutResult.nodes || [],
          edges: layoutResult.edges || []
        });
      }
    } catch (error) {
      console.error('레이아웃 변경 실패:', error);
    }

    setIsLoading(false);
    setLoadingStep('');
  }, [isElectronAvailable, projectPath, graphData, currentLayout]);

  // AI 분석 핸들러
  const handleAnalyzeWithAI = useCallback(async (node) => {
    if (!isElectronAvailable || !node.data.filePath) return;

    setIsAnalyzing(true);

    try {
      const content = await window.electronAPI.fileSystem.readFile(node.data.filePath);
      const analysisResult = await window.electronAPI.ai.analyzeCode(content, {
        analysisType: 'detailed',
        filePath: node.data.filePath,
        fileType: node.data.nodeType
      });

      if (analysisResult.success) {
        setAiAnalysis(prev => ({
          ...prev,
          [node.id]: analysisResult
        }));
      } else {
        console.error('AI 분석 실패:', analysisResult.error);
      }
    } catch (error) {
      console.error('AI 분석 중 오류:', error);
    }

    setIsAnalyzing(false);
  }, [isElectronAvailable]);

  // 설정 변경 핸들러
  const handleSettingsChange = useCallback(async (newSettings) => {
    setSettings(newSettings);
    
    if (isElectronAvailable) {
      try {
        // AI 공급자 설정 업데이트
        if (newSettings.ai) {
          for (const [provider, config] of Object.entries(newSettings.ai)) {
            if (config.apiKey || provider === 'ollama') {
              await window.electronAPI.ai.setProvider(provider, config);
            }
          }
        }
      } catch (error) {
        console.error('설정 저장 실패:', error);
      }
    }
  }, [isElectronAvailable]);

  // 연결 테스트 핸들러
  const handleTestConnection = useCallback(async (provider) => {
    if (!isElectronAvailable) return;

    try {
      const result = await window.electronAPI.ai.testConnection(provider);
      setConnectionStatus(prev => ({
        ...prev,
        [provider]: result
      }));
    } catch (error) {
      console.error('연결 테스트 실패:', error);
      setConnectionStatus(prev => ({
        ...prev,
        [provider]: { connected: false, error: error.message }
      }));
    }
  }, [isElectronAvailable]);

  // 테스트 모드에서 analyzeProject를 전역으로 노출
  useEffect(() => {
    if (isTestMode && typeof window !== 'undefined') {
      window.__testAnalyzeProject = analyzeProject;
      window.__testSetProjectPath = setProjectPath;
      window.__testGetGraphData = () => graphData;
    }
  }, [analyzeProject, graphData]);

  return (
    <div className="main-page h-screen flex flex-col bg-gray-50">
      {/* 상단 툴바 */}
      <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-gray-800">CodeVisor</h1>
          
          {projectPath && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FileText className="w-4 h-4" />
              <span className="truncate max-w-64">{projectPath}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* 상태 표시 */}
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <RotateCcw className="w-4 h-4 animate-spin" />
              <span>{loadingStep}</span>
            </div>
          )}

          {/* 프로젝트 열기 */}
          <button
            onClick={handleSelectFolder}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <FolderOpen className="w-4 h-4" />
            프로젝트 열기
          </button>

          {/* 설정 */}
          <button
            onClick={() => setShowSettingsPanel(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="설정"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 그래프 영역 */}
        <div className={`flex-1 transition-all duration-300 ${showDetailPanel ? 'mr-80' : ''}`} style={{ height: '100%' }}>
          {/* GraphViewer를 항상 렌더링하되, 프로젝트 미선택 시 내부에서 안내 메시지 표시 */}
          {console.log('🔍 MainPage: 렌더링 중, GraphViewer 컴포넌트 사용')}
          {console.log('📊 MainPage: 현재 노드 수:', graphData.nodes?.length)}
          {console.log('MainPage 렌더링: graphData =', { 
            nodes: graphData.nodes.length, 
            edges: graphData.edges.length,
            firstNode: graphData.nodes[0]
          })}
          <GraphViewer
            initialNodes={graphData.nodes}
            initialEdges={graphData.edges}
            onNodeClick={handleNodeClick}
            onNodeSelect={handleNodeSelect}
            onLayoutChange={handleLayoutChange}
            onFilterChange={setFilterOptions}
            filterOptions={filterOptions}
            isLoading={isLoading}
          />
        </div>

        {/* 상세 정보 패널 */}
        {showDetailPanel && (
          <DetailPanel
            selectedNode={selectedNode}
            selectedNodes={selectedNodes}
            onClose={() => setShowDetailPanel(false)}
            onAnalyzeWithAI={handleAnalyzeWithAI}
            aiAnalysis={selectedNode ? aiAnalysis[selectedNode.id] : null}
            isAnalyzing={isAnalyzing}
            isVisible={showDetailPanel}
          />
        )}
      </div>

      {/* 설정 패널 */}
      <SettingsPanel
        isOpen={showSettingsPanel}
        onClose={() => setShowSettingsPanel(false)}
        settings={settings}
        onSettingsChange={handleSettingsChange}
        onTestConnection={handleTestConnection}
        connectionStatus={connectionStatus}
      />
    </div>
  );
};

export default MainPage;