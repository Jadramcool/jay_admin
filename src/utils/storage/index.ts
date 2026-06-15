class CustomStorage {
  private prefix: string

  constructor(prefix = '') {
    this.prefix = prefix
  }

  private getKey(key: string): string {
    return this.prefix ? `${this.prefix}_${key}` : key
  }

  get(key: string): any {
    const raw = localStorage.getItem(this.getKey(key))
    if (raw === null || raw === undefined)
      return null
    try {
      return JSON.parse(raw)
    }
    catch {
      return raw
    }
  }

  set(key: string, value: any): void {
    localStorage.setItem(this.getKey(key), JSON.stringify(value))
  }

  remove(key: string): void {
    localStorage.removeItem(this.getKey(key))
  }

  clear(): void {
    localStorage.clear()
  }
}

export default new CustomStorage()
