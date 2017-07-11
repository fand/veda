'use babel';

export default class AtomLivecoderView {
  constructor(serializedState) {
    // TODO: restore from serializedState
    this.state = serializedState;

    this.element = document.createElement('div');
    this.element.classList.add('atom-livecoder');

    this.style = document.createElement('style');
    this.style.innerHTML = `
      body, atom-workspace, .header *, .footer *, atom-workspace-axis :not(.cursor):not(autocomplete-suggestion-list):not(atom-overlay):not(span), atom-workspace *:before {
        background: transparent !important;
        border: none !important;
        text-shadow: 0 1px 1px black;
        box-shadow: none !important;
      }
      .line > span {
        background: rgba(0,0,0,0.7) !important;
      }
      .cursor {
        width: 0 !important;
        box-shadow: 0 0 3px #0FF !important;
        border-left: 4px solid #0FF !important;
      }
      autocomplete-suggestion-list, atom-overlay {
        background: rgba(0, 0, 0, 0.9) !important;
      }
    `;

    this.canvas = document.createElement('canvas');
    this.element.appendChild(this.canvas);

    this.isVisible = false;
  }

  serialize() {}

  destroy() {
    this.three.stop();
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

  getCanvas() {
    return this.canvas;
  }

  show() {
    this.isVisible = true;
    this.element.style.display = 'block';
    this.element.appendChild(this.style);
  }

  hide() {
    this.isVisible = false;
    this.element.style.display = 'none';
    this.element.removeChild(this.style);
  }
}
