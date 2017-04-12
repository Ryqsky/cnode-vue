<template>
  <div class="vue-recyclist">
    <div ref="list" class="vue-recyclist-items">
    </div>

    <div v-show="spinner && !nomore && !tombstone"
         class="vue-recyclist-loading"
         :style="{visibility: loading ? 'visible' : 'hidden'}">
      <slot name="spinner">
        <div class="vue-recyclist-loading-content">
          <div class="cssloading-circle spinner"></div>
        </div>
      </slot>
    </div>

    <div v-show="nomore && !loading"
         class="vue-recyclist-nomore">
      <slot name="nomore">
        <div>End of list</div>
      </slot>
    </div>
  </div>
</template>
<script type="text/babel">
  import Vue from 'vue'
  import router from './../../router'
  export default {
    data () {
      return {
        name: 'VueRecyclist',
        translateY: 0,
        items: [], // Wrapped full list items
        height: 0, // Full list height
        loadings: [], // Loading status queue
        start: 0, // Visible items start index
        startOffset: 0, // Start item offset,
        unusedNodes: [],
        anchorScrollTop: 0,
        curPos: 0,
        anchorItem: {
          index: 0,
          offset: 0
        },
        ANIMATION_DURATION_MS: 200,
        RUNWAY_ITEMS: 20,
        RUNWAY_ITEMS_OPPOSITE: 20,
        lastAttachedIndex: 0,
        firstAttachedIndex: 0,
        TOMBSTONE_CLASS: 'tombstone',
        loadItemIndex: 0,
        tombstones: [],
        INVISIBLE_CLASS: 'invisible'
      }
    },
    computed: {
      firstIndex () {
        return Math.max(0, this.start - this.size)
      },
      endIndex () {
        return Math.min(this.items.length, this.start + this.size)
      },
      containerHeight () {
        return (this.$el && this.$el.offsetHeight) || 0
      },
      tombHeight () {
        return this.tombstone ? this.$refs.tomb && this.$refs.tomb.offsetHeight : 0
      },
      loading () {
        return this.loadings.length
      }
    },
    activated () {
      this.setScrollTop()
    },
    props: {
      list: {
        type: Array,
        required: true
      },
      tombstone: {
        type: Boolean,
        default: false // Whether to show tombstones.
      },
      size: {
        type: Number,
        default: 20 // The number of items added each time.
      },
      offset: {
        type: Number,
        default: 200 // The number of pixels of additional length to allow scrolling to.
      },
      loadmore: {
        type: Function,
        required: true // The function of loading more items.
      },
      spinner: {
        type: Boolean,
        default: true // Whether to show loading spinner.
      },
      nomore: {
        type: Boolean,
        default: false // Whether to show 'no more data' status bar
      }
    },
    watch: {
      list (arr) {
        if (arr.length) {
          this.loadings.pop()
          if (!this.loading) {
            this.loadItems()
          }
        } else {
          this.init()
        }
      },
      items (arr) {
        if (arr.length > this.list.length) {
          if (!this.loading) {
            this.loadItems()
          }
        }
      }
    },
    mounted () {
      this.$el.addEventListener('scroll', this.onScroll.bind(this))
      window.addEventListener('resize', this.onResize.bind(this))
      this.init()
    },
    methods: {
      init () {
        this.reset()
      },
      reset () {
        this.items = []
        this.height = this.top = this.start = 0
        this.$el.scrollTop = 0
        this.onScroll()
      },
      load () {
        if (!this.loading) {
          this.getItems()
        }
      },
      getItems () {
        this.loadings.push(1)
        this.loadmore()
      },
      loadItems () {
        let end = this.list.length
        this.loadItemIndex = end
        for (let i = 0; i < end; i++) {
          if (this.items[i] && this.items[i].data) {
            continue
          }
          if (this.items[i] && !this.items[i].data && this.items[i].node) {
            this.items[i].node.classList.contains(this.TOMBSTONE_CLASS) && (this.tombstones.push(this.items[i].node), this.tombstones[this.tombstones.length - 1].classList.add(this.INVISIBLE_CLASS))
          }
          this.setItem(i, this.list[i] || null)
        }
        this.attachContent()
      },
      setItem (index, data) {
        this.$set(this.items, index, {
          vm: null,
          data: data || {},
          height: 0,
          top: -1000,
          node: null,
          tomb: !data,
          loaded: !!data
        })
      },
      setScrollTop () {
        if (this.items[this.start]) {
          this.$el.scrollTop = this.items[this.start].top
        }
      },
      makeScrollable () {
        // make ios -webkit-overflow-scrolling scrollable
        this.$el.classList.add('vue-recyclist-scrollable')
      },
      onScroll () {
        console.log('scrollTop:' + this.$el.scrollTop)
        let currentScrollTop = this.$el.scrollTop
        let differ = currentScrollTop - this.anchorScrollTop
        currentScrollTop === 0 ? this.anchorItem = {
          index: 0,
          offset: 0
        } : this.anchorItem = this.computeAnchorIndex()
        this.anchorScrollTop = this.$el.scrollTop
        differ < 0 ? this.fill(this.anchorItem.index - this.RUNWAY_ITEMS, this.anchorItem.index + this.RUNWAY_ITEMS_OPPOSITE) : this.fill(this.anchorItem.index - this.RUNWAY_ITEMS_OPPOSITE, this.anchorItem.index + this.RUNWAY_ITEMS)
        if (this.loadItemIndex < this.lastAttachedIndex) {
          this.load()
        }
      },
      fill: function (t, e) {
        this.firstAttachedIndex = Math.max(0, t)
        this.lastAttachedIndex = e
        this.attachContent()
      },
      attachContent: function () {
        this.getUnUsedNodes()
        let e = this.renderItems()
        this.clearUnUsedNodes()
        this.cacheItemHeight()
        this.getNodePosition()
        this.setAnimatePosition(e)
//        this.setScrollRunway()
      },
      computeAnchorIndex () {
        let top = this.$el.scrollTop
        if (top === 0) {
          this.start = 0
          return {
            index: 0,
            offset: 0
          }
        }
        for (let i = 0; i < this.items.length; i++) {
          if (this.items[i].top > top) {
            this.start = Math.max(0, i - 1)
            break
          }
        }
        return {
          index: this.start,
          offset: 0
        }
      },
      cacheItemHeight: function () {
        for (let t = this.firstAttachedIndex; t < this.lastAttachedIndex; t++) {
          if (this.items[t].node && !this.items[t].height) {
            this.items[t].height = this.items[t].node.offsetHeight
            this.items[t].width = this.items[t].node.offsetWidth
          }
        }
      },
      getNodePosition: function () {
        this.anchorScrollTop = 0
        for (let t = 0; t < this.anchorItem.index; t++) {
          this.anchorScrollTop += this.items[t].height
        }
        this.anchorScrollTop += this.anchorItem.offset
        this.curPos = this.anchorScrollTop - this.anchorItem.offset
        for (let e = this.anchorItem.index; e > this.firstAttachedIndex;) {
          this.curPos -= this.items[e - 1].height
          e--
        }
        for (let e = this.anchorItem.index; e < this.firstAttachedIndex;) {
          this.curPos += this.items[e].height
          e++
        }
      },
      onResize () {
        this.items.forEach((item) => {
          item.loaded = false
        })
        this.loadItems()
      },
      createTombstone: function () {
        let tombstone = this.tombstones.pop()
        if (tombstone) {
          tombstone.classList.remove(this.INVISIBLE_CLASS)
          tombstone.style.opacity = 1
          tombstone.style.transform = ''
          tombstone.style.transition = ''
          return tombstone
        } else {
          let _this = this
          return new Vue({
            el: document.createElement('div'),
            render (h) {
              return h('div', {
                'class': {
                  tombstone: true
                }
              }, [
                _this.$scopedSlots.tombstone()
              ])
            }
          }).$el
        }
      },
      renderItems () {
        console.log(this.firstAttachedIndex)
        console.log(this.lastAttachedIndex)
        let items = []
        for (let i = this.firstAttachedIndex; i < this.lastAttachedIndex; i++) {
          for (; this.items.length <= i;) this.addItem()
          if (this.items[i].node) {
            if (!this.items[i].node.classList.contains(this.TOMBSTONE_CLASS) || !this.items[i].data) continue
            this.items[i].node.style.zIndex = 1
            items[i] = [this.items[i].node, this.items[i].top - this.anchorScrollTop]
          }
          let el = this.items[i].data ? this.renderTemp('', this.items[i].data, this.items[i]) : this.createTombstone()
          el.style.position = 'absolute'
          this.items[i].node = el
          this.items[i].top = -1
          this.$refs.list.appendChild(el)
        }
        return items
      },
      getUnUsedNodes: function () {
        for (let t = 0, len = this.items.length; t < len; t++) {
          if (t !== this.firstAttachedIndex) {
            this.items[t].vm && this.items[t].vm.$destroy()
            if (this.items[t].node) {
              this.items[t].node.classList.contains(this.TOMBSTONE_CLASS) && (this.tombstones.push(this.items[t].node), this.tombstones[this.tombstones.length - 1].classList.add(this.INVISIBLE_CLASS))
            }
            this.items[t].node && this.unusedNodes.push(this.items[t].node)
            this.items[t].vm = null
            this.items[t].node = null
          } else {
            t = this.lastAttachedIndex - 1
          }
        }
      },
      clearUnUsedNodes: function () {
        for (; this.unusedNodes.length;) this.$refs.list.removeChild(this.unusedNodes.pop())
      },
      setAnimatePosition: function (t) {
        this.tombstoneLayout(t)
        this.itemLayout(t)
      },
      tombstoneLayout: function (t) {
        for (let e in t) {
          let i = t[e]
          this.items[e].node.style.transform = 'translateY(' + (this.anchorScrollTop + i[1]) + 'px)'
          this.items[e].node.style.transition = 'transform ' + this.ANIMATION_DURATION_MS + 'ms'
        }
      },
      itemLayout: function (items) {
        for (let e = this.firstAttachedIndex; e < this.lastAttachedIndex; e++) {
          let i = items[e]
          if (i) {
            i[0].style.transition = 'transform ' + this.ANIMATION_DURATION_MS + 'ms, opacity ' + this.ANIMATION_DURATION_MS + 'ms'
            i[0].style.transform = 'translateY(' + this.curPos + 'px)'
            i[0].style.opacity = 0
          }
          if (this.curPos !== this.items[e].top) {
            i || (this.items[e].node.style.transition = '')
            this.items[e].node.style.transform = 'translateY(' + this.curPos + 'px)'
          }
          this.items[e].top = this.curPos
          this.curPos += this.items[e].height
        }
      },
      addItem: function () {
        this.items.push({
          vm: null,
          data: null,
          node: null,
          height: 0,
          top: 0,
          tomb: false,
          loaded: true
        })
      },
      renderTemp (target, data, item) {
        let _this = this
        let $vm = new Vue({
          router,
          el: document.createElement('div'),
          render (h) {
            return h('div', [
              _this.$scopedSlots.item({
                ...data
              })
            ])
          }
        })
        item && (item.vm = $vm)
        return $vm.$el
      }
    },
    destroyed () {
      this.$el.removeEventListener('scroll', this.onScroll.bind(this))
      window.removeEventListener('resize', this.onResize.bind(this))
    }
  }
