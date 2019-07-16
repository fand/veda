export default class View {
    private wrapper: HTMLElement;
    private element: HTMLElement;
    private canvas: HTMLCanvasElement;
    private isFullscreen = false;

    public constructor(wrapper: HTMLElement) {
        this.wrapper = wrapper;

        this.element = document.createElement('div');
        this.element.classList.add('veda');

        this.canvas = document.createElement('canvas');

        this.element.appendChild(this.canvas);
        this.wrapper.appendChild(this.element);
    }

    public destroy(): void {
        this.element.remove();
    }

    public getCanvas(): HTMLCanvasElement {
        return this.canvas;
    }

    public show(): void {
        document.body.classList.add('veda-enabled');
    }

    public hide(): void {
        document.body.classList.remove('veda-enabled');
    }

    public toggleFullscreen(): void {
        this.isFullscreen = !this.isFullscreen;
        if (this.isFullscreen) {
            document.body.classList.add('veda-fullscreen');
        } else {
            document.body.classList.remove('veda-fullscreen');
        }
    }
}
