const socket = io('http://localhost:5500')
const lobby = document.getElementById('lobby')
const settings = document.getElementById('settings')
const lobbyName = document.getElementById('lobbyName')
const createBtn = document.getElementById('createBtn')
const search = document.getElementById('search')
const lobbyList = document.getElementById('lobbyList')
const lobbyInfo = document.getElementById('lobbyInfo')
const appExitBtn = document.getElementById('appExitBtn')

appExitBtn.addEventListener('click', () => {
    api.close()
})

let clientPlayer = null
let lobbies = []
let inLobby = false

setInterval(() => {
    socket.emit('message', JSON.stringify({event: 'lobbies', payload: {}}))
}, 1000)

function listen_keypress(key){
    if(inLobby){
        key = key.toLowerCase()
        for(const [prop, value] of Object.entries(clientPlayer)){
            if(typeof value === 'object' && value !== null && value.key?.toLowerCase() == key){
                if(clientPlayer[prop].cooldown == clientPlayer[prop].cooldownMax){
                    let lobbyID  
                    lobbies.map((lobby) => {
                        lobby.players.map((player) => {
                            if(player.id == clientPlayer.id){
                                lobbyID = lobby.id
                            }
                        })
                    })
                    socket.emit('message', JSON.stringify({event: 'cast', payload: {lobbyID: lobbyID, ability: prop.toString()}}))
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
                        cdDiv.innerHTML = parseFloat(clientPlayer[prop].cooldown).toFixed(2)
                        if(startCooldown(interval, clientPlayer[prop].cooldown)){
                            clientPlayer[prop].cooldown = clientPlayer[prop].cooldownMax
                            cdDiv.innerHTML = parseFloat(clientPlayer[prop].cooldown).toFixed(2)
                        }
                    }, 10)
                }
            }
        }
    }
}

const toggleDisplay = (id) => {
    lobby.style.display = id === 1 ? 'block' : 'none'
    settings.style.display = id === 2 ? 'block' : 'none'
}

const setSettings = (input) => {
    localStorage.setItem(input.id, input.value)
}

const loadSettings = () => {
    document.getElementById('username').value = localStorage.getItem('username') ?? null
    document.getElementById('ability1_key').value = localStorage.getItem('ability1_key') ?? null
    document.getElementById('ability1_cooldown').value = localStorage.getItem('ability1_cooldown') ?? null
    document.getElementById('ability2_key').value = localStorage.getItem('ability2_key') ?? null
    document.getElementById('ability2_cooldown').value = localStorage.getItem('ability2_cooldown') ?? null
    document.getElementById('ability3_key').value = localStorage.getItem('ability3_key') ?? null
    document.getElementById('ability3_cooldown').value = localStorage.getItem('ability3_cooldown') ?? null
    document.getElementById('ability4_key').value = localStorage.getItem('ability4_key') ?? null
    document.getElementById('ability4_cooldown').value = localStorage.getItem('ability4_cooldown') ?? null
    document.getElementById('ability5_key').value = localStorage.getItem('ability5_key') ?? null
    document.getElementById('ability5_cooldown').value = localStorage.getItem('ability5_cooldown') ?? null
    document.getElementById('ability6_key').value = localStorage.getItem('ability6_key') ?? null
    document.getElementById('ability6_cooldown').value = localStorage.getItem('ability6_cooldown') ?? null
}

