const PROXY_ENDPOINT = "https://clippy-ai.yosirespondo.com/api/get-clippy-tip";
const AZURE_MODEL_NAME = "Phi-4";

let jqueryContent = '';
let clippyContent = '';

chrome.runtime.onInstalled.addListener(() => {
    fetch(chrome.runtime.getURL('js/jquery.min.js'))
        .then(response => response.text())
        .then(text => {
            jqueryContent = text;
        })
        .catch(e => console.error('Clippy AI Helper: Error loading jQuery content:', e));

    fetch(chrome.runtime.getURL('js/clippy.min.js'))
        .then(response => response.text())
        .then(text => {
            clippyContent = text;
        })
        .catch(e => console.error('Clippy AI Helper: Error loading Clippy.js content:', e));
});

async function getPhi4Completion(messages) {
    try {
        const response = await fetch(PROXY_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: messages,
                max_tokens: 150,
                temperature: 0.9,
                top_p: 0.9,
                presence_penalty: 0,
                frequency_penalty: 0,
                model: AZURE_MODEL_NAME,
                stream: false
            })
        });

        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(`Proxy/Azure API error: ${response.status} - ${errorBody.error.message || response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error("Clippy AI Helper: Error calling Azure LLM via proxy:", error);
        throw error;
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "get_useless_tip_from_page") {
        getPhi4Completion(request.messages)
            .then(tip => sendResponse({ tip: tip }))
            .catch(error => sendResponse({ error: error.message }));
        return true;
    }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://')) {
        if (!jqueryContent || !clippyContent) {
            console.warn("Clippy AI Helper: Script contents not yet loaded. Waiting for next update.");
            return;
        }

        const injectClippyLogic = (jqCode, clippyCode, agentsBasePath) => {
            try {
                eval(jqCode);
            } catch (e) {
                console.error('Clippy AI Helper: Error executing jQuery code:', e);
            }

            try {
                eval(clippyCode);
                if (typeof window.clippy === 'undefined' && typeof clippy !== 'undefined') {
                    window.clippy = clippy;
                }
            } catch (e) {
                console.error('Clippy AI Helper: Error executing Clippy.js code:', e);
            }

            let myClippyAgent;
            const maxRetries = 60;
            let retries = 0;

            const intervalId = setInterval(() => {
                if (typeof window.jQuery !== 'undefined' && typeof window.clippy !== 'undefined') {
                    clearInterval(intervalId);

                    window.clippy.BASE_PATH = agentsBasePath;
                    window.clippy.load('Clippy', function(agent) {
                        myClippyAgent = agent;
                        agent.show();
                        agent.speak('Hello! I am Clippy.');

                        const AI_ANIMATIONS = [
                            "Searching", "Thinking", "Congratulate", "Explain",
                            "Processing", "Pulsating", "GetAttention", "GoodBye",
                            "LookRight", "LookLeft", "LookUp", "LookDown",
                            "Idle1_1", "IdleAtom", "IdleEyeBrowRaise", "IdleFingerwag",
                            "IdleGlide", "IdleHeadScratch", "IdleLoop", "IdleRummaging",
                            "IdleSnooze", "IdleSpin", "IdleWink", "Writing"
                        ];

                        const requestTipFromAI = () => {
                            const currentUrl = window.location.href;
                            const pageTitle = document.title;

                            const promptContent = `Give me a useless or funny tip about the page ${currentUrl} with title "${pageTitle}". Include an animation keyword from the list ${AI_ANIMATIONS.join(', ')} in the format [ANIMATION:AnimationName] at the end of your tip. Ensure your final response contains exactly one of those animation keywords. Be concise, in a single sentence and with your Clippy personality.`;
                            
                            const messages = [
                                { role: "system", content: `You are Clippy, a helpful but often useless office assistant. Give funny, absurd, or truly unhelpful tips related to the user's current webpage context. Respond in a single concise sentence and always, without exception, include an animation keyword from the list ${AI_ANIMATIONS.join(', ')} in the format [ANIMATION:AnimationName] at the end of your tip. Example: 'This site is so interactive, you might get lost in an endless loading loop. [ANIMATION:Processing]'.` },
                                { role: "user", content: promptContent }
                            ];

                            window.postMessage({
                                type: "CLIPPYS_AI_REQUEST",
                                payload: { type: "get_useless_tip_from_page", messages: messages }
                            }, window.location.origin);
                        };

                        window.addEventListener('message', (event) => {
                            if (event.source !== window) {
                                return;
                            }
                            if (event.data && event.data.type === 'CLIPPYS_AI_RESPONSE') {
                                const response = event.data.payload;
                                if (response && response.tip) {
                                    let tipText = response.tip;
                                    let animationToPlay = null;

                                    const match = tipText.match(/\[ANIMATION:([a-zA-Z0-9_]+)\]/);
                                    
                                    if (match && match[1]) {
                                        let detectedAnimName = match[1];
                                        animationToPlay = AI_ANIMATIONS.find(anim => anim.toLowerCase() === detectedAnimName.toLowerCase());

                                        if (!animationToPlay) {
                                            let fallbackAnim = detectedAnimName.charAt(0).toUpperCase() + detectedAnimName.slice(1).toLowerCase();
                                            animationToPlay = AI_ANIMATIONS.find(anim => anim.toLowerCase() === fallbackAnim.toLowerCase()) || fallbackAnim;
                                            if (!AI_ANIMATIONS.includes(animationToPlay)) {
                                                animationToPlay = null;
                                            }
                                        }

                                        tipText = tipText.replace(match[0], '').trim();
                                    } else {
                                        animationToPlay = AI_ANIMATIONS[Math.floor(Math.random() * AI_ANIMATIONS.length)];
                                    }

                                    myClippyAgent.speak(tipText);
                                    setTimeout(() => {
                                        if (animationToPlay && myClippyAgent.hasAnimation(animationToPlay)) {
                                            myClippyAgent.play(animationToPlay);
                                        } else {
                                            myClippyAgent.animate();
                                        }
                                    }, 200);

                                } else if (response && response.error) {
                                    console.error("Clippy AI Helper: Error getting AI tip:", response.error);
                                    myClippyAgent.speak("Oops, I can't think of a tip right now. Have you tried restarting?");
                                }
                            }
                        });

                        setInterval(requestTipFromAI, 30000);

                        document.body.addEventListener('click', () => {
                            if (myClippyAgent && Math.random() < 0.1) {
                                myClippyAgent.animate();
                                myClippyAgent.speak('Looks like you are exploring this page!');
                            }
                        });

                    }, agentsBasePath);
                } else {
                    retries++;
                    if (retries >= maxRetries) {
                        clearInterval(intervalId);
                        console.error('Clippy AI Helper: ERROR: Clippy.js or jQuery not defined after multiple attempts. Clippy could not be loaded.');
                    } else {
                        console.warn('Clippy AI Helper: Waiting for Clippy.js and jQuery to be defined...');
                    }
                }
            }, 100);
        };

        chrome.scripting.executeScript({
            target: {tabId: tabId},
            func: injectClippyLogic,
            args: [
                jqueryContent,
                clippyContent,
                chrome.runtime.getURL('agents/')
            ],
            world: 'MAIN'
        }).catch(error => console.error("Clippy AI Helper: Error injecting Clippy logic:", error));
    }
});