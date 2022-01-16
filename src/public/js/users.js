const socket = io();
let updateUsrBtn = document.getElementById('update-state');
let userList = document.getElementById('usersList');
let submenu = document.getElementById('submenu');

window.onload = function(){
    const newUser = sessionStorage.getItem('username');
    let usernameSession = JSON.parse(newUser).username;
    document.getElementById('name').innerHTML = `${usernameSession} <i class="fas fa-circle state"></i>`;
    document.querySelector('.state').style.color = 'greenyellow';
    socket.emit('getUsers');
}

socket.on('listUsernames', data =>{
    let innerUsers="";
    let listUsers="";
    // for(i=0; i < data.connectedUsers.length; i++){
    data.connectedUsers.map((connectedUser, i) =>{
        innerUsers += `
        <div class="col-sm-4 users-div">
            <li>
                <div class="card border-success text-center">
                    <div class="card-header bg-success text-white">
                            <a>${connectedUser.username}<i class="fas fa-circle state active" id="${connectedUser.username}"></i></a>
                    </div>
                    <div class="card-body">
                        <p class="card-text">Activo</p>
                    </div>
                </div>
            </li>
        </div>
        `;
        // <button onclick="redirect(${connectedUser.username})" class="btn btn-secondary">Send Message</button>

        listUsers += `<li><a onclick="redirect(${connectedUser.username})">${connectedUser.username}</a></li>`;
    })
    // for(i=0; i < data.disconnectedUsers.length; i++){
    data.disconnectedUsers.map((disconnectedUser, i) =>{
        innerUsers += `
        <div class="col-sm-4 users-div">
            <li>
                <div class="card border-danger text-center">
                    <div class="card-header bg-danger text-white">
                            <a>${disconnectedUser.username}<i class="fas fa-circle state inactive" id="${disconnectedUser.username}"></i></a>
                    </div>
                    <div class="card-body">
                        <p class="card-text">Inactivo</p>
                    </div>
                </div>
            </li>
        </div>
        `;
        // <button onclick="redirect('${disconnectedUser.username}')" class="btn btn-secondary">Send Message</button>
        listUsers += `<li><a onclick="redirect(${disconnectedUser.username})">${disconnectedUser.username}</a></li>`;
    })
    userList.innerHTML = innerUsers;
    submenu.innerHTML = listUsers;
})

function redirect(username){
    window.location.href = `/dm?username=${username.id}`;
}

socket.on('redirect', function(destination) {
    window.location.href = destination;
});

updateUsrBtn.addEventListener('click', ()=>{
    window.location.reload();
})

function searchUsr() {
    var input, filter, ul, li, a, i, txtValue,div;
    input = document.getElementById("usr_search"); 
    filter = input.value.toUpperCase(); 
    ul = document.getElementById("usersList"); 
    li = ul.getElementsByTagName("li");
    console.log(li.length);
    div = document.getElementsByClassName("users-div");
    for (i = 0; i < li.length; i++) {  
    a = li[i].getElementsByTagName("a")[0]; 
    txtValue = a.textContent || a.innerText; //a.textContent || a.innerText; 
    console.log(txtValue);
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
        li[i].style.display = "";
        div[i].style.visibility="visible";
        div[i].style.position="relative";
    } else {
        li[i].style.display = "none";
        div[i].style.visibility="hidden";
        div[i].style.position="absolute";
    }
    }
}