declare class CronService {
    private isDbHealthy;
    private lastHealthCheck;
    initialize(): void;
    private performDatabaseHealthCheck;
    private cleanupExpiredTokens;
    private logSystemStats;
    getHealthStatus(): {
        isDbHealthy: boolean;
        lastHealthCheck: Date;
    };
}
declare const _default: CronService;
export default _default;
