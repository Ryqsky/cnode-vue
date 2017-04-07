<template>
  <div class="article-box" :style="{minHeight: minHeight + 50 + 'px'}">
    <div class="head-box">
      <h2 class="head-title" v-text="article.title">
      </h2>
      <div class="head-intro">
        <div class="avatar">
          <img :src="author.avatar_url" alt="headImgUrl">
        </div>
        <div class="head-middle">
          <div class="head-middle-top">
            <div class="feed-label" :class="[article.top ? 'feed-label-top' : `feed-label-other`]">
              {{article.tab | translateTab(article.top)}}
            </div>
            <span class="head-author-name" v-text="author.name"></span>
          </div>
          <div class="head-middle-bottom">
            {{article.create_at | timeAgo}}创建
            ·
            <span v-text="article.visit_count"></span>次预览
            <div class="icon-eye-open"></div>
          </div>
        </div>
        <div class="head-right" @click="onLikeThisArticle">
          <i :class="[article.is_collect ? 'icon-heart' : 'icon-heart-empty']"></i>
        </div>
      </div>
    </div>

    <div class="content-box markdown-body" v-html="article.content">
    </div>

    <div class="comment-box">
      <div class="comment-title">
        {{reply_count}} 条回复
      </div>
      <div class="comment-li" v-for="(c, index) in displayCommentList">
        <div class="comment-head">
          <router-link :to="{name: 'user', query: { id: c.author.loginname }}">
            <div class="avatar">
              <img :src="c.author.avatar_url" alt="headImgUrl">
            </div>
          </router-link>
          <div class="comment-middle">
            <div class="comment-middle-top" v-text="c.author.loginname">
            </div>
            <div class="comment-middle-bottom">
              <span>{{index + 1}}楼</span> · {{c.create_at | timeAgo}}
            </div>
          </div>
          <div class="comment-right">
            <div @click="onLikeThisComment(c.id, index)" style="display: flex;"
                 :class="{ 'active': index < 60 && c.ups.indexOf($store.getters.loginInfo.id) >= 0}">
              <i class="icon-thumbs-up"></i>
              <span v-text="c.ups.length"></span>
            </div>
            <i class="icon-reply" @click="onReplyComment(c.id, c.author.loginname, index)"></i>
          </div>
        </div>
        <div class="comment-content markdown-body" v-html="c.content">
        </div>
      </div>
    </div>

    <popup v-model="popup.show" @on-hide="popup.show = false">
      <div class="popup-editor-box">
        <x-input class="weui_vcode weui_text_left" style="text-align: left" v-model="popup.content"
                 :placeholder="popup.placeholder" ref="input">
          <x-button slot="right" type="primary" @click.native="onSendComment">发送</x-button>
        </x-input>
      </div>
    </popup>

    <div class="ext-btn-reply" :class="{'hide': !showExtBtnReply}" @click="onReplyArticle">
      <i class="icon-reply"></i>
    </div>
  </div>
