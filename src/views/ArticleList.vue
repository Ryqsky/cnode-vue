<template>
  <div>
    <scroller lock-x scrollbar-y use-pullup use-pulldown height="-50" @on-pullup-loading="onLoadMore"
              @on-pulldown-loading="onRefresh" v-model="status" ref="scroller">
      <div class="feed-box">
        <div v-for="i in articleList" class="feed-li">
          <router-link :to="{name: 'detail', query: { id: i.id }}">
            <div class="feed-title">
              <div class="feed-label" :class="[i.top ? 'feed-label-top' : `feed-label-other`]">
                {{i.tab | translateTab(i.top)}}
              </div>
              <p v-text="i.title"></p>
            </div>
            <div class="feed-content">
              <router-link :to="{name: 'user', query: { id: i.author.loginname }}">
                <div class="avatar">
                  <img :src="i.author.avatar_url" alt="headImgUrl">
                </div>
              </router-link>
              <div class="feed-right">
                <div class="feed-right-top">
                  <div class="feed-name" v-text="i.author.loginname">
                  </div>
                  <div class="feed-count">
                    <span v-text="i.reply_count"></span> / {{i.visit_count}}
                  </div>
                </div>
                <div class="feed-right-bottom">
                  <div class="feed-time">
                    创建于：<span>{{i.create_at | formatDate('yyyy-MM-dd hh:mm:ss')}}</span>
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
      <div slot="pullup" class="xs-plugin-pullup-container xs-plugin-pullup-up"
           style="position: absolute; width: 100%; height: 40px; bottom: -40px; text-align: center;">
        <span v-show="status.pullupStatus === 'loading'" style="line-height: 40px;"><spinner type="ios-small"></spinner></span>
      </div>
    </scroller>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        page: 1,
        limit: 20,
        articleList: [],
        status: {
          pullupStatus: 'default',
          pulldownStatus: 'default'
        }
      }
    },
    mounted () {
      this.onRefresh()
    },
    activated(){
      this.$store.commit('SET_SHOWTABBAR', true)
    },
    methods: {
      onRefresh () {
        this.$loading.show()
        this.$axios.get('/topics', {
          params: {
            page: 1,
            limit: 20
          }
        })
          .then(result => {
            console.log(result)
            this.articleList = result.data.data
            this.$nextTick(() => {
              this.$refs.scroller.donePulldown()
              this.$refs.scroller.reset()
              this.$loading.hide()
            })
          })
          .catch(e => {
            console.log(e)
            this.$vux.toast.show({
              text: '获取数据失败',
            })
            this.$loading.hide()
          })
      },
      onLoadMore () {
        let _this = this
        this.$axios.get('/topics', {
          params: {
            page: _this.page + 1,
            limit: 20
          }
        })
          .then(result => {
            this.articleList = this.articleList.concat(result.data.data)
            this.$nextTick(() => {
              _this.page++
              this.$refs.scroller.donePullup()
              this.$refs.scroller.reset()
            })
          })
          .catch(e => {
            console.log(e)
            this.$vux.toast.show({
              text: '获取数据失败',
            })
            this.$loading.hide()
          })
      },
    },
    computed: {
      minHeight: () => {
        return (document.body.clientHeight >= 400 && document.body.clientHeight <= 736) ? document.body.clientHeight : window.screen.height
      },
    },
  }
</script>
