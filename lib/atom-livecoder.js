'use babel';

import AtomLivecoderView from './atom-livecoder-view';
import { CompositeDisposable } from 'atom';

export default {

  atomLivecoderView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.atomLivecoderView = new AtomLivecoderView(state.atomLivecoderViewState);
    atom.workspace.element.appendChild(this.atomLivecoderView.getElement());

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-livecoder:toggle': () => this.toggle(),
      'atom-livecoder:run-shader': () => this.runShader(),
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
    this.atomLivecoderView.destroy();
  },

  serialize() {
    return {
      atomLivecoderViewState: this.atomLivecoderView.serialize()
    };
  },

  toggle() {
    return (
      this.atomLivecoderView.isVisible ?
      this.atomLivecoderView.hide() :
      this.atomLivecoderView.show()
    );
  },

  runShader() {
    const editor = atom.workspace.getActiveTextEditor();
    const shader = editor.getText();

    this.atomLivecoderView.loadShader(shader);
  },

};
