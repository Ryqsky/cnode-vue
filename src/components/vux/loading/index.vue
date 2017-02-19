<template>
  <div class="weui_loading_toast" v-show="show">
    <div class="weui_mask_transparent"></div>
    <div class="weui_toast" :style="{ position: position }">
      <i class="weui-loading weui-icon_toast"></i>
      <p class="weui_toast_content">{{ text }}
        <slot></slot>
      </p>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      value: {
        type: Boolean,
        default: false
      },
      text: {
        type: String,
        default: 'Loading'
      },
      position: String
    },
    created () {
      this.show = this.value
    },
    data () {
      return {
        show: false
      }
    },
    watch: {
      value (val) {
        this.show = val
      },
      show (val) {
        this.$emit('input', val)
      }
    }
  }
</script>

<style lang="less">
  @import '../styles/weui/widget/weui_tips/weui_mask.less';
  @import '../styles/weui/widget/weui_tips/weui_toast.less';
  @import '../styles/weui/widget/weui-loading/index.less';
  .weui-icon_toast.weui-loading {
    margin: 20px 0 0;
    width: 38px;
    height: 38px;
    vertical-align: baseline;
  }
  .weui_loading_toast .weui_toast_content {
    margin-top: 0!important;
  }
</style>
