<template>
  <div class="gameBoard xsos-full">
    <section class="gameBoard__userBoard">
      <img class="userBoard__picture" v-if="opponent.userId" :src="opponent.imgURL" /><h3 class="userBoard__name">{{ opponent.name }}</h3>
    </section>
    <section class="gameBoard__playBoard">
      <div class="playBoard__cell" v-for="cell of cells" :data-empty="cell.empty" :style="cell.style" >
        <img class="playBoard__cell-img" :src="cell.img" v-if="cell.img" />
      </div>
    </section>
    <section class="gameBoard__userBoard gameBoard__userBoard--self">
      <img class="userBoard__picture" v-if="self.userId" :src="self.imgURL" /><h3 class="userBoard__name">{{ self.name }}</h3>
    </section>
  </div>
</template>

<script>
import config from "../../config/client.env";
import circleImg from "../assets/circle.svg";
import crossImg from "../assets/cross.svg";
import sallyImg from "../assets/sally.png";
import brownImg from "../assets/brown.jpg";

export default {
  name: 'XsOsGame',

  computed: {

    cells() {
      const game = this.$store.state.game;
      return game.map((move, i) => {
        const img = move === 1 ? circleImg : move === -1 ? crossImg : "";
        const style = {};
        if ([2, 5, 8].indexOf(i) >= 0) style.borderRight = "0";
        if ([6, 7, 8].indexOf(i) >= 0) style.borderBottom = "0";
        return {
          img,
          style,
          empty: !img
        };
      });
    },

    self() {
      return this.formatUserInfo(this.$store.state.self);
    },

    opponent() {
      return this.formatUserInfo(this.$store.state.opponent);
    },
  },

  methods: {
    formatUserInfo(user = {}) {
      const { name, imgURL, userId } = user;
      return {
        name: !!userId ? name : "Waiting Player...",
        imgURL,
        userId
      };

    }
  },

  // Life cycle listeners

  mounted() {
  }
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
