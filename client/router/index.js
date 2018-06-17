import Vue from 'vue'
import Router from 'vue-router'
import XsOsGame from '@/components/XsOsGame'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'XsOsGame',
      component: XsOsGame
    }
  ]
})
