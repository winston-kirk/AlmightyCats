"use strict";

import * as PIXI from '../lib/pixi.min.mjs'

class App
{
    pixiApplication = null

    constructor(){}

    async execute()
    {
        this.pixiApplication = new PIXI.Application()

        await this.pixiApplication.init()

        document.body.appendChild(this.pixiApplication.canvas)

        this.pixiApplication.ticker.add
        (
            () =>
            {
            }
        )
    }
}

function main()
{
    const app = new App()

    console.log("Executing ClanCats - The game...")

    app.execute()
}

document.addEventListener('DOMContentLoaded', main)
