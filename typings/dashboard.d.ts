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
    operationType: System.OperationType
    time: string
    status: System.OperationStatus
  }

  interface MineTodoItem {
    id: number
    title: string
    isDone: boolean
    createdTime: string
  }

  interface MineNoticeItem {
    id: number
    noticeId: number
    title: string
    publishedAt: string | null
    type: System.NoticeType
    isPinned: boolean
    isMandatory: boolean
    readTime: string | null
    assignedTime: string
  }

  /** 个人工作台聚合数据(GET /dashboard/mine) */
  interface MineInfo {
    todo: {
      openCount: number
      doneCount: number
      recent: MineTodoItem[]
    }
    notice: {
      unreadCount: number
      recent: MineNoticeItem[]
    }
    myActivities: Activity[]
  }
}
