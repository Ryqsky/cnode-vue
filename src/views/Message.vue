<template>
  <div class="message-box" :style="{minHeight: minHeight - 50 + 'px'}">
    <tab>
      <tab-item selected @click.native="onSwitchTab(0)">未读消息</tab-item>
      <tab-item @click.native="onSwitchTab(1)">已读消息</tab-item>
    </tab>
    <div class="message-li" v-for="i in displayList" @click="onClickMessage(i.topic.id)">
      <div class="message-head">
        <div class="avatar">
          <img :src="i.author.avatar_url" alt="headImgUrl">
        </div>
        <div class="message-head-right">
          <div class="message-name">
            {{i.author.loginname}}
            <span>{{i.create_at | timeAgo}}</span>
          </div>
          <div class="message-intro">
            回复了您的话题
          </div>
        </div>
      </div>
      <div class="message-content" v-html="i.reply.content">

      </div>
      <div class="message-topic">
        话题：{{i.topic.title}}
      </div>
    </div>
    <div class="message-tip" :style="{minHeight: (minHeight - 100) + 'px'}" v-show="isShowTip">
      <div class="message-icon">
        <i class="icon-comment-alt"></i>
      </div>
      <div class="message-text">
        暂无消息
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        tab: 0,
        displayList: [],
      }
    },
    activated(){
      this.$store.commit('SET_SHOWTABBAR', true)
      this.onFetchMessage()
    },
    computed: {
      minHeight: () => {
        return (document.body.clientHeight >= 400 && document.body.clientHeight <= 736) ? document.body.clientHeight : window.screen.height
      },
      isShowTip: function() {
        return !(this.displayList && this.displayList.length)
      }
    },
    methods: {
      onSwitchTab(tab){
        this.tab = tab
        this.onFetchMessage()
      },
      onFetchMessage(){
        if (this.checkLogin()) {
          this.$axios.get(`/messages`, {
            params: {
              accesstoken: this.$store.getters.accessToken,
            }
          })
            .then(result => {
              console.log(result)
              this.displayList = this.tab === 0 ? result.data.data.hasnot_read_messages : result.data.data.has_read_messages
            })
            .catch(e => {
              console.log(e)
              this.$vux.toast.show({
                text: '获取消息失败',
              })
            })
        }
      },
      onClickMessage(id){
        this.$axios.post(`/message/mark_all`, {
          accesstoken: this.$store.getters.accessToken,
        })
          .then(result => {
            console.log(result)
          })
          .catch(e => {
            console.log(e)
            this.$vux.toast.show({
              text: '标记全部已读失败',
            })
          })
        this.$router.push({
          name: 'detail',
          query: {
            id: id
          }
        })
      },
      checkLogin(){
        let accessToken = this.$store.getters.accessToken
        if (!accessToken) {
          this.$vux.toast.show({
            text: '请先登录',
          })
          this.$router.replace('/login')
          return false
        } else {
          return true
        }
      },
    }
  }
</script>
