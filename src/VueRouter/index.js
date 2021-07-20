let _Vue = null
class VueRouter{
    static install(Vue){
        // 1、判断插件是否已经被安装
        if(VueRouter.install.installed){
            return
        }
        VueRouter.install.installed = true
        // 2、把Vue构造函数记录到全局变量
        _Vue = Vue
        // 3、把创建Vue实例时候传入的router对象注入到Vue原型，让所有实例可用
        Vue.mixin({
            beforeCreate(){
                if(this.$options.router){
                    // this为最外层vue实例
                    Vue.prototype.$router = this.$options.router
                    this.$options.router.init()
                }
            }
        })
    }
    constructor(optinos){
        this.optinos = optinos
        this.routeMap = {}
        this.data = _Vue.observable({
            current:'/'
        })
    }
    init(){
        this.createRouteMap()
        this.initComponent()
        this.initEvent()
    }
    createRouteMap(){
        this.optinos.routes.forEach((route)=>{
            this.routeMap[route.path] = route.component
        })
    }
    initComponent(){
        _Vue.component('router-link',{
            props:{
                to:String
            },
            render(h){
                return h('a',{
                    attrs:{
                        href:this.to
                    },
                    on:{
                        click:this.clickHandler
                    }
                },[this.$slots.default])
            },
            methods:{
                clickHandler(e){
                    // 改变路由地址，但是不向服务器发送请求
                    history.pushState({},'',this.to)
                    // 获取路由对象的data值
                    this.$router.data.current = this.to
                    e.preventDefault()
                }
            }
        })
        const self = this
        _Vue.component('router-view',{
            render(h){
                const component = self.routeMap[self.data.current]
                console.log(component,'componentcomponentcomponent')
                return h(component)
            }
        })
    }
    initEvent(){
        window.addEventListener('popstate',()=>{
            this.data.current = window.location.pathname
        })
    }
}

export default VueRouter