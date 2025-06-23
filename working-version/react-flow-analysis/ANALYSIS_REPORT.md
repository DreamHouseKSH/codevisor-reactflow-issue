# React Flow 노드 클러스터링 문제 분석 보고서

## 문제 현상
- CodeVisor 앱에서 노드들이 모두 한 위치에 클러스터링됨 (transform: matrix(1, 0, 0, 1, 0, 0))
- 미니맵에서는 올바른 위치를 표시하지만 메인 뷰에서는 모든 노드가 겹침
- 노드 드래그가 작동하지 않음

## 핵심 차이점 분석

### 1. 초기화 방식 차이

**테스트 버전 (정상 작동):**
```javascript
const [nodes, setNodes, onNodesChange] = useNodesState(testNodes);
```

**실제 CodeVisor (문제 발생):**
```javascript
const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
```

### 2. 데이터 흐름 차이

**테스트 버전:**
- 정적 데이터 (`testNodes`) 직접 사용
- 즉시 위치 정보가 적용됨

**실제 CodeVisor:**
- `props.initialNodes`를 통해 데이터 전달받음
- `useEffect`를 통해 `initialNodes` 변경시 업데이트
- Electron API 호출 후 데이터 업데이트

### 3. 위치 동기화 문제

**의심되는 원인:**
1. **비동기 데이터 로딩**: Electron API에서 받은 데이터의 position 정보가 React Flow 렌더링 시점에 제대로 전달되지 않음
2. **useEffect 타이밍**: `initialNodes` 업데이트와 React Flow 렌더링 사이의 동기화 문제
3. **Transform 계산 오류**: React Flow 내부적으로 position을 transform으로 변환하는 과정에서 문제

## 검증 필요 사항

### A. 데이터 무결성 확인
1. `initialNodes`에 올바른 position 값이 포함되어 있는지
2. `setNodes` 호출 직후 React state가 올바르게 업데이트되는지
3. React Flow 내부 state와 props의 동기화 상태

### B. 렌더링 사이클 확인
1. React Flow가 position 정보를 transform으로 올바르게 변환하는지
2. DOM 요소가 올바른 transform 값을 가지는지
3. 미니맵과 메인 뷰 사이의 데이터 소스 차이

### C. React Flow v12 호환성
1. 버전 업그레이드로 인한 position 처리 방식 변경
2. useNodesState 훅의 동작 변경
3. ReactFlowProvider 설정 문제

## 디버깅 전략

### 1. 실시간 위치 모니터링
```javascript
useEffect(() => {
  const interval = setInterval(() => {
    console.log('React State:', nodes.map(n => ({id: n.id, pos: n.position})));
    
    const domNodes = document.querySelectorAll('.react-flow__node');
    domNodes.forEach(node => {
      const id = node.getAttribute('data-id');
      const transform = getComputedStyle(node).transform;
      console.log(`DOM ${id}:`, transform);
    });
  }, 1000);
  
  return () => clearInterval(interval);
}, [nodes]);
```

### 2. 미니맵 데이터 소스 확인
미니맵이 올바른 위치를 표시한다는 것은 데이터 자체는 정상이라는 의미. 
메인 뷰의 렌더링 문제일 가능성이 높음.

### 3. 강제 리렌더링 테스트
```javascript
const forceUpdate = () => {
  setNodes(nodes => [...nodes]);
};
```

## 추천 해결 방안

### 방안 1: 지연 렌더링
```javascript
const [isReady, setIsReady] = useState(false);

useEffect(() => {
  if (initialNodes.length > 0) {
    setTimeout(() => {
      setNodes(initialNodes);
      setIsReady(true);
    }, 100);
  }
}, [initialNodes]);

return isReady ? <ReactFlow ... /> : <Loading />;
```

### 방안 2: Transform 직접 제어
```javascript
useEffect(() => {
  if (nodes.length > 0) {
    setTimeout(() => {
      nodes.forEach(node => {
        const element = document.querySelector(`[data-id="${node.id}"]`);
        if (element) {
          element.style.transform = `translate(${node.position.x}px, ${node.position.y}px)`;
        }
      });
    }, 100);
  }
}, [nodes]);
```

### 방안 3: ReactFlow 재초기화
```javascript
const [key, setKey] = useState(0);

const resetFlow = () => {
  setKey(prev => prev + 1);
};

return <ReactFlow key={key} ... />;
```

## 결론

문제의 핵심은 React Flow의 position → transform 변환 과정에서 발생하는 동기화 오류로 보입니다. 
미니맵이 정상 작동한다는 점에서 데이터는 올바르지만, 메인 뷰의 DOM 렌더링에 문제가 있습니다.

우선순위: 방안 2 (Transform 직접 제어) → 방안 1 (지연 렌더링) → 방안 3 (재초기화)