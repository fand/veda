import * as io from 'socket.io-client';
import Player from './player';
import View from './view';
import { IRc, IRcDiff } from './config';
import { IShader, Command, Query } from './constants';

interface ICreateOpts {
    rc: IRc;
    isPlaying: boolean;
    lastShader: IShader;
}

export default class PlayerClient {
    private socket: any;
    private player: Player | null = null;
    private wrapper: any = document.body;
    private timer: number | null = null;

    constructor() {
        this.socket = io({
            autoConnect: false,
        });

        this.socket.on(
            'create',
            ({ rc, isPlaying, lastShader }: ICreateOpts) => {
                if (this.timer) {
                    clearTimeout(this.timer);
                }
                if (!this.player) {
                    const view = new View(this.wrapper);
                    this.player = new Player(view, rc, isPlaying, lastShader);
                }
            },
        );
        this.socket.on('destroy', () => {
            this.player && this.player.destroy();
        });
        this.socket.on('onChange', (rcDiff: IRcDiff) => {
            this.player && this.player.onChange(rcDiff);
        });
        this.socket.on('command', (command: Command) => {
            this.player && this.player.command(command);
        });
        this.socket.on(
            'query',
            (
                query: Query,
                callback: (err: string | null, value?: any) => void,
            ) => {
                if (!this.player) {
                    return callback('[VEDA] Player is not initialized.');
                }

                this.player
                    .query(query)
                    .then(value => callback(null, value), callback);
            },
        );
        this.socket.on('connect', () => {
            console.log('[VEDA] Connected to the server');
            this.poll();
        });
        this.socket.on('disconnect', () => {
            console.log('[VEDA] Disconnected');
        });
    }

    connect() {
        this.socket.open();
    }

    poll = () => {
        this.socket.emit('ready');
        this.timer = window.setTimeout(this.poll, 1000);
    };
}
