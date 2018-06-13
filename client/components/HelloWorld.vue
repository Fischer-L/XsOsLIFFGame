<template>
  <div class="hello">
    <button v-on:click="sendNow">Send now to the server by socket</button>
    <h1>{{ socketMsg }}</h1>
    <h2>{{ liffData }}</h2>
    <h2>{{ liffProfile }}</h2>
  </div>
</template>

<script>
import io from 'socket.io-client';
import config from "../../config/client.env";

export default {
  name: 'HelloWorld',
  data () {
    return {
      socketMsg: 'Waiting Websocket Message...',
      liffData: "",
      liffProfile: ""
    }
  },

  methods: {
    sendNow() {
      window._socket.emit('client_msg', { body: Date.now() });
    }
  },

  // Life cycle listeners

  beforeCreate() {
  },

  mounted() {
    let socket = io(config.SOCKET_URL);
    socket.on('server_msg', data => {
      if (data.body) this.socketMsg = data.body;
    });
    window._socket = socket;

    if (liff && !config.LOCAL_DEV) {
      liff.init(async data => {
        this.liffData = JSON.stringify(data);
        this.liffProfile = JSON.stringify(await liff.getProfile());
      });
    } else {
      this.liffData = "No LIFF APIs";
    }
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
