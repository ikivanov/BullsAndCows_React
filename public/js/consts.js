export const SERVER_ADDRESS = "localhost:8080";
export const NUMBER_LENGH = 4;

export const MISSING_HOST_ELEMENT_MESSAGE= "Host element cannot be null, undentified or an empty string!";
export const INVALID_HOST_ELEMENT_MESSAGE= "Invalid host element! A valid html element identifier or jquery html object should be provided!";
export const INVALID_PLAYER_MODE_MESSAGE= "Invalid player mode!";
export const MISSING_GAME_NAME_MESSAGE= "Game name should be specified before starting a new game!";
export const MISSING_NICKNAME_MESSAGE= "A non empty nickname should be specified before starting a new game!";
export const MISSING_GAME_TYPE_MESSAGE= "Game type should be specified before starting a new game!";

export const SINGLE_PLAYER= 0;
export const MULTIPLAYER= 1;
export const PEER_2_PEER= 2;

export const CREATE_GAME_EVENT= "create game";

export const START_GAME_EVENT= "start game";
export const GAME_STARTED_SERVER_EVENT= "game started server event";

export const SURRENDER_GAME_EVENT= "surrender game";

export const GUESS_NUMBER_EVENT= "guess number";
export const GUESS_NUMBER_SERVER_EVENT= "guess number server event";

export const GUESS_PEER_NUMBER_EVENT= "guess peer number";
export const GUESS_PEER_NUMBER_SERVER_EVENT= "check peer number";
export const GUESS_PEER_NUMBER_CLIENT_RESPONSE_EVENT= "check peer number response";
export const GUESS_PEER_NUMBER_RESPONSE_EVENT= "guess peer number response";

export const GAME_OVER_EVENT= "game over";
export const GAME_OVER_PEER_CLIENT_EVENT= "game over peer client";
export const GAME_OVER_PEER_SERVER_EVENT= "game over peer server";

export const JOIN_GAME_EVENT= "join game";
export const JOIN_GAME_SERVER_EVENT= "join server game";

export const LIST_GAMES_EVENT= "list games";
export const LIST_GAMES_RESPONSE_EVENT= "list games response";

export const LIST_GAME_PLAYERS_EVENT= "list players";

export const POST_NUMBER_EVENT= "post number";
export const POST_NUMBER_RESPONSE_EVENT= "post number response";

export const PLAYER_TURN_SERVER_EVENT= "player turn";

export const CHECK_NICKNAME_EXISTS_EVENT= "nickname exists";
export const CHECK_NICKNAME_EXISTS_RESPONSE_EVENT= "nickname exists response";