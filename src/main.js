import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { register } from './libs/global'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import gTable from './components/g-table.vue'
Vue.use(ElementUI)

Vue.config.productionTip = false

let app = new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

// 注册全局组件
register(Vue)
// register2(Vue)

Vue.component('g-table',gTable)