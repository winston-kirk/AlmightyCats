"use strict";

import * as PIXI from '../lib/pixi.min.mjs'
import KeyActions from './KeyActions.mjs'
import PlayerInputController from './PlayerInputController.mjs'

class App
{
    UISpaces = 
    {
        INVALID : 'UISPACE_INVALID',
        BASE_GAME : 'UISPACE_BASE_GAME'
    }

    pixiApplication = null
    playerInputController = null
    activeUISpace = this.UISpaces.BASE_GAME
    activeKeyActions = KeyActions.ACTION_NONE
    player = null

    constructor(){}

    async execute()
    {
        this.playerInputController = new PlayerInputController(this)
        this.playerInputController.registerKeyActionEvent(this.onKeyAction)
        this.playerInputController.start()

        this.pixiApplication = new PIXI.Application()

        await this.pixiApplication.init()

        document.body.appendChild(this.pixiApplication.canvas)

        this.player = new PIXI.Graphics()
            .rect(0,0,32,32).fill(0xC40000)

        this.pixiApplication.stage.addChild(this.player)

        this.pixiApplication.ticker.speed = 1

        this.pixiApplication.ticker.add
        (
            () =>
            {
                if(this.activeKeyActions & KeyActions.ACTION_UP) this.player.y -= 10
                if(this.activeKeyActions & KeyActions.ACTION_LEFT) this.player.x -= 10
                if(this.activeKeyActions & KeyActions.ACTION_DOWN) this.player.y += 10
                if(this.activeKeyActions & KeyActions.ACTION_RIGHT) this.player.x += 10
            }
        )
    }

    setKeyActions(activeKeyActions)
    {
        this.activeKeyActions = activeKeyActions
    }

    onKeyAction(appContext, activeKeyActions)
    {
        appContext.setKeyActions(activeKeyActions)
    }
}

function main()
{
    const app = new App()

    console.log("Executing ClanCats - The game...")

    app.execute()
}

document.addEventListener('DOMContentLoaded', main)
