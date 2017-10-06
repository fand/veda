/* @flow */
// This is a mock for flowtype.

type BufferedProcessOpts = {
  command: string,
  args: string[],
  stdout?: Function,
  stderr?: Function,
};

export class BufferedProcess {
  constructor: (opts: BufferedProcessOpts) => void;
  kill: () => void;
}

const atom = {
  BufferedProcess: BufferedProcess,
};

export default atom;
