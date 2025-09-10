import React from 'react';

interface WuxingDiagramProps {
  elements: {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
  };
  dayMaster?: string; // 日主天干，用于计算十神
  yongShenInfo?: {
    primaryYongShen: string;
    jiShen: string[];
  };
}

const WuxingDiagram: React.FC<WuxingDiagramProps> = ({ elements, dayMaster, yongShenInfo }) => {
  const centerX = 160;
  const centerY = 160;
  const radius = 100;
  
  // 五行在圆周上的位置（从上方开始，顺时针）
  const wuxingOrder = ['wood', 'fire', 'earth', 'metal', 'water'];
  const positions = wuxingOrder.map((element, index) => {
    const angle = (index * 72 - 90) * (Math.PI / 180); // 72度间隔，从顶部开始
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    return {
      element,
      x,
      y,
      angle: angle * (180 / Math.PI)
    };
  });

  // 五行颜色（与八字排盘配色完全一致）
  const colors = {
    wood: '#10b981',   // emerald-500
    fire: '#f43f5e',   // rose-500  
    earth: '#d97706',  // amber-600 (更接近八字排盘的土色)
    metal: '#eab308',  // yellow-500 
    water: '#0ea5e9'   // sky-500
  };

  // 五行名称映射
  const elementNames = {
    wood: '木',
    fire: '火',
    earth: '土',
    metal: '金',
    water: '水'
  };

  // 根据日主计算十神
  const getTenGod = (element: string): string => {
    if (!dayMaster) return '';
    
    // 日主五行映射
    const dayMasterElement = (() => {
      if (['甲', '乙'].includes(dayMaster)) return 'wood';
      if (['丙', '丁'].includes(dayMaster)) return 'fire';
      if (['戊', '己'].includes(dayMaster)) return 'earth';
      if (['庚', '辛'].includes(dayMaster)) return 'metal';
      if (['壬', '癸'].includes(dayMaster)) return 'water';
      return '';
    })();

    // 十神关系映射
    const tenGodMap: { [key: string]: { [key: string]: string } } = {
      wood: { wood: '比劫', fire: '食伤', earth: '财才', metal: '官杀', water: '印枭' },
      fire: { wood: '印枭', fire: '比劫', earth: '食伤', metal: '财才', water: '官杀' },
      earth: { wood: '官杀', fire: '印枭', earth: '比劫', metal: '食伤', water: '财才' },
      metal: { wood: '财才', fire: '官杀', earth: '印枭', metal: '比劫', water: '食伤' },
      water: { wood: '食伤', fire: '财才', earth: '官杀', metal: '印枭', water: '比劫' }
    };

    return tenGodMap[dayMasterElement]?.[element] || '';
  };

  // 五行中文到英文的映射
  const wuxingMap: { [key: string]: string } = {
    '木': 'wood',
    '火': 'fire', 
    '土': 'earth',
    '金': 'metal',
    '水': 'water'
  };

  // 判断五行的用神属性
  const getYongShenType = (elementKey: string): string => {
    if (!yongShenInfo) return '';
    
    const elementName = elementNames[elementKey as keyof typeof elementNames];
    
    if (yongShenInfo.primaryYongShen === elementName) {
      return 'yongshen'; // 用神
    }
    
    if (yongShenInfo.jiShen.includes(elementName)) {
      return 'jishen'; // 忌神
    }
    
    return ''; // 普通五行
  };

  return (
    <div className="bg-white dark:bg-slate-800/60 rounded-lg p-4 border border-gray-200 dark:border-slate-600">
      <h5 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3 flex items-center gap-1">
        <span>📊</span> 五行数值分析
      </h5>
      
      <svg viewBox="0 0 320 320" className="w-full h-auto max-w-sm mx-auto">
        {/* 中心五边形数值分析图 */}
        {(() => {
          const maxValue = Math.max(...Object.values(elements), 1); // 避免除以0
          const centerRadius = 80;
          
          // 计算五边形各顶点坐标（用于网格线）
          const gridPoints = wuxingOrder.map((element, index) => {
            const angle = (index * 72 - 90) * (Math.PI / 180);
            return {
              x: centerX + centerRadius * Math.cos(angle),
              y: centerY + centerRadius * Math.sin(angle),
              angle
            };
          });
          
          // 计算实际数值的五边形各顶点
          const pentagonPoints = wuxingOrder.map((element, index) => {
            const angle = (index * 72 - 90) * (Math.PI / 180);
            const elementKey = element as keyof typeof elements;
            const value = elements[elementKey];
            const normalizedValue = value / maxValue;
            const r = centerRadius * normalizedValue;
            
            return {
              x: centerX + r * Math.cos(angle),
              y: centerY + r * Math.sin(angle),
              value,
              color: colors[elementKey]
            };
          });
          
          // 生成五边形路径
          const pathData = pentagonPoints.map((point, index) => 
            `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
          ).join(' ') + ' Z';
          
          return (
            <g>
              {/* 蜘蛛网格线 - 同心五边形 */}
              {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale, scaleIndex) => {
                const scaledPoints = gridPoints.map(point => ({
                  x: centerX + (point.x - centerX) * scale,
                  y: centerY + (point.y - centerY) * scale
                }));
                const gridPath = scaledPoints.map((point, index) => 
                  `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
                ).join(' ') + ' Z';
                
                return (
                  <path
                    key={`grid-${scaleIndex}`}
                    d={gridPath}
                    fill="none"
                    stroke="#d1d5db"
                    strokeWidth="1"
                    opacity="0.5"
                  />
                );
              })}
              
              {/* 蜘蛛网格线 - 从中心到顶点的射线 */}
              {gridPoints.map((point, index) => (
                <line
                  key={`ray-${index}`}
                  x1={centerX}
                  y1={centerY}
                  x2={point.x}
                  y2={point.y}
                  stroke="#d1d5db"
                  strokeWidth="1"
                  opacity="0.5"
                />
              ))}
              
              {/* 五边形数值区域 */}
              <path
                d={pathData}
                fill="rgba(139, 92, 246, 0.3)"
                stroke="rgba(139, 92, 246, 0.8)"
                strokeWidth="3"
              />
              
              {/* 数值点 */}
              {pentagonPoints.map((point, index) => (
                <g key={index}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="5"
                    fill={point.color}
                    stroke="white"
                    strokeWidth="2"
                  />
                  {/* 数值标签 */}
                  {point.value > 0 && (
                    <text
                      x={point.x}
                      y={point.y - 12}
                      textAnchor="middle"
                      className="text-sm font-bold"
                      style={{ 
                        fontSize: '14px',
                        fill: point.color,
                        fontFamily: 'system-ui, -apple-system, sans-serif'
                      }}
                    >
                      {point.value}
                    </text>
                  )}
                </g>
              ))}
            </g>
          );
        })()}

        {/* 五行元素圆圈和文字 */}
        {positions.map(({ element, x, y }) => {
          const elementKey = element as keyof typeof elements;
          const yongShenType = getYongShenType(elementKey);
          
          return (
            <g key={element}>
              {/* 五行底色圆圈 */}
              <circle
                cx={x}
                cy={y}
                r="30"
                fill={colors[elementKey]}
                stroke={yongShenType === 'yongshen' ? '#ffd700' : yongShenType === 'jishen' ? '#ff4444' : colors[elementKey]}
                strokeWidth={yongShenType ? "4" : "2"}
                opacity="0.9"
              />
              
              {/* 用神/忌神特殊标识环 */}
              {yongShenType && (
                <circle
                  cx={x}
                  cy={y}
                  r="35"
                  fill="none"
                  stroke={yongShenType === 'yongshen' ? '#ffd700' : '#ff4444'}
                  strokeWidth="2"
                  strokeDasharray={yongShenType === 'yongshen' ? "4,2" : "2,2"}
                  opacity="0.8"
                />
              )}
              
              {/* 元素名称 */}
              <text
                x={x}
                y={yongShenType ? y - 3 : y}
                textAnchor="middle"
                dominantBaseline="central"
                className="font-bold select-none"
                style={{ 
                  fontSize: '20px',
                  fill: 'white',
                  opacity: 1,
                  fontFamily: 'system-ui, -apple-system, sans-serif'
                }}
              >
                {elementNames[elementKey]}
              </text>

              {/* 用神/忌神标识文字 */}
              {yongShenType && (
                <text
                  x={x}
                  y={y + 10}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="font-bold select-none"
                  style={{ 
                    fontSize: '10px',
                    fill: yongShenType === 'yongshen' ? '#ffd700' : '#ffaaaa',
                    opacity: 1,
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                  }}
                >
                  {yongShenType === 'yongshen' ? '用神' : '忌神'}
                </text>
              )}

              {/* 十神标签 - 放在圆圈外面 */}
              {dayMaster && (
                <text
                  x={x}
                  y={['water', 'wood', 'fire'].includes(elementKey) ? y - 55 : y + 55}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="text-sm font-semibold"
                  style={{ 
                    fontSize: '14px',
                    fill: '#374151', // 深灰色，在浅色和深色主题下都清晰
                    opacity: 1,
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                  }}
                >
                  {getTenGod(elementKey)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default WuxingDiagram; 