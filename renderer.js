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

setInterval(() => {
    socket.emit('message', JSON.stringify({event: 'lobbies', payload: {}}))
}, 1000)

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

const showLobby = (data) => {
    let leaveBtn = document.getElementById('leaveBtn')
    leaveBtn.onclick = () => {
        socket.emit('message', JSON.stringify({event: 'leave', payload: {lobbyID: data.id}}))
        document.getElementById("mainLobby").style.display = "block"
        document.getElementById("inLobby").style.display = "none"
    }

    let h5 = document.getElementById('lobbyInfoName')
    h5.innerHTML = data.name
    
    let table = document.getElementById('playerList')
    table.innerHTML = ''
    let owner = data.players.filter((player) => player.username == clientPlayer.username)[0].owner
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