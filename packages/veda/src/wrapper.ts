import App from './app';
import Config from './config';
import { AtomEnvironment, CompositeDisposable } from 'atom';
import * as fs from 'fs';
import * as which from 'which';
import { MessagePanelView, PlainMessageView } from 'atom-message-panel';
import { VedaStatus } from './constants';

export default class Wrapper {
    private app: App;
    private config: Config;
    private subscriptions: CompositeDisposable;
    private messages: MessagePanelView | null = null;

    public constructor(state: VedaStatus) {
        // TODO: Recover state
        console.log(state);

        this.config = new Config(this.getProjectPath(atom), {
            pixelRatio: atom.config.get('veda.pixelRatio'),
            frameskip: atom.config.get('veda.frameskip'),
            vertexMode: atom.config.get('veda.vertexMode'),
            vertexCount: atom.config.get('veda.vertexCount'),
            glslangValidatorPath: atom.config.get('veda.glslangValidatorPath'),
            fftSize: atom.config.get('veda.fftSize'),
            fftSmoothingTimeConstant: atom.config.get(
                'veda.fftSmoothingTimeConstant',
            ),
        });

        this.app = new App(this.config);
        this.app.setRecordingMode(atom.config.get('veda.recordingMode'));

        atom.config.observe('veda.glslangValidatorPath', (x): void =>
            this.setGlslangValidatorPath(x),
        );
        atom.config.observe('veda.pixelRatio', (x): void =>
            this.config.setGlobalSettings({ pixelRatio: x }),
        );
        atom.config.observe('veda.frameskip', (x): void =>
            this.config.setGlobalSettings({ frameskip: x }),
        );
        atom.config.observe('veda.vertexMode', (x): void =>
            this.config.setGlobalSettings({ vertexMode: x }),
        );
        atom.config.observe('veda.vertexCount', (x): void =>
            this.config.setGlobalSettings({ vertexCount: x }),
        );
        atom.config.observe('veda.fftSize', (x): void =>
            this.config.setGlobalSettings({ fftSize: x }),
        );
        atom.config.observe('veda.fftSmoothingTimeConstant', (x): void =>
            this.config.setGlobalSettings({ fftSmoothingTimeConstant: x }),
        );
        atom.config.observe('veda.recordingMode', (x): void =>
            this.app.setRecordingMode(x),
        );

        // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
        this.subscriptions = new CompositeDisposable();

        // Register command that toggles this view
        this.subscriptions.add(
            /* eslint-disable @typescript-eslint/explicit-function-return-type */
            atom.commands.add('atom-workspace', {
                'veda:toggle': () => this.app.toggle(),
                'veda:load-shader': () => this.app.loadShader(),
                'veda:watch-shader': () => this.app.watchShader(),
                'veda:watch-active-shader': () => this.app.watchActiveShader(),
                'veda:stop-watching': () => this.app.stopWatching(),
                'veda:load-sound-shader': () => this.app.playSound(),
                'veda:stop-sound-shader': () => this.app.stopSound(),
                'veda:toggle-fullscreen': () => this.app.toggleFullscreen(),
                'veda:start-recording': () => this.app.startRecording(),
                'veda:stop-recording': () => this.app.stopRecording(),
                'veda:insert-time': () => this.app.insertTime(),
            }),
            /* eslint-enable @typescript-eslint/explicit-function-return-type */
        );

        this.app.play();
    }

    public destroy(): void {
        this.subscriptions.dispose();
        this.app.destroy();
    }

    private showError(message: string): void {
        if (!this.messages) {
            this.messages = new MessagePanelView({
                title: 'veda',
            });
            this.messages.attach();
            this.messages.toggle();
        }
        this.messages.clear();
        this.messages.add(
            new PlainMessageView({
                message,
                className: 'text-error',
            }),
        );
    }

    private hideError(): void {
        if (this.messages) {
            this.messages.close();
            this.messages = null;
        }
    }

    private checkExistence(path: string): string | null {
        let result = null;

        // copied from https://github.com/AtomLinter/linter-glsl/blob/master/lib/linter-glsl.js
        if (fs.existsSync(path) && fs.statSync(path).isFile()) {
            try {
                // eslint-disable-next-line
                fs.accessSync(path, (fs as any).X_OK);
                result = path;
            } catch (error) {
                console.log(error);
            }
        } else {
            try {
                result = which.sync(path);
            } catch (error) {
                console.log(error);
            }
        }

        return result;
    }

    private setGlslangValidatorPath(glslangValidatorPath: string): void {
        // Do nothins if empty
        if (!glslangValidatorPath) {
            return;
        }

        const result = this.checkExistence(glslangValidatorPath);
        if (result) {
            this.hideError();
            this.config.setGlobalSettings({ glslangValidatorPath: result });
        } else {
            this.showError(
                `Unable to locate glslangValidator at '${glslangValidatorPath}'`,
            );
        }
    }

    private getProjectPath(atom: AtomEnvironment): string {
        const projectPaths = atom.project.getPaths();
        if (projectPaths.length === 0) {
            atom.notifications.addError(
                '[VEDA] No projects found in this window',
            );
            throw new Error('[VEDA] No projects found in this window');
        }
        if (projectPaths.length > 1) {
            atom.notifications.addWarning(
                '[VEDA] There are more than 1 project in this window. <br>veda only recognizes the 1st project.',
            );
        }
        return projectPaths[0];
    }
}
