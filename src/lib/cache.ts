/**
 * Simple in-memory cache with TTL for server-side data
 * Automatically sweeps expired entries when size exceeds threshold
 */
class SimpleCache {
  private m = new Map<string, { v: any; exp: number }>()

  get(k: string): any | null {
    const e = this.m.get(k)
    if (!e) return null
    if (Date.now() > e.exp) {
      this.m.delete(k)
      return null
    }
    return e.v
  }

  set(k: string, v: any, ttlSec: number): void {
    this.m.set(k, { v, exp: Date.now() + ttlSec * 1000 })
    this.sweep()
  }

  private sweep(): void {
    // Only sweep when cache grows large
    if (this.m.size < 200) return
    const now = Date.now()
    for (const [k, e] of this.m) {
      if (now > e.exp) this.m.delete(k)
    }
  }

  // Expose size for monitoring/debugging
  get size(): number {
    return this.m.size
  }
}

export const cache = new SimpleCache()
