import { Router } from 'express';
import { prisma } from '../app';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Get device stats
router.get('/stats', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    
    // Get device counts and stats
    const devices = await prisma.device.findMany({
      where: { userId: userId },
      select: {
        id: true,
        status: true,
        cpuUsage: true,
        memoryUsage: true,
        storageUsage: true,
      }
    });

    const connectedDevices = devices.filter(d => d.status === 'online').length;
    const totalCpuUsage = devices.reduce((sum: number, d: typeof devices[0]) => sum + (d.cpuUsage || 0), 0);
    const averageCpuUsage = devices.length > 0 ? Math.round(totalCpuUsage / devices.length) : 0;
    const totalMemoryUsage = devices.reduce((sum: number, d: typeof devices[0]) => sum + (d.memoryUsage || 0), 0);
    const averageMemoryUsage = devices.length > 0 ? Math.round(totalMemoryUsage / devices.length / 1024 * 100 / 16) : 0; // Convert to percentage
    const totalStorageUsage = devices.reduce((sum: number, d: typeof devices[0]) => sum + (d.storageUsage || 0), 0);

    const stats = {
      connectedDevices,
      totalDevices: devices.length,
      averageCpuUsage,
      averageMemoryUsage,
      totalMemoryUsage: Math.round(totalMemoryUsage / 1024), // Convert to GB
      onlineDevices: devices.filter((d: typeof devices[0]) => d.status === 'online').length,
      offlineDevices: devices.filter((d: typeof devices[0]) => d.status === 'offline').length,
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching device stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch device statistics' });
  }
});

// Get all devices for user
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    console.log(`🔍 Fetching devices for user ID: ${userId}`);

    const devices = await prisma.device.findMany({
      where: { userId: userId },
      orderBy: { lastSeen: 'desc' }
    });

    console.log(`📱 Found ${devices.length} devices for user ${userId}:`, devices.map(d => ({ name: d.name, status: d.status, cpuUsage: d.cpuUsage })));
    res.json({ success: true, data: { devices } });
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch devices' });
  }
});

// Add new device (replaces all existing devices for single-device users)
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const { name, type, location, specs } = req.body;

    if (!name || !type) {
      return res.status(400).json({ success: false, error: 'Name and type are required' });
    }

    console.log(`📱 Registering device for user ${userId}: ${name}`);

    // Clear all existing devices for this user (single device mode)
    await prisma.device.deleteMany({
      where: { userId: userId }
    });

    console.log(`🗑️ Cleared existing devices for user ${userId}`);

    // Create the new device with realistic metrics
    const device = await prisma.device.create({
      data: {
        ...req.body,
        userId: userId,
        status: 'online',
        cpuUsage: Math.floor(Math.random() * 30) + 15, // 15-45%
        memoryUsage: Math.floor(Math.random() * 4000) + 2000, // 2-6GB in MB
        storageUsage: Math.floor(Math.random() * 30) + 40, // 40-70%
        lastSeen: new Date(),
      },
    });

    console.log(`✅ Created device: ${device.name} (${device.id})`);
    res.json({ success: true, data: { device } });
  } catch (error) {
    console.error('Error creating device:', error);
    res.status(500).json({ success: false, error: 'Failed to create device' });
  }
});

// Update device
router.put('/:deviceId', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { deviceId } = req.params;
    const userId = req.user!.id;

    // Check if device belongs to user
    const device = await prisma.device.findFirst({
      where: {
        id: deviceId,
        userId: userId,
      },
    });

    if (!device) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }

    const updatedDevice = await prisma.device.update({
      where: { id: deviceId },
      data: {
        ...req.body,
        lastSeen: new Date(),
      },
    });

    res.json({ success: true, data: { device: updatedDevice } });
  } catch (error) {
    console.error('Error updating device:', error);
    res.status(500).json({ success: false, error: 'Failed to update device' });
  }
});

// Delete device
router.delete('/:deviceId', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { deviceId } = req.params;
    const userId = req.user!.id;

    // Check if device belongs to user
    const device = await prisma.device.findFirst({
      where: {
        id: deviceId,
        userId: userId,
      },
    });

    if (!device) {
      return res.status(404).json({ success: false, error: 'Device not found' });
    }

    await prisma.device.delete({
      where: { id: deviceId }
    });

    res.json({ success: true, message: 'Device deleted successfully' });
  } catch (error) {
    console.error('Error deleting device:', error);
    res.status(500).json({ success: false, error: 'Failed to delete device' });
  }
});

