"use strict";

const socket = io('ws://localhost:3500');

function sendMessage(e) {
    e.preventDefault();
    const message = document.getElementById('message');

    if (!!message.value) {
        socket.emit('message', message.value);
        message.value = '';
    }
    message.focus();
}

document.querySelector('form').addEventListener('submit', sendMessage);

socket.on('message', (data) => {
    const messages = document.getElementById('messages');
    const message = document.createElement('li');
    message.textContent = data;
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
});