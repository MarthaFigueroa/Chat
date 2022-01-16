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
        console.log("ekis", usernameSession);
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

        console.log("gg",msg);
        displayMessage('you-message', msg);
        socket.emit('sendMessage', msg);
    }

    function sendlogin(message){
        const msg = {
            username: usernameSession,
            message: message
        }

        console.log("gg",msg);
        display(msg);
        socket.emit('getUsers');
        socket.emit('updateState', {username: msg.username, state: true});
    }

    const createRoom = (to, from) =>{
        console.log(to.id);
        let room = to.id+"-"+from;
        socket.emit('create', {room: room, userID: loggedUser.userID, withUser: to.id});
        console.log("Created Room:", {room: room, userID: loggedUser.userID, withUser: to});
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
        console.log("Jaja", msg);
        displayMessage('other-message', msg);
    });

    socket.on('sendStatusToAll', msg=>{
        console.log("Jaja", msg);
        display(msg);
    });

    socket.on('sendLogoutToAll', msg=>{
        console.log("Jaja", msg);
        document.getElementById(msg.username).style.color = 'red' ;
        socket.emit('updateState', {username: msg.username, state: false});
        display(msg);
    });

    socket.on('state', state =>{
        console.log("ssss",state);
        state.users.map(user =>{

            console.log("kednc", document.getElementById(user.username));
            document.getElementById(user.username).style.color = 'greenyellow' ;
        })

        state.disconnectedUsers.map(disconnectedUser => {
            console.log("dcx", document.getElementById(disconnectedUser.username));
            document.getElementById(disconnectedUser.username).style.color = 'red' ;
        })
    });

    socket.on('listUsernames', data =>{
        console.log("7857",data);
        let listUsers="";
        // for(i=0; i < data.connectedUsers.length; i++){
        data.connectedUsers.map((connectedUser, i) =>{
            listUsers += `<li><a onclick="createRoom(${connectedUser.username}, '${usernameSession}')">${connectedUser.username}</a></li>`;
            // <div class="users-div">
            //     <li class=""><a>${connectedUser.username}<i class="fas fa-circle state active" id="${connectedUser.username}"></i></a></li>
            // </div>
        })
        // for(i=0; i < data.disconnectedUsers.length; i++){
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
        console.log("777",data);
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
            console.log("Salgoooo");

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