const getSettings = () => {
    return {
        username: document.getElementById('username').value != '' ? document.getElementById('username').value : null,
        ability1: {
            key: document.getElementById('ability1_key').value != '' ? document.getElementById('ability1_key').value : 'Q',
            cooldown: document.getElementById('ability1_cooldown').value != '' ? document.getElementById('ability1_cooldown').value : 1,
            cooldownMax: document.getElementById('ability1_cooldown').value != '' ? document.getElementById('ability1_cooldown').value :  1
        },
        ability2: {
            key: document.getElementById('ability2_key').value != '' ? document.getElementById('ability2_key').value : 'W',
            cooldown: document.getElementById('ability2_cooldown').value != '' ? document.getElementById('ability2_cooldown').value : 5,
            cooldownMax: document.getElementById('ability2_cooldown').value != '' ? document.getElementById('ability2_cooldown').value :  5
        },
        ability3: {
            key: document.getElementById('ability3_key').value != '' ? document.getElementById('ability3_key').value : 'E',
            cooldown: document.getElementById('ability3_cooldown').value != '' ? document.getElementById('ability3_cooldown').value : 10,
            cooldownMax: document.getElementById('ability3_cooldown').value != '' ? document.getElementById('ability3_cooldown').value :  10
        },
        ability4: {
            key: document.getElementById('ability4_key').value != '' ? document.getElementById('ability4_key').value : 'R',
            cooldown: document.getElementById('ability4_cooldown').value != '' ? document.getElementById('ability4_cooldown').value : 15,
            cooldownMax: document.getElementById('ability4_cooldown').value != '' ? document.getElementById('ability4_cooldown').value :  15
        },
        ability5: {
            key: document.getElementById('ability5_key').value != '' ? document.getElementById('ability5_key').value : 'D',
            cooldown: document.getElementById('ability5_cooldown').value != '' ? document.getElementById('ability5_cooldown').value : 20,
            cooldownMax: document.getElementById('ability5_cooldown').value != '' ? document.getElementById('ability5_cooldown').value :  30
        },
        ability6: {
            key: document.getElementById('ability6_key').value != '' ? document.getElementById('ability6_key').value : 'F',
            cooldown: document.getElementById('ability6_cooldown').value != '' ? document.getElementById('ability6_cooldown').value : 25,
            cooldownMax: document.getElementById('ability6_cooldown').value != '' ? document.getElementById('ability6_cooldown').value :  25
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
    let original = document.getElementById("original")
    let inGame = document.getElementById("inGame")
    original.style.display = "none"
    inGame.style.display = "block"
    let inGameNav = document.getElementById("inGameNav") || document.createElement('nav')
    inGameNav.id = "inGameNav"
    inGameNav.innerHTML = ''
    let exitBtn = document.getElementById('exitBtn') || document.createElement('span')
    exitBtn.id = 'exitBtn'
    exitBtn.innerHTML = '&#10006;<br>'
    exitBtn.style.cursor = 'pointer'
    exitBtn.onclick = () => {
        original.style.display = "block"
        inGame.style.display = "none"
        api.toggle(800, 600, false)
    }
    inGameNav.appendChild(exitBtn)
    let list = document.getElementById("inGamePlayerList")
    inGame.insertBefore(inGameNav, list)
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
                span.innerHTML = parseFloat(player.ability1.cooldown).toFixed(2)
                div.appendChild(span)

                span = document.createElement('span')
                span.innerHTML = ' | ' + player.ability2.key + ' '
                div.appendChild(span)
                
                span = document.createElement('span')
                span.id = player.ability2.key
                span.innerHTML = parseFloat(player.ability2.cooldown).toFixed(2)
                div.appendChild(span)

                span = document.createElement('span')
                span.innerHTML = ' | ' + player.ability3.key + ' '
                div.appendChild(span)

                span = document.createElement('span')
                span.id = player.ability3.key
                span.innerHTML = parseFloat(player.ability3.cooldown).toFixed(2)
                div.appendChild(span)

                span = document.createElement('span')
                span.innerHTML = ' | ' + player.ability4.key + ' '
                div.appendChild(span)

                span = document.createElement('span')
                span.id = player.ability4.key
                span.innerHTML = parseFloat(player.ability4.cooldown).toFixed(2)
                div.appendChild(span)

                span = document.createElement('span')
                span.innerHTML = ' | ' + player.ability5.key + ' '
                div.appendChild(span)

                span = document.createElement('span')
                span.id = player.ability5.key
                span.innerHTML = parseFloat(player.ability5.cooldown).toFixed(2)
                div.appendChild(span)

                span = document.createElement('span')
                span.innerHTML = ' | ' + player.ability6.key + ' '
                div.appendChild(span)

                span = document.createElement('span')
                span.id = player.ability6.key
                span.innerHTML = parseFloat(player.ability6.cooldown).toFixed(2) + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
                div.appendChild(span)
                
                list.appendChild(div)
            })
        }
    })
    api.toggle(inGame.clientWidth, inGame.clientHeight, true)
}

const togglePlayer = (lobbyID, player, prop = null) => {
    if(prop){
        player[prop].enabled = !player[prop].enabled
    } else {
        player.enabled = !player.enabled
    }
    socket.emit('message', JSON.stringify({event: 'toggle', payload: {lobbyID: lobbyID, player: player}}))
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
            checkbox.onclick = () => {
                togglePlayer(data.id, player, 'ability1')
            }
            td = document.createElement('td')
            td.appendChild(checkbox)
            tr.appendChild(td)
    
            checkbox = document.createElement('input')
            checkbox.type = 'checkbox'
            checkbox.checked = player.ability2.enabled
            checkbox.disabled = !owner
            checkbox.onclick = () => {
                togglePlayer(data.id, player, 'ability2')
            }
            td = document.createElement('td')
            td.appendChild(checkbox)
            tr.appendChild(td)
    
            checkbox = document.createElement('input')
            checkbox.type = 'checkbox'
            checkbox.checked = player.ability3.enabled
            checkbox.disabled = !owner
            checkbox.onclick = () => {
                togglePlayer(data.id, player, 'ability3')
            }
            td = document.createElement('td')
            td.appendChild(checkbox)
            tr.appendChild(td)
    
            checkbox = document.createElement('input')
            checkbox.type = 'checkbox'
            checkbox.checked = player.ability4.enabled
            checkbox.disabled = !owner
            checkbox.onclick = () => {
                togglePlayer(data.id, player, 'ability4')
            }
            td = document.createElement('td')
            td.appendChild(checkbox)
            tr.appendChild(td)
    
            checkbox = document.createElement('input')
            checkbox.type = 'checkbox'
            checkbox.checked = player.ability5.enabled
            checkbox.disabled = !owner
            checkbox.onclick = () => {
                togglePlayer(data.id, player, 'ability5')
            }
            td = document.createElement('td')
            td.appendChild(checkbox)
            tr.appendChild(td)
    
            checkbox = document.createElement('input')
            checkbox.type = 'checkbox'
            checkbox.checked = player.ability6.enabled
            checkbox.disabled = !owner
            checkbox.onclick = () => {
                togglePlayer(data.id, player, 'ability6')
            }
            td = document.createElement('td')
            td.appendChild(checkbox)
            tr.appendChild(td)
    
            checkbox = document.createElement('input')
            checkbox.type = 'checkbox'
            checkbox.checked = player.enabled
            checkbox.disabled = !owner
            checkbox.onclick = () => {
                togglePlayer(data.id, player)
            }
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
                                        cdDiv.innerHTML = parseFloat(player[prop].cooldown).toFixed(2)
                                        if(startCooldown(interval, player[prop].cooldown)){
                                            player[prop].cooldown = cdInit
                                            cdDiv.innerHTML = parseFloat(player[prop].cooldown).toFixed(2)
                                        }
                                    }, 10)
                                }
                            }
                        }
                    })
                })
                break;
            case payload.message.includes('Toggled cooldowns'):
                showLobby(payload.data)
                break;
            case payload.message.includes('Lobby started.'):
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