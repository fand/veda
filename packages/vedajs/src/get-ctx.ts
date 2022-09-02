let ctx: AudioContext;

export const getCtx = () => {
    if (!ctx) {
        ctx = new window.AudioContext();
    }
    return ctx;
};
