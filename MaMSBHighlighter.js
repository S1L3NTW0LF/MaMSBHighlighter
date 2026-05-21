// ==UserScript==
// @name         MAM Shoutbox Mention Highlighter
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Highlights shoutbox messages where you are @mentioned
// @author       Sazaland
// @match        https://www.myanonamouse.net/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const YOUR_USERNAME = document.querySelector('a#tmUS')?.textContent.trim() || '';

    if (!YOUR_USERNAME) return; // bail out if not logged in or element not found

    const HIGHLIGHT_STYLE = `
        border: 2px solid #f5a623;
        border-radius: 3px;
        padding: 2px 6px;
    `;

    function highlightMentions() {
        const messages = document.querySelectorAll('div[id^="sbid"]');

        messages.forEach(msg => {
            if (msg.style.outline) return; // already processed

            let mentioned = false;

            // Method 1: Check @<a><span>Username</span></a> pattern
            const anchors = msg.querySelectorAll('a');
            anchors.forEach(anchor => {
                const span = anchor.querySelector('span');
                if (!span) return;

                const username = span.textContent.trim();
                const prevNode = anchor.previousSibling;

                const isAtMention = prevNode &&
                      prevNode.nodeType === Node.TEXT_NODE &&
                      prevNode.textContent.includes('@');

                if (isAtMention && username.toLowerCase() === YOUR_USERNAME.toLowerCase()) {
                    mentioned = true;
                }
            });

            // Method 2: Fallback — scan raw text content for @Username
            if (!mentioned && msg.textContent.toLowerCase().includes('@' + YOUR_USERNAME.toLowerCase())) {
                mentioned = true;
            }

            if (mentioned) {
                msg.style.cssText += HIGHLIGHT_STYLE;
            }
        });
    }

    // Run on load
    highlightMentions();

    // Watch for new messages being added to the shoutbox
    const observer = new MutationObserver(() => {
        highlightMentions();
    });

    // Observe the shoutbox container if it exists, else observe body
    const shoutbox = document.querySelector('#shoutbox') || document.body;
    observer.observe(shoutbox, { childList: true, subtree: true });

})();