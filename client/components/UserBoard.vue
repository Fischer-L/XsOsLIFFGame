<template>
    <section class="gameBoard__userBoard" :class="{ 'gameBoard__userBoard--self': isSelf }">
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

    player: {
      type: Object,
      required: true
    },
  }
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
</style>
