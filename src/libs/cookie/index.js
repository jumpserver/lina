import { VueCookieNext } from 'vue-cookie-next'

/**
 * 创建 cookie 兼容对象
 * 提供统一的 cookie 操作接口
 *
 * @returns {Object} cookie 兼容对象
 */
function createCookieCompat() {
  return {
    get: VueCookieNext.getCookie.bind(VueCookieNext),
    set: VueCookieNext.setCookie.bind(VueCookieNext),
    delete: VueCookieNext.removeCookie.bind(VueCookieNext),
    getCookie: VueCookieNext.getCookie.bind(VueCookieNext),
    setCookie: VueCookieNext.setCookie.bind(VueCookieNext),
    removeCookie: VueCookieNext.removeCookie.bind(VueCookieNext)
  }
}

/**
 * Cookie 插件
 * 统一封装 cookie 相关的所有设置
 */
const CookiePlugin = {
  install(app) {
    // 注册 VueCookieNext 插件
    app.use(VueCookieNext)

    // 创建 cookie 兼容对象
    const cookieCompat = createCookieCompat()

    // 设置到 Vue 全局属性
    app.config.globalProperties.$cookie = cookieCompat

    // 设置到 window 对象
    window.$cookie = cookieCompat
  }
}

// 导出插件，供 app.use() 使用
export default CookiePlugin

// 导出 VueCookieNext，供其他地方使用
export { VueCookieNext }

