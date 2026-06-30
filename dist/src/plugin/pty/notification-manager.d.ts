import type { PTYSession } from './types.ts';
import type { OpencodeClient } from '@opencode-ai/sdk';
export declare class NotificationManager {
    private client;
    init(client: OpencodeClient): void;
    sendExitNotification(session: PTYSession, exitCode: number): Promise<void>;
    private buildExitNotification;
}
//# sourceMappingURL=notification-manager.d.ts.map