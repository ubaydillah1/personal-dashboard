import { keepAliveRepository } from "@/repositories/keep-alive.repository";

export const cronService = {
  async keepDatabaseAwake() {
    await keepAliveRepository.pingDatabase();
    return {
      checkedAt: new Date().toISOString(),
    };
  },
};
