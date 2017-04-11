<template>
  <div class="vue-recyclist" @click="renderItems">
    <div @click="onScroll" ref="list" class="vue-recyclist-items" :style="{height: '500px'}">
      <!--<div v-for="(item, index) in visibleItems" class="vue-recyclist-item" :style="{transform: 'translate3d(0,' + item.top + 'px,0)'}">-->
      <!--<div :class="{'vue-recyclist-transition': tombstone}" :style="{opacity: +item.loaded}">-->
      <!--<slot name="item" :data="item.data" :index="index"></slot>-->
      <!--</div>-->
      <!--</div>-->

      <!--get tombstone and item heights from these invisible doms-->
      <!--<div class="vue-recyclist-pool">-->
      <!--<div :ref="'item'+index" v-for="(item, index) in items" v-if="!item.tomb && !item.height"-->
      <!--class="vue-recyclist-item vue-recyclist-invisible">-->
      <!--<slot name="item" :data="item.data"></slot>-->
      <!--</div>-->
      <!--</div>-->
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
        baseNode: document.createElement('div'),
        unusedNodes: [],
        anchorScrollTop: 0,
        curPos: 0,
        anchorItem: {
          index: 0,
          offset: 0
        },
        tombstoneSize: 30,
        ANIMATION_DURATION_MS: 0.2,
        RUNWAY_ITEMS: 30,
        RUNWAY_ITEMS_OPPOSITE: 30,
        lastAttachedIndex: 0,
        firstAttachedIndex: 0,
        TOMBSTONE_CLASS: 'tombstone'
      }
    },
    computed: {
      visibleItems () {
        return this.items.slice(Math.max(0, this.start - this.size), Math.min(this.items.length, this.start + this.size))
      },
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
          this.getItems()
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
        this.load()
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
        let loads = []
        let start = 0
        let end = this.list.length
        for (let i = start; i < end; i++) {
          if (this.items[i] && this.items[i].loaded) {
            continue
          }
          this.setItem(i, this.list[i] || null)
          // update newly added items position
          loads.push(this.$nextTick().then(() => {
            this.updateItemHeight(i)
          }))
        }
        // update items top and full list height
        Promise.all(loads).then(() => {
          this.updateItemTop()
        })
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
      updateItemHeight (index) {
        // update item height
        let cur = this.items[index]
        let dom = this.$refs['item' + index]
        if (dom && dom[0]) {
          cur.height = dom[0].offsetHeight
        } else {
          // item is tombstone
          cur.height = this.tombHeight
        }
      },
      updateItemTop () {
        // loop all items to update item top and list height
        this.height = 0
        for (let i = 0; i < this.items.length; i++) {
          let pre = this.items[i - 1]
          this.items[i].top = pre ? pre.top + pre.height : 0
          this.height += this.items[i].height
        }
        this.translateY += this.items[0].height
        // update scroll top when needed
        if (this.startOffset) {
          this.setScrollTop()
        }
        this.updateIndex()
        this.makeScrollable()
      },
      updateIndex () {
        // update visible items start index
        let top = this.$el.scrollTop
        for (let i = 0; i < this.items.length; i++) {
          if (this.items[i].top > top) {
            this.start = Math.max(0, i - 1)
            break
          }
        }
        // scrolling does not need recalculate scrolltop
        // this.getStartItemOffset()
      },
      getStartItemOffset () {
        if (this.items[this.start]) {
          this.startOffset = this.items[this.start].top - this.$el.scrollTop
        }
      },
      setScrollTop () {
        if (this.items[this.start]) {
          this.$el.scrollTop = this.items[this.start].top - this.startOffset
          // reset start item offset
          this.startOffset = 0
        }
      },
      makeScrollable () {
        // make ios -webkit-overflow-scrolling scrollable
        this.$el.classList.add('vue-recyclist-scrollable')
      },
      onScroll () {
        console.log('onScroll')
        console.log('scrollTop:' + this.$el.scrollTop)
        console.log('offsetHeight:' + this.$el.offsetHeight)
        let t = this.$el.scrollTop - this.anchorScrollTop
        this.$el.scrollTop === 0 ? this.anchorItem = {
          index: 0,
          offset: 0
        } : this.anchorItem = this.calculateAnchoredItem(this.anchorItem, t)
        this.anchorScrollTop = this.$el.scrollTop
        let e = this.calculateAnchoredItem(this.anchorItem, this.$el.offsetHeight)
        console.log(e)
        t < 0 ? this.fill(this.anchorItem.index - this.RUNWAY_ITEMS, e.index + this.RUNWAY_ITEMS_OPPOSITE) : this.fill(this.anchorItem.index - this.RUNWAY_ITEMS_OPPOSITE, e.index + this.RUNWAY_ITEMS)
        if (this.$el.scrollTop + this.$el.offsetHeight > this.height - this.offset) {
          this.load()
//          this.attachContent()
        }
        this.updateIndex()
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
      calculateAnchoredItem: function (t, e) {
        if (e === 0) return t
        e += t.offset
        let i = t.index
        let o = 0
        if (e < 0) {
          for (; e < 0 && i > 0 && this.items[i - 1].height;) {
            console.log('----')
            e += this.items[i - 1].height
            i--
            o = Math.max(-i, Math.ceil(Math.min(e, 0) / this.tombstoneSize))
          }
        } else {
          for (; e > 0 && i < this.items.length && this.items[i].height && this.items[i].height < e;) {
            console.log('++++')
            e -= this.items[i].height
            i++;
            (i >= this.items.length || !this.items[i].height) && (o = Math.floor(Math.max(e, 0) / this.tombstoneSize))
          }
        }
        i += o
        e -= o * this.tombstoneSize
        return {index: i, offset: e}
      },
      cacheItemHeight: function () {
        for (var t = this.firstAttachedIndex; t < this.lastAttachedIndex; t++) {
          this.items[t].data && !this.items[t].height && (this.items[t].height = this.items[t].node.offsetHeight, this.items[t].width = this.items[t].node.offsetWidth)
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
        this.getStartItemOffset()
        this.items.forEach((item) => {
          item.loaded = false
        })
        this.loadItems()
      },
      createTombstone: function () {
        return new Vue({
          el: document.createElement('div'),
          render: function (h) {
            return <h2>占位符</h2>
          }
        }).$el
      },
      renderItems () {
        console.log(this.firstAttachedIndex)
        console.log(this.lastAttachedIndex)
        let items = []
        let tempEls = []
        for (let i = this.firstAttachedIndex; i < this.lastAttachedIndex; i++) {
          for (; this.items.length <= i;) this.addItem()
          if (this.items[i].node) {
            if (!this.items[i].node.classList.contains(this.TOMBSTONE_CLASS) || !this.items[i].data) continue
            this.items[i].node.style.zIndex = 1
            items[i] = [this.items[i].node, this.items[i].top - this.anchorScrollTop]
          }
          let el = this.items[i].data ? this.renderTemp('', this.items[i].data, this.items[i]) : this.createTombstone()
          el.style.position = 'absolute'
          if (!this.items[i].data) {
            this.items[i].height = 30
          }
          this.items[i].node = el
          this.items[i].top = -1
          tempEls.push(el)
        }
        console.log(tempEls)
        for (let i = 0, len = tempEls.length; i < len; i++) {
          this.$refs.list.appendChild(tempEls[i])
        }
        return items
      },
      getUnUsedNodes: function () {
        for (let t = 0; t < this.items.length; t++) {
//          console.log('getUnUsedNodes')
          if (t !== this.firstAttachedIndex) {
            this.items[t].vm && this.items[t].vm.$destroy()
            console.log('getUnUsedNodes')
            console.log(this.items[t].node)
            this.items[t].node && this.unusedNodes.push(this.items[t].node)
            this.items[t].vm = null
            this.items[t].node = null
          } else {
            t = this.lastAttachedIndex - 1
          }
        }
      },
      clearUnUsedNodes: function () {
        console.log('clearUnUsedNodes')
        console.log(this.unusedNodes)
        for (; this.unusedNodes.length;) this.$refs.list.removeChild(this.unusedNodes.pop())
      },
      setAnimatePosition: function (t) {
        this.itemLayout(t)
      },
      itemLayout: function (t) {
        let e = void 0
        let i = void 0
        for (e = this.firstAttachedIndex; e < this.lastAttachedIndex; e++) {
          i = t[e]
          if (i) {
            i[0].style.transition = 'transform ' + this.ANIMATION_DURATION_MS + 'ms, opacity ' + this.ANIMATION_DURATION_MS + 'ms'
            i[0].style.transform = 'translateY(' + this.curPos + 'px) scale(' + this.items[e].width / this.tombstoneWidth_ + ', ' + this.items[e].height / this.tombstoneSize + ')'
            i[0].style.opacity = 0
          }
          if (this.curPos !== this.items[e].top) {
            i || (this.items[e].node.style.transition = '')
            this.items[e].node.style.transform = 'translateY(' + this.curPos + 'px)'
          }
          this.items[e].top = this.curPos
          this.curPos += this.items[e].height || this.tombstoneSize
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
        let $vm = new Vue({
          el: document.createElement('div'),
          render (h) {
            let tempData = {
              props: data
            }
            return (
              <div id={data.id} class="feed-li" {...tempData}>
                <div class="feed-title">
                  <div class="feed-label" class={[data.top ? 'feed-label-top' : `feed-label-other`]}>
                  {data.tab}
                </div>
                <p>{data.title}</p>
              </div>
            </div>
            )
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
