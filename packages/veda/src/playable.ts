import {
    Command,
    Query,
    QueryResult,
    AudioInputsQuery,
    TimeQuery,
    VideoInputsQuery,
} from './constants';
import type { RcDiff } from './types';

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
