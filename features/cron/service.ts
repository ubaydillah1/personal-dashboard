import { keepAliveRepository } from "@/repositories/keep-alive.repository";
import { storageCleanerRepository } from "@/repositories/storage-cleaner.repository";

export const cronService = {
  async keepDatabaseAwake() {
    await keepAliveRepository.pingDatabase();
    const cleanupResult = await storageCleanerRepository.cleanupOrphanedImages();

    return {
      checkedAt: new Date().toISOString(),
      storageCleanup: cleanupResult,
    };
  },
};
