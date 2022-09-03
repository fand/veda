import { io, Socket } from 'socket.io-client';
import Player from './player';
import View from './view';
import type { Rc, RcDiff } from './types';
import type { Shader, Command, Query, QueryResult } from './constants';

interface CreateOpts {
    rc: Rc;
    isPlaying: boolean;
    lastShader: Shader;
}

export default class PlayerClient {
    private socket: Socket;
    private player: Player | null = null;
    private wrapper: HTMLElement = document.body;
    private timer: number | null = null;

    public constructor() {
        this.socket = io({
            autoConnect: false,
        });

        this.socket.on(
            'create',
            ({ rc, isPlaying, lastShader }: CreateOpts): void => {
                if (this.timer) {
                    clearTimeout(this.timer);
                }
                if (!this.player) {
                    const view = new View(this.wrapper);
                    this.player = new Player(view, rc, isPlaying, lastShader);
                }
            },
        );
        this.socket.on('destroy', (): void => {
            this.player && this.player.destroy();
        });
        this.socket.on('onChange', (rcDiff: RcDiff): void => {
            this.player && this.player.onChange(rcDiff);
        });
        this.socket.on('command', (command: Command): void => {
            this.player && this.player.command(command);
        });
        this.socket.on(
            'query',
            (
                query: Query,
                callback: (err: string | null, value?: QueryResult) => void,
            ): void => {
                if (!this.player) {
                    return callback('[VEDA] Player is not initialized.');
                }

                this.player
                    .query(query)
                    .then((value): void => callback(null, value), callback);
            },
        );
        this.socket.on('connect', (): void => {
            console.log('[VEDA] Connected to the server');
            this.poll();
        });
        this.socket.on('disconnect', (): void => {
            console.log('[VEDA] Disconnected');
        });
    }

    public connect(): void {
        this.socket.open();
    }

    private poll = (): void => {
        this.socket.emit('ready');
        this.timer = window.setTimeout(this.poll, 1000);
    };
}
