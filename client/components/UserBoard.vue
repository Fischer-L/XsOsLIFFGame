<template>
    <section class="gameBoard__userBoard" :class="className">
      <template v-if="player.userId">
        <img class="userBoard__picture" :src="player.imgURL" /><h3 class="userBoard__name">{{ player.name }}</h3>
      </template><template v-else>
        <h3 class="userBoard__name--waiting">Waiting player...</h3>
      </template>
    </section>
</template>

<script>
export default {
  name: 'UserBoard',

  props: {
    isSelf: {
      type: Boolean,
      required: true
    },

    isPlaying: {
      type: Boolean,
      required: true
    },

    player: {
      type: Object,
      required: true
    },
  },

  computed: {
    className() {
      return {
        "gameBoard__userBoard--self": this.isSelf,
        "gameBoard__userBoard--currentPlayer": this.isPlaying
      };
    }
  },
}
</script>

<style>
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

.userBoard__name--waiting {
  padding: 20px;
}

@keyframes highlight-to-play {
  0% { background-color: #fff; }
  50% { background-color: #fffbe8; }
  100% { background-color: #fff; }
}

.gameBoard__userBoard--currentPlayer {
  animation: highlight-to-play 1.8s infinite;
}
</style>
