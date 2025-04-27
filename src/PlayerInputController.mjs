"use strict";

import KeyActions from "./KeyActions.mjs"

export default class PlayerInputController
{
    #appContext = null
    #activeKeyActions = 0

    constructor(appContext)
    {
        this.#appContext = appContext
    }

    start()
    {
        document.addEventListener('keydown', (event) => {this.#keyEvent(true,event)})
        document.addEventListener('keyup', (event) => {this.#keyEvent(false,event)})
    }

    #keyEvent(down, data)
    {
        let key = data.key.toUpperCase()
        let keyAction = KeyActions.ACTION_NONE

        if((key === 'W') || (key === 'ARROWUP')) keyAction = KeyActions.ACTION_UP
        else if((key === 'A') || (key === 'ARROWLEFT')) keyAction = KeyActions.ACTION_LEFT
        else if((key === 'S') || (key === 'ARROWDOWN')) keyAction = KeyActions.ACTION_DOWN
        else if((key === 'D') || (key === 'ARROWRIGHT')) keyAction = KeyActions.ACTION_RIGHT
        else if(key === 'ESCAPE') keyAction = KeyActions.ACTION_ESCAPE
        else if(key === 'ENTER') keyAction = KeyActions.ACTION_ENTER

        if(keyAction.needsFullCycle)
            this.#fullCycleKeyAction(down, keyAction)
        else
            this.#halfCycleKeyAction(down, keyAction)
    }

    #halfCycleKeyAction(down, keyAction)
    {
        if(down) this.#activeKeyActions = this.#activeKeyActions | keyAction.flag
        else this.#activeKeyActions = this.#activeKeyActions & ~keyAction.flag

        this.#appContext.onKeyAction(this.#activeKeyActions)
    }

    #fullCycleKeyAction(down, keyAction)
    {
        if(!down)
        {
            this.#appContext.onFullCycleKeyAction(keyAction)
        }
    }
}
