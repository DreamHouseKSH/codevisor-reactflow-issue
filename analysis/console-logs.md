# Console Logs from Problem Instance

## Node Position Logging
```
🔄 GraphViewer: initialNodes 변경됨: 8 개 노드
📍 GraphViewer: 첫 번째 노드 위치: {x: 200, y: 50}
🎯 GraphViewer: 즉시 노드 설정
📍 노드 MainPage.jsx: position(200, 50)
📍 노드 App.jsx: position(100, 150)
📍 노드 GraphViewer.jsx: position(300, 150)
📍 노드 DetailPanel.jsx: position(500, 150)
📍 노드 GraphService.js: position(200, 250)
📍 노드 CustomNode.jsx: position(400, 250)
📍 노드 utils.js: position(150, 350)
📍 노드 config.js: position(350, 350)
```

## React Flow State vs DOM Reality
```
GraphViewer 렌더링 - nodes: 8, edges: 7
GraphViewer 렌더링 - filteredNodes: 8, styledNodes: 8
GraphViewer: 렌더링할 첫 번째 노드: {
  "id": "MainPage.jsx",
  "type": "custom",
  "position": {"x": 200, "y": 50},
  "data": {...},
  "draggable": true,
  "selected": false,
  "style": {...}
}
```

## DOM Transform Analysis
All nodes in DOM show:
```css
.react-flow__node {
  transform: matrix(1, 0, 0, 1, 0, 0);
  /* Should be: translate(200px, 50px) for first node */
}
```

## Position Duplicate Warning
```
⚠️ 노드 위치 중복 발견! 위치 0,0에 8개 노드: [
  "MainPage.jsx", "App.jsx", "GraphViewer.jsx", 
  "DetailPanel.jsx", "GraphService.js", "CustomNode.jsx", 
  "utils.js", "config.js"
]
```

This confirms all nodes end up at position (0,0) despite having different position data in React state.