<template>
  <transition :name="maskTransition">
    <div class="weui_dialog_alert" v-show="show">
      <div class="weui_mask"></div>
      <transition :name="dialogTransition">
        <div class="weui_dialog " v-show="show">
          <slot></slot>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script>
  export default {
    props: {
      show: {
        type: Boolean,
        default: false
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
    watch: {
      show (val) {
        this.$emit(val ? 'on-show' : 'on-hide')
      }
    }
  }
</script>

<style>
  .vux-dialog-enter-active, .vux-dialog-leave-active {
    opacity: 1;
    transition-duration: .4s;
    transform: translate(-50%, -50%) scale(1) !important;
    transition-property: transform, opacity !important;
  }
  .vux-dialog-enter, .vux-dialog-leave-active {
    opacity: 0
  }

  .vux-dialog-enter {
    transform: translate(-50%, -50%) scale(1.185) !important;
  }

  .vux-dialog-leave {
    transform: translate(-50%, -50%) scale(1) !important;
  }

  .vux-fade-enter-active, .vux-fade-leave-active {
    transition: opacity .5s ease;
  }

  .vux-fade-leave-active {
    opacity: 0
  }
</style>
