<template>
  <div class="hello">
    <button v-on:click="sendNow">Ping your partner</button>
    <h3>You are {{ userName }}</h3>
    <h3>Your partner is {{ partnerName }}</h3>
    <p>You ping your partner at {{pingTime}}</p>
    <p>You partner pong your at {{pongTime}}</p>
  </div>
</template>

<script>
import io from 'socket.io-client';
import config from "../../config/client.env";

const sokcet = io(config.SOCKET_URL);

export default {
  name: 'HelloWorld',

  data () {
    return {
      userName: "n/a",
      partnerName: "n/a",
      pingTime: "--",
      pongTime: "--"
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
