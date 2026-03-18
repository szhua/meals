import App from './App'

// 全局注册 IconPark 组件
import IconPark from './components/icon-park.vue'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  // 全局注册 IconPark 组件
  app.component('IconPark', IconPark)
  return {
    app
  }
}
// #endif