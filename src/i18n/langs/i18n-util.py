"""
  描述: Lina i18n 翻译 检测、更新 工具

  两个功能:
    1. 以 zh.json 文件为基础，检测 en.json 和 ja.json 文件文件，是否有缺失的翻译，如果有会输出到新文件 diff-zh-en.json 和 diff-zh-ja.json 中
    2. 用户直接修改 diff-zh-en.json 和 diff-zh-ja.json 文件中对应的翻译，然后执行命令，会将修改后的翻译写入到 en.json 和 ja.json 文件中

  使用方法:
    1. 生成差异文件: python i18n-util.py diff en ja
    2. 修改差异文件: diff-zh-en.json 和 diff-zh-ja.json
    3. 更新翻译文件: python i18n-util.py update en ja

  依赖包:
    pip install data-tree
    pip install pathdict

"""

import json
import argparse
import data_tree
from pathdict import PathDict


actions_display_mapper = {
    'diff': '检测',
    'update': '更新'
}
langs_display_map = {
    'en': '英文',
    'ja': '日文'
}


class I18NFileUtil(object):
    def diff(self, lang):
        zh_json = self.load_json('./zh.json')
        zh_tree = data_tree.Data_tree_node(arg_data=zh_json)
        zh_paths = list(zh_tree.paths(arg_bool_get_paths_as_strings=True))

        lang_json = self.load_json(f'./{lang}.json')
        lang_tree = data_tree.Data_tree_node(arg_data=lang_json)
        lang_paths = list(lang_tree.paths(arg_bool_get_paths_as_strings=True))

        diff_paths = set(zh_paths) - set(lang_paths)

        data = {}
        diff_filepath = f'./diff-zh-{lang}.json'
        with open(diff_filepath, 'w', encoding='utf-8') as f:
            for path in diff_paths:
                value = zh_tree.get(path)
                if not isinstance(value, str):
                    continue
                data[path] = value
            json_data = json.dumps(data, ensure_ascii=False, indent=2)
            f.write(json_data)

            msg = f'\n' \
                  f'* 检测到 ./{lang}.json 有 {len(data)} 条翻译未处理, ' \
                  f'待翻译条目已写入到 {diff_filepath} 文件中. \n'
            print(msg)

    def update(self, lang):
        diff_data = self.load_json(f'./diff-zh-{lang}.json')
        lang_data = self.load_json(f'./{lang}.json')

        lang_pdict = PathDict(lang_data, create_if_not_exists=True)
        for key_path, value in diff_data.items():
            lang_pdict[key_path] = value

        with open(f'./{lang}.json', 'w', encoding='utf-8') as f:
            data = self.pathdict_to_dict(lang_pdict)
            data = json.dumps(data, ensure_ascii=False, indent=2)
            f.write(data)

            print(f'\n翻译文件 ./{lang}.json 已更新, 总共写入新的翻译 {len(diff_data)} 条.\n')

    def pathdict_to_dict(self, data):
        d = {}
        for k, v in data.items():
            if isinstance(v, PathDict):
                v = self.pathdict_to_dict(v)
            d[k] = v
        return d

    @staticmethod
    def load_json(filename):
        with open(filename, 'r') as f:
            data = f.read()
            return json.loads(data)


if __name__ == '__main__':

    parser = argparse.ArgumentParser(
        description="""
        Lina i18n util

        Example: \r\n

        %(prog)s diff en(ja);
        %(prog)s update en(ja);
        """
    )
    parser.add_argument(
        'action', type=str, choices=("diff", "update"),
    )
    parser.add_argument(
        'langs', type=str, choices=("en", "ja"), nargs='*'
    )
    args = parser.parse_args()
    action = args.action
    langs = args.langs

    util = I18NFileUtil()
    method = getattr(util, action)

    action_display = actions_display_mapper[action]
    for index, _lang in enumerate(langs):
        lang_display = langs_display_map[_lang]
        print('-'*100)
        method(_lang)
        if index == len(langs) - 1:
            print('-'*100)

    if action == 'diff':
        _langs = ' '.join(langs)
        msg = f'\n* Tips: 修改差异文件后, 执行命令 ```python i18n-util.py update {_langs} ``` 更新翻译文件 *\n'
        print(msg)

