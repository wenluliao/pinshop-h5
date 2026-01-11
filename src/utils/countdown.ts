/**
 * 倒计时工具类
 */
export class Countdown {
  private endTime: number
  private timer: number | null = null
  private remainingTime: number = 0

  constructor(endTime: number) {
    this.endTime = endTime
    this.remainingTime = Math.max(0, endTime - Date.now())
  }

  /**
   * 开始倒计时
   * @param callback 每秒回调，返回剩余毫秒数
   * @param complete 完成回调
   */
  start(
    callback: (remaining: number) => void,
    complete?: () => void
  ) {
    this.stop()

    // 立即执行一次
    callback(this.remainingTime)

    this.timer = setInterval(() => {
      const now = Date.now()
      this.remainingTime = Math.max(0, this.endTime - now)

      if (this.remainingTime <= 0) {
        this.stop()
        complete?.()
      } else {
        callback(this.remainingTime)
      }
    }, 1000) as unknown as number
  }

  /**
   * 停止倒计时
   */
  stop() {
    if (this.timer !== null) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  /**
   * 获取剩余时间（毫秒）
   */
  getRemaining(): number {
    return Math.max(0, this.endTime - Date.now())
  }

  /**
   * 格式化倒计时
   * @param milliseconds 毫秒数
   * @returns 格式化后的字符串 HH:MM:SS
   */
  static format(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    const pad = (n: number) => n.toString().padStart(2, '0')

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    }
    return `${pad(minutes)}:${pad(seconds)}`
  }

  /**
   * 分解倒计时
   * @param milliseconds 毫秒数
   * @returns 时、分、秒对象
   */
  static decompose(milliseconds: number): {
    hours: number
    minutes: number
    seconds: number
  } {
    const totalSeconds = Math.floor(milliseconds / 1000)
    return {
      hours: Math.floor(totalSeconds / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60
    }
  }
}

/**
 * 格式化倒计时（快捷方法）
 */
export function formatCountdown(ms: number): string {
  return Countdown.format(ms)
}

/**
 * 分解倒计时（快捷方法）
 */
export function decomposeCountdown(ms: number): {
  hours: number
  minutes: number
  seconds: number
} {
  return Countdown.decompose(ms)
}
