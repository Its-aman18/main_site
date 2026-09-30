// ZERO → ONE Deterministic PRNG Service
// Provides reproducible pseudo-random numbers based on an authoritative seed.
// Used for crisis draws, dynamic market fluctuations, and simulation replay.

export class DeterministicRng {
  private seed: number;

  constructor(seedString: string = 'SCRIET-ZERO-ONE-2026') {
    this.seed = this.hashString(seedString);
  }

  // 32-bit FNV-1a hash to convert seed string to initial integer seed
  private hashString(str: string): number {
    let hash = 2166136261;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  // Linear Congruential Generator (LCG) - Numerical Recipes parameters
  public next(): number {
    this.seed = (Math.imul(1664525, this.seed) + 1013904223) >>> 0;
    return this.seed / 4294967296;
  }

  // Return integer in range [min, max] inclusive
  public nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  // Pick an element from an array deterministically
  public pick<T>(array: T[]): T {
    if (array.length === 0) throw new Error('Cannot pick from empty array');
    const index = this.nextInt(0, array.length - 1);
    return array[index];
  }

  // Shuffle an array deterministically (Fisher-Yates)
  public shuffle<T>(array: T[]): T[] {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  // Re-seed the generator
  public reseed(seedString: string) {
    this.seed = this.hashString(seedString);
  }
}
