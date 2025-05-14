/**
 * 停车管理相关工具函数
 */

/**
 * 从停车位编号中提取停车场标识
 * @param spotNumber 停车位编号，如 "A-001"
 * @returns 停车场标识，如 "A"
 */
export function extractLotIdentifier(spotNumber: string): string | null {
  if (!spotNumber) return null;
  
  // 方法1: 使用连字符分隔，取第一部分
  if (spotNumber.includes('-')) {
    return spotNumber.split('-')[0];
  }
  
  // 方法2: 取第一个字符
  return spotNumber.charAt(0);
}

/**
 * 根据停车位编号和停车场列表关联停车位与停车场
 * @param spots 停车位选项
 * @param lots 停车场选项
 * @returns 添加了lotId的停车位选项
 */
export function associateSpotsWithLots(
  spots: { label: string; value: number }[],
  lots: { label: string; value: number }[]
): { label: string; value: number; lotId?: number }[] {
  if (!spots.length || !lots.length) return spots.map(spot => ({ ...spot }));
  
  return spots.map(spot => {
    const identifier = extractLotIdentifier(spot.label || '');
    if (!identifier) return { ...spot };
    
    // 尝试匹配停车场
    const matchedLot = lots.find(lot => 
      lot.label.startsWith(identifier) || 
      lot.label.charAt(0) === identifier
    );
    
    return {
      ...spot,
      lotId: matchedLot?.value
    };
  });
}

/**
 * 根据选中的停车场ID过滤停车位
 * @param spots 带lotId的停车位选项
 * @param selectedLotId 选中的停车场ID
 * @param showAllIfEmpty 当没有匹配项时是否显示所有选项
 * @returns 过滤后的停车位选项
 */
export function filterSpotsByLot(
  spots: { label: string; value: number; lotId?: number }[],
  selectedLotId?: number,
  showAllIfEmpty: boolean = true
): { label: string; value: number; lotId?: number }[] {
  if (!selectedLotId) return spots;
  
  const filtered = spots.filter(spot => spot.lotId === selectedLotId);
  
  // 如果没有匹配项且需要显示全部，则返回所有选项
  if (filtered.length === 0 && showAllIfEmpty) {
    return spots;
  }
  
  return filtered;
} 