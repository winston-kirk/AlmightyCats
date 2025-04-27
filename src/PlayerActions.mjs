"use strict";

const PlayerActions =
{
    ACTION_NONE :                       { flag: 0 },
    ACTION_CONNECT_HANDSHAKE_CLIENT :   { flag: 1 },
    ACTION_CONNECT_HANDSHAKE_SERVER :   { flag: 2 },
    ACTION_LOGIN :                      { flag: 4 },
    ACTION_LOGOUT :                     { flag: 8 },
    ACTION_SPAWN :                      { flag: 16 },
    ACTION_LIST_PLAYERS :               { flag: 32 },
    ACTION_MOVE_TO :                    { flag: 64 },
    ACTION_INVALID :                    { flag: 512 },
}

export { PlayerActions as default }
