import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import relativeTime from 'dayjs/plugin/relativeTime'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import localizedFormat from 'dayjs/plugin/localizedFormat'

import 'dayjs/locale/zh-cn'
import 'dayjs/locale/zh-tw'
import 'dayjs/locale/ja'
import 'dayjs/locale/en'

// utc: `.utc()` 模式（getDayEnd 用到）
// relativeTime: `.fromNow()`
// customParseFormat: `dayjs(str, 'YYYY-MM-DD')` 按格式解析
// localizedFormat: 本地化格式 token（'L LTS'）
dayjs.extend(utc)
dayjs.extend(relativeTime)
dayjs.extend(customParseFormat)
dayjs.extend(localizedFormat)

dayjs.locale('zh-cn')

export default dayjs
