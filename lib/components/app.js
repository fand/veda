"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const Settings = () => (React.createElement("h3", null, "SETTINGS@@@@@@@@!!!!!!!"));
class App extends React.Component {
    constructor() {
        super(...arguments);
        this.setCanvas = (el) => {
            this.canvas = el;
        };
    }
    render() {
        return React.createElement(React.Fragment, null,
            React.createElement("canvas", { ref: this.setCanvas }),
            React.createElement(Settings, null));
    }
}
exports.default = App;
//# sourceMappingURL=app.js.map