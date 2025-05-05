import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ParkingLot, ParkingZone, ParkingSpot } from '@/types';
import { getParkingLotList } from '@/api/parkingLot';
import { getParkingZoneList } from '@/api/parkingZone';
import { getParkingSpotList } from '@/api/parkingSpot';
import { ElMessage } from 'element-plus';

export function useSpotMonitor() {
  // 状态数据
  const parkingLots = ref<ParkingLot[]>([]);
  const parkingZones = ref<ParkingZone[]>([]);
  const parkingSpots = ref<ParkingSpot[]>([]);
  const selectedLotId = ref<number | null>(null);
  const selectedZoneId = ref<number | null>(null);
  const loading = ref(false);
  const refreshInterval = ref<number | null>(null);
  const autoRefresh = ref(true);
  const refreshRate = ref(30); // 秒

  // 计算属性：按停车场分组的停车位
  const spotsByLot = computed(() => {
    const result: Record<number, ParkingSpot[]> = {};
    
    parkingSpots.value.forEach(spot => {
      if (!result[spot.parkingLotId]) {
        result[spot.parkingLotId] = [];
      }
      result[spot.parkingLotId].push(spot);
    });
    
    return result;
  });

  // 计算属性：按停车区分组的停车位
  const spotsByZone = computed(() => {
    const result: Record<number, ParkingSpot[]> = {};
    
    parkingSpots.value.forEach(spot => {
      if (!result[spot.parkingZoneId]) {
        result[spot.parkingZoneId] = [];
      }
      result[spot.parkingZoneId].push(spot);
    });
    
    return result;
  });

  // 计算属性：当前选中停车场的停车位
  const spotsInSelectedLot = computed(() => {
    if (!selectedLotId.value) return [];
    return parkingSpots.value.filter(spot => spot.parkingLotId === selectedLotId.value);
  });

  // 计算属性：当前选中停车区的停车位
  const spotsInSelectedZone = computed(() => {
    if (!selectedZoneId.value) return [];
    return parkingSpots.value.filter(spot => spot.parkingZoneId === selectedZoneId.value);
  });

  // 计算属性：各种状态的停车位统计
  const spotStats = computed(() => {
    const stats = {
      total: parkingSpots.value.length,
      available: 0,
      occupied: 0,
      reserved: 0,
      maintenance: 0
    };

    parkingSpots.value.forEach(spot => {
      switch (spot.status) {
        case 'available':
          stats.available++;
          break;
        case 'occupied':
          stats.occupied++;
          break;
        case 'reserved':
          stats.reserved++;
          break;
        case 'maintenance':
          stats.maintenance++;
          break;
      }
    });

    return stats;
  });

  // 加载停车场列表
  const loadParkingLots = async () => {
    try {
      const res = await getParkingLotList({});
      if (res && res.data) {
        parkingLots.value = res.data.items || res.data || [];
      }
    } catch (error) {
      console.error('加载停车场列表失败:', error);
      ElMessage.error('加载停车场列表失败');
    }
  };

  // 加载停车区列表
  const loadParkingZones = async (lotId?: number) => {
    try {
      const params = lotId ? { parkingLotId: lotId } : {};
      const res = await getParkingZoneList(params);
      if (res && res.data) {
        parkingZones.value = res.data.items || res.data || [];
      }
    } catch (error) {
      console.error('加载停车区列表失败:', error);
      ElMessage.error('加载停车区列表失败');
    }
  };

  // 加载停车位列表
  const loadParkingSpots = async (params: any = {}) => {
    loading.value = true;
    try {
      const res = await getParkingSpotList(params);
      if (res && res.data) {
        parkingSpots.value = res.data.items || res.data || [];
      }
    } catch (error) {
      console.error('加载停车位列表失败:', error);
      ElMessage.error('加载停车位列表失败');
    } finally {
      loading.value = false;
    }
  };

  // 选择停车场
  const selectParkingLot = async (lotId: number) => {
    selectedLotId.value = lotId;
    selectedZoneId.value = null;
    await loadParkingZones(lotId);
    await loadParkingSpots({ parkingLotId: lotId });
  };

  // 选择停车区
  const selectParkingZone = async (zoneId: number) => {
    selectedZoneId.value = zoneId;
    await loadParkingSpots({ parkingZoneId: zoneId });
  };

  // 刷新所有数据
  const refreshData = async () => {
    loading.value = true;
    try {
      await loadParkingLots();
      
      if (selectedLotId.value) {
        await loadParkingZones(selectedLotId.value);
      } else {
        await loadParkingZones();
      }
      
      if (selectedZoneId.value) {
        await loadParkingSpots({ parkingZoneId: selectedZoneId.value });
      } else if (selectedLotId.value) {
        await loadParkingSpots({ parkingLotId: selectedLotId.value });
      } else {
        await loadParkingSpots();
      }
      
      console.log('数据已刷新:', new Date().toLocaleTimeString());
    } catch (error) {
      console.error('刷新数据失败:', error);
    } finally {
      loading.value = false;
    }
  };

  // 切换自动刷新
  const toggleAutoRefresh = (value: boolean) => {
    autoRefresh.value = value;
    
    if (value) {
      startAutoRefresh();
    } else {
      stopAutoRefresh();
    }
  };

  // 设置刷新频率
  const setRefreshRate = (seconds: number) => {
    refreshRate.value = seconds;
    
    if (autoRefresh.value) {
      stopAutoRefresh();
      startAutoRefresh();
    }
  };

  // 开始自动刷新
  const startAutoRefresh = () => {
    stopAutoRefresh(); // 先停止已有的定时器
    
    refreshInterval.value = window.setInterval(() => {
      refreshData();
    }, refreshRate.value * 1000);
    
    console.log(`自动刷新已启动，频率: ${refreshRate.value}秒`);
  };

  // 停止自动刷新
  const stopAutoRefresh = () => {
    if (refreshInterval.value !== null) {
      window.clearInterval(refreshInterval.value);
      refreshInterval.value = null;
      console.log('自动刷新已停止');
    }
  };

  // 生命周期钩子：组件挂载时
  onMounted(async () => {
    await refreshData();
    
    if (autoRefresh.value) {
      startAutoRefresh();
    }
  });

  // 生命周期钩子：组件卸载时
  onUnmounted(() => {
    stopAutoRefresh();
  });

  return {
    parkingLots,
    parkingZones,
    parkingSpots,
    selectedLotId,
    selectedZoneId,
    loading,
    autoRefresh,
    refreshRate,
    spotsByLot,
    spotsByZone,
    spotsInSelectedLot,
    spotsInSelectedZone,
    spotStats,
    loadParkingLots,
    loadParkingZones,
    loadParkingSpots,
    selectParkingLot,
    selectParkingZone,
    refreshData,
    toggleAutoRefresh,
    setRefreshRate
  };
} 