"""
 requirements:
    pip install data-tree
    pip install pathdict

"""

import json
import argparse
import data_tree
from pathdict import PathDict


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

    zh = 'zh'
    en = 'en'
    ja = 'ja'

    # I18NFileUtil().diff(en)
    # I18NFileUtil().update(en)
    #
    # I18NFileUtil().diff(ja)
    # I18NFileUtil().update(ja)

    action = args.action
    langs = args.langs

    print(action, '>>>>', args.langs)

    util = I18NFileUtil()
    method = getattr(util, action)
    for _lang in langs:
        method(_lang)
