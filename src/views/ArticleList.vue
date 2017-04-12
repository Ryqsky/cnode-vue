<template>
  <div class="feed-box">
    <recycler :style="{height: minHeight - 50 +  'px'}" :list="articleList" :tombstone="false" :size="20"
              :loadmore="onLoadMore">
      <template slot="item" scope="data">
        <div :id="data.id" class="feed-li">
          <router-link :to="{name: 'detail', query: { id: data.id }}">
            <div class="feed-title">
              <div class="feed-label" :class="[data.top ? 'feed-label-top' : `feed-label-other`]">
                {{data.tab | translateTab(data.top)}}
              </div>
              <p v-text="data.title"></p>
            </div>
            <div class="feed-content">
              <router-link :to="{name: 'user', query: { id: data.author.loginname }}">
                <div class="avatar">
                  <img :src="data.author.avatar_url" alt="headImgUrl">
                </div>
              </router-link>
              <div class="feed-right">
                <div class="feed-right-top">
                  <div class="feed-name" v-text="data.author.loginname">
                  </div>
                  <div class="feed-count">
                    <span v-text="data.reply_count"></span> / {{data.visit_count}}
                  </div>
                </div>
                <div class="feed-right-bottom">
                  <div class="feed-time">
                    创建于：<span>{{data.create_at | formatDate('yyyy-MM-dd hh:mm:ss')}}</span>
                  </div>
                  <div class="feed-pass">
                    {{data.last_reply_at | timeAgo}}
                  </div>
                </div>
              </div>
            </div>
          </router-link>
        </div>
      </template>
      <template slot="tombstone" scope="data">
        <div class="feed-li tombstone">
            <div class="feed-title">
              <div class="feed-label feed-label-other">
                问答
              </div>
              <p>
                默认问答阿斯蒂芬
              </p>
            </div>
            <div class="feed-content">
              <div class="avatar">
                <img src="" alt="headImgUrl">
              </div>
              <div class="feed-right">
                <div class="feed-right-top">
                  <div class="feed-name" >
                    名字
                  </div>
                  <div class="feed-count">
                    <span>时间</span> / 看的次数
                  </div>
                </div>
                <div class="feed-right-bottom">
                  <div class="feed-time">
                    创建于：<span>{{new Date() | formatDate('yyyy-MM-dd hh:mm:ss')}}</span>
                  </div>
                  <div class="feed-pass">
                    {{new Date() | timeAgo}}
                  </div>
                </div>
              </div>
            </div>
        </div>
      </template>
      <div slot="spinner" style="text-align: center">
        <span style="line-height: 40px;"><spinner type="ios-small"></spinner></span>
      </div>
      <div>No More Data</div>
      <div slot="nomore">No More Data</div>
    </recycler>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        page: 0,
        limit: 20,
        articleList: [],
        status: {
          pullupStatus: 'default',
          pulldownStatus: 'default'
        }
      }
    },
    mounted () {
//      this.onRefresh()
    },
    activated () {
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
              this.$loading.hide()
            })
          })
          .catch(e => {
            console.log(e)
            this.$vux.toast.show({
              text: '获取数据失败'
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
            })
          })
          .catch(e => {
            console.log(e)
            this.$vux.toast.show({
              text: '获取数据失败'
            })
            this.$loading.hide()
          })
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
  .vue-recyclist-items > div {
    width: 100%;
  }
</style>
