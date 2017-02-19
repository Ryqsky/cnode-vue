import Vue from 'vue'
import Router from 'vue-router'

const ArticleList = resolve => require(['../views/ArticleList'], resolve)
const ArticleDetail = resolve => require(['../views/ArticleDetail'], resolve)
const ArticleCreate = resolve => require(['../views/ArticleCreate'], resolve)
const Message = resolve => require(['../views/Message'], resolve)
const User = resolve => require(['../views/User'], resolve)
const Login = resolve => require(['../views/Login'], resolve)

Vue.use(Router)

const scrollBehavior = (to, from, savedPosition) => {
  if (savedPosition) {
    // savedPosition is only available for popstate navigations.
    return savedPosition
  } else {
    const position = {}
    // new navigation.
    // scroll to anchor by returning the selector
    if (to.hash) {
      position.selector = to.hash
    }
    // check if any matched route config has meta that requires scrolling to top
    if (to.matched.some(m => m.meta.scrollToTop)) {
      position.x = 0
      position.y = 0
    }
    return position
  }
}

export default new Router({
  mode: 'history',
  base: __dirname,
  scrollBehavior,
  routes: [
    {
      path: '/',
      name: 'index',
      component: ArticleList
    },
    {
      path: '/detail',
      name: 'detail',
      component: ArticleDetail,
      meta: {
        scrollToTop: true
      }
    },
    {
      path: '/create',
      name: 'create',
      component: ArticleCreate
    },
    {
      path: '/message',
      name: 'message',
      component: Message,
      meta: {
        scrollToTop: true,
        auth: true
      }
    },
    {
      path: '/user',
      name: 'user',
      component: User,
      meta: { scrollToTop: true }
    },
    {
      path: '/me',
      name: 'me',
      component: User,
      meta: {
        scrollToTop: true,
        auth: true
      }
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { scrollToTop: true }
    }
  ]
})
