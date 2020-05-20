import {
    Command,
    Query,
    QueryResult,
    AudioInputsQuery,
    TimeQuery,
    VideoInputsQuery,
} from './constants';
import { RcDiff } from './config';

export interface Playable {
    destroy: () => void;
    onChange: (rcDiff: RcDiff) => void;
    command(command: Command): void;
    query(
        query: AudioInputsQuery | VideoInputsQuery,
    ): Promise<MediaDeviceInfo[]>;
    query(query: TimeQuery): Promise<number>;
    query(query: Query): Promise<QueryResult>;
}
