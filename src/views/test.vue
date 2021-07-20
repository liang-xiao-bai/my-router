<template>
    <div>
        <div class="div1">
            <slot name="first"></slot>
        </div>
        <div class="div2">
            <slot name="second"></slot>
        </div>
    </div>
</template>
<script>
export default {
   data() {
      return {
      }
   },
   created(){
   },
   computed:{
   },
   methods:{
   },
}
</script>
<style lang="less" scoped>
    .div1{
        color: pink;
    }
    .div2{
        color: blue;
    }
</style>
