#!/usr/bin/python
#

import json


def remove_duplicate_key(filename):
    with open(filename) as f:
        data = json.load(f)

    with open('new_' + filename, 'wb') as f:
        data = json.dumps(data, indent=2, sort_keys=True, ensure_ascii=False)
        data = data.encode('utf8')
        f.write(data)


if __name__ == '__main__':
    filename = 'zh.json'
    # filename = sys.argv[1]
    remove_duplicate_key(filename)


