'use babel';

import AtomLivecoderView from './atom-livecoder-view';
import { CompositeDisposable } from 'atom';

export default {

  atomLivecoderView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.atomLivecoderView = new AtomLivecoderView(state.atomLivecoderViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.atomLivecoderView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-livecoder:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.atomLivecoderView.destroy();
  },

  serialize() {
    return {
      atomLivecoderViewState: this.atomLivecoderView.serialize()
    };
  },

  toggle() {
    console.log('AtomLivecoder was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