// Get device statistics
router.get('/stats', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;

    const devices = await prisma.device.findMany({
      where: { userId: userId },
    });

    const totalDevices = devices.length;
    const onlineDevices = devices.filter((d: any) => d.status === 'online').length;
    const offlineDevices = devices.filter((d: any) => d.status === 'offline').length;
    const maintenanceDevices = devices.filter((d: any) => d.status === 'maintenance').length;

    // Calculate averages for online devices only
    const onlineDevicesList = devices.filter((d: any) => d.status === 'online');
    const averageCpuUsage = onlineDevicesList.length > 0 
      ? onlineDevicesList.reduce((sum: number, d: any) => sum + (d.cpuUsage || 0), 0) / onlineDevicesList.length
      : 0;
    
    // Convert memory from MB to percentage (assuming 16GB = 16384MB as 100%)
    const averageMemoryUsage = onlineDevicesList.length > 0
      ? onlineDevicesList.reduce((sum: number, d: any) => {
          const memoryMB = d.memoryUsage || 0;
          const memoryPercentage = Math.min((memoryMB / 16384) * 100, 100); // Assume 16GB max
          return sum + memoryPercentage;
        }, 0) / onlineDevicesList.length
      : 0;

    const averageDiskUsage = onlineDevicesList.length > 0
      ? onlineDevicesList.reduce((sum: number, d: any) => sum + (d.storageUsage || 0), 0) / onlineDevicesList.length
      : 0;

    // Health categorization based on actual thresholds
    const criticalDevices = devices.filter((d: any) => {
      if (d.status !== 'online') return false;
      const memoryPercent = Math.min(((d.memoryUsage || 0) / 16384) * 100, 100);
      return d.cpuUsage > 90 || memoryPercent > 90 || (d.storageUsage || 0) > 95;
    }).length;

    const warningDevices = devices.filter((d: any) => {
      if (d.status !== 'online') return false;
      const memoryPercent = Math.min(((d.memoryUsage || 0) / 16384) * 100, 100);
      return (
        (d.cpuUsage > 70 && d.cpuUsage <= 90) || 
        (memoryPercent > 70 && memoryPercent <= 90) || 
        ((d.storageUsage || 0) > 80 && (d.storageUsage || 0) <= 95)
      );
    }).length;

    const healthyDevices = onlineDevices - criticalDevices - warningDevices;

    res.json({
      success: true,
      data: {
        totalDevices,
        onlineDevices,
        offlineDevices,
        maintenanceDevices,
        averageCpuUsage,
        averageMemoryUsage,
        averageDiskUsage,
        criticalDevices,
        warningDevices,
        healthyDevices,
      }
    });
  } catch (error) {
    console.error('Error fetching device stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch device stats' });
  }
});

// Get device health report
router.get('/health-report', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;

    const devices = await prisma.device.findMany({
      where: { userId: userId },
      include: {
        deviceMetrics: {
          orderBy: { timestamp: 'desc' },
          take: 24 // Last 24 hours
        }
      }
    });

    const healthReport = {
      totalDevices: devices.length,
      onlineDevices: devices.filter((d: typeof devices[0]) => d.status === 'online').length,
      criticalDevices: devices.filter((d: typeof devices[0]) => 
        (d.cpuUsage && d.cpuUsage > 90) || 
        (d.memoryUsage && d.memoryUsage > 90) || 
        (d.storageUsage && d.storageUsage > 90)
      ).length,
      warningDevices: devices.filter((d: typeof devices[0]) => 
        (d.cpuUsage && d.cpuUsage > 70) || 
        (d.memoryUsage && d.memoryUsage > 70) || 
        (d.storageUsage && d.storageUsage > 70)
      ).length,
      healthyDevices: devices.filter((d: typeof devices[0]) => 
        (!d.cpuUsage || d.cpuUsage <= 70) && 
        (!d.memoryUsage || d.memoryUsage <= 70) && 
        (!d.storageUsage || d.storageUsage <= 70)
      ).length,
      alerts: devices.filter((d: typeof devices[0]) => 
        (d.cpuUsage && d.cpuUsage > 80) || 
        (d.memoryUsage && d.memoryUsage > 80) || 
        (d.storageUsage && d.storageUsage > 80)
      ).map((d: typeof devices[0]) => ({
        deviceId: d.id,
        deviceName: d.name,
        type: d.cpuUsage && d.cpuUsage > 80 ? 'High CPU Usage' :
              d.memoryUsage && d.memoryUsage > 80 ? 'High Memory Usage' : 'High Storage Usage',
        severity: (d.cpuUsage || 0) > 90 || (d.memoryUsage || 0) > 90 || (d.storageUsage || 0) > 95 
          ? 'critical' : 'warning'
      }))
    };

    res.json({ success: true, data: healthReport });
  } catch (error) {
    console.error('Error generating health report:', error);
    res.status(500).json({ success: false, error: 'Failed to generate health report' });
  }
});

export default router;
