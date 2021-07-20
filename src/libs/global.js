
import AllUse from '../views/all-use'
export function register(Vue){
    Vue.component('global-com',{
        render:(h)=>{
            return h('div',
            {
                attrs:{
                    class:'test'
                }
            },
            [
                h('p','我是一个全局组件'),
                h('p','我有两个子元素')
            ],
            )
        }
    })
}

export function register2(Vue){
    Vue.component('all-use',AllUse)
}