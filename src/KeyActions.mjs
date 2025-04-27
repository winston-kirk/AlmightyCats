"use strict";

const KeyActions =
{
    ACTION_NONE   : { flag : 0, needsFullCycle : false },
    ACTION_UP     : { flag : 1, needsFullCycle : false },
    ACTION_LEFT   : { flag : 2, needsFullCycle : false },
    ACTION_DOWN   : { flag : 4, needsFullCycle : false },
    ACTION_RIGHT  : { flag : 8, needsFullCycle : false },
    ACTION_ESCAPE : { flag : 16, needsFullCycle : true },
    ACTION_ENTER  : { flag:  32, needsFullCycle : true }
}

export { KeyActions as default }
