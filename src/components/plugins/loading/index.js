import ToastComponent from '../../vux/loading'

let $vm

const plugin = {
  install (vue, options) {
    const Toast = vue.extend(ToastComponent)

    if (!$vm) {
      $vm = new Toast({
        el: document.createElement('div')
      })
      document.body.appendChild($vm.$el)
    }

    const loading = {
      show () {
        $vm.show = true
      },
      hide () {
        $vm.show = false
      }
    }

    if (!vue.$loading) {
      vue.$loading = loading
    }

    vue.mixin({
      created: function () {
        this.$loading = vue.$loading
      }
    })
  }
}

export default plugin
export const install = plugin.install

