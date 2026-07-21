import * as fs from 'fs';
import path from 'path';

export class FileHelper {
  /**
   * Check if a file exists
   * @returns boolean flag
   */
  static fileExists(filePath: string): boolean {
    return fs.existsSync(filePath);
  }

  /**
   * Get file size in bytes
   * @returns number (0 if file not found)
   */
  static fileSize(filePath: string): number {
    if (!fs.existsSync(filePath)) return 0;
    const stats = fs.statSync(filePath);
    return stats.size;
  }

  /**
   * Read file content as string
   * @returns string (empty if file not found)
   */
  static async readFileContent(filePath: string): Promise<string> {
    if (!fs.existsSync(filePath)) return '';
    return await fs.promises.readFile(filePath, 'utf-8');
  }

  /**
   * Get file name from path
   * @returns string
   */
  static getFileName(filePath: string): string {
    return path.basename(filePath);
  }

  /**
   * Delete a file if it exists
   * @returns boolean flag (true if deleted, false if not found)
   */
  static deleteFile(filePath: string): boolean {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  }

  /**
   * Clean up all files in a directory
   * @returns number of files deleted
   */
  static cleanDirectory(dirPath: string): number {
    if (!fs.existsSync(dirPath)) return 0;
    const files = fs.readdirSync(dirPath);
    files.forEach(file => fs.unlinkSync(path.join(dirPath, file)));
    return files.length;
  }
}
