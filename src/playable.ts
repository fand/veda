import {
    Command,
    Query,
    IAudioInputsQuery,
    ITimeQuery,
    IVideoInputsQuery,
} from './constants';
import { IRcDiff } from './config';

export interface IPlayable {
    destroy: () => void;
    onChange: (rcDiff: IRcDiff) => void;
    command(command: Command): void;
    query(
        query: IAudioInputsQuery | IVideoInputsQuery,
    ): Promise<MediaDeviceInfo[]>;
    query(query: ITimeQuery): Promise<number>;
    query(query: Query): Promise<any>;
}
