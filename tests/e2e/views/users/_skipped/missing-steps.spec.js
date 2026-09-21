/**
 * MeterSphere cases skipped at Mode B because source had no steps.
 * Kept here so inventory coverage is 110/110.
 */
import { describe, it } from 'vitest'

const SKIPPED = [
  {
    "id": "101486",
    "title": "用户列表-批量更新-更新完自动关闭更新窗口",
    "reason": "missing_steps",
    "warnings": [
      {
        "type": "missing_steps",
        "message": "当前测试用例没有步骤描述"
      },
      {
        "type": "missing_expectations",
        "message": "当前测试用例没有明确的预期结果"
      }
    ],
    "message": "源用例无步骤，已跳过 Draft"
  },
  {
    "id": "105138",
    "title": "用户管理-用户列表-更新用户：更新用户来源信息",
    "reason": "missing_steps",
    "warnings": [
      {
        "type": "missing_steps",
        "message": "当前测试用例没有步骤描述"
      },
      {
        "type": "missing_expectations",
        "message": "当前测试用例没有明确的预期结果"
      }
    ],
    "message": "源用例无步骤，已跳过 Draft"
  },
  {
    "id": "105290",
    "title": "用户管理-用户列表-详情页-基本信息tab:查看用户的基本信息",
    "reason": "missing_steps",
    "warnings": [
      {
        "type": "missing_steps",
        "message": "当前测试用例没有步骤描述"
      },
      {
        "type": "missing_expectations",
        "message": "当前测试用例没有明确的预期结果"
      }
    ],
    "message": "源用例无步骤，已跳过 Draft"
  },
  {
    "id": "105328",
    "title": "用户管理-用户列表-详情页-基本信息tab-快速更新：开启/关闭激活",
    "reason": "missing_steps",
    "warnings": [
      {
        "type": "missing_steps",
        "message": "当前测试用例没有步骤描述"
      },
      {
        "type": "missing_expectations",
        "message": "当前测试用例没有明确的预期结果"
      }
    ],
    "message": "源用例无步骤，已跳过 Draft"
  },
  {
    "id": "105366",
    "title": "用户管理-用户列表-详情页-基本信息tab-快速更新：重置MFA",
    "reason": "missing_steps",
    "warnings": [
      {
        "type": "missing_steps",
        "message": "当前测试用例没有步骤描述"
      },
      {
        "type": "missing_expectations",
        "message": "当前测试用例没有明确的预期结果"
      }
    ],
    "message": "源用例无步骤，已跳过 Draft"
  },
  {
    "id": "105422",
    "title": "用户管理-用户列表-详情页-基本信息tab-快速更新：重置密码",
    "reason": "missing_steps",
    "warnings": [
      {
        "type": "missing_steps",
        "message": "当前测试用例没有步骤描述"
      },
      {
        "type": "missing_expectations",
        "message": "当前测试用例没有明确的预期结果"
      }
    ],
    "message": "源用例无步骤，已跳过 Draft"
  },
  {
    "id": "105461",
    "title": "用户管理-用户列表-详情页-基本信息tab-快速更新：重置SSH密钥",
    "reason": "missing_steps",
    "warnings": [
      {
        "type": "missing_steps",
        "message": "当前测试用例没有步骤描述"
      },
      {
        "type": "missing_expectations",
        "message": "当前测试用例没有明确的预期结果"
      }
    ],
    "message": "源用例无步骤，已跳过 Draft"
  },
  {
    "id": "105531",
    "title": "用户管理-用户列表-详情页-基本信息tab-快速更新：解锁用户",
    "reason": "missing_steps",
    "warnings": [
      {
        "type": "missing_steps",
        "message": "当前测试用例没有步骤描述"
      },
      {
        "type": "missing_expectations",
        "message": "当前测试用例没有明确的预期结果"
      }
    ],
    "message": "源用例无步骤，已跳过 Draft"
  },
  {
    "id": "105586",
    "title": "用户管理-用户列表-详情页-基本信息tab-用户组：添加/删除用户组",
    "reason": "missing_steps",
    "warnings": [
      {
        "type": "missing_steps",
        "message": "当前测试用例没有步骤描述"
      },
      {
        "type": "missing_expectations",
        "message": "当前测试用例没有明确的预期结果"
      }
    ],
    "message": "源用例无步骤，已跳过 Draft"
  },
  {
    "id": "105601",
    "title": "用户管理-用户列表-详情页-基本信息tab：右上角更新按钮",
    "reason": "missing_steps",
    "warnings": [
      {
        "type": "missing_steps",
        "message": "当前测试用例没有步骤描述"
      },
      {
        "type": "missing_expectations",
        "message": "当前测试用例没有明确的预期结果"
      }
    ],
    "message": "源用例无步骤，已跳过 Draft"
  },
  {
    "id": "105694",
    "title": "用户管理-用户列表-详情页-用户登录规则：",
    "reason": "missing_steps",
    "warnings": [
      {
        "type": "missing_steps",
        "message": "当前测试用例没有步骤描述"
      },
      {
        "type": "missing_expectations",
        "message": "当前测试用例没有明确的预期结果"
      }
    ],
    "message": "源用例无步骤，已跳过 Draft"
  },
  {
    "id": "105702",
    "title": "用户管理-用户列表-详情页-基本信息tab：右上角删除按钮",
    "reason": "missing_steps",
    "warnings": [
      {
        "type": "missing_steps",
        "message": "当前测试用例没有步骤描述"
      },
      {
        "type": "missing_expectations",
        "message": "当前测试用例没有明确的预期结果"
      }
    ],
    "message": "源用例无步骤，已跳过 Draft"
  },
  {
    "id": "105765",
    "title": "用户管理-用户列表-详情页-授权的资产tab：获取授权的资产信息",
    "reason": "missing_steps",
    "warnings": [
      {
        "type": "missing_steps",
        "message": "当前测试用例没有步骤描述"
      },
      {
        "type": "missing_expectations",
        "message": "当前测试用例没有明确的预期结果"
      }
    ],
    "message": "源用例无步骤，已跳过 Draft"
  },
  {
    "id": "105786",
    "title": "用户管理-用户列表-详情页-授权的账号tab：获取授权的账号信息",
    "reason": "missing_steps",
    "warnings": [
      {
        "type": "missing_steps",
        "message": "当前测试用例没有步骤描述"
      },
      {
        "type": "missing_expectations",
        "message": "当前测试用例没有明确的预期结果"
      }
    ],
    "message": "源用例无步骤，已跳过 Draft"
  },
  {
    "id": "105883",
    "title": "用户管理-用户列表-详情页-资产授权规则tab：获取资产授权规则",
    "reason": "missing_steps",
    "warnings": [
      {
        "type": "missing_steps",
        "message": "当前测试用例没有步骤描述"
      },
      {
        "type": "missing_expectations",
        "message": "当前测试用例没有明确的预期结果"
      }
    ],
    "message": "源用例无步骤，已跳过 Draft"
  }
]

describe('Mode B skipped cases (missing steps)', () => {
  for (const item of SKIPPED) {
    it.skip(`MS-${item.id} ${item.title}`, () => {
      // missing steps in MeterSphere source
    })
  }
})
