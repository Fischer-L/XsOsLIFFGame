// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import io from 'socket.io-client';

let socket = io('http://localhost:3000');
socket.on('news', function (data) {
	console.log(data);
	socket.emit('my_event', { my: 'data' });
});
window._socket = socket;

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
