<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <button @click='jump'>点击跳转</button>
    <HelloWorld msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: 'Home',
  components: {
    HelloWorld
  },
  methods:{
    jump(){
      this.$router.push({
        name:"About",
        params:{
          id:1,
          name:'zhangsan',
          hobit:'play'
        }
      })
    }
  }
}
</script>
