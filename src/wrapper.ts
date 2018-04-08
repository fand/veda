import App from './app';
import Config from './config';
import { AtomEnvironment, CompositeDisposable } from 'atom';
import * as fs from 'fs';
import * as which from 'which';
import { MessagePanelView, PlainMessageView } from 'atom-message-panel';

export default class Wrapper {
    app: App;
    config: Config;
    subscriptions: CompositeDisposable;
    messages: MessagePanelView | null = null;

    constructor(state: any) {
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

        atom.config.observe('veda.glslangValidatorPath', x =>
            this.setGlslangValidatorPath(x),
        );
        atom.config.observe('veda.pixelRatio', x =>
            this.config.setGlobalSettings({ pixelRatio: x }),
        );
        atom.config.observe('veda.frameskip', x =>
            this.config.setGlobalSettings({ frameskip: x }),
        );
        atom.config.observe('veda.vertexMode', x =>
            this.config.setGlobalSettings({ vertexMode: x }),
        );
        atom.config.observe('veda.vertexCount', x =>
            this.config.setGlobalSettings({ vertexCount: x }),
        );
        atom.config.observe('veda.fftSize', x =>
            this.config.setGlobalSettings({ fftSize: x }),
        );
        atom.config.observe('veda.fftSmoothingTimeConstant', x =>
            this.config.setGlobalSettings({ fftSmoothingTimeConstant: x }),
        );

        // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
        this.subscriptions = new CompositeDisposable();

        // Register command that toggles this view
        this.subscriptions.add(
            atom.commands.add('atom-workspace', {
                'veda:toggle': () => this.app.toggle(),
                'veda:load-shader': () => this.app.loadShader(),
                'veda:watch-shader': () => this.app.watchShader(),
                'veda:watch-active-shader': () => this.app.watchActiveShader(),
                'veda:stop-watching': () => this.app.stopWatching(),
                'veda:load-sound-shader': () => this.app.playSound(),
                'veda:stop-sound-shader': () => this.app.stopSound(),
                'veda:toggle-fullscreen': () => this.app.toggleFullscreen(),
            }),
        );

        this.app.play();
    }

    destroy() {
        this.subscriptions.dispose();
        this.app.destroy();
    }

    showError(message: string): void {
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

    hideError(): void {
        if (this.messages) {
            this.messages.close();
            this.messages = null;
        }
    }

    checkExistence(path: string): string | null {
        let result = null;

        // copied from https://github.com/AtomLinter/linter-glsl/blob/master/lib/linter-glsl.js
        if (fs.existsSync(path) && fs.statSync(path).isFile()) {
            try {
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

    setGlslangValidatorPath(glslangValidatorPath: string) {
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

    getProjectPath(atom: AtomEnvironment): string {
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
