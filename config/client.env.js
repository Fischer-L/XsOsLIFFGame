'use strict';
const LOCAL_DEV = true;
const SOCKET_URL = LOCAL_DEV ? "http://localhost:3000" : "https://xs-os-liff-game.herokuapp.com";
module.exports = {
	LOCAL_DEV, SOCKET_URL
};
