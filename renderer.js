const socket = io('http://localhost:5500')
const lobby = document.getElementById('lobby')
const settings = document.getElementById('settings')
const lobbyName = document.getElementById('lobbyName')
const createBtn = document.getElementById('createBtn')
const search = document.getElementById('search')
const lobbyList = document.getElementById('lobbyList')
const lobbyInfo = document.getElementById('lobbyInfo')

let clientPlayer = null
let lobbies = []
let inLobby = false

setInterval(() => {
    socket.emit('message', JSON.stringify({event: 'lobbies', payload: {}}))
}, 1000)

window.addEventListener("keypress", (e) => {
    if(inLobby){
        let key = e.key.toLowerCase()
        for(const [prop, value] of Object.entries(clientPlayer)){
            if(typeof value === 'object' && value !== null && value.key?.toLowerCase() == key){
                let lobbyID  
                lobbies.map((lobby) => {
                    lobby.players.map((player) => {
                        if(player.id == clientPlayer.id){
                            lobbyID = lobby.id
                        }
                    })
                })
                socket.emit('message', JSON.stringify({event: 'cast', payload: {lobbyID: lobbyID, ability: prop.toString()}}))
                let cdInit = clientPlayer[prop].cooldown
                let interval = setInterval(() => {
                    clientPlayer[prop].cooldown -= 0.01
                    let playerDiv = document.getElementById(clientPlayer.id)
                    let cdDiv
                    for(let i = 0; i < playerDiv.childNodes.length; i++){
                        if(playerDiv.childNodes[i].id?.toLowerCase() == clientPlayer[prop].key.toLowerCase()){
                            cdDiv = playerDiv.childNodes[i]
                            break
                        }
                    }
                    cdDiv.innerHTML = clientPlayer[prop].cooldown.toFixed(2)
                    if(startCooldown(interval, clientPlayer[prop].cooldown)){
                        clientPlayer[prop].cooldown = cdInit
                        cdDiv.innerHTML = clientPlayer[prop].cooldown.toFixed(2)
                    }
                }, 10)
            }
        }
    }
})

const toggleDisplay = (id) => {
    lobby.style.display = id === 1 ? 'block' : 'none'
    settings.style.display = id === 2 ? 'block' : 'none'
}

const getSettings = () => {
    return {
        username: null,
        ability1: {
            key: 'Q',
            cooldown: 1
        },
        ability2: {
            key: 'W',
            cooldown: 5
        },
        ability3: {
            key: 'E',
            cooldown: 10
        },
        ability4: {
            key: 'R',
            cooldown: 15
        },
        ability5: {
            key: 'D',
            cooldown: 20
        },
        ability6: {
            key: 'F',
            cooldown: 25
        }
    }
}

lobbyName.addEventListener("keyup", () => {
    if(lobbyName.value.length >= 3){
        createBtn.disabled = false
    }else{
        createBtn.disabled = true
    }
})

const refreshLobbies = () => {
    lobbyList.innerHTML = ''

    if(search.value == ''){
        data = lobbies
    } else {
        data = lobbies.filter((lobby) => lobby.name.toLowerCase().includes(search.value.toLowerCase()))
    }

    data.map((lobby) => {
        let tr = document.createElement('tr')
        
        let td = document.createElement('td')
        td.innerHTML = lobby.name
        tr.appendChild(td)

        td = document.createElement('td')
        td.innerHTML = lobby.players.length
        tr.appendChild(td)

        td = document.createElement('td')
        td.innerHTML = '<button onclick="joinLobby(\'' + lobby.id + '\')">Join</button>'
        tr.appendChild(td)

        lobbyList.appendChild(tr)
    })
}

const createLobby = () => {
    socket.emit('message', JSON.stringify({event: 'create', payload: {name: lobbyName.value, password: ''}}))
    lobbyName.value = ''
    createBtn.disabled = true
}

const joinLobby = (id) => {
    socket.emit('message', JSON.stringify({event: 'join', payload: {lobbyID: id, password: ''}}))
}

