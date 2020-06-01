/* eslint-disable no-unused-vars */
import router from './router'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { startup } from '@/utils/startup'

NProgress.configure({
  showSpinner: false
}) // NProgress Configuration

router.beforeEach(async(to, from, next) => {
  // start progress bar
  NProgress.start()
  try {
    await startup({ to, from, next })
    next()
  } catch (e) {
    console.log('Start service error: ', e)
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})

