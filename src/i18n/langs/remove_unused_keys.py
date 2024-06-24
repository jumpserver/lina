# -- coding: utf-8 --
import json

# npm run vue-i18n-report-json
i18n_report_path = '/tmp/abc.json'
lang_paths = {
    'zh': 'zh.json',
    'en': 'en.json',
    'ja': 'ja.json',
    'zh_hant': 'zh_Hant.json'
}


def load_i18n_unused_keys(i18n_report_path, lang='en'):
    f = open(i18n_report_path)
    data = json.load(f)
    unused_keys = data['unusedKeys']
    return [i['path'] for i in unused_keys if i['language'] == lang]


def remove_unused_keys(data, keys):
    removed = {}
    for key in keys:
        print("key: ", key)
        key_split = key.split('.')

        if len(key_split) == 1:
            print("Pop: ", key)
            removed[key] = data.pop(key_split[0], None)
            continue

        if len(key_split) == 2:
            print("Pop: ", key)
            removed[key] = data[key_split[0]].pop(key_split[1], None)
            continue

        d = data[key_split[0]]
        for i in key_split[1:-1]:
            d = d[i]
        removed[key] = d.pop(key_split[-1], None)
    return removed


def remove_keys(lang):
    unused_keys = load_i18n_unused_keys(i18n_report_path, lang)
    lang_path = lang_paths[lang]

    with open(lang_path) as f:
        data = json.load(f)

    removed = remove_unused_keys(data, unused_keys)

    with open(lang_path, 'wb') as f:
        data = json.dumps(data, indent=2, sort_keys=True, ensure_ascii=False)
        data = data.encode('utf8')
        f.write(data)

    try:
        with open(f'{lang}.removed.json', 'r') as f:
            origin = json.load(f)
    except:
        origin = {}

    origin.update(removed)
    data = json.dumps(origin, indent=2, sort_keys=True, ensure_ascii=False)
    with open(f'{lang}.removed.json', 'wb') as f:
        f.write(data.encode('utf8'))


for i in ['zh', 'en', 'ja']:
    remove_keys(i)
