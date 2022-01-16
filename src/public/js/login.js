const socket = io();

const buttonLogin = document.getElementById('button-login');
const username = document.getElementById('username');
username.focus();

buttonLogin.addEventListener('click', (e)=>{
    e.preventDefault();
    console.log(username);
    const msg = "Joined de Group"
    sendlogin(msg, username.value);
})

function sendlogin(message, username){
    console.log(username);
    const msg = {
        username: username,
        message: message
    }

    socket.emit('join', msg);
}

socket.on("newUser", data =>{
    sessionStorage.setItem('username', JSON.stringify(data));
});

socket.on('redirect', function(destination) {
    window.location.href = destination;
});