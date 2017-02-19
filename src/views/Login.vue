<template>
  <div>
    <div class="login-box" :style="{minHeight: minHeight + 'px'}">
      <div class="login-logo">
        <img src="https://cnodejs.org/public/images/cnodejs.svg" alt="">
      </div>
      <div class="login-title">
        登录到Cnodejs.org
      </div>
      <group>
        <x-input title='AccessToken' v-model="accessToken"></x-input>
      </group>
      <flexbox style="margin-top: 20px" @click="onLogin">
        <flexbox-item>
          <router-link to="/">
            <x-button type="default">随便逛逛</x-button>
          </router-link>
        </flexbox-item>
        <flexbox-item>
          <x-button type="primary" @click.native="onLogin">立即登录</x-button>
        </flexbox-item>
      </flexbox>
    </div>
  </div>
</template>
<script>
  export default{
    data(){
      return {
        accessToken: 'f24da430-fbcd-4710-880c-f53bb289924f',
        currTab: '最近回复',
        userData: {},
        isLogin: false
      }
    },
    activated(){
      this.$loading.hide()
    },
    methods: {
      onLogin(){
        if (!this.accessToken) {
          this.$vux.toast.show({
            text: '请输入AccessToken',
          })
          return false
        } else {
          this.$loading.show()
          this.$axios.post('/accesstoken', {
            accesstoken: this.accessToken
          })
            .then(result => {
              console.log(result)
              localStorage.setItem('accessToken', this.accessToken)
              this.$store.commit('SET_LOGININFO', {
                avatarUrl: result.data.avatar_url,
                id: result.data.id,
                loginname: result.data.loginname,
                accessToken: this.accessToken
              })
              this.$vux.toast.show({
                text: '登录成功',
              })
              this.$loading.hide()
              this.$router.push('/')
            })
            .catch(e => {
              console.log(e)
              localStorage.setItem('accessToken', null)
              this.$vux.toast.show({
                text: 'AccessToken错误',
              })
              this.$loading.hide()
            })
        }
      }
    },
    computed: {
      minHeight: () => {
        return (document.body.clientHeight >= 400 && document.body.clientHeight <= 736) ? document.body.clientHeight : window.screen.height
      }
    }
  }
</script>
