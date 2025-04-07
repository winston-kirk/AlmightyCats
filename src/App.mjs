"use strict";

import * as PIXI from '../lib/pixi.min.mjs'
import KeyActions from './KeyActions.mjs'
import PlayerInputController from './PlayerInputController.mjs'

class App
{
    static UISpaces =
    {
        INVALID : 'UISPACE_INVALID',
        BASE_GAME : 'UISPACE_BASE_GAME',
        MAIN_MENU : 'UISPACE_MAIN_MENU',
        DIRECT_CONNECT_MENU : 'UISPACE_DIRECT_CONNECT_MENU'
    }

    static activeUISpace = App.UISpaces.MAIN_MENU

    pixiApplication = null
    playerInputController = null
    activeKeyActions = KeyActions.ACTION_NONE
    player = null

    constructor(){}

    async execute()
    {
        this.playerInputController = new PlayerInputController(this)
        this.playerInputController.registerKeyActionEvent(this.onKeyAction)
        this.playerInputController.registerFullCycleKeyActionEvent(this.onFullCycleKeyAction)
        this.playerInputController.start()

        this.pixiApplication = new PIXI.Application()

        await this.pixiApplication.init({resizeTo: window})

        document.body.appendChild(this.pixiApplication.canvas)

        this.pixiApplication.renderer.background.color = 0xA1DF50

        this.player = new PIXI.Graphics()
            .rect(0,0,32,32).fill(0xC40000)

        this.pixiApplication.stage.addChild(this.player)

        this.pixiApplication.ticker.speed = 1

        this.pixiApplication.ticker.add
        (
            () =>
            {
                this.interpreteKeyActions()
            }
        )
    }

    registerMenuEvents()
    {
        const directConnectMenuElement = document.getElementById('CC-Button-DirectConnect-Menu')
        directConnectMenuElement.onclick = this.openDirectConnectMenu
    }

    openDirectConnectMenu()
    {
        App.activeUISpace = App.UISpaces.DIRECT_CONNECT_MENU

        const mainMenuElement = document.getElementById('CC-Main-Menu')
        const directConnectMenuElement = document.getElementById('CC-DirectConnect-Menu')

        mainMenuElement.style.display = 'none'
        directConnectMenuElement.style.display = 'block'
    }

    closeDirectConnectMenu()
    {
        App.activeUISpace = App.UISpaces.MAIN_MENU

        const mainMenuElement = document.getElementById('CC-Main-Menu')
        const directConnectMenuElement = document.getElementById('CC-DirectConnect-Menu')

        mainMenuElement.style.display = 'block'
        directConnectMenuElement.style.display = 'none'
    }

    interpreteKeyActions()
    {
        if(App.activeUISpace === App.UISpaces.BASE_GAME)
            this.interpreteKeyActionsBaseGame()
        else if(App.activeUISpace === App.UISpaces.MAIN_MENU)
            this.interpreteKeyActionsMainMenu()
        else if(App.activeUISpace === App.UISpaces.DIRECT_CONNECT_MENU)
            this.interpreteKeyActionsDirectConnectMenu()
    }

    interpreteKeyActionsBaseGame()
    {
        if(this.activeKeyActions & KeyActions.ACTION_UP.flag) this.player.y -= 10
        if(this.activeKeyActions & KeyActions.ACTION_LEFT.flag) this.player.x -= 10
        if(this.activeKeyActions & KeyActions.ACTION_DOWN.flag) this.player.y += 10
        if(this.activeKeyActions & KeyActions.ACTION_RIGHT.flag) this.player.x += 10
    }

    interpreteKeyActionsMainMenu()
    {
        if(this.activeKeyActions & KeyActions.ACTION_ESCAPE.flag) this.toggleMainMenu()
    }

    interpreteKeyActionsDirectConnectMenu()
    {
        if(this.activeKeyActions & KeyActions.ACTION_ESCAPE.flag) this.closeDirectConnectMenu()
    }

    setKeyActions(activeKeyActions)
    {
        this.activeKeyActions = activeKeyActions
    }

    onKeyAction(appContext, activeKeyActions)
    {
        appContext.setKeyActions(activeKeyActions)
    }

    onFullCycleKeyAction(appContext, keyAction)
    {
        if(App.activeUISpace === App.UISpaces.BASE_GAME)
            appContext.interpreteFullCycleKeyActionBaseGame(appContext, keyAction)
        else if(App.activeUISpace === App.UISpaces.MAIN_MENU)
            appContext.interpreteFullCycleKeyActionMainMenu(appContext, keyAction)
        else if(App.activeUISpace === App.UISpaces.DIRECT_CONNECT_MENU)
            appContext.interpreteFullCycleKeyActionDirectConnectMenu(appContext, keyAction)
    }

    interpreteFullCycleKeyActionBaseGame(appContext, keyAction)
    {
        if(keyAction === KeyActions.ACTION_ESCAPE) 
            appContext.toggleMainMenu()
    }

    interpreteFullCycleKeyActionMainMenu(appContext, keyAction)
    {
        if(keyAction === KeyActions.ACTION_ESCAPE) 
            appContext.toggleMainMenu()
    }

    interpreteFullCycleKeyActionDirectConnectMenu(appContext, keyAction)
    {
        if(keyAction === KeyActions.ACTION_ESCAPE) 
            appContext.closeDirectConnectMenu()
    }

    toggleMainMenu()
    {
        let mainMenu = document.getElementById('CC-Main-Menu')

        if(App.activeUISpace !== App.UISpaces.MAIN_MENU) 
        {
            mainMenu.style.display = "block"
            App.activeUISpace = App.UISpaces.MAIN_MENU
        }
        else
        {
            mainMenu.style.display = "none"
            App.activeUISpace = App.UISpaces.BASE_GAME
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
