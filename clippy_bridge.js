window.addEventListener('message', (event) => {
    if (event.source !== window) {
        return;
    }

    if (event.data && event.data.type === 'CLIPPYS_AI_REQUEST') {
        chrome.runtime.sendMessage(event.data.payload, (response) => {
            window.postMessage({
                type: 'CLIPPYS_AI_RESPONSE',
                payload: response
            }, window.location.origin);
        });
    }
});