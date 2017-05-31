import Vue from 'vue'
import VueRouter from 'vue-router'


Vue.use(VueRouter)

const Login = resolve => require(['modules/account/login.vue'], resolve)
const Register = resolve => require(['modules/account/register.vue'], resolve)

const routes = [
  { path: '/', component: Login, name: 'login' },
  { path: '/register', component: Register, name: 'register' },
]

export default new VueRouter({
 	routes 
})