import Vue from 'vue';
import Vuex from 'vuex';
import { getInitialState } from "./state";

Vue.use(Vuex);

export default () => {
  return new Vuex.Store({
    state: getInitialState()
  })
};