const startGame = (lobbyID) => {
    document.getElementById("original").style.display = "none"
    document.getElementById("inGame").style.display = "block"
    let list = document.getElementById("inGamePlayerList")
    list.innerHTML = ''
    lobbies.map((lobby) => {
        if(lobby.id == lobbyID){
            lobby.players.map((player) => {
                let div = document.createElement('div')
                div.id = player.id
                div.innerHTML = player.username + ': '
                
                let span = document.createElement('span')
                span.innerHTML = player.ability1.key + ' '
                div.appendChild(span)

                span = document.createElement('span')
                span.id = player.ability1.key
                span.innerHTML = player.ability1.cooldown.toFixed(2)
                div.appendChild(span)

                span = document.createElement('span')
                span.innerHTML = ' | ' + player.ability2.key + ' '
                div.appendChild(span)
                
                span = document.createElement('span')
                span.id = player.ability2.key
                span.innerHTML = player.ability2.cooldown.toFixed(2)
                div.appendChild(span)

                span = document.createElement('span')
                span.innerHTML = ' | ' + player.ability3.key + ' '
                div.appendChild(span)

                span = document.createElement('span')
                span.id = player.ability3.key
                span.innerHTML = player.ability3.cooldown.toFixed(2)
                div.appendChild(span)

                span = document.createElement('span')
                span.innerHTML = ' | ' + player.ability4.key + ' '
                div.appendChild(span)

                span = document.createElement('span')
                span.id = player.ability4.key
                span.innerHTML = player.ability4.cooldown.toFixed(2)
                div.appendChild(span)

                span = document.createElement('span')
                span.innerHTML = ' | ' + player.ability5.key + ' '
                div.appendChild(span)

                span = document.createElement('span')
                span.id = player.ability5.key
                span.innerHTML = player.ability5.cooldown.toFixed(2)
                div.appendChild(span)

                span = document.createElement('span')
                span.innerHTML = ' | ' + player.ability6.key + ' '
                div.appendChild(span)

                span = document.createElement('span')
                span.id = player.ability6.key
                span.innerHTML = player.ability6.cooldown.toFixed(2)
                div.appendChild(span)
                
                list.appendChild(div)
            })
        }
    })
}

const showLobby = (data) => {
    let leaveBtn = document.getElementById('leaveBtn')
    leaveBtn.onclick = () => {
        socket.emit('message', JSON.stringify({event: 'leave', payload: {lobbyID: data.id}}))
        document.getElementById("mainLobby").style.display = "block"
        document.getElementById("inLobby").style.display = "none"
        inLobby = false
    }

    let startBtn = document.getElementById('startBtn') || document.createElement('button')
    startBtn.id = 'startBtn'
    startBtn.innerHTML = 'Start'
    startBtn.style.float = 'right'
    startBtn.onclick = () => {
        socket.emit('message', JSON.stringify({event: 'start', payload: {lobbyID: data.id}}))
        startGame(data.id)
    }

    if(data){
        inLobby = true
        let h5 = document.getElementById('lobbyInfoName')
        h5.innerHTML = data.name
        
        let table = document.getElementById('playerList')
        table.innerHTML = ''
        let owner = data.players.filter((player) => player.username == clientPlayer.username)[0].owner
        if(owner){
            document.getElementById('lobbyBtns').appendChild(startBtn)
        }
        data.players.map((player) => {
            let tr = document.createElement('tr')
            
            let td = document.createElement('td')
            td.innerHTML = player.username + (player.owner ? ' <i>(Owner)</i>' : '')
            tr.appendChild(td)
    
            let checkbox = document.createElement('input')
            checkbox.type = 'checkbox'
            checkbox.checked = player.ability1.enabled
            checkbox.disabled = !owner
            td = document.createElement('td')
            td.appendChild(checkbox)
            tr.appendChild(td)
    
            checkbox = document.createElement('input')
            checkbox.type = 'checkbox'
            checkbox.checked = player.ability2.enabled
            checkbox.disabled = !owner
            td = document.createElement('td')
            td.appendChild(checkbox)
            tr.appendChild(td)
    
            checkbox = document.createElement('input')
            checkbox.type = 'checkbox'
            checkbox.checked = player.ability3.enabled
            checkbox.disabled = !owner
            td = document.createElement('td')
            td.appendChild(checkbox)
            tr.appendChild(td)
    
            checkbox = document.createElement('input')
            checkbox.type = 'checkbox'
            checkbox.checked = player.ability4.enabled
            checkbox.disabled = !owner
            td = document.createElement('td')
            td.appendChild(checkbox)
            tr.appendChild(td)
    
            checkbox = document.createElement('input')
            checkbox.type = 'checkbox'
            checkbox.checked = player.ability5.enabled
            checkbox.disabled = !owner
            td = document.createElement('td')
            td.appendChild(checkbox)
            tr.appendChild(td)
    
            checkbox = document.createElement('input')
            checkbox.type = 'checkbox'
            checkbox.checked = player.ability6.enabled
            checkbox.disabled = !owner
            td = document.createElement('td')
            td.appendChild(checkbox)
            tr.appendChild(td)
    
            checkbox = document.createElement('input')
            checkbox.type = 'checkbox'
            checkbox.checked = player.enabled
            checkbox.disabled = !owner
            td = document.createElement('td')
            td.appendChild(checkbox)
            tr.appendChild(td)
    
            table.appendChild(tr)
        })
    
        document.getElementById("mainLobby").style.display = "none"
        document.getElementById("inLobby").style.display = "block"
    }
}

