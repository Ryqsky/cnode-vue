function o (t, e) {
  var i = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {}
  this.RUNWAY_ITEMS = i.RUNWAY_ITEMS || s
  this.RUNWAY_ITEMS_OPPOSITE = i.RUNWAY_ITEMS_OPPOSITE || a
  this.SCROLL_RUNWAY = i.SCROLL_RUNWAY || n
  this.ANIMATION_DURATION_MS = i.ANIMATION_DURATION_MS || r
  this.TOMBSTONE_CLASS = i.TOMBSTONE_CLASS || h
  this.INVISIBLE_CLASS = i.INVISIBLE_CLASS || c
  this.anchorItem = {
    index: 0,
    offset: 0
  }
  this.firstAttachedItem_ = 0
  this.lastAttachedItem_ = 0
  this.anchorScrollTop = 0
  this.tombstoneSize_ = 0
  this.tombstoneWidth_ = 0
  this.tombstones_ = []
  this.scroller_ = t
  this.source_ = e
  this.items_ = []
  this.loadedItems_ = 0
  this.requestInProgress_ = !1
  this.curPos = 0
  this.unusedNodes = []
  this.baseNode = document.createElement('div')
  this.scroller_.addEventListener('scroll', this.onScroll_.bind(this))
  window.addEventListener('resize', this.onResize_.bind(this))
  this.scrollRunway_ = document.createElement('div')
  this.scrollRunway_.textContent = ' '
  this.scrollRunwayEnd_ = 0
  this.scrollRunway_.style.position = 'absolute'
  this.scrollRunway_.style.height = '1px'
  this.scrollRunway_.style.width = '1px'
  this.scrollRunway_.style.transition = 'transform 0.2s'
  this.scroller_.appendChild(this.scrollRunway_)
  this.onResize_()
}
o.prototype = {
  onResize_: function () {
    var t = this.source_.createTombstone(this.baseNode.cloneNode(!0))
    t.style.position = 'absolute', this.scroller_.appendChild(t), t.classList.remove(this.INVISIBLE_CLASS), this.tombstoneSize_ = t.offsetHeight, this.tombstoneWidth_ = t.offsetWidth, this.scroller_.removeChild(t)
    for (var e = 0; e < this.items_.length; e++) this.items_[e].height = this.items_[e].width = 0
    this.onScroll_()
  },
  onScroll_: function () {
    var t = this.scroller_.scrollTop - this.anchorScrollTop
    this.scroller_.scrollTop === 0 ? this.anchorItem = {
      index: 0,
      offset: 0
    } : this.anchorItem = this.calculateAnchoredItem(this.anchorItem, t), this.anchorScrollTop = this.scroller_.scrollTop
    var e = this.calculateAnchoredItem(this.anchorItem, this.scroller_.offsetHeight)
    t < 0 ? this.fill(this.anchorItem.index - this.RUNWAY_ITEMS, e.index + this.RUNWAY_ITEMS_OPPOSITE) : this.fill(this.anchorItem.index - this.RUNWAY_ITEMS_OPPOSITE, e.index + this.RUNWAY_ITEMS)
  },
  calculateAnchoredItem: function (t, e) {
    if (e == 0) return t
    e += t.offset
    var i = t.index, o = 0
    if (e < 0) {
      for (; e < 0 && i > 0 && this.items_[i - 1].height;)e += this.items_[i - 1].height, i--
      o = Math.max(-i, Math.ceil(Math.min(e, 0) / this.tombstoneSize_))
    } else {
      for (; e > 0 && i < this.items_.length && this.items_[i].height && this.items_[i].height < e;)e -= this.items_[i].height, i++;
      (i >= this.items_.length || !this.items_[i].height) && (o = Math.floor(Math.max(e, 0) / this.tombstoneSize_))
    }
    return i += o, e -= o * this.tombstoneSize_, {index: i, offset: e}
  },
  fill: function (t, e) {
    this.firstAttachedItem_ = Math.max(0, t), this.lastAttachedItem_ = e, this.attachContent()
  },
  getTombstone: function () {
    var t = this.tombstones_.pop()
    return t ? (t.classList.remove(this.INVISIBLE_CLASS), t.style.opacity = 1, t.style.transform = '', t.style.transition = '', t) : this.source_.createTombstone(this.baseNode.cloneNode(!0))
  },
  getUnUsedNodes: function () {
    for (var t = 0; t < this.items_.length; t++)t !== this.firstAttachedItem_ ? (this.items_[t].vm && this.items_[t].vm.$destroy(), this.items_[t].node && (this.items_[t].node.classList.contains(this.TOMBSTONE_CLASS) ? (this.tombstones_.push(this.items_[t].node), this.tombstones_[this.tombstones_.length - 1].classList.add(this.INVISIBLE_CLASS)) : this.unusedNodes.push(this.items_[t].node)), this.items_[t].vm = null, this.items_[t].node = null) : t = this.lastAttachedItem_ - 1
  },
  clearUnUsedNodes: function () {
    for (; this.unusedNodes.length;) this.scroller_.removeChild(this.unusedNodes.pop())
  },
  getNodePosition: function () {
    this.anchorScrollTop = 0
    for (var t = 0; t < this.anchorItem.index; t++) this.anchorScrollTop += this.items_[t].height || this.tombstoneSize_
    this.anchorScrollTop += this.anchorItem.offset, this.curPos = this.anchorScrollTop - this.anchorItem.offset
    for (var e = this.anchorItem.index; e > this.firstAttachedItem_;) this.curPos -= this.items_[e - 1].height || this.tombstoneSize_, e--
    for (; e < this.firstAttachedItem_;) this.curPos += this.items_[e].height || this.tombstoneSize_, e++
  },
  tombstoneLayout: function (t) {
    var e = void 0, i = void 0
    for (e in t)i = t[e], this.items_[e].node.style.transform = 'translateY(' + (this.anchorScrollTop + i[1]) + 'px) scale(' + this.tombstoneWidth_ / this.items_[e].width + ', ' + this.tombstoneSize_ / this.items_[e].height + ')', this.items_[e].node.offsetTop, i[0].offsetTop, this.items_[e].node.style.transition = 'transform ' + this.ANIMATION_DURATION_MS + 'ms'
  },
  itemLayout: function (t) {
    var e = void 0, i = void 0
    for (e = this.firstAttachedItem_; e < this.lastAttachedItem_; e++)i = t[e], i && (i[0].style.transition = 'transform ' + this.ANIMATION_DURATION_MS + 'ms, opacity ' + this.ANIMATION_DURATION_MS + 'ms', i[0].style.transform = 'translateY(' + this.curPos + 'px) scale(' + this.items_[e].width / this.tombstoneWidth_ + ', ' + this.items_[e].height / this.tombstoneSize_ + ')', i[0].style.opacity = 0), this.curPos !== this.items_[e].top && (i || (this.items_[e].node.style.transition = ''), this.items_[e].node.style.transform = 'translateY(' + this.curPos + 'px)'), this.items_[e].top = this.curPos, this.curPos += this.items_[e].height || this.tombstoneSize_
  },
  setAnimatePosition: function (t) {
    this.tombstoneLayout(t), this.itemLayout(t)
  },
  renderItems: function () {
    var t = {}, e = void 0, i = [], o = void 0
    for (o = this.firstAttachedItem_; o < this.lastAttachedItem_; o++) {
      for (; this.items_.length <= o;) this.addItem_()
      if (this.items_[o].node) {
        if (!this.items_[o].node.classList.contains(this.TOMBSTONE_CLASS) || !this.items_[o].data) continue
        this.ANIMATION_DURATION_MS ? (this.items_[o].node.style.zIndex = 1, t[o] = [this.items_[o].node, this.items_[o].top - this.anchorScrollTop]) : (this.items_[o].node.classList.add(this.INVISIBLE_CLASS), this.tombstones_.push(this.items_[o].node)), this.items_[o].node = null
      }
      e = this.items_[o].data ? this.source_.render(this.items_[o].data, this.unusedNodes.pop() || this.baseNode.cloneNode(!0), this.items_[o]) : this.getTombstone()
      e.style.position = 'absolute'
      this.items_[o].top = -1
      this.items_[o].node = e
      i.push(e)
    }
    var s = s = i.length
    for (o = 0; o < s; o++) this.scroller_.appendChild(i[o])
    return t
  },
  cacheItemHeight: function () {
    for (var t = this.firstAttachedItem_; t < this.lastAttachedItem_; t++) this.items_[t].data && !this.items_[t].height && (this.items_[t].height = this.items_[t].node.offsetHeight, this.items_[t].width = this.items_[t].node.offsetWidth)
  },
  attachContent: function () {
    var t = this
    this.getUnUsedNodes()
    var e = this.renderItems()
    this.clearUnUsedNodes(), this.cacheItemHeight(), this.getNodePosition(), this.setAnimatePosition(e), this.setScrollRunway(), this.ANIMATION_DURATION_MS && setTimeout(function () {
      t.tombstoneAnimation(e)
    }, this.ANIMATION_DURATION_MS), this.maybeRequestContent()
  },
  setScrollRunway: function () {
    this.scrollRunwayEnd_ = Math.max(this.scrollRunwayEnd_, this.curPos + this.SCROLL_RUNWAY), this.scrollRunway_.style.transform = 'translate(0, ' + this.scrollRunwayEnd_ + 'px)', this.scroller_.scrollTop = this.anchorScrollTop
  },
  tombstoneAnimation: function (t) {
    var e = void 0
    for (var i in t)e = t[i], e[0].classList.add(this.INVISIBLE_CLASS), this.tombstones_.push(e[0])
    t = null
  },
  maybeRequestContent: function () {
    if (!this.requestInProgress_) {
      var t = this.lastAttachedItem_ - this.loadedItems_
      t <= 0 || (this.requestInProgress_ = !0, this.source_.fetch(t).then(this.addContent.bind(this)))
    }
  },
  addItem_: function () {
    this.items_.push({vm: null, data: null, node: null, height: 0, width: 0, top: 0})
  },
  addContent: function (t) {
    this.requestInProgress_ = !1
    for (var e = (this.items_.length, 0); e < t.length; e++) {
      this.items_.length <= this.loadedItems_ && this.addItem_()
      this.items_[this.loadedItems_++].data = t[e]
    }
    this.attachContent()
  },
  destroy: function () {
    this.scroller_.removeEventListener('scroll', this.onScroll_), window.removeEventListener('resize', this.onResize_), this.firstAttachedItem_ = 0, this.lastAttachedItem_ = 0, this.anchorScrollTop = 0, this.tombstoneSize_ = 0, this.tombstoneWidth_ = 0, this.tombstones_ = [], this.scroller_ = null, this.source_ = null, this.loadedItems_ = 0, this.requestInProgress_ = !1, this.curPos = 0, this.unusedNodes = [], this.baseNode = null
  }
}
