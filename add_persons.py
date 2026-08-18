import re

t = open('lib/taxonomy.ts', encoding='utf-8').read()

# 添加三个人物
persons = '''  {
    "id": "jiu-mo-luo-shi",
    "name": "鸠摩罗什",
    "title": "译经大师",
    "era": "344-413",
    "lifeStory": "鸠摩罗什（Kumārajīva，344-413），龟兹国人，中国佛教四大译经家之一。七岁随母出家，遍学大小乘。后秦弘始三年（401）入长安，受姚兴礼遇，组织译场，译出《中论》《百论》《十二门论》《大智度论》《法华经》《金刚经》《阿弥陀经》等七十四部三百八十四卷。其译文流畅优美，义理准确，对中观思想在中国的传播奠定决定性基础。",
    "teachings": "鸠摩罗什以译经为毕生事业，将龙树中观学派的根本论典系统译介到中国。其翻译的"三论"（《中论》《百论》《十二门论》）成为后世三论宗的根本经典。罗什的翻译风格既忠实原文又符合汉语习惯，被誉为"意译"典范。",
    "quotes": [
      "译经事业，利益众生。",
      "若所传无误，焚身之后，舌根不烂。"
    ],
    "classics": ["zhonglun"],
    "relatedConcepts": ["zhongguan", "zhongdao"],
    "relatedMethods": [],
    "relatedPersons": ["longshu", "seng-rui"],
    "relatedBooks": ["zhonglun"]
  },
  {
    "id": "ti-po",
    "name": "提婆",
    "title": "中观学派继承者",
    "era": "约3世纪",
    "lifeStory": "提婆（Āryadeva，约3世纪），南印度人，龙树菩萨弟子。继承并发展龙树的中观思想，著有《百论》《四百论》等。提婆以破斥外道著称，与龙树并称"龙提"，共为中观学派奠基。其思想对后世中观学派影响深远。",
    "teachings": "提婆继承龙树的"破而不立"方法，以破斥外道邪见为己任。《百论》破斥数论、胜论等外道学说，《四百论》阐明中观要义。提婆的思想更加犀利，破斥更加彻底，被称为"破邪显正"的典范。",
    "quotes": [
      "破邪即是显正，无邪可破，无正可显。",
      "诸法无自性，因缘和合而有。"
    ],
    "classics": ["zhonglun"],
    "relatedConcepts": ["zhongguan", "zhongdao"],
    "relatedMethods": [],
    "relatedPersons": ["longshu"],
    "relatedBooks": ["zhonglun"]
  },
  {
    "id": "seng-rui",
    "name": "僧叡",
    "title": "译经助手",
    "era": "约4-5世纪",
    "lifeStory": "僧叡（约4-5世纪），鸠摩罗什弟子，参与译经工作。为《中论》作序，阐述中观思想的要旨。僧叡的序文是理解《中论》的重要文献，对中观思想在中国的传播有重要贡献。",
    "teachings": "僧叡在《中论序》中阐述：龙树菩萨以"八不中道"破斥一切边见，显示缘起性空的中道实相。序文指出《中论》的翻译对于纠正当时般若学的偏颇具有重要意义。",
    "quotes": [
      "龙树大士，析之以中道，使惑趣之徒望玄指而一变。",
      "括之以即化，令玄悟之宾丧咨询于朝彻。"
    ],
    "classics": ["zhonglun"],
    "relatedConcepts": ["zhongguan", "zhongdao"],
    "relatedMethods": [],
    "relatedPersons": ["jiu-mo-luo-shi", "longshu"],
    "relatedBooks": ["zhonglun"]
  },'''

# 在 ZEN_PERSONS 数组的开头插入
t = re.sub(r'(export const ZEN_PERSONS: PersonItem\[\] = \[)', r'\1\n' + persons, t, count=1)

open('lib/taxonomy.ts', 'w', encoding='utf-8').write(t)
print('taxonomy.ts 已更新：新增3人物（鸠摩罗什、提婆、僧叡）')
