import * as React from 'react';

const Settings = () => (
    <h3>SETTINGS@@@@@@@@!!!!!!!</h3>
);

export default class App extends React.Component<any, any> {
    public canvas?: HTMLCanvasElement;

    setCanvas = (el: HTMLCanvasElement) => {
        this.canvas = el;
    }

    render() {
        return <>
            <canvas ref={this.setCanvas}/>
            <Settings/>
        </>;
    }
}
