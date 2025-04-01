"use strict";

import KeyActions from "./KeyActions.mjs"

export default class PlayerInputController
{
    appContext = null
    keyActionCallback = null
    activeKeyActions = 0

    constructor(appContext)
    {
        this.appContext = appContext
    }

    start()
    {
        document.addEventListener('keydown', (event) => {this.keyEvent(true,event)})
        document.addEventListener('keyup', (event) => {this.keyEvent(false,event)})
    }

    registerKeyActionEvent(callback)
    {
        this.keyActionCallback = callback
    }

    keyEvent(down, data)
    {
        let key = data.key.toUpperCase()
        let keyAction = KeyActions.ACTION_NONE

        if(key === 'W') keyAction = KeyActions.ACTION_UP
        if(key === 'A') keyAction = KeyActions.ACTION_LEFT
        if(key === 'S') keyAction = KeyActions.ACTION_DOWN
        if(key === 'D') keyAction = KeyActions.ACTION_RIGHT

        if(down) this.activeKeyActions = this.activeKeyActions | keyAction
        else this.activeKeyActions = this.activeKeyActions & ~keyAction

        this.keyActionCallback(this.appContext, this.activeKeyActions)
    }
}
