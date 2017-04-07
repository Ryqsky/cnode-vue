import Vue from 'vue'
import router from './router'
import store from './store'
import axios from './components/plugins/axios'
import {Tabbar, TabbarItem} from './components/vux/tabbar'
import * as filters from './filters'
import XInput from './components/vux/x-input'
import XTextarea from './components/vux/x-textarea'
import Selector from './components/vux/selector'
import Group from './components/vux/group'
import XButton from './components/vux/x-button'
import {Flexbox, FlexboxItem} from './components/vux/flexbox'
import {Tab, TabItem} from './components/vux/tab'
import Scroller from './components/vux/scroller'
import Spinner from './components/vux/spinner'
import Popup from './components/vux/popup'
import ToastPlugins from './components/plugins/toast'
import LoadingPlugins from './components/plugins/loading'

const FastClick = require('fastclick')
FastClick.attach(document.body)

Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

Vue.use(LoadingPlugins)
Vue.use(ToastPlugins)
Vue.use(axios)
Vue.component('Tab', Tab)
Vue.component('TabItem', TabItem)
Vue.component('Tabbar', Tabbar)
Vue.component('TabbarItem', TabbarItem)
Vue.component('Flexbox', Flexbox)
Vue.component('FlexboxItem', FlexboxItem)
Vue.component('XInput', XInput)
Vue.component('XTextarea', XTextarea)
Vue.component('Selector', Selector)
Vue.component('Group', Group)
Vue.component('XButton', XButton)
Vue.component('Scroller', Scroller)
Vue.component('Spinner', Spinner)
Vue.component('Popup', Popup)

let accessToken = localStorage.getItem('accessToken')
if (!accessToken || accessToken === 'null') {
  store.commit('SET_ACCESSTOKEN', null)
} else {
  Vue.$axios.post('/accesstoken', {
    accesstoken: accessToken
  })
    .then(result => {
      console.log(result)
      store.commit('SET_LOGININFO', {
        avatarUrl: result.data.avatar_url,
        id: result.data.id,
        loginname: result.data.loginname,
        accessToken: accessToken
      })
    })
    .catch(e => {
      console.log(e)
      localStorage.setItem('accessToken', null)
      Vue.$vux.toast.show({
        text: 'AccessToken错误'
      })
    })
}

// 是否第二加载
let isAgainLoading = localStorage.getItem('isAgainLoading')
if (!isAgainLoading) {
  store.commit('SET_ISAGAINLOADING', false)
  localStorage.setItem('isAgainLoading', true)
} else {
  store.commit('SET_ISAGAINLOADING', true)
}

// simple history management
const history = window.sessionStorage
history.clear()
let historyCount = history.getItem('count') * 1 || 0
history.setItem('/', 0)
router.beforeEach((to, from, next) => {
  const toIndex = history.getItem(to.path)
  const fromIndex = history.getItem(from.path)
  if (toIndex) {
    if (toIndex > fromIndex || !fromIndex || (toIndex === '0' && fromIndex === '0')) {
      store.commit('SET_DIRECTION', 'forward')
    } else {
      store.commit('SET_DIRECTION', 'reverse')
    }
  } else {
    ++historyCount
    history.setItem('count', historyCount)
    to.path !== '/' && history.setItem(to.path, historyCount)
    store.commit('SET_DIRECTION', 'forward')
  }
  if (to.meta.auth) {
    let accessToken = localStorage.getItem('accessToken')
    if (accessToken === 'null' || accessToken === null) {
      next({
        name: 'login'
      })
    } else {
      next()
    }
  } else {
    next()
  }
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store
})

