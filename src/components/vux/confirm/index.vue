<template>
  <div>
    <v-dialog class="weui_dialog_confirm"
            :show="show"
            :mask-transition="maskTransition"
            :dialog-transition="dialogTransition"
            @on-hide="$emit('on-hide')"
            @on-show="$emit('on-show')">
      <div class="weui_dialog_hd"><strong class="weui_dialog_title">{{title}}</strong></div>
      <div class="weui_dialog_bd"><slot></slot></div>
      <div class="weui_dialog_ft">
        <a href="javascript:;" class="weui_btn_dialog default" @click="_onCancel">{{cancelText}}</a>
        <a href="javascript:;" class="weui_btn_dialog primary" @click="_onConfirm">{{confirmText}}</a>
      </div>
    </v-dialog>
  </div>
</template>

<script>
import vDialog from '../dialog'
export default {
  components: {
    vDialog
  },
  props: {
    show: {
      type: Boolean,
      default: false,
      twoWay: true
    },
    title: {
      type: String,
      default: '提示'
    },
    confirmText: {
      type: String,
      default: '确定'
    },
    cancelText: {
      type: String,
      default: '取消'
    },
    maskTransition: {
      type: String,
      default: 'vux-fade'
    },
    dialogTransition: {
      type: String,
      default: 'vux-dialog'
    }
  },
  methods: {
    _onConfirm () {
      this.show = false
      this.$emit('on-confirm')
    },
    _onCancel () {
      this.show = false
      this.$emit('on-cancel')
    }
  }
}
</script>

<style lang="less">
  @import "./index.less";
</style>
