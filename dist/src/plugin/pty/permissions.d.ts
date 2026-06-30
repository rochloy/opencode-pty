import type { PluginClient } from '../types.ts';
export declare function initPermissions(client: PluginClient, directory: string): void;
export declare function checkCommandPermission(command: string, args: string[]): Promise<void>;
export declare function checkWorkdirPermission(workdir: string): Promise<void>;
//# sourceMappingURL=permissions.d.ts.map