// Debouncing -> prevent API to be oveloaded/spam
// Set up times it runs after a specific delay, set in the wait param

import { type } from "@testing-library/user-event/dist/type";

// Call debounce func before it finishes it will cancel current timer prev set
const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearImmediate(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

// AI part of the autocomplete
// API route to the endpoint to get the actual LLM completion from the backend
// For now API URL is not deployed using Render, so is running locally
const getCompletion = async message => {
    const response = await fetch("https://localhost:3000/api/chat", {
        method: "POST",
        headers:{
            "Content-Type": "application/json",
        },
        body: JSON.stringify({message}),
    });

    if (!response.ok){
        throw new Error("Failed to get Completion 😓");
    }

    const data = await response.json();
    try{
        //Try to parse the response as JSON if it's a string
        const parsedResponse = 
            typeof data.response === "string"
                ? JSON.parse(data.response)
                : data.response;
        return parsedResponse.response || parsedResponse;
    } catch(error){
        // if parsed fails, we return the original response
        return data.response;

    }
};

// Start of logic to display completion in the frontend of text areas

//Class for Suggestion to overlay 
//How text completion will be show in the UI with proper CSS properties
class SuggestionCover{
    constructor() {
        this.cover = document.createElement("div");
        this.cover.className = "ai-suggestion-cover";
            this.cover.style.cssText = `
                position: absolute;
                pointer-events: none;
                color: #9CA3AF;
                font-family: monospace;
                white-space: pre;
                z-index: 10000; 
                background: transparent;
            `;
            document.body.appendChild(this.cover);
    }

    //Method to actually show the text completion suggestion, while user is typing
    show(element, suggestion, cursorPosition){

        const rect = element.getBoundingClientRect(); // -> Where is user typing
        const computedStyle = window.getComputedStyle(element);

        //Create span element to get the width of the text
        const measureSpan = document.createElement("span");
        measureSpan.style.cssText = `
            position: absolute;
            visibility: hidden;
            font-family: ${computedStyle.fontFamily};
            font-size: ${computedStyle.fontSize};
            letter-spacing: ${computedStyle.letterSpacing};
            white-space: pre;
        `;
        measureSpan.textContent = element.value.slice(0, cursorPosition);
        document.body.appendChild(measureSpan);

        const textWidth = measureSpan.getBoundingClientRect().width;
        document.body.removeChild(measureSpan);

        // Take current div element and put it where spasn and put styling the same
        this.cover.style.top = `${rect.top + window.scrollY}px`;
        this.cover.style.left = `${rect.left + window.scrollX + textWidth}px`;
        this.cover.style.height = computedStyle.lineHeight;
        this.cover.style.padding = computedStyle.padding;
        this.cover.style.fontSize = computedStyle.fontSize;
        this.cover.style.fontFamily = computedStyle.fontFamily;
        this.cover.style.letterSpacing = computedStyle.letterSpacing;
        this.cover.style.lineHeight = computedStyle.lineHeight;

        // Will only show the suggestion
        this.cover.textContent = suggestion;
        this.cover.style.display = "block";

    }

    // When they press tab the suggestion will not be showed anymore
    hide() {
        this.cover.style.display = "none";
    }

}

// AI class for getcompletion 
class AIcompletion {
    constructor() {
        this.currentElement = null;
        this.suggestion = "";
        this.cover = new SuggestionCover();
        this.cursorPositio = 0;

        this.debounceGetSuggestions = debounce(
            this.debounceGetSuggestions.bind(this),
            500
        );

        this.setupEventListeners();
    }
}