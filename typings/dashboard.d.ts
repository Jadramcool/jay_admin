declare namespace Dashboard {
  interface Stats {
    userCount: number
    userTrend: number
    roleCount: number
    menuCount: number
    departmentCount: number
    logCount: number
    logTodayCount: number
    onlineCount: number
  }

  interface Trends {
    dates: string[]
    visits: number[]
    newUsers: number[]
    operations: number[]
  }

  interface SystemInfo {
    cpu: number
    memory: number
    disk: number
    uptime: string
    version: string
    nodeVersion: string
    platform: string
    dbRecords: number
  }

  interface Activity {
    id: number
    username: string
    action: string
    module: string
    operationType: string
    time: string
    status: string
  }
}
