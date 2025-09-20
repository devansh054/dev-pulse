const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedDevices() {
  try {
    console.log('🌱 Seeding device data...')

    // Get the first user from the database (or create a test user)
    let user = await prisma.user.findFirst()
    
    if (!user) {
      console.log('👤 Creating test user...')
      user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          githubId: 123456,
        }
      })
    }

    console.log(`👤 Using user: ${user.name} (ID: ${user.id})`)

    // Create sample devices
    const devices = [
      {
        name: 'MacBook Pro M2',
        type: 'laptop',
        status: 'online',
        cpuUsage: 45.0,
        memoryUsage: 8192.0, // 8GB in MB
        storageUsage: 78.0,
        location: 'San Francisco, CA',
        ipAddress: '192.168.1.100',
        specs: {
          cpu: 'Apple M2',
          ram: '16GB',
          storage: '512GB SSD',
          os: 'macOS 14.1'
        },
        userId: user.id
      },
      {
        name: 'Ubuntu Server',
        type: 'server',
        status: 'online',
        cpuUsage: 89.0,
        memoryUsage: 16384.0, // 16GB in MB
        storageUsage: 45.0,
        location: 'AWS us-west-2',
        ipAddress: '10.0.1.50',
        specs: {
          cpu: 'Intel Xeon E5-2686 v4',
          ram: '32GB',
          storage: '1TB SSD',
          os: 'Ubuntu 22.04 LTS'
        },
        userId: user.id
      },
      {
        name: 'Windows Desktop',
        type: 'desktop',
        status: 'offline',
        cpuUsage: 0.0,
        memoryUsage: 0.0,
        storageUsage: 67.0,
        location: 'New York, NY',
        ipAddress: '192.168.1.101',
        specs: {
          cpu: 'AMD Ryzen 7 5800X',
          ram: '32GB',
          storage: '2TB NVMe SSD',
          os: 'Windows 11 Pro'
        },
        userId: user.id
      },
      {
        name: 'iPad Pro',
        type: 'tablet',
        status: 'online',
        cpuUsage: 23.0,
        memoryUsage: 6144.0, // 6GB in MB
        storageUsage: 89.0,
        location: 'Los Angeles, CA',
        ipAddress: '192.168.1.102',
        specs: {
          cpu: 'Apple M2',
          ram: '8GB',
          storage: '256GB',
          os: 'iOS 17.1'
        },
        userId: user.id
      },
      {
        name: 'Raspberry Pi 4',
        type: 'server',
        status: 'maintenance',
        cpuUsage: 15.0,
        memoryUsage: 3072.0, // 3GB in MB
        storageUsage: 92.0,
        location: 'Home Lab',
        ipAddress: '192.168.1.200',
        specs: {
          cpu: 'ARM Cortex-A72',
          ram: '4GB',
          storage: '64GB microSD',
          os: 'Raspberry Pi OS'
        },
        userId: user.id
      }
    ]

    // Clear existing devices for this user
    await prisma.device.deleteMany({
      where: { userId: user.id }
    })

    // Create new devices
    for (const deviceData of devices) {
      const device = await prisma.device.create({
        data: deviceData
      })
      console.log(`📱 Created device: ${device.name} (${device.status})`)

      // Create some sample metrics for each device
      const metricsData = []
      const now = new Date()
      
      // Create metrics for the last 24 hours (every hour)
      for (let i = 0; i < 24; i++) {
        const timestamp = new Date(now.getTime() - (i * 60 * 60 * 1000))
        metricsData.push({
          deviceId: device.id,
          cpuUsage: Math.max(0, deviceData.cpuUsage + (Math.random() - 0.5) * 20),
          memoryUsage: Math.max(0, deviceData.memoryUsage + (Math.random() - 0.5) * 1000),
          storageUsage: Math.max(0, deviceData.storageUsage + (Math.random() - 0.5) * 5),
          networkIn: Math.max(0, Math.random() * 50), // Random network in MB/s
          networkOut: Math.max(0, Math.random() * 20), // Random network out MB/s
          temperature: deviceData.status === 'online' ? Math.max(20, 45 + (Math.random() - 0.5) * 20) : null,
          timestamp
        })
      }

      await prisma.deviceMetric.createMany({
        data: metricsData
      })
      console.log(`📊 Created ${metricsData.length} metrics for ${device.name}`)
    }

    console.log('✅ Device seeding completed successfully!')
    console.log(`📱 Created ${devices.length} devices with sample metrics`)
    
  } catch (error) {
    console.error('❌ Error seeding devices:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedDevices()
  .catch((error) => {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  })
