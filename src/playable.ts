import { IShader } from './constants';
import { IRcDiff } from './config';

export interface IPlayable {
    destroy: () => void;
    onChange: (rcDiff: IRcDiff) => void;
    onChangeSound: (rcDiff: IRcDiff) => Promise<void>;
    play: () => void;
    stop: () => void;
    loadShader: (shader: IShader) => void;
    playSound: () => void;
    stopSound: () => void;
    loadSoundShader: (fs: string) => void;
    setOsc: (name: string, data: number[]) => void;
    toggleFullscreen(): void;
}
