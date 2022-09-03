"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("@babel/polyfill");
const player_client_1 = __importDefault(require("./player-client"));
const client = new player_client_1.default();
client.connect();
//# sourceMappingURL=client.js.map