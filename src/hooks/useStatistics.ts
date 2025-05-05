import { ref, computed, onMounted } from 'vue';
import { getParkingLotList } from '@/api/parkingLot';
import { getParkingSpotList } from '@/api/parkingSpot';
import { getParkingRecordList } from '@/api/parkingRecord';

export function useStatistics() {
  // 基础数据
  const parkingLots = ref<any[]>([]);
  const parkingSpots = ref<any[]>([]);
  const parkingRecords = ref<any[]>([]);
  const loading = ref(false);
  const dateRange = ref<[Date, Date]>([
    new Date(new Date().setDate(new Date().getDate() - 30)),
    new Date()
  ]);

  // 计算属性：停车场总数
  const totalLots = computed(() => parkingLots.value.length);

  // 计算属性：停车位总数
  const totalSpots = computed(() => parkingSpots.value.length);

  // 计算属性：可用停车位数
  const availableSpots = computed(() => 
    parkingSpots.value.filter(spot => spot.status === 'available').length
  );

  // 计算属性：已占用停车位数
  const occupiedSpots = computed(() => 
    parkingSpots.value.filter(spot => spot.status === 'occupied').length
  );

  // 计算属性：今日收入
  const todayIncome = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayRecords = parkingRecords.value.filter(record => {
      const recordDate = new Date(record.exitTime || new Date());
      recordDate.setHours(0, 0, 0, 0);
      return recordDate.getTime() === today.getTime() && record.fee;
    });
    
    const income = todayRecords.reduce((sum, record) => sum + (record.fee || 0), 0);
    return income.toFixed(2);
  });

  // 计算属性：本周收入
  const weeklyIncome = computed(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const weekStart = new Date(today.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);
    
    const weekRecords = parkingRecords.value.filter(record => {
      const recordDate = new Date(record.exitTime || new Date());
      return recordDate >= weekStart && record.fee;
    });
    
    const income = weekRecords.reduce((sum, record) => sum + (record.fee || 0), 0);
    return income.toFixed(2);
  });

  // 计算属性：本月收入
  const monthlyIncome = computed(() => {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const monthRecords = parkingRecords.value.filter(record => {
      const recordDate = new Date(record.exitTime || new Date());
      return recordDate >= monthStart && record.fee;
    });
    
    const income = monthRecords.reduce((sum, record) => sum + (record.fee || 0), 0);
    return income.toFixed(2);
  });

  // 计算属性：停车场利用率
  const lotUtilization = computed(() => {
    return parkingLots.value.map(lot => {
      const lotsSpots = parkingSpots.value.filter(spot => spot.parkingLotId === lot.id);
      const occupiedLotsSpots = lotsSpots.filter(spot => spot.status === 'occupied');
      const utilization = lotsSpots.length > 0 ? (occupiedLotsSpots.length / lotsSpots.length) * 100 : 0;
      
      return {
        id: lot.id,
        name: lot.name,
        total: lotsSpots.length,
        occupied: occupiedLotsSpots.length,
        utilization: Math.round(utilization * 100) / 100
      };
    });
  });

  // 计算属性：按小时统计的停车记录数量
  const hourlyDistribution = computed(() => {
    const hours = Array.from({length: 24}, (_, i) => i);
    const hourData = hours.map(hour => {
      const count = parkingRecords.value.filter(record => {
        const entryTime = new Date(record.entryTime);
        return entryTime.getHours() === hour;
      }).length;
      
      return {
        hour: `${hour}:00`,
        count
      };
    });
    
    return hourData;
  });

  // 计算属性：按天统计的收入
  const dailyIncome = computed(() => {
    const days = [];
    const end = new Date(dateRange.value[1]);
    let current = new Date(dateRange.value[0]);
    
    while (current <= end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days.map(day => {
      const dayStart = new Date(day);
      dayStart.setHours(0, 0, 0, 0);
      
      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);
      
      const dayRecords = parkingRecords.value.filter(record => {
        const exitTime = new Date(record.exitTime || new Date());
        return exitTime >= dayStart && exitTime <= dayEnd && record.fee;
      });
      
      const income = dayRecords.reduce((sum, record) => sum + (record.fee || 0), 0);
      
      return {
        date: day.toISOString().substring(0, 10),
        income: income.toFixed(2)
      };
    });
  });

  // 计算属性：按类型统计的车位数量
  const spotsByType = computed(() => {
    const types = ['standard', 'handicapped', 'electric', 'compact'];
    
    return types.map(type => {
      const count = parkingSpots.value.filter(spot => spot.type === type).length;
      const label = 
        type === 'standard' ? '标准车位' :
        type === 'handicapped' ? '残障车位' :
        type === 'electric' ? '电动车位' : '紧凑车位';
      
      return { type, label, count };
    });
  });

  // 加载停车场数据
  const loadParkingLots = async () => {
    try {
      const res = await getParkingLotList({});
      if (res && res.data) {
        parkingLots.value = res.data.items || res.data || [];
      }
    } catch (error) {
      console.error('加载停车场数据失败:', error);
    }
  };

  // 加载停车位数据
  const loadParkingSpots = async () => {
    try {
      const res = await getParkingSpotList({});
      if (res && res.data) {
        parkingSpots.value = res.data.items || res.data || [];
      }
    } catch (error) {
      console.error('加载停车位数据失败:', error);
    }
  };

  // 加载停车记录数据
  const loadParkingRecords = async () => {
    try {
      // 设置较大的size以获取更多数据进行分析
      const res = await getParkingRecordList({ current: 1, size: 1000 });
      if (res && res.data) {
        parkingRecords.value = res.data.records || res.data || [];
      }
    } catch (error) {
      console.error('加载停车记录数据失败:', error);
    }
  };

  // 加载所有数据
  const loadAllData = async () => {
    loading.value = true;
    try {
      await Promise.all([
        loadParkingLots(),
        loadParkingSpots(),
        loadParkingRecords()
      ]);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      loading.value = false;
    }
  };

  // 更新日期范围
  const updateDateRange = (range: [Date, Date]) => {
    dateRange.value = range;
  };

  // 组件挂载时加载数据
  onMounted(() => {
    loadAllData();
  });

  return {
    loading,
    dateRange,
    totalLots,
    totalSpots,
    availableSpots,
    occupiedSpots,
    todayIncome,
    weeklyIncome,
    monthlyIncome,
    lotUtilization,
    hourlyDistribution,
    dailyIncome,
    spotsByType,
    loadAllData,
    updateDateRange
  };
} 