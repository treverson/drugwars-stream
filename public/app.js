
//catch error messages
main().catch(console.error);

//pause stream
window.pauseStream = async () => {
    state = stream.pause();
};

//resume stream
window.resumeStream = async () => {
    state = state.resume();
};
