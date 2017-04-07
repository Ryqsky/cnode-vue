<template>
  <div class="user-box" :style="{minHeight: isShowBtnLogout ? (minHeight + 'px') : (minHeight - 50 + 'px')}">
    <div class="user-head-box">
      <div class="big-avatar">
        <img :src="userInfo.avatar_url" alt="">
      </div>
      <div class="user-head-title">
        <div class="user-head-name" v-text="userInfo.loginname"></div>
        <div class="user-head-link">
          <a :href="`https://github.com/${userInfo.githubUsername}`">{{userInfo.githubUsername}}@github.com</a>
        </div>
      </div>
      <div class="user-head-intro">
        注册时间：{{userInfo.create_at | timeAgo}}
        <span>积分：{{userInfo.score}}</span>
      </div>
    </div>
    <tab>
      <tab-item selected @click.native="onSwitchTab(0)">最近回复</tab-item>
      <tab-item @click.native="onSwitchTab(1)">最新发布</tab-item>
      <tab-item @click.native="onSwitchTab(2)">话题收藏</tab-item>
    </tab>
    <div class="feed-box">
      <div v-for="i in displayList" class="feed-li">
        <router-link :to="{name: 'detail', query: { id: i.id }}">
          <div class="feed-content">
            <div class="avatar">
              <img :src="i.author.avatar_url" alt="headImgUrl">
            </div>
            <div class="feed-right">
              <div class="feed-right-top">
                <div class="feed-title">
                  <p v-text="i.title"></p>
                </div>
              </div>
              <div class="feed-right-bottom">
                <div class="feed-time">
                  <span>{{i.author.loginname}}</span>
                </div>
                <div class="feed-pass">
                  {{i.last_reply_at | timeAgo}}
                </div>
              </div>
            </div>
          </div>
        </router-link>
      </div>
    </div>
    <div class="ext-btn-reply btn-logout" @click="onLogout" :class="{'hide': !isShowBtnLogout}">
      注销
    </div>
  </div>
</template>
<script>
  export default{
    data () {
      return {
        currTab: 0,
        displayList: [],
        userInfo: {
          loginname: '',
          avatar_url: '',
          githubUsername: '',
          create_at: new Date(),
          score: 0,
          recent_topics: [],
          recent_replies: []
        }
      }
    },
    activated () {
      this.onUpdateData()
    },
    methods: {
      onUpdateData () {
        if (this.$route.name === 'me') {
          this.$store.commit('SET_SHOWTABBAR', true)
          if (this.checkLogin()) {
            this.onFetchUser(this.$store.getters.loginInfo.loginname)
          }
        } else {
          this.$store.commit('SET_SHOWTABBAR', false)
          if (this.$route.query.id) {
            this.onFetchUser(this.$route.query.id)
          }
        }
      },
      onLogout () {
        localStorage.setItem('accessToken', null)
        this.$store.commit('SET_LOGININFO', {
          avatarUrl: '',
          id: '',
          loginname: '',
          accessToken: null
        })
        this.$router.push('/login')
      },
      onSwitchTab (tab) {
        this.currTab = tab
        if (tab === 2) {
          this.$axios.get(`/topic_collect/${this.userInfo.loginname}`)
            .then(result => {
              console.log(result)
              this.displayList = result.data.data
            })
            .catch(e => {
              console.log(e)
              this.$vux.toast.show({
                text: '获取数据失败'
              })
            })
        } else {
          this.onFetchUser(this.userInfo.loginname)
        }
      },
      onFetchUser (id) {
        this.$axios.get(`/user/${id}`)
          .then(result => {
            this.userInfo.loginname = result.data.data.loginname
            this.userInfo.avatar_url = result.data.data.avatar_url
            this.userInfo.githubUsername = result.data.data.githubUsername
            this.userInfo.create_at = result.data.data.create_at
            this.userInfo.score = result.data.data.score
            this.userInfo.recent_topics = result.data.data.recent_topics
            this.userInfo.recent_replies = result.data.data.recent_replies
            this.displayList = this.currTab === 0 ? result.data.data.recent_replies : result.data.data.recent_topics
          })
          .catch(e => {
            console.log(e)
            this.$vux.toast.show({
              text: '获取数据失败'
            })
          })
      },
      checkLogin () {
        let accessToken = this.$store.getters.accessToken
        if (!accessToken) {
          this.$vux.toast.show({
            text: '请先登录'
          })
          this.$router.replace('/login')
          return false
        } else {
          return true
        }
      }
    },
    computed: {
      minHeight: () => {
        return (document.body.clientHeight >= 400 && document.body.clientHeight <= 736) ? document.body.clientHeight : window.screen.height
      },
      isShowBtnLogout: function () {
        return this.$store.getters.loginInfo.loginname === this.userInfo.loginname
      }
    }
  }
</script>
