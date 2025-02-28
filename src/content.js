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
        this.cursorPosition = 0;

        this.debounceGetSuggestions = debounce(
            this.debounceGetSuggestions.bind(this),
            500
        );

        this.setupEventListeners();
    }

    // Function to get suggestion
    async getSuggestion(text, cursorPosition){
        // If no text is display we will not show anything
        if(!text.trim()){
            this.suggestion = "";
            this.cover.hide();
            return;
        }

        // If there is text we should display something
        try {
            const suggestion = await getCompletion(text);
            this.suggestion = suggestion.trim();
            if (this.currentElement && this.suggestion) {
                this.cover.show(this.currentElement, this.suggestion, cursorPosition);
            }
        } catch(error){
            console.error("Error getting suggestion:", error);
            this.suggestion = "";
            this.cover.hide();
        }
    }

    // Event listeres

    // Main  handle input
    handleInput(event){
        const element = event.target;
        this.currentElement = element;
        this.cursorPosition = element.selectionStart;
        this.debounceGetSuggestions(element.value, this.cursorPosition);
    }

    // Handle when TAB is press and accept suggestion
    handleKeyDown(event){
        if(event.key === "Tab" && this.suggestion){
            event.preventDefault();
            const element = event.target;
            const beforeCursor = element.value.slice(0, this.cursorPosition);
            const afterCursor = element.value.slice(this.cursorPosition);
            element.value = beforeCursor + this.suggestion + afterCursor;

            // Move the cursor to the end of inserted suggestion
            const newCursorPosition = this.cursorPosition + this.suggestion.length;
            element.setSelectionRange(newCursorPosition, newCursorPosition);

            // reset suggestion to none 
            this.suggestion = "";
            this.cover.hide();
        }
    }

    // Handles cursor position when user moves it
    handleSelectionChange(event){
        if (this.currentElement === event.target){
            this.cursorPosition = event.target.selectionStart;
            if(this.suggestion){
                this.cover.show(
                    this.currentElement,
                    this.suggestion,
                    this.cursorPosition
                );
            }
        }
    }

    handleFocus(event) { 
        this.currentElement = event.target;
        this.cursorPosition = event.target.selectionStart;
        if (event.target.value && this.suggestion){
            this.cover.show(event.target, this.suggestion, this.cursorPosition);
        }
    }

    handleBlur() {
        this.currentElement = null;
        this.cover.hide();
    }

    
    //Register eventListerners
    setupEventListeners() {
        document.addEventListener("input", this.handleInput.bind(this), true);
        document.addEventListener("keydown", this.handleKeyDown.bind(this), true);
        document.addEventListener("focus", this.handleFocus.bind(this), true);
        document.addEventListener("blur", this.handleBlur.bind(this), true);
        document.addEventListener("selectionchange", this.handleSelectionChange.bind(this), true);
    }


}