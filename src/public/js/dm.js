const socket = io();

    const message = document.getElementById('message');
    const buttonSend = document.getElementById('button-send');
    const buttonSearch = document.getElementById('button-search');
    const buttonLogout = document.getElementById('button-logout');
    const chat = document.getElementsByClassName('chat-content');
    const showedMessage = document.querySelector('.message');
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const username = urlParams.get('username')
    
    const newUser = sessionStorage.getItem('username');
    let usernameSession = JSON.parse(newUser).username;
    let loggedUser = JSON.parse(newUser);

    if(newUser != "" && newUser != null){
        document.title = usernameSession;
        document.getElementById('name').innerHTML = `${usernameSession} <i class="fas fa-circle state"></i>`;
        document.querySelector('.state').style.color = 'greenyellow';
        document.getElementById('nameChat').innerHTML = username;
        socket.emit('getUsers');
    }else{
        window.location.href = "/";
    }

    buttonSend.addEventListener('click', (e)=>{
        e.preventDefault();
        sendMessage(message.value);
        message.value = "";
    });

    buttonLogout.addEventListener('click', (e)=>{
        e.preventDefault();
        const message = "Left the group";
        sendLogout(message);
    });
    
    function sendMessage(message){
        const msg = {
            me: usernameSession,
            message: message,
            username: username
        }

        displayMessage('you-message', msg);
        socket.emit('sendDirectMessage', msg);
    }

    const createRoom = (to, from) =>{
        let room = to.id+"-"+from;
        socket.emit('create', {room: room, userID: loggedUser.userID, withUser: to.id});
        console.log("Created Room:", {room: room, userID: loggedUser.userID, withUser: to.id});
        window.location.href = `/dm?username=${to.id}`;
    }

    socket.on('invite', data =>{
        socket.emit('joinRoom', data);
    })

    function sendLogout(message){
        const msg = {
            username: usernameSession,
            message: message
        }

        console.log("logout",msg);
        display(msg);
        socket.emit('end', msg);
    }

    socket.on('redirect', function(destination) {
        window.location.href = destination;
    });

    socket.on('sendToAll', msg=>{
        displayMessage('other-message', msg);
    });

    socket.on('sendDm', msg =>{
        displayMessage('other-message', msg);
    });

    socket.on('listUsernames', data =>{
        let listUsers="";
        data.connectedUsers.map((connectedUser) =>{
            listUsers += `<li><a onclick="createRoom('${connectedUser.username}', '${usernameSession}')">${connectedUser.username}</a></li>`;
        })
        data.disconnectedUsers.map((disconnectedUser) =>{
            listUsers += `<li><a onclick="createRoom('${disconnectedUser.username}', '${usernameSession}')">${disconnectedUser.username}</a></li>`;
        })
        submenu.innerHTML = listUsers;
    })

    function display(message){
        const msgDiv = document.createElement('div');
        msgDiv.classList.add("message-status", 'message-row');

        let innerText = `
            🐧<span>${message.username} - ${message.message}</span>
            `;

        msgDiv.innerHTML = innerText;
        showedMessage.appendChild(msgDiv);
    }
    
    function displayMessage(type, message){
        const msgDiv = document.createElement('div');
        let classname = type;
        msgDiv.classList.add(classname, 'message-row');
        let times = new Date().toLocaleDateString();

        if(usernameSession ===  message.username || usernameSession ===  message.me){
            let innerText = `
            <div class="message-title">
                🐧<span>${message.me}</span>
            </div>
            <div class="message-text">
                ${message.message}
            </div>
            <div class="message-time">${times}</div>
            `;    
            msgDiv.innerHTML = innerText;
            showedMessage.appendChild(msgDiv);
        }
    }