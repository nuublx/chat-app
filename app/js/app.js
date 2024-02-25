"use strict";

const socket = io('ws://localhost:3500');
const msgInput = document.querySelector('#message')
const nameInput = document.querySelector('#name')
const chatRoom = document.querySelector('#room')

const activity = document.querySelector('.activity')
let activityTimer;

const usersList = document.querySelector('.user-list')
const roomList = document.querySelector('.room-list')
const chatDisplay = document.querySelector('.chat-display')

function sendMessage(e) {
    e.preventDefault();
    if (!!nameInput && !!msgInput.value && !!chatRoom.value) {
        socket.emit('message', {
            name: nameInput.value,
            text: msgInput.value,
        });
        msgInput.value = '';
    }
    msgInput.focus();
}

function enterRoom(e) {
    e.preventDefault()
    if (!!nameInput.value && !!chatRoom.value) {
        socket.emit('enterRoom', {
            name: nameInput.value,
            room: chatRoom.value
        });
    }
}

document.querySelector('.form-join').addEventListener('submit', enterRoom);
document.querySelector('.form-msg').addEventListener('submit', sendMessage);

msgInput.addEventListener('keypress', () => {
    socket.emit('activity', nameInput.value)
})

socket.on('message', (data) => {
    activity.textContent = "";
    const { name, text, time } = data;
    const message = document.createElement('li');
    message.className = 'post';
    if (name === nameInput.value)
        message.className = 'post post--left'
    if (name !== nameInput.value && name !== 'Admin')
        message.className = 'post post--right';

    if (name !== 'Admin') {
        message.innerHTML = `
            <div class="post__header ${name === nameInput.value ?
                'post__header--user' : 'post__header--reply'}">
                <span class="post__header--name">${name}</span>
                <span class="post__header--time">${time}</span>
            </div>
            <div class="post__text">${text}</div>
            `
    } else {
        message.innerHTML = `<div class="post__text">${text}</div>`
    }
    chatDisplay.appendChild(message);
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
});
socket.on('activity', (data) => {
    activity.textContent = `${data} is typing...`;
    clearTimeout(activityTimer);
    activityTimer = setTimeout(() => { activity.textContent = "" }, 2000);
});

socket.on('userList', ({ users }) => {
    showUsers(users);
})

socket.on('roomList', ({ rooms }) => {
    showRooms(rooms);
})

function showUsers(users) {
    usersList.textContent = '';
    if (users) {
        usersList.innerHTML = `<em>Users in ${chatRoom.value}: </em>`
        users.forEach((user, i) => {
            usersList.innerHTML += `${user.name}`
            if (users.length > 1 && i !== users.length - 1) {
                usersList.textContent += ', '
            }
        });
    }
}

function showRooms(rooms) {
    roomList.textContent = '';
    if (rooms) {
        roomList.innerHTML = '<em>Active Rooms: </em>'
        rooms.forEach((room, i) => {
            roomList.innerHTML += `${room}`
            if (rooms.length > 1 && i !== rooms.length - 1) {
                roomList.textContent += ', '
            }
        });
    }
}