</script>
<style>
  @-webkit-keyframes csl-rotate {
    0% {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg)
    }
    to {
      -webkit-transform: rotate(1turn);
      transform: rotate(1turn)
    }
  }

  @keyframes csl-rotate {
    0% {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg)
    }
    to {
      -webkit-transform: rotate(1turn);
      transform: rotate(1turn)
    }
  }

  .cssloading-circle {
    box-sizing: border-box;
    display: block;
    position: relative;
    width: 30px;
    height: 30px;
    font-size: 2px;
    color: #87cefa;
    background: #fff;
    border-radius: 50%;
    overflow: hidden;
    -webkit-animation: csl-rotate 1s infinite linear;
    animation: csl-rotate 1s infinite linear
  }

  .cssloading-circle:after, .cssloading-circle:before {
    content: "";
    display: block;
    position: absolute
  }

  .cssloading-circle:before {
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    font-size: 100em;
    border: .01em solid currentColor;
    border-radius: 50%
  }

  .cssloading-circle:after {
    top: 0;
    left: 50%;
    width: 50%;
    height: 50%;
    -webkit-transform: translate3d(0, 100%, 0) skew(20deg, 20deg) rotate(0deg);
    transform: translate3d(0, 100%, 0) skew(20deg, 20deg) rotate(0deg);
    -webkit-transform-origin: left top;
    transform-origin: left top;
    background-color: inherit
  }

  .invisible {
    display: none;
  }
</style>
<style lang="less" scoped>
  @duration: 500ms;
  .vue-recyclist {
    overflow-x: hidden;
    overflow-y: auto;
    &.vue-recyclist-scrollable {
      -webkit-overflow-scrolling: touch;
    }
    .vue-recyclist-items {
      position: relative;
      /*position: absolute;*/
      margin: 0;
      padding: 0;
      width: 100%;
      .vue-recyclist-invisible {
        top: -1000px;
        visibility: hidden;
      }
      .vue-recyclist-item {
        position: absolute;
        width: 100%;
        .vue-recyclist-transition {
          position: absolute;
          opacity: 0;
          transition-property: opacity;
          transition-duration: @duration;
        }
      }
    }
    .vue-recyclist-loading {
      overflow: hidden;
      .vue-recyclist-loading-content {
        width: 100%;
        text-align: center;
        .spinner {
          margin: 10px auto;
          width: 20px;
          height: 20px;
        }
      }
    }
    .vue-recyclist-nomore {
      overflow: hidden;
      margin: 10px auto;
      height: 20px;
      text-align: center;
    }
  }
</style>
