import axios from "axios"
import { Message } from "element-ui"
// 保存token
import { getToken, setToken } from '@/libs/util'

class HttpRequest{
    constructor(baseUrl){
        this.baseUrl = baseUrl
    }
    // 基础配置
    getInsideConfig(){
        const config = {
            baseUrl = this.baseUrl,
            headers:{
                Authorization: 'bearer ' + getToken(),
                'Cache-Control': 'no-cache'
            }
        }
    }
    // 拦截器
    interceptors(instance,url){
        // 请求拦截器
        instance.interceptors.request.use(config=>{
            //添加全局的loading
            return config
        },error=>{
            return Promise.reject(error)
        })
        // 相应拦截器
        instance.interceptors.response.use(res=>{
            let { data,headers } = res
            // 每次请求成功后刷新token保存的时间
            if(headers.authorization){
                setToken(headers.authorization)
            }
            if(data.code){
                data.data.code = data.code
                return data.data
            }else{
                Message({
                    type:'error',
                    message:data.msg
                })
                return Promise.reject(data.data)
            }
        },error=>{
            if(error.response.headers.authorization){
                setToken(error.response.headers.authorization)
            }
            if(error.response.status === 401){
                setToken('')
                router.push('/login')
                Message({
                    type:'error',
                    message:'登录过期，请重新登录'
                })
                return Promise.reject(error)
            }else{
                Message({
                    type:'error',
                    message:'登录过期，请重新登录'
                })
                return Promise.reject(error)
            }
        })
    }
    request(options){
        const instance = axios.create()
        options = Object.assign(this.getInsideConfig(),options)
        this.interceptors(instance,options.url)
        return instance(options)
    }
}
export default HttpRequest