const socket = io();

    const loggedUsers = [];
    const message = document.getElementById('message');
    const buttonSend = document.getElementById('button-send');
    const buttonLogout = document.getElementById('button-logout');
    const chat = document.getElementsByClassName('chat-content');
    const showedMessage = document.querySelector('.message');
    const usersDiv = document.getElementById('usersDiv');
    const submenu = document.getElementById('submenu');

    let newUser;
    let loggedUser;
    let usernameSession;
    buttonSend.addEventListener('click', (e)=>{
        e.preventDefault();
        sendMessage(message.value);
        message.value = "";
    });

    window.onload = function(){
        newUser = sessionStorage.getItem('username');
        loggedUser = JSON.parse(newUser);
        usernameSession = JSON.parse(newUser).username;
        if(newUser != "" && newUser != null){
            document.title = usernameSession;
            document.getElementById('name').innerHTML = `${usernameSession} <i class="fas fa-circle state"></i>`;
            document.getElementById('nameChat').innerHTML = usernameSession;
            document.querySelector('.state').style.color = 'greenyellow';
            message.focus();
            const msg = "Joined de Group";
            sendlogin(msg);
        }else{
            window.location.href = "/";
        }
    }
    
    buttonLogout.addEventListener('click', (e)=>{
        e.preventDefault();
        const message = "Left the group";
        sendLogout(message);
    });

    function sendMessage(message){
        const msg = {
            username: usernameSession,
            message: message
        }

        displayMessage('you-message', msg);
        socket.emit('sendMessage', msg);
    }

    function sendlogin(message){
        const msg = {
            username: usernameSession,
            message: message
        }

        display(msg);
        socket.emit('getUsers');
        socket.emit('updateState', {username: msg.username, state: true});
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

        display(msg);
        message.disabled = true;
        buttonSend.disabled = true;
        document.querySelector('.state').style.color = 'red';
        sessionStorage.removeItem('username');
        socket.emit('end', msg);
        window.location.href = '/';
    }

    socket.on('redirect', function(destination) {
        window.location.href = destination;
    });

    socket.on('sendToAll', msg=>{
        displayMessage('other-message', msg);
    });

    socket.on('sendStatusToAll', msg=>{
        display(msg);
    });

    socket.on('sendLogoutToAll', msg=>{
        document.getElementById(msg.username).style.color = 'red' ;
        socket.emit('updateState', {username: msg.username, state: false});
        display(msg);
    });

    socket.on('state', state =>{
        state.users.map(user =>{
            document.getElementById(user.username).style.color = 'greenyellow' ;
        })

        state.disconnectedUsers.map(disconnectedUser => {
            document.getElementById(disconnectedUser.username).style.color = 'red' ;
        })
    });

    socket.on('listUsernames', data =>{
        let listUsers="";
        data.connectedUsers.map((connectedUser, i) =>{
            listUsers += `<li><a onclick="createRoom(${connectedUser.username}, '${usernameSession}')">${connectedUser.username}</a></li>`;

        })
        data.disconnectedUsers.map((disconnectedUser, i) =>{
            listUsers += `<li><a onclick="createRoom(${disconnectedUser.username}, '${usernameSession}')">${disconnectedUser.username}</a></li>`;
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

    socket.on('usernames', data =>{
        let innerUsers = '<b>Participants:</b> ';
            data.connectedUsers.map((connectedUser, i) =>{
                
                innerUsers += `<p class="users-list">${connectedUser.username}<i class="fas fa-circle state active" id="${connectedUser.username}"></i></p>     `;
                
                if(data.connectedUsers[i+1]){
                    innerUsers += ' , ';
                }
            })
            data.disconnectedUsers.map((disconnectedUser, i) =>{

                innerUsers += `<p class="users-list">${disconnectedUser.username}<i class="fas fa-circle state inactive" id="${disconnectedUser.username}"></i></p>     `;
                if(data.disconnectedUsers[i+1]){
                    innerUsers += ' , ';
                }
            })
            usersDiv.innerHTML = innerUsers;

    })

    function displayMessage(type, message){
        const msgDiv = document.createElement('div');
        let classname = type;
        msgDiv.classList.add(classname, 'message-row');
        let times = new Date().toLocaleDateString();

        let innerText = `
        <div class="message-title">
            🐧<span>${message.username}</span>
        </div>
        <div class="message-text">
            ${message.message}
        </div>
        <div class="message-time">${times}</div>
        `;

        msgDiv.innerHTML = innerText;
        showedMessage.appendChild(msgDiv);
    }