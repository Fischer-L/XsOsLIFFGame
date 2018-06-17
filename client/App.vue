<template>
  <div id="app" class="xsos-full">
    <XsOsGame/>
  </div>
</template>

<script>
import XsOsGame from "./components/XsOsGame";

export default {
  name: 'App',
  components: {
    XsOsGame
  },
}
</script>

<style>
* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
}

html, body, .xsos-full {
  width: 100%;
  height: 100%;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
