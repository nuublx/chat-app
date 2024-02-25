"use strict";

const socket = io('ws://localhost:3500');
const activity = document.querySelector('.activity')
const msgInput = document.querySelector('#message')

function sendMessage(e) {
    e.preventDefault();
    if (!!msgInput.value) {
        socket.emit('message', msgInput.value);
        msgInput.value = '';
    }
    msgInput.focus();
}

document.querySelector('form').addEventListener('submit', sendMessage);

msgInput.addEventListener('keypress', () => {
    socket.emit('activity', socket.id.substring(0, 5))
})

socket.on('message', (data) => {
    activity.textContent = "";
    const messages = document.getElementById('messages');
    const message = document.createElement('li');
    message.textContent = data;
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
});
let activityTimer;
socket.on('activity', (data) => {
    activity.textContent = data;
    clearTimeout(activityTimer);
    activityTimer = setTimeout(() => { activity.textContent = "" }, 2000);
});