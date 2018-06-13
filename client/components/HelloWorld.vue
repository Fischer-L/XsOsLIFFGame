<template>
  <div class="hello">
    <h1>{{ socketMsg }}</h1>
  </div>
</template>

<script>
import io from 'socket.io-client';
import config from "../../config/client.env";

export default {
  name: 'HelloWorld',
  data () {
    return {
      socketMsg: 'Waiting Websocket Message...'
    }
  },

  // Life cycle listeners

  mounted() {
    let socket = io(config.SOCKET_URL);
    socket.on('news', data => {
      this.socketMsg = JSON.stringify(data);
      socket.emit('my_event', { my: 'data' });
    });
    window._socket = socket;
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
