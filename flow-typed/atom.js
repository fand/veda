declare module 'atom' {
  declare class CompositeDisposable {
    constructor(): void;
    add(command: any): void;
  }

  declare interface AtomExports {
    CompositeDisposable: typeof CompositeDisposable;
  }

  declare module.exports: AtomExports;
}

interface Notifications {
  constructor(): void;
  addSuccess(message: string): void;
  addWarning(message: string): void;
  addError(message: string): void;
}

interface Project {
  getPaths(): string[];
}

interface Commands {
  add(workspace: string, commands: { [name: string]: Function }): void;
}

interface Config {
  observe(key: string, callback: Function): void;
  get(key: string): any;
}

declare class Atom {
  project: Project;
  notifications: Notifications;
  commands: Commands;
  config: Config;
}

declare var atom: Atom;
