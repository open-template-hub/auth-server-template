/**
 * @description holds usage util
 */

export class UsageUtil {
  /**
   * gets memory usage
   * @returns memory usage
   */
  getMemoryUsage = () => {
    const used = process.memoryUsage().heapUsed / 1024 / 1024;
    console.log(`Memory Usage: ${used.toFixed(2)} MB`);
    return used;
  };
}
