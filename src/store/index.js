import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    loading: false,
    isShowTabbar: true,
    loginInfo: {
      avatarUrl: null,
      id: null,
      loginname: '',
      accessToken: ''
    },
    direction: 'forward',
    isAgainLoading: false
  },

  actions: {
    FETCH_LOADING: ({commit, state}) => {
      return state.loading
    }
  },

  mutations: {
    SET_LOADING: (state, bool) => {
      state.loading = bool
    },
    SET_SHOWTABBAR: (state, bool) => {
      state.isShowTabbar = bool
    },
    SET_ACCESSTOKEN: (state, str) => {
      state.loginInfo.accessToken = str
    },
    SET_LOGININFO: (state, object) => {
      state.loginInfo = object
    },
    SET_DIRECTION: (state, str) => {
      state.direction = str
    },
    SET_ISAGAINLOADING: (state, bool) => {
      state.isAgainLoading = bool
    }
  },

  getters: {
    loading (state, getters) {
      return state.loading
    },
    isShowTabbar (state, getters) {
      return state.isShowTabbar
    },
    accessToken (state, getters) {
      return state.loginInfo.accessToken
    },
    loginInfo (state, getters) {
      return state.loginInfo
    },
    direction (state, getters) {
      return state.direction
    },
    isAgainLoading (state, getters) {
      return state.isAgainLoading
    }
  }
})

export default store
