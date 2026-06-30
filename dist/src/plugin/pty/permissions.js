import { allStructured } from "./wildcard.js";
let _client = null;
let _directory = null;
export function initPermissions(client, directory) {
    _client = client;
    _directory = directory;
}
async function getPermissionConfig() {
    if (!_client) {
        return {};
    }
    try {
        const response = await _client.config.get();
        if (response.error || !response.data) {
            return {};
        }
        return response.data.permission ?? {};
    }
    catch {
        return {};
    }
}
async function showToast(message, variant = 'info') {
    if (!_client)
        return;
    try {
        await _client.tui.showToast({ body: { message, variant } });
    }
    catch {
        // Ignore toast errors
    }
}
async function denyWithToast(msg, details) {
    await showToast(msg, 'error');
    throw new Error(details ? `${msg} ${details}` : msg);
}
async function handleAskPermission(commandLine) {
    await denyWithToast(`PTY: Command "${commandLine}" requires permission (treated as denied)`, `PTY spawn denied: Command "${commandLine}" requires user permission which is not supported by this plugin. Configure explicit "allow" or "deny" in your opencode.json permission.bash settings.`);
    throw new Error('Unreachable'); // For TS, should never hit.
}
export async function checkCommandPermission(command, args) {
    const config = await getPermissionConfig();
    const bashPerms = config.bash;
    if (!bashPerms) {
        return;
    }
    if (typeof bashPerms === 'string') {
        if (bashPerms === 'deny') {
            await denyWithToast('PTY spawn denied: All bash commands are disabled by user configuration.');
        }
        if (bashPerms === 'ask') {
            await handleAskPermission(command);
        }
        return;
    }
    const action = allStructured({ head: command, tail: args }, bashPerms);
    if (action === 'deny') {
        await denyWithToast(`PTY spawn denied: Command "${command} ${args.join(' ')}" is explicitly denied by user configuration.`);
    }
    if (action === 'ask') {
        await handleAskPermission(`${command} ${args.join(' ')}`);
    }
}
export async function checkWorkdirPermission(workdir) {
    if (!_directory) {
        return;
    }
    const normalizedWorkdir = workdir.replace(/\/$/, '');
    const normalizedProject = _directory.replace(/\/$/, '');
    if (normalizedWorkdir.startsWith(normalizedProject)) {
        return;
    }
    const config = await getPermissionConfig();
    const extDirPerm = config.external_directory;
    if (extDirPerm === 'deny') {
        await denyWithToast(`PTY spawn denied: Working directory "${workdir}" is outside project directory "${_directory}". External directory access is denied by user configuration.`);
    }
    if (extDirPerm === 'ask') {
        // TODO: Implement user prompt for external directory access
    }
}
//# sourceMappingURL=permissions.js.map