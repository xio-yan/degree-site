const COURSES = [
  {
    "code": "CSD117",
    "name": "素描",
    "grade": "大一",
    "term": "上",
    "credit": 3,
    "programs": [
      0,
      1,
      2,
      3
    ]
  },
  {
    "code": "CSD218",
    "name": "3D建模",
    "grade": "大一",
    "term": "上",
    "credit": 3,
    "programs": [
      0,
      1,
      2,
      3
    ]
  },
  {
    "code": "CSD119",
    "name": "平面圖形設計",
    "grade": "大一",
    "term": "下",
    "credit": 3,
    "programs": [
      1,
      3
    ]
  },
  {
    "code": "CSD150",
    "name": "網頁設計",
    "grade": "大一",
    "term": "下",
    "credit": 3,
    "programs": [
      0,
      1,
      2,
      3
    ]
  },
  {
    "code": "CSD157",
    "name": "基礎視覺特效",
    "grade": "大一",
    "term": "下",
    "credit": 3,
    "programs": [
      3
    ]
  },
  {
    "code": "CSD201",
    "name": "物件導向程式設計",
    "grade": "大一",
    "term": "下",
    "credit": 2,
    "programs": [
      0,
      2
    ]
  },
  {
    "code": "CSD232",
    "name": "材質貼圖繪製",
    "grade": "大一",
    "term": "下",
    "credit": 3,
    "programs": [
      0,
      1,
      2,
      3
    ]
  },
  {
    "code": "CSD202",
    "name": "視覺化行動程式開發",
    "grade": "大二",
    "term": "上",
    "credit": 3,
    "programs": [
      0,
      2
    ]
  },
  {
    "code": "CSD209",
    "name": "色彩學",
    "grade": "大二",
    "term": "上",
    "credit": 3,
    "programs": [
      3
    ]
  },
  {
    "code": "CSD214",
    "name": "數位影像設計",
    "grade": "大二",
    "term": "上",
    "credit": 3,
    "programs": [
      3
    ]
  },
  {
    "code": "CSD220",
    "name": "動畫繪畫與劇本創作",
    "grade": "大二",
    "term": "上",
    "credit": 3,
    "programs": [
      1
    ]
  },
  {
    "code": "CSD227",
    "name": "雕塑造形設計",
    "grade": "大二",
    "term": "上",
    "credit": 3,
    "programs": [
      3
    ]
  },
  {
    "code": "CSD228",
    "name": "UI/UX設計",
    "grade": "大二",
    "term": "上",
    "credit": 3,
    "programs": [
      0,
      2
    ]
  },
  {
    "code": "CSD328",
    "name": "自由造型曲面模型設計",
    "grade": "大二",
    "term": "上",
    "credit": 3,
    "programs": [
      1,
      2,
      3
    ]
  },
  {
    "code": "CSD217",
    "name": "場景繪畫",
    "grade": "大二",
    "term": "下",
    "credit": 3,
    "programs": [
      1
    ]
  },
  {
    "code": "CSD223",
    "name": "創意角色製作",
    "grade": "大二",
    "term": "下",
    "credit": 3,
    "programs": [
      1,
      3
    ]
  },
  {
    "code": "CSD225",
    "name": "遊戲企劃設計",
    "grade": "大二",
    "term": "下",
    "credit": 3,
    "programs": [
      0,
      2
    ]
  },
  {
    "code": "CSD242",
    "name": "3D動畫燈光合成",
    "grade": "大二",
    "term": "下",
    "credit": 3,
    "programs": [
      1
    ]
  },
  {
    "code": "CSD243",
    "name": "數位遊戲插畫",
    "grade": "大二",
    "term": "下",
    "credit": 3,
    "programs": [
      3
    ]
  },
  {
    "code": "CSD311",
    "name": "3D遊戲設計(二)",
    "grade": "大三",
    "term": "上",
    "credit": 3,
    "programs": [
      0,
      2
    ]
  },
  {
    "code": "CSD314",
    "name": "進階3D電腦動畫",
    "grade": "大三",
    "term": "上",
    "credit": 3,
    "programs": [
      1
    ]
  },
  {
    "code": "CSD346",
    "name": "數位教材設計實務",
    "grade": "大三",
    "term": "上",
    "credit": 3,
    "programs": [
      0,
      2
    ]
  },
  {
    "code": "CSD353",
    "name": "虛擬/擴增實境",
    "grade": "大三",
    "term": "上",
    "credit": 3,
    "programs": [
      2
    ]
  },
  {
    "code": "CSD357",
    "name": "數位視訊剪接",
    "grade": "大三",
    "term": "上",
    "credit": 3,
    "programs": [
      1,
      3
    ]
  },
  {
    "code": "CSD373",
    "name": "次世代遊戲設計",
    "grade": "大三",
    "term": "上",
    "credit": 3,
    "programs": []
  },
  {
    "code": "DMG374",
    "name": "劇本設計與編修",
    "grade": "大三",
    "term": "上",
    "credit": 2,
    "programs": []
  },
  {
    "code": "CSD172",
    "name": "虛擬角色直播",
    "grade": "大三",
    "term": "下",
    "credit": 3,
    "programs": []
  },
  {
    "code": "CSD244",
    "name": "人工智慧與創新設計",
    "grade": "大三",
    "term": "下",
    "credit": 2,
    "programs": []
  },
  {
    "code": "CSD337",
    "name": "影視動畫設計",
    "grade": "大三",
    "term": "下",
    "credit": 3,
    "programs": [
      1,
      3
    ]
  },
  {
    "code": "CSD355",
    "name": "遊戲美術設計(二)",
    "grade": "大三",
    "term": "下",
    "credit": 3,
    "programs": [
      3
    ]
  },
  {
    "code": "CSD358",
    "name": "多媒體企劃與製作",
    "grade": "大三",
    "term": "下",
    "credit": 3,
    "programs": [
      3
    ]
  },
  {
    "code": "CSD435",
    "name": "遊戲人工智慧",
    "grade": "大三",
    "term": "下",
    "credit": 3,
    "programs": [
      0
    ]
  },
  {
    "code": "CSD307",
    "name": "專題研究與實習(一)",
    "grade": "大四",
    "term": "上",
    "credit": 3,
    "programs": [
      0,
      1,
      2,
      3
    ]
  },
  {
    "code": "CSD418",
    "name": "3D動畫實例技巧研究",
    "grade": "大四",
    "term": "上",
    "credit": 3,
    "programs": [
      1
    ]
  },
  {
    "code": "CSD439",
    "name": "多媒體創意設計與管理",
    "grade": "大四",
    "term": "上",
    "credit": 3,
    "programs": [
      1,
      3
    ]
  },
  {
    "code": "CSD443",
    "name": "遊戲產業實務實習",
    "grade": "大四",
    "term": "上",
    "credit": 3,
    "programs": [
      0,
      1,
      2,
      3
    ]
  },
  {
    "code": "CSD446",
    "name": "企業職場實務",
    "grade": "大四",
    "term": "上",
    "credit": 3,
    "programs": [
      0,
      1,
      2,
      3
    ]
  },
  {
    "code": "CSD422",
    "name": "專題研究與實習(二)",
    "grade": "大四",
    "term": "下",
    "credit": 3,
    "programs": [
      0,
      1,
      2,
      3
    ]
  },
  {
    "code": "CSD441",
    "name": "職場實習",
    "grade": "大四",
    "term": "下",
    "credit": 3,
    "programs": [
      0,
      1,
      2,
      3
    ]
  },
  {
    "code": "CSD444",
    "name": "產業實習",
    "grade": "大四",
    "term": "下",
    "credit": 3,
    "programs": [
      0,
      1,
      2,
      3
    ]
  }
];
