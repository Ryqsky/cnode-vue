<template>
  <div class="feed-box">
    <recycler :style="{height: minHeight - 50 +  'px'}" :list="articleList" :tombstone="false" :size="20"
              :loadmore="onLoadMore">
      <template slot="item" scope="props">
        <div :id="props.data.id" class="feed-li">
          <router-link :to="{name: 'detail', query: { id: props.data.id }}">
            <div class="feed-title">
              <div class="feed-label" :class="[props.data.top ? 'feed-label-top' : `feed-label-other`]">
                {{props.data.tab | translateTab(props.data.top)}}
              </div>
              <p v-text="props.data.title"></p>
            </div>
            <div class="feed-content">
              <router-link :to="{name: 'user', query: { id: props.data.author.loginname }}">
                <div class="avatar">
                  <img :src="props.data.author.avatar_url" alt="headImgUrl">
                </div>
              </router-link>
              <div class="feed-right">
                <div class="feed-right-top">
                  <div class="feed-name" v-text="props.data.author.loginname">
                  </div>
                  <div class="feed-count">
                    <span v-text="props.data.reply_count"></span> / {{props.data.visit_count}}
                  </div>
                </div>
                <div class="feed-right-bottom">
                  <div class="feed-time">
                    创建于：<span>{{props.data.create_at | formatDate('yyyy-MM-dd hh:mm:ss')}}</span>
                  </div>
                  <div class="feed-pass">
                    {{props.data.last_reply_at | timeAgo}}
                  </div>
                </div>
              </div>
            </div>
          </router-link>
        </div>
      </template>
      <div slot="spinner" style="text-align: center">
        <span style="line-height: 40px;"><spinner type="ios-small"></spinner></span>
      </div>
      <div slot="nomore">No More Data</div>
    </recycler>
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
