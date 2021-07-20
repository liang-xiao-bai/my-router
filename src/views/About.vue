<template>
  <div class="about">
    <!-- <h1>This is an about page</h1> -->
    <global-com></global-com>
    <el-button @click="tip">点击</el-button>
    <g-table></g-table>
    <!-- <all-use></all-use> -->
    <!-- <test>
        <template v-slot:first>粉红色</template>
        <template v-slot:second>蓝色</template>
    </test>
    <el-row>
      <el-button>默认按钮</el-button>
      <el-button type="primary">主要按钮</el-button>
      <el-button type="success">成功按钮</el-button>
      <el-button type="info">信息按钮</el-button>
      <el-button type="warning">警告按钮</el-button>
      <el-button type="danger">危险按钮</el-button>
    </el-row> -->
  </div>
</template>
<script>
import test from './test.vue'
import { tipMsg } from '../libs/message.js'
export default {
   data() {
      return {
      }
   },
   components:{ test },
   created(){
     console.log(this.$route)
   },
    mounted(){
      console.log(this.$slots)
   },
   computed:{
   },
   methods:{
     tip(){
       tipMsg()
     }
   }
}
</script>
<style lang="less" scoped>

</style>

