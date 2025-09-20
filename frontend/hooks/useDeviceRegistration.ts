import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface DeviceInfo {
  name: string;
  type: 'laptop' | 'desktop' | 'tablet' | 'mobile';
  os: string;
  browser: string;
  specs: {
    cpu: string;
    memory: string;
    screen: string;
  };
}

export const useDeviceRegistration = () => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const detectDevice = (): DeviceInfo => {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    
    // Detect OS
    let os = 'Unknown';
    if (userAgent.includes('Mac OS X')) os = 'macOS';
    else if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS')) os = 'iOS';

    // Detect device type
    let type: DeviceInfo['type'] = 'desktop';
    if (/iPad/.test(userAgent)) type = 'tablet';
    else if (/iPhone|Android.*Mobile/.test(userAgent)) type = 'mobile';
    else if (/MacBook|laptop/i.test(userAgent) || platform.includes('Mac')) type = 'laptop';

    // Detect browser
    let browser = 'Unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    // Generate unique device name with timestamp to avoid duplicates
    let baseName = 'My Device';
    if (os === 'macOS') {
      baseName = type === 'laptop' ? 'MacBook Pro' : 'Mac Studio';
    } else if (os === 'Windows') {
      baseName = type === 'laptop' ? 'Windows Laptop' : 'Windows PC';
    } else if (os === 'Linux') {
      baseName = 'Linux Workstation';
    } else if (os === 'iOS') {
      baseName = type === 'tablet' ? 'iPad' : 'iPhone';
    } else if (os === 'Android') {
      baseName = type === 'tablet' ? 'Android Tablet' : 'Android Phone';
    }

    // Get hardware info from browser APIs
    const memoryGB = (navigator as any).deviceMemory || 8; // Default to 8GB if unknown
    const cpuCores = (navigator as any).hardwareConcurrency || 4; // Default to 4 cores
    
    const memory = `${memoryGB}GB RAM`;
    const cpu = `${cpuCores}-Core Processor`;
    const screenInfo = `${window.screen.width}x${window.screen.height}`;

    console.log('🔍 Device Detection Results:', {
      name: baseName,
      type,
      os,
      browser,
      memoryGB,
      cpuCores,
      screen: screenInfo
    });

    return {
      name: baseName,
      type,
      os,
      browser,
      specs: {
        cpu,
        memory,
        screen: screenInfo
      }
    };
  };

  const getRealisticMetrics = () => {
    // Simulate more realistic system metrics based on actual usage patterns
    const now = new Date();
    const hour = now.getHours();
    
    // CPU usage varies by time of day (higher during work hours)
    let baseCpu = 15;
    if (hour >= 9 && hour <= 17) baseCpu = 25; // Work hours
    if (hour >= 18 && hour <= 22) baseCpu = 35; // Evening usage
    
    const cpuUsage = baseCpu + Math.floor(Math.random() * 20); // Add some variance
    
    // Memory usage based on detected RAM (more realistic)
    const memoryGB = (navigator as any).deviceMemory || 8;
    const baseMemoryUsage = Math.min(memoryGB * 0.4, memoryGB * 0.7); // 40-70% of available RAM
    const memoryUsageMB = Math.floor(baseMemoryUsage * 1024 + Math.random() * 1024);
    
    // Storage usage (simulate typical usage)
    const storageUsage = 45 + Math.floor(Math.random() * 25); // 45-70%
    
    return { cpuUsage, memoryUsageMB, storageUsage };
  };

  const registerDevice = async (deviceInfo: DeviceInfo) => {
    try {
      setIsRegistering(true);
      
      const metrics = getRealisticMetrics();
      
      const deviceData = {
        name: deviceInfo.name,
        type: deviceInfo.type,
        location: 'Current Location',
        specs: {
          os: deviceInfo.os,
          browser: deviceInfo.browser,
          ...deviceInfo.specs
        },
        status: 'online',
        cpuUsage: metrics.cpuUsage,
        memoryUsage: metrics.memoryUsageMB,
        storageUsage: metrics.storageUsage,
      };

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/devices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(deviceData)
      });

      const result = await response.json();

      if (result.success) {
        setIsRegistered(true);
        console.log('✅ Device registered successfully:', result.data.device);
        return result.data.device;
      }
    } catch (error) {
      console.error('❌ Failed to register device:', error);
    } finally {
      setIsRegistering(false);
    }
  };

  const autoRegisterDevice = async () => {
    const device = detectDevice();
    setDeviceInfo(device);
    
    // Check if we should auto-register (only if user is authenticated)
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const sessionResponse = await fetch(`${API_BASE_URL}/auth/session`, {
        credentials: 'include'
      });
      const sessionData = await sessionResponse.json();
      
      if (sessionData.user && sessionData.user.id !== 'demo-user') {
        console.log('🔍 Authenticated user detected, auto-registering current device...');
        
        // Always register the current device (replace any existing devices)
        console.log('📱 Registering current device:', device.name);
        const registeredDevice = await registerDevice(device);
        
        if (registeredDevice) {
          console.log('✅ Device auto-registration successful');
          setIsRegistered(true);
        }
      }
    } catch (error) {
      console.error('Error in auto-registration:', error);
    }
  };

  useEffect(() => {
    autoRegisterDevice();
  }, []);

  return {
    deviceInfo,
    isRegistering,
    isRegistered,
    registerDevice: () => deviceInfo && registerDevice(deviceInfo),
    detectDevice,
    autoRegisterDevice
  };
};
