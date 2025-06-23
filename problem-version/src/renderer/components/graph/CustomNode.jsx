/**
 * @brief React Flow용 커스텀 노드 컴포넌트
 * @details 파일 타입별로 다른 시각적 표현을 제공하는 노드
 * @author CodeVisor Team
 * @date 2025-06-20
 */

import React, { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { 
  FileText, 
  Component, 
  Settings, 
  TestTube, 
  Home,
  Code,
  AlertCircle,
  Info
} from 'lucide-react';

/**
 * @brief 파일 타입별 아이콘을 반환합니다
 * @param {string} nodeType 노드 타입
 * @param {string} className CSS 클래스
 */
const getNodeIcon = (nodeType, className = "w-4 h-4") => {
  const iconMap = {
    'component': <Component className={className} />,
    'module': <FileText className={className} />,
    'config': <Settings className={className} />,
    'test': <TestTube className={className} />,
    'index': <Home className={className} />,
    'function': <Code className={className} />,
    'default': <FileText className={className} />
  };
  
  return iconMap[nodeType] || iconMap.default;
};

/**
 * @brief 노드 타입별 색상을 반환합니다
 * @param {string} nodeType 노드 타입
 */
const getNodeColors = (nodeType) => {
  const colorMap = {
    'component': {
      bg: 'bg-blue-100',
      border: 'border-blue-300',
      text: 'text-blue-800',
      dot: 'bg-blue-500'
    },
    'module': {
      bg: 'bg-green-100',
      border: 'border-green-300',
      text: 'text-green-800',
      dot: 'bg-green-500'
    },
    'config': {
      bg: 'bg-purple-100',
      border: 'border-purple-300',
      text: 'text-purple-800',
      dot: 'bg-purple-500'
    },
    'test': {
      bg: 'bg-pink-100',
      border: 'border-pink-300',
      text: 'text-pink-800',
      dot: 'bg-pink-500'
    },
    'index': {
      bg: 'bg-yellow-100',
      border: 'border-yellow-300',
      text: 'text-yellow-800',
      dot: 'bg-yellow-500'
    },
    'default': {
      bg: 'bg-gray-100',
      border: 'border-gray-300',
      text: 'text-gray-800',
      dot: 'bg-gray-500'
    }
  };
  
  return colorMap[nodeType] || colorMap.default;
};

/**
 * @brief 커스텀 노드 컴포넌트
 * @param {Object} data 노드 데이터
 * @param {boolean} selected 선택 상태
 */
const CustomNode = memo(({ data, selected }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  
  const colors = getNodeColors(data.nodeType);
  const icon = getNodeIcon(data.nodeType);
  
  // 복잡도에 따른 노드 크기 계산
  const complexity = data.metadata?.complexity || 1;
  const nodeSize = Math.max(60, Math.min(120, 60 + complexity * 8));
  
  // 함수/컴포넌트 수에 따른 표시
  const functionCount = data.functions?.length || 0;
  const componentCount = data.components?.length || 0;
  const exportCount = data.exports?.length || 0;
  
  const handleMouseEnter = () => {
    setIsHovered(true);
    setShowTooltip(true);
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    setTimeout(() => setShowTooltip(false), 200);
  };

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 메인 노드 */}
      <div
        className={`
          rounded-lg border-2 transition-all duration-200 cursor-pointer
          ${colors.bg} ${colors.border} ${colors.text}
          ${selected ? 'ring-2 ring-blue-400 ring-offset-2' : ''}
          ${isHovered ? 'shadow-lg scale-105' : 'shadow-md'}
        `}
        style={{
          width: nodeSize,
          height: nodeSize,
          minWidth: '60px',
          minHeight: '60px',
          position: 'relative'
        }}
      >
        {/* 연결 핸들들 */}
        <Handle
          type="target"
          position={Position.Top}
          className="w-3 h-3 !bg-gray-400 !border-2 !border-white"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-3 h-3 !bg-gray-400 !border-2 !border-white"
        />
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 !bg-gray-400 !border-2 !border-white"
        />
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 !bg-gray-400 !border-2 !border-white"
        />

        {/* 노드 내용 */}
        <div className="flex flex-col items-center justify-center h-full p-2">
          {/* 아이콘 */}
          <div className="mb-1">
            {icon}
          </div>
          
          {/* 파일명 */}
          <div 
            className="text-xs font-bold text-center leading-tight text-gray-900"
            style={{ 
              fontSize: nodeSize > 80 ? '12px' : '10px',
              lineHeight: nodeSize > 80 ? '14px' : '12px',
              color: '#1a1a1a',
              textShadow: '0 1px 2px rgba(255,255,255,0.8)',
              fontWeight: '700'
            }}
          >
            {data.label}
          </div>
          
          {/* 메타 정보 (큰 노드일 때만 표시) */}
          {nodeSize > 90 && (
            <div className="flex gap-1 mt-1">
              {functionCount > 0 && (
                <span className="text-xs bg-white bg-opacity-70 px-1 rounded">
                  F{functionCount}
                </span>
              )}
              {componentCount > 0 && (
                <span className="text-xs bg-white bg-opacity-70 px-1 rounded">
                  C{componentCount}
                </span>
              )}
            </div>
          )}
        </div>

        {/* 복잡도 인디케이터 */}
        {complexity > 3 && (
          <div className="absolute -top-1 -right-1">
            <div className={`w-3 h-3 rounded-full ${colors.dot} flex items-center justify-center`}>
              <AlertCircle className="w-2 h-2 text-white" />
            </div>
          </div>
        )}

        {/* Export 인디케이터 */}
        {exportCount > 0 && (
          <div className="absolute -bottom-1 -right-1">
            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">{exportCount}</span>
            </div>
          </div>
        )}
      </div>

      {/* 툴팁 */}
      {showTooltip && (
        <div className="absolute z-50 p-3 bg-black bg-opacity-90 text-white text-xs rounded-lg shadow-lg pointer-events-none"
             style={{
               top: -10,
               left: nodeSize + 10,
               minWidth: '200px',
               maxWidth: '300px'
             }}>
          <div className="space-y-1">
            <div className="font-semibold text-blue-300">{data.label}</div>
            
            {data.filePath && (
              <div className="text-gray-300 truncate">{data.filePath}</div>
            )}
            
            <div className="flex gap-2 pt-1 border-t border-gray-600">
              <span className="text-gray-400">타입:</span>
              <span className="text-blue-300 capitalize">{data.nodeType}</span>
            </div>
            
            {complexity > 1 && (
              <div className="flex gap-2">
                <span className="text-gray-400">복잡도:</span>
                <span className="text-yellow-300">{complexity}</span>
              </div>
            )}
            
            {functionCount > 0 && (
              <div className="flex gap-2">
                <span className="text-gray-400">함수:</span>
                <span className="text-green-300">{functionCount}개</span>
              </div>
            )}
            
            {componentCount > 0 && (
              <div className="flex gap-2">
                <span className="text-gray-400">컴포넌트:</span>
                <span className="text-blue-300">{componentCount}개</span>
              </div>
            )}
            
            {exportCount > 0 && (
              <div className="flex gap-2">
                <span className="text-gray-400">Export:</span>
                <span className="text-purple-300">{exportCount}개</span>
              </div>
            )}
            
            {data.imports?.length > 0 && (
              <div className="flex gap-2">
                <span className="text-gray-400">Import:</span>
                <span className="text-orange-300">{data.imports.length}개</span>
              </div>
            )}
          </div>
          
          {/* 툴팁 화살표 */}
          <div className="absolute top-4 -left-1 w-2 h-2 bg-black bg-opacity-90 transform rotate-45"></div>
        </div>
      )}
    </div>
  );
});

CustomNode.displayName = 'CustomNode';

export default CustomNode;