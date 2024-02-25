"use strict";

const socket = new WebSocket('ws://localhost:3000');

function sendMessage(e) {
    e.preventDefault();
    const message = document.getElementById('message');

    if (!!message.value) {
        socket.send(message.value);
        message.value = '';
    }
    message.focus();
}

document.querySelector('form').addEventListener('submit', sendMessage);

socket.addEventListener('message', ({ data }) => {
    const messages = document.getElementById('messages');
    const message = document.createElement('li');
    message.textContent = data;
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
});