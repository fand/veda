import { CommandType, CommandData } from './constants';
import { IRcDiff } from './config';

export interface IPlayable {
    destroy: () => void;
    onChange: (rcDiff: IRcDiff) => void;
    command(type: CommandType, payload?: CommandData): void;
}
