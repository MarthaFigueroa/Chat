const express = require('express');
const path = require('path');
const app = express();
const http = require('http');
const { connect } = require('http2');
const server = http.createServer(app);
const io = require("socket.io")(server, {  
  cors: {    
    origin: "https://localhost:3000/",  
  },
});
const PORT = process.env.PORT || 3000;
const disconnectedUsers = [];
const users = [];
const rooms = [];
app.use('/', express.static(path.join(__dirname, '/public')));    
app.use(express.urlencoded({extended: false}));  
app.use(express.json());

app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);

app.get('/', (req, res) =>{
  res.render('index.html');
});

app.get('/chat', (req, res) =>{
  res.render('chat.html');
});

app.get('/principal', (req, res) =>{
  res.render('principal.html');
});

app.get('/dm', (req, res) =>{
  res.render('directMessage.html');
});

app.get('/users', (req, res) =>{
  res.render('users.html');
});

io.on('connection', socket =>{
  const getListUsers = (data = []) => {
    const list = [];
    for (let [id, socket] of data) {  
      list.push({      
        userID: id,      
        username: socket.username,   
        connected: true 
      });  
    }
    return list  
  }

  socket.on('join', user => {
    if(user in users){
      console.log("Error");
    }else{
      // disconnectedUsers.map(disconnectedUser => {
      //   if(disconnectedUser.username == user.username){
      //     console.log("Hello again ", user.username);
      //     for( let i = 0; i < disconnectedUsers.length; i++){ 
      //       if ( disconnectedUsers[i] === user.username) { 
      //         disconnectedUsers.splice(i, 1); 
      //       }
      //     }
      //     console.log(disconnectedUsers);
      //     console.log(user.username,"online:",users[socket.nickname].connected );
      //     updateUsers();
      //     let payload = {connectedUsers: users, disconnectedUsers: disconnectedUsers};
      //     io.sockets.emit('usernames', payload );
      //   }else{
          console.log('New User Connected', user.username, user.message, " with ID:",socket.id);
          socket.username = user.username;
          users.push({      
            userID: socket.id,      
            username: socket.username,   
            connected: true 
          }); 
          console.log("Users List",users);
            users.map(user =>{
              console.log(user.username,"online:", user.connected );
            })
          updateUsers();
          socket.emit("newUser", { userID: socket.id, username: socket.username,connected: true });
          let payload = {connectedUsers: users, disconnectedUsers: disconnectedUsers};
          io.sockets.emit('usernames', payload );
    }
    socket.broadcast.emit('sendStatusToAll', user);
    const destination = '/chat';
    socket.emit('redirect', destination);
  });

  function updateUsers(){
    let payload = {connectedUsers: users, disconnectedUsers: disconnectedUsers};
    io.sockets.emit('usernames', payload );
    io.sockets.emit('listUsernames', payload );
  }

  socket.on('sendDirectMessage', msg =>{
    console.log(msg);
    const username = msg.username;
    console.log(username);
    users.map(user => {
      if(user.username === username){
        console.log("id", user.userID);
        socket.to(user.userID).emit('sendDm', msg);
        // users[username].emit('sendDm', msg); 
        console.log(msg);
        console.log("Direct Message");
      }
    });
    socket.broadcast.emit('sendToAll', msg);
  })

  socket.on('sendMessage', msg =>{
    console.log(msg);
    socket.broadcast.emit('sendToAll', msg);
  })

  socket.on('create', data =>{
    console.log("Create room");
    socket.join(data.room);
    users.map(user =>{
      if(user == data.withUser){
        socket.broadcast.to(user.userID).emit('invite', {room: data});
      }
    })
  })

  socket.on('joinRoom', data =>{
    socket.join(data.room.room);
  })

  socket.on('end', msg =>{
    console.log('User disconnected!');
    socket.broadcast.emit('state', {users: users, disconnectedUsers: disconnectedUsers, username: msg.username, state: false});
    socket.broadcast.emit('sendLogoutToAll', msg);
    socket.username = msg.username;
    users.map(user =>{
      if(user.username === msg.username){
        socket.id = user.userID;
        disconnectedUsers.push({      
          userID: socket.id,      
          username: socket.username,   
          connected: true 
        }); 

        console.log(user.userID,"logged out");
        users.splice(users.findIndex(user => user.username === msg.username), 1); 
      }
    })
    updateUsers();
    socket.disconnect(0);

    console.log(msg.username,"online:",false);
  });

  socket.on('updateState', data =>{
    let payload = {connectedUsers: users, disconnectedUsers: disconnectedUsers};
    io.sockets.emit('usernames', payload );
    console.log("updateState", data);
    disconnectedUsers.map(disconnectedUser => {
      if(!data.state && !disconnectedUser.username.includes(data.username)){
        socket.username = data.username;
        users.map(user =>{
          if(user.username === data.username){
            socket.id = user.userID;
            disconnectedUsers.push({      
              userID: socket.id,      
              username: socket.username,   
              connected: true 
            }); 
  
            console.log(user.userID,"logged out");
            users.splice(users.findIndex(user => user.username === msg.username), 1); 
          }
        })
      }
      socket.emit('state', {users: users, disconnectedUsers: disconnectedUsers, username: data.username, state: data.state});
    })
  })

  socket.on('getUsers', () =>{
    const data = {connectedUsers: users, disconnectedUsers: disconnectedUsers};
    if(Object.keys(data.connectedUsers).length > 0 || data.disconnectedUsers.length > 0){
      updateUsers();
    }else{
      const destination = '/';
      socket.emit('redirect', destination);
    }
  })
})

server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});