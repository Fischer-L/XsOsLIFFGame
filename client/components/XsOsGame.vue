<template>
  <div class="gameBoard xsos-full">
    
    <UserBoard :isSelf="false" :player="opponent" :isPlaying="opponent.isPlaying" />

    <section class="gameBoard__playBoard"
             @click="onClickCell"
             @touchend.stop.prevent="onClickCell"
    >
      <div class="playBoard__cell" v-for="cell of cells" :data-index="cell.index" :style="cell.style" >
        <img class="playBoard__cell-img" :src="cell.img" v-if="cell.img" />
      </div>
    </section>

    <UserBoard :isSelf="true" :player="self" :isPlaying="self.isPlaying" />

  </div>
</template>

<script>
import io from 'socket.io-client';
import gameRoom from "../lib/gameRoom";
import gameSocket from "../lib/gameSocket";
import { GAME_STATE } from "../lib/constants";
import UserBoard from "./UserBoard.vue"
import circleImg from "../assets/circle.svg";
import crossImg from "../assets/cross.svg";
import sallyImg from "../assets/sally.png";
import brownImg from "../assets/brown.jpg";

import config from "../../config/client.env";
function fakeTmpLiff(liff) { // TMP
  if (!config.LOCAL_DEV) return liff;

  liff.init = onOK => {
    onOK({
      context: { utouId: "utouId_123456789" }
    });
  };

  liff.getProfile = () => {
    let userId = "" + Date.now();
    return Promise.resolve({
      userId,
      displayName: userId,
      pictureUrl: "",
    });
  };

  liff.sendMessages = (payload) => console.log("TMP> liff.sendMessages =", payload);

  return liff;
}

const DUMMY_IMG = { DUMMY_SALLY_IMG: sallyImg, DUMMY_BROWN_IMG: brownImg };

const WIN_MSGS = [
  "Just lucky to win",
  "That was easy~",
  "I can beat you 100 times~",
  "Good game, thank you"
];

export default {
  name: 'XsOsGame',

  components: {
    UserBoard
  },

  computed: {
    _state() {
      return this.$store.state;
    },

    cells() {
      const game = this._state.game;
      const winCells = this._state.gameState === GAME_STATE.OVER ? gameRoom.winCells : null;
      return game.map((move, i) => {
        const img = move === 1 ? circleImg : move === -1 ? crossImg : "";
        const style = {};
        if ([2, 5, 8].indexOf(i) >= 0) style.borderRight = "0";
        if ([6, 7, 8].indexOf(i) >= 0) style.borderBottom = "0";
        if (winCells && winCells.indexOf(i) >= 0) style.background = "#f7d1cf";
        return {
          img, style, index: i,
        };
      });
    },

    self() {
      return this.formatPlayerInfo("self");
    },

    opponent() {
      return this.formatPlayerInfo("opponent");
    },
  },

  methods: {

    formatPlayerInfo(who) {
      let info = Object.assign({}, this._state[who]);
      info.isPlaying = this._state.currentPlayer === who && this._state.gameState === GAME_STATE.PLAYING;
      if (DUMMY_IMG[info.imgURL]) info.imgURL = DUMMY_IMG[info.imgURL];
      return info;
    },

    _initLIFF() {
      return new Promise(resolve => {
        console.log("TMP> _initLIFF");
        liff = fakeTmpLiff(liff);
        let onOK = async (data) => {
          let profile = await liff.getProfile();
          let context = {
            utouId: data.context.utouId,
            userId: profile.userId,
            name: profile.displayName,
            // The user image may not exist so take a dummy as alternative.
            // Notice here we use reserved keywords to reduce socket bandwidth (because shorter)
            imgURL: profile.pictureUrl || (Date.now() % 2 ? "DUMMY_SALLY_IMG" : "DUMMY_BROWN_IMG"),
          };
          resolve(context);
        };
        liff.init(onOK);
      });
    },

    // Events

    onClickCell(e) {
      let game = this._state.game;
      let index = parseInt(e.target.getAttribute("data-index"));
      if (game[index] !== 0 ||
          this._state.currentPlayer !== "self" ||
          this._state.gameState !== GAME_STATE.PLAYING
      ) {
        console.log("TMP> Game not yet start or not my turn or cell already occupied");
        console.log("TMP> game[index] !== 0", index, game);
        console.log("TMP> this._state.currentPlayer !== self", this._state.currentPlayer !== "self");
        console.log("TMP> this._state.gameSate !== GAME_STATE.PLAYING", this._state.gameState !== GAME_STATE.PLAYING);
        return;
      }
      let value = this._state.isFirst ? 1 : -1;
      gameRoom.playMove(index, value);
    }

    // Events END
  },

  // Life cycle listeners

  async mounted() {
    let { utouId, name, imgURL, userId } = await this._initLIFF();
    let player = { name, imgURL, userId };
    let store = this.$store;
    gameSocket.init(io);
    gameRoom.init({ utouId, player, store, gameSocket });
    window.addEventListener("beforeunload", () => gameRoom.leave());
  },

  updated() {
    if (this._state.gameState === GAME_STATE.OVER && gameRoom.winner === "self") {
      liff.sendMessages([
        {
          type:'text',
          text: WIN_MSGS[ Date.now() % WIN_MSGS.length ]
        }
      ]);
    }
  },
}
</script>

<style>
.gameBoard {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.gameBoard__userBoard {
  height: 80px;
  padding: 0 15px 0 10px;
  display: flex;
  align-items: center;
  text-align: left;
}

.gameBoard__userBoard--self {
  padding: 0 10px 0 15px;
  flex-direction: row-reverse;
  text-align: right;
}

.userBoard__picture {
  height: 48px;
  padding: 0 10px;
}

.userBoard__name {
  flex: 1;
  overflow: hidden;
}

.gameBoard__playBoard {
  margin: 10px;
  flex: 1;
  display: grid;
  grid-template-rows: repeat(3, 1fr);
  grid-template-columns: repeat(3, 1fr);
  cursor: pointer;
}

.playBoard__cell {
  border: 0 solid #8ea8b2;
  border-right-width: 2px;
  border-bottom-width: 2px; 
  display: flex;
  justify-content: center;
  align-items: center;
}

.playBoard__cell-img {
  width: 70%;
  height: 70%;
}
</style>