</template>
<script>
  export default{
    data () {
      return {
        page: 1,
        pageSize: 10,
        author: {
          id: '',
          avatar_url: '',
          name: ''
        },
        article: {
          title: '',
          content: '',
          create_at: '',
          good: false,
          id: '',
          is_collect: false,
          last_reply_at: '',
          tab: '',
          top: false,
          visit_count: 0
        },
        displayCommentList: [],
        comment: [],
        reply_count: 0,
        popup: {
          replyId: null,
          show: false,
          content: '',
          placeholder: '请在这里填写评论'
        },
        showExtBtnReply: true
      }
    },
    activated () {
      this.page = 1
      this.onFetchDetail()
    },
    deactivated () {
      window.onscroll = null
    },
    methods: {
      onFetchDetail () {
        // 初始化数据
        this.$store.commit('SET_SHOWTABBAR', false)
        this.author = {
          id: '',
          avatar_url: '',
          name: ''
        }
        this.article = {
          title: '',
          content: '',
          create_at: '',
          good: false,
          id: '',
          is_collect: false,
          last_reply_at: '',
          tab: '',
          top: false,
          visit_count: 0
        }
        this.comment = []
        this.reply_count = 0
        this.popup = {
          replyId: null,
          show: false,
          content: '',
          placeholder: '请在这里填写评论'
        }
        this.showExtBtnReply = true

        // 添加上滑显示下滑隐藏
        let _this = this
        let beforeScrollTop = document.documentElement.scrollTop || document.body.scrollTop
        window.onscroll = () => {
          let afterScrollTop = document.documentElement.scrollTop || document.body.scrollTop
          _this.showExtBtnReply = beforeScrollTop >= afterScrollTop
          beforeScrollTop = afterScrollTop
          let hasScrollTop = document.body.scrollTop
          let bodyHeight = document.body.scrollHeight
          let availHeight = window.screen.availHeight
          let remainingHeight = bodyHeight - availHeight - hasScrollTop
          if (remainingHeight < 200) {
            _this.onLoadMore()
          }
        }

        // 加载数据
        this.$loading.show()
        let id = this.$route.query.id
        this.$axios.get('https://cnodejs.org/api/v1/topic/' + id, {
          params: {
            accesstoken: this.$store.getters.accessToken
          }
        })
          .then(response => {
            let result = response.data.data
            this.author = {
              id: result.author_id,
              name: result.author.loginname,
              avatar_url: result.author.avatar_url
            }
            this.article = {
              title: result.title,
              content: result.content,
              create_at: result.create_at,
              good: result.good,
              id: result.id,
              is_collect: result.is_collect,
              last_reply_at: result.last_reply_at,
              tab: result.tab,
              top: result.top,
              visit_count: result.visit_count
            }
            this.comment = result.replies
            this.reply_count = result.reply_count
            this.displayCommentList = result.replies.slice(0, this.pageSize)
            this.$loading.hide()
          })
          .catch(e => {
            console.log(e)
            this.$vux.toast.show({
              text: '获取数据失败'
            })
            this.$loading.hide()
          })
      },
      checkLogin () {
        let accessToken = this.$store.getters.accessToken
        if (!accessToken) {
          this.$vux.toast.show({
            text: '请先登录'
          })
          this.$router.push('/login')
          return false
        } else {
          return true
        }
      },
      onReplyComment (id, name, index) {
        if (this.checkLogin()) {
          this.popup.replyId = id
          this.popup.placeholder = `正在回复${index + 1}楼，${name}`
          this.popup.show = true
          console.log(this.$refs.input)
          this.$refs.input.onFocus()
        }
      },
      onReplyArticle () {
        if (this.checkLogin()) {
          this.popup.replyId = null
          this.popup.placeholder = `正在回复作者，${this.author.name}`
          this.popup.show = true
          console.log(this.$refs.input)
          this.$refs.input.onFocus()
        }
      },
      onSendComment () {
        if (this.checkLogin()) {
          if (!this.popup.content) {
            this.$vux.toast.show({
              text: '评论不能为空'
            })
          } else {
            this.$loading.show()
            this.$axios.post(`/topic/${this.article.id}/replies`, {
              accesstoken: this.$store.getters.accessToken,
              content: this.popup.content,
              reply_id: this.popup.replyId
            })
              .then(result => {
                console.log(result)
                this.comment.push({
                  author: {
                    avatar_url: this.$store.getters.loginInfo.avatarUrl,
                    loginname: this.$store.getters.loginInfo.loginname
                  },
                  content: this.popup.content,
                  create_at: new Date(),
                  id: result.data.reply_id,
                  reply_id: null,
                  ups: []
                })
                this.popup.show = false
                this.$vux.toast.show({
                  text: '评论成功'
                })
                this.$loading.hide()
              })
              .catch(e => {
                console.log(e)
                this.$vux.toast.show({
                  text: '操作失败'
                })
                this.$loading.hide()
              })
          }
        }
      },
      onLikeThisArticle () {
        if (this.checkLogin()) {
          let url
          let toastText
          if (!this.article.is_collect) {
            url = '/topic_collect/collect'
            toastText = '收藏成功'
          } else {
            url = '/topic_collect/de_collect'
            toastText = '取消收藏成功'
          }
          this.$axios.post(url, {
            accesstoken: this.$store.getters.accessToken,
            topic_id: this.article.id
          })
            .then(result => {
              console.log(result)
              this.article.is_collect = !this.article.is_collect
              this.$vux.toast.show({
                text: toastText
              })
            })
            .catch(e => {
              console.log(e)
              this.$vux.toast.show({
                text: '操作失败'
              })
            })
        }
      },
      onLikeThisComment (id, index) {
        if (this.checkLogin()) {
          this.$axios.post(`/reply/${id}/ups`, {
            accesstoken: this.$store.getters.accessToken
          })
            .then(result => {
              let toastText
              if (result.data.action === 'down') {
                toastText = '取消点赞成功'
                let removeIndex = this.comment[index].ups.indexOf(this.$store.getters.loginInfo.id)
                this.comment[index].ups.splice(removeIndex, 1)
              } else {
                toastText = '点赞成功'
                this.comment[index].ups.push(this.$store.getters.loginInfo.id)
              }
              this.$vux.toast.show({
                text: toastText
              })
            })
            .catch(e => {
              console.log(e)
              this.$vux.toast.show({
                text: '操作失败'
              })
            })
        }
      },
      onLoadMore () {
        let page = this.page
        let pageSize = this.pageSize
        let fetchComment = this.comment.slice(page * pageSize, (page + 1) * pageSize)
        if (fetchComment.length) {
          this.displayCommentList = this.displayCommentList.concat(fetchComment)
          this.page++
        }
      }
    },
    computed: {
      minHeight: () => {
        return (document.body.clientHeight >= 400 && document.body.clientHeight <= 736) ? document.body.clientHeight : window.screen.height
      }
    }
  }
</script>
<style>
  .weui_text_left .weui_input {
    text-align: left;
  }
</style>
