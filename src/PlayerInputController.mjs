"use strict";

import KeyActions from "./KeyActions.mjs"

export default class PlayerInputController
{
    appContext = null
    keyActionCallback = null
    fullCycleKeyActionCallback = null
    activeKeyActions = 0
    fullCycleKeyActions = 0

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

    registerFullCycleKeyActionEvent(callback)
    {
        this.fullCycleKeyActionCallback = callback
    }

    keyEvent(down, data)
    {
        let key = data.key.toUpperCase()
        let keyAction = KeyActions.ACTION_NONE

        if((key === 'W') || (key === 'ARROWUP')) keyAction = KeyActions.ACTION_UP
        if((key === 'A') || (key === 'ARROWLEFT')) keyAction = KeyActions.ACTION_LEFT
        if((key === 'S') || (key === 'ARROWDOWN')) keyAction = KeyActions.ACTION_DOWN
        if((key === 'D') || (key === 'ARROWRIGHT')) keyAction = KeyActions.ACTION_RIGHT
        if(key === 'ESCAPE') keyAction = KeyActions.ACTION_ESCAPE

        if(!keyAction.needsFullCycle)
            this.halfCycleKeyAction(down, keyAction)
        else
            this.fullCycleKeyAction(down, keyAction)
    }

    halfCycleKeyAction(down, keyAction)
    {
        if(down) this.activeKeyActions = this.activeKeyActions | keyAction.flag
        else this.activeKeyActions = this.activeKeyActions & ~keyAction.flag

        this.keyActionCallback(this.appContext, this.activeKeyActions)
    }

    fullCycleKeyAction(down, keyAction)
    {
        if(!down)
        {
            this.fullCycleKeyActionCallback(this.appContext, keyAction)
        }
    }
}
