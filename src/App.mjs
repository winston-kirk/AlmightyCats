"use strict";

import * as PIXI from '../lib/pixi.min.mjs'
import KeyActions from './KeyActions.mjs'
import PlayerInputController from './PlayerInputController.mjs'
import PlayerActions from './PlayerActions.mjs'

class App
{
    #activeUISpace = App.UISpaces.MAIN_MENU
    #webSocketConnection = null
    #otherPlayers = []

    #pixiApplication = null
    #playerInputController = null
    #activeKeyActions = KeyActions.ACTION_NONE.flag
    #localPlayer = null

    static UISpaces =
    {
        INVALID : 'UISPACE_INVALID',
        BASE_GAME : 'UISPACE_BASE_GAME',
        MAIN_MENU : 'UISPACE_MAIN_MENU',
        DIRECT_CONNECT_MENU : 'UISPACE_DIRECT_CONNECT_MENU'
    }

    constructor(){}

    async execute()
    {
        this.#playerInputController = new PlayerInputController(this)
        this.#playerInputController.start()

        this.#pixiApplication = new PIXI.Application()

        await this.#pixiApplication.init({resizeTo: window})

        document.body.appendChild(this.#pixiApplication.canvas)

        this.#pixiApplication.renderer.background.color = 0xA1DF50

        this.#localPlayer =
        {
            player_id: -1,
            player_rect: new PIXI.Graphics()
            .rect(0,0,32,32).fill(0xC40000)
        }

        this.#pixiApplication.stage.addChild(this.#localPlayer.player_rect)

        this.#pixiApplication.ticker.speed = 1

        this.#pixiApplication.ticker.add
        (
            () =>
            {
                this.#interpreteKeyActions()
            }
        )
    }

    registerMenuEvents()
    {
        const directConnectMenuElement = document.getElementById('CC-Button-DirectConnect-Menu')
        directConnectMenuElement.addEventListener
        (
            'click',
            (event) =>
            {
                this.#openDirectConnectMenu(event)
            }
        )

        const directConnectStartButton = document.getElementById('CC-Button-DirectConnect-Start')
        directConnectStartButton.addEventListener
        (
            'click',
            (event) =>
            {
                this.#connectionStart(event)
            }
        )
    }

    #openDirectConnectMenu()
    {
        this.#activeUISpace = App.UISpaces.DIRECT_CONNECT_MENU

        const mainMenuElement = document.getElementById('CC-Main-Menu')
        const directConnectMenuElement = document.getElementById('CC-DirectConnect-Menu')

        mainMenuElement.style.display = 'none'
        directConnectMenuElement.style.display = 'block'
    }

    #connectionStart()
    {
        let hostname = document.getElementById('CC-Hostname').value

        if(hostname === "") return

        hostname = this.#sanitizeHostname(hostname)

        this.#webSocketConnection = new WebSocket(hostname)

        this.#webSocketConnection.addEventListener
        (
            'error',
            (event) =>
            {
                const directConnectErrorElement = document.getElementById('CC-DirectConnect-Error')
                directConnectErrorElement.style.display = "block"
                directConnectErrorElement.innerHTML = "An error occurred while connecting to your given hostname!"

                console.log('A WebSocket error occurred: ' + event)
            }
        )

        this.#webSocketConnection.addEventListener
        (
            'open',
            (event) =>
            {
                console.log('WebSocket connection established...')

                const playerAction =
                {
                    player_action: { 'flag' : PlayerActions.ACTION_CONNECT_HANDSHAKE_CLIENT.flag },
                    payload : 'ClanCats - Meow Meow!'
                }

                this.#webSocketConnection.send(JSON.stringify(playerAction))
                this.#switchToBaseGame()
            }
        )

        this.#webSocketConnection.addEventListener
        (
            'message',
            (event) =>
            {
                //console.log("Message: " + event.data)
                this.#interpretePlayerAction(event.data)
            }
        )
    }

    #switchToBaseGame()
    {
        let menuElement = null

        if(this.#activeUISpace === App.UISpaces.MAIN_MENU)
            menuElement = document.getElementById('CC-Main-Menu')
        else if(this.#activeUISpace === App.UISpaces.DIRECT_CONNECT_MENU)
            menuElement = document.getElementById('CC-DirectConnect-Menu')

        menuElement.style.display = 'none'

        this.#activeUISpace = App.UISpaces.BASE_GAME
    }

    #closeDirectConnectMenu()
    {
        this.#activeUISpace = App.UISpaces.MAIN_MENU

        const mainMenuElement = document.getElementById('CC-Main-Menu')
        const directConnectMenuElement = document.getElementById('CC-DirectConnect-Menu')

        mainMenuElement.style.display = 'block'
        directConnectMenuElement.style.display = 'none'
    }

    #interpreteKeyActions()
    {
        if(this.#activeUISpace === App.UISpaces.BASE_GAME)
            this.#interpreteKeyActionsBaseGame()
        else if(this.#activeUISpace === App.UISpaces.MAIN_MENU)
            this.#interpreteKeyActionsMainMenu()
        else if(this.#activeUISpace === App.UISpaces.DIRECT_CONNECT_MENU)
            this.#interpreteKeyActionsDirectConnectMenu()
    }

    #interpreteKeyActionsBaseGame()
    {
        if(this.#activeKeyActions === KeyActions.ACTION_NONE.flag) return
        if(this.#activeKeyActions & KeyActions.ACTION_UP.flag) this.#localPlayer.player_rect.y -= 10
        if(this.#activeKeyActions & KeyActions.ACTION_LEFT.flag) this.#localPlayer.player_rect.x -= 10
        if(this.#activeKeyActions & KeyActions.ACTION_DOWN.flag) this.#localPlayer.player_rect.y += 10
        if(this.#activeKeyActions & KeyActions.ACTION_RIGHT.flag) this.#localPlayer.player_rect.x += 10

        this.#webSocketConnection.send
        (
            JSON.stringify
            (
                {
                    player_action : PlayerActions.ACTION_MOVE_TO,
                    payload :
                    {
                        player_id : this.#localPlayer.player_id,
                        position:
                        {
                            X : this.#localPlayer.player_rect.x,
                            Y : this.#localPlayer.player_rect.y
                        }
                    }
                }
            )
        )
    }

    #interpreteKeyActionsMainMenu()
    {
        if(this.#activeKeyActions & KeyActions.ACTION_ESCAPE.flag) this.#toggleMainMenu()
    }

    #interpreteKeyActionsDirectConnectMenu()
    {
        if(this.#activeKeyActions & KeyActions.ACTION_ESCAPE.flag) this.#closeDirectConnectMenu()
    }

    #setKeyActions(activeKeyActions)
    {
        this.#activeKeyActions = activeKeyActions
    }

    onKeyAction(activeKeyActions)
    {
        this.#setKeyActions(activeKeyActions)
    }

    onFullCycleKeyAction(keyAction)
    {
        if(this.#activeUISpace === App.UISpaces.BASE_GAME)
            this.#interpreteFullCycleKeyActionBaseGame(keyAction)
        else if(this.#activeUISpace === App.UISpaces.MAIN_MENU)
            this.#interpreteFullCycleKeyActionMainMenu(keyAction)
        else if(this.#activeUISpace === App.UISpaces.DIRECT_CONNECT_MENU)
            this.#interpreteFullCycleKeyActionDirectConnectMenu(keyAction)
    }

    #interpreteFullCycleKeyActionBaseGame(keyAction)
    {
        if(keyAction === KeyActions.ACTION_ESCAPE) 
            this.#toggleMainMenu()
    }

    #interpreteFullCycleKeyActionMainMenu(keyAction)
    {
        if(keyAction === KeyActions.ACTION_ESCAPE) 
            this.#toggleMainMenu()
    }

    #interpreteFullCycleKeyActionDirectConnectMenu(keyAction)
    {
        if(keyAction === KeyActions.ACTION_ESCAPE)
            this.#closeDirectConnectMenu()
        else if(keyAction === KeyActions.ACTION_ENTER)
            this.#connectionStart()
    }

    #toggleMainMenu()
    {
        let mainMenu = document.getElementById('CC-Main-Menu')

        if(this.#activeUISpace !== App.UISpaces.MAIN_MENU)
        {
            mainMenu.style.display = "block"
            this.#activeUISpace = App.UISpaces.MAIN_MENU
        }
        else
        {
            mainMenu.style.display = "none"
            this.#activeUISpace = App.UISpaces.BASE_GAME
        }
    }

    #sanitizeHostname(hostname)
    {
        //TODO
        return hostname
    }

    #interpretePlayerAction(jsonAction)
    {
        const playerAction = JSON.parse(jsonAction)

        if(parseInt(playerAction.player_action.flag) & PlayerActions.ACTION_CONNECT_HANDSHAKE_SERVER.flag)
        {
            this.#handshakeServer(playerAction.payload)
        }
        if(parseInt(playerAction.player_action.flag) & PlayerActions.ACTION_SPAWN.flag)
        {
            this.#addPlayer(playerAction.payload.player_id)
        }
        if(parseInt(playerAction.player_action.flag) & PlayerActions.ACTION_MOVE_TO.flag)
        {
            this.#movePlayer(playerAction.payload)
        }
        if(parseInt(playerAction.player_action.flag) & PlayerActions.ACTION_LIST_PLAYERS.flag)
        {
            this.#createAllPlayers(playerAction.payload)
        }
    }

    #handshakeServer(payload)
    {
        this.#localPlayer.player_id = payload.player_id
    }

    #addPlayer(playerID, position = { 'X' : 0, 'Y' : 0 })
    {
        if(playerID === this.#localPlayer.player_id) return

        const playerData =
        {
            player_id : playerID,
            player_rect : new PIXI.Graphics().rect(0, 0, 32, 32).fill(0x1727BB)
        }

        playerData.player_rect.x = position.X
        playerData.player_rect.y = position.Y

        this.#otherPlayers.push(playerData)
        this.#pixiApplication.stage.addChild(playerData.player_rect)
    }

    #movePlayer(payload)
    {
        for(const playerData of this.#otherPlayers)
        {
            if(playerData.player_id === payload.player_id)
            {
                playerData.player_rect.x = payload.position.X
                playerData.player_rect.y = payload.position.Y
                break
            }
        }
    }

    #createAllPlayers(payload)
    {
        for(const player of payload.player_list)
        {
            this.#addPlayer(player.player_id, { 'X' : player.position.X, 'Y' : player.position.Y })
        }
    }
}

function main()
{
    const app = new App()

    app.registerMenuEvents()

    console.log("Executing ClanCats - The game...")

    app.execute()
}

document.addEventListener('DOMContentLoaded', main)
