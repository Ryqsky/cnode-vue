import Vue from 'vue'
import router from './router'
import store from './store'
import axios from './components/plugins/axios'
import VueLazyload from 'vue-lazyload'
import App from './App.vue'
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

// 是否有已登录过的记录，localStorage
let accessToken = localStorage.getItem('accessToken')
if (!accessToken || accessToken === 'null') {
  store.commit('SET_ACCESSTOKEN', null)
} else {
  // 本地localStorage已储存好accessToken
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

// 简单的浏览器历史管理
const history = window.sessionStorage
history.clear()
let historyCount = history.getItem('count') * 1 || 0
history.setItem('/', 0)
router.beforeEach((to, from, next) => {
  // 判断当前切换是前进forward还是后退reverse
  const toIndex = history.getItem(to.path)          // 目标页
  const fromIndex = history.getItem(from.path)      // 出发页
  if (toIndex) {
    // 再次访问目标页toIndex
    if (toIndex > fromIndex || !fromIndex || (toIndex === '0' && fromIndex === '0')) {
      store.commit('SET_DIRECTION', 'forward')
    } else {
      store.commit('SET_DIRECTION', 'reverse')
    }
  } else {
    // 第一次访问目标页toIndex
    ++historyCount
    history.setItem('count', historyCount)
    to.path !== '/' && history.setItem(to.path, historyCount)
    store.commit('SET_DIRECTION', 'forward')
  }
  // 判断当前路由标签是否需要登录后权限
  if (to.meta.auth) {
    // 需要登录
    let accessToken = localStorage.getItem('accessToken')
    if (accessToken === 'null' || accessToken === null) {
      // 未登录
      next({
        name: 'login'
      })
    } else {
      // 已登录
      next()
    }
  } else {
    // 不需要登录
    next()
  }
})

// 图片懒加载
Vue.use(VueLazyload, {
  preLoad: 1.3,
  error: 'static/images/404.png',
  loading: 'static/images/loading-spin.svg',
  attempt: 1
})

/* eslint-disable no-new */
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
