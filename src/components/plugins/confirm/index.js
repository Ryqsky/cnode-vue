import ConfirmComponent from '../../vux/confirm'

let $vm
let watcher

export default {
  install (vue) {
    if (!$vm) {
      const Confirm = vue.extend(ConfirmComponent)
      $vm = new Confirm({
        el: document.createElement('div')
      })
      document.body.appendChild($vm.$el)
    }

    const confirm = {
      show (options) {
        // destroy watcher
        watcher && watcher()
        if (typeof options === 'object') {
          for (let i in options) {
            if (i !== 'content') {
              $vm[i] = options[i]
            } else {
              $vm.$el.querySelector('.weui_dialog_bd').innerHTML = options['content']
            }
          }
        }
        if (options.onShow || options.onHide) {
          watcher = $vm.$watch('show', (val) => {
            val && options.onShow && options.onShow($vm)
            val === false && options.onHide && options.onHide($vm)
          })
        }
        $vm.$off( ['on-confirm'] )
        $vm.$off( ['on-cancel'] )
        options.onConfirm && $vm.$on('on-confirm', options.onConfirm)
        options.onCancel && $vm.$on('on-cancel', options.onCancel)
        $vm.show = true
      },
      hide () {
        $vm.show = false
      }
    }

    if (!vue.$confirm) {
      vue.$confirm = confirm
    }

    vue.mixin({
      created: function () {
        this.$confirm = vue.$confirm
      }
    })
  }
}