const startCooldown = (interval, cooldown) => {
    if(cooldown <= 0){
        clearInterval(interval)
        return true
    }
    return false
}

socket.on('broadcast', (data) => {
    let response = JSON.parse(data)
    let event = response.event
    let payload = response.payload

    if(payload.status == 200){
        switch(true){
            case payload.message == 'Connected.':
                socket.emit('message', JSON.stringify({event: 'register', payload: getSettings()}))
                break;
            case payload.message == 'Player registered.':
                clientPlayer = payload.data
                socket.emit('message', JSON.stringify({event: 'lobbies', payload: {}}))
                break;
            case payload.message == 'List of lobbies.':
                lobbies = payload.data
                refreshLobbies(lobbies)
                break;
            case payload.message == 'Lobby created.':
                showLobby(payload.data)
                break;
            case payload.message.includes('joined the lobby.'):
                showLobby(payload.data)
                break;
            case payload.message.includes('left the lobby.'):
                showLobby(payload.data)
                break;
            case payload.message.includes('Sync Cooldown.'):
                lobbies.map((lobby) => {
                    lobby.players.map((player) => {
                        if(player.id == payload.data.player.id){
                            for(const [prop, value] of Object.entries(player)){
                                if(typeof value === 'object' && value !== null && value.key?.toLowerCase() == payload.data.ability.key.toLowerCase()){
                                    let cdInit = player[prop].cooldown
                                    let interval = setInterval(() => {
                                        player[prop].cooldown -= 0.01
                                        let playerDiv = document.getElementById(player.id)
                                        let cdDiv
                                        for(let i = 0; i < playerDiv.childNodes.length; i++){
                                            if(playerDiv.childNodes[i].id?.toLowerCase() == player[prop].key.toLowerCase()){
                                                cdDiv = playerDiv.childNodes[i]
                                                break
                                            }
                                        }
                                        cdDiv.innerHTML = player[prop].cooldown.toFixed(2)
                                        if(startCooldown(interval, player[prop].cooldown)){
                                            player[prop].cooldown = cdInit
                                            cdDiv.innerHTML = player[prop].cooldown.toFixed(2)
                                        }
                                    }, 10)
                                }
                            }
                        }
                    })
                })
                break;
            case payload.message == 'Lobby started.':
                startGame(payload.data.id)
                break;
            default:
                console.log('Unhandled event, message: ' + payload.message)
                break;
        }
    }
    else if(payload.status == 1){
        socket.emit('message', JSON.stringify({event: 'pong', payload: {}}))
    } 
    else {
        console.log(response)
    }
})