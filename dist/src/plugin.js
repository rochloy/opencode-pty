import { initManager, manager } from "./plugin/pty/manager.js";
import { initPermissions } from "./plugin/pty/permissions.js";
import { ptySpawn } from "./plugin/pty/tools/spawn.js";
import { ptyWrite } from "./plugin/pty/tools/write.js";
import { ptyRead } from "./plugin/pty/tools/read.js";
import { ptyList } from "./plugin/pty/tools/list.js";
import { ptyKill } from "./plugin/pty/tools/kill.js";
import open from 'open';
const ptyOpenClientCommand = 'pty-open-background-spy';
const ptyShowServerUrlCommand = 'pty-show-server-url';
export const PTYPlugin = async ({ client, directory }) => {
    initPermissions(client, directory);
    initManager(client);
    let ptyServer;
    return {
        'command.execute.before': async (input) => {
            if (input.command !== ptyOpenClientCommand && input.command !== ptyShowServerUrlCommand) {
                return;
            }
            // Lazy-load PTYServer — only works on Bun runtime (uses Bun.serve)
            // On Node.js, this will throw a clear error explaining the requirement.
            if (ptyServer === undefined) {
                try {
                    // @ts-ignore - PTYServer requires Bun runtime, excluded from Node.js build
                    const { PTYServer } = await import("./web/server/server.js");
                    ptyServer = await PTYServer.createServer();
                }
                catch (err) {
                    const message = `PTY Web UI requires Bun runtime. Install Bun and run: bunx opencode-ai\nError: ${err instanceof Error ? err.message : String(err)}`;
                    await client.session.prompt({
                        path: { id: input.sessionID },
                        body: {
                            noReply: true,
                            parts: [{ type: 'text', text: message }],
                        },
                    });
                    throw new Error('PTY Web UI requires Bun runtime');
                }
            }
            if (input.command === ptyOpenClientCommand) {
                open(ptyServer.server.url.origin);
            }
            else if (input.command === ptyShowServerUrlCommand) {
                const message = `PTY Sessions Web Interface URL: ${ptyServer.server.url.origin}`;
                await client.session.prompt({
                    path: { id: input.sessionID },
                    body: {
                        noReply: true,
                        parts: [
                            {
                                type: 'text',
                                text: message,
                            },
                        ],
                    },
                });
            }
            throw new Error('Command handled by PTY plugin');
        },
        tool: {
            pty_spawn: ptySpawn,
            pty_write: ptyWrite,
            pty_read: ptyRead,
            pty_list: ptyList,
            pty_kill: ptyKill,
        },
        config: async (input) => {
            if (!input.command) {
                input.command = {};
            }
            input.command[ptyOpenClientCommand] = {
                template: `This command will start the PTY Sessions Web Interface in your default browser.`,
                description: 'Open PTY Sessions Web Interface',
            };
            input.command[ptyShowServerUrlCommand] = {
                template: `This command will show the PTY Sessions Web Interface URL.`,
                description: 'Show PTY Sessions Web Interface URL',
            };
        },
        event: async ({ event }) => {
            if (event.type === 'session.deleted') {
                manager.cleanupBySession(event.properties.info.id);
            }
        },
    };
};
//# sourceMappingURL=plugin.js.map