export interface Topic {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  image: string;
  suggestedArticleTitles: string[];
  contentHints: string[];
}

export const topics: Topic[] = [
  {
    id: 'stress',
    title: '期末壓力管理',
    description: '期末考將至，如何幫助學生舒緩壓力、保持專注？',
    category: '壓力管理',
    tags: ['壓力管理', '期末季'],
    image: '/topic-stress.jpg',
    suggestedArticleTitles: [
      '期末不崩潰！壓力管理三步驟',
      '考前放鬆小技巧',
      '如何在圖書館高效學習不焦慮',
    ],
    contentHints: [
      '深呼吸練習',
      '時間管理矩陣',
      '適度運動的重要性',
      '尋求心理諮商的時機',
    ],
  },
  {
    id: 'anxiety',
    title: '考試焦慮與放鬆',
    description: '面對考試的緊張情緒，學習放鬆技巧與認知重建。',
    category: '焦慮調適',
    tags: ['考試焦慮', '放鬆技巧'],
    image: '/topic-anxiety.jpg',
    suggestedArticleTitles: [
      '考前不緊張的秘訣',
      '呼吸法讓你平靜下來',
      '克服考試焦慮的心理技巧',
    ],
    contentHints: [
      '漸進式肌肉放鬆',
      '正念呼吸法',
      '認知重建技巧',
      '考試前的作息建議',
    ],
  },
  {
    id: 'relationship',
    title: '人際關係與溝通',
    description: '大學生活中的人際挑戰，從宿舍到社團的相處智慧。',
    category: '人際關係',
    tags: ['人際關係', '溝通技巧'],
    image: '/topic-relationship.jpg',
    suggestedArticleTitles: [
      '宿舍相處的溝通藝術',
      '如何建立健康的友誼',
      '社團中的人際互動指南',
    ],
    contentHints: [
      '積極傾聽技巧',
      '非暴力溝通原則',
      '人際界線的設定',
      '衝突化解方法',
    ],
  },
  {
    id: 'emotion',
    title: '情感議題與情緒調適',
    description: '理解情緒的來源，學習健康的情感表達與調適方式。',
    category: '情緒管理',
    tags: ['情感議題', '情緒調適'],
    image: '/topic-emotion.jpg',
    suggestedArticleTitles: [
      '認識你的情緒天氣',
      '如何健康地表達憤怒',
      '失戀後的自我照顧',
    ],
    contentHints: [
      '情緒覺察練習',
      '情緒日記書寫',
      '健康的情緒宣洩管道',
      '何時尋求專業協助',
    ],
  },
  {
    id: 'identity',
    title: '自我認同與探索',
    description: '在成長的路上，認識自己、接納自己，找到獨特的價值。',
    category: '自我成長',
    tags: ['自我認同', '成長探索'],
    image: '/topic-identity.jpg',
    suggestedArticleTitles: [
      '大學生的自我探索之旅',
      '如何找到自己的人生方向',
      '接納不完美的自己',
    ],
    contentHints: [
      '自我探索練習',
      '價值觀釐清',
      '優勢盤點方法',
      '接納與承諾療法概念',
    ],
  },
  {
    id: 'sleep',
    title: '睡眠健康與作息',
    description: '良好的睡眠是身心健康的基礎，建立規律的作息習慣。',
    category: '生活健康',
    tags: ['睡眠健康', '作息規律'],
    image: '/topic-sleep.jpg',
    suggestedArticleTitles: [
      '大學生的睡眠救星指南',
      '熬夜後如何快速恢復',
      '打造完美睡眠環境',
    ],
    contentHints: [
      '睡眠衛教知識',
      '睡前放鬆儀式',
      '咖啡因與睡眠的關係',
      '睡眠障礙的徵兆',
    ],
  },
  {
    id: 'mindfulness',
    title: '正念與自我關懷',
    description: '在忙碌中停下腳步，練習正念帶來的平靜力量。',
    category: '正念練習',
    tags: ['正念練習', '自我照顧'],
    image: '/topic-mindfulness.jpg',
    suggestedArticleTitles: [
      '每天五分鐘正念練習',
      '正念飲食的奇妙體驗',
      '行走冥想的入門指南',
    ],
    contentHints: [
      '正念呼吸引導',
      '身體掃描練習',
      '正念日常應用',
      '自我關懷語句',
    ],
  },
  {
    id: 'time',
    title: '時間管理與效率',
    description: '掌握時間分配的藝術，在學業與生活間找到平衡。',
    category: '生活管理',
    tags: ['時間管理', '學習效率'],
    image: '/topic-time.jpg',
    suggestedArticleTitles: [
      '大學生的時間管理術',
      '番茄鐘工作法實戰',
      '如何告別拖延症',
    ],
    contentHints: [
      '時間管理矩陣',
      '番茄鐘工作法',
      '目標設定 SMART 原則',
      '避免拖延的策略',
    ],
  },
  {
    id: 'confidence',
    title: '自信心建立',
    description: '培養健康的自信心，肯定自己的價值與能力。',
    category: '自我成長',
    tags: ['自信心', '自我肯定'],
    image: '/topic-confidence.jpg',
    suggestedArticleTitles: [
      '建立自信的每日練習',
      '如何走出舒適圈',
      '從內而外散發自信',
    ],
    contentHints: [
      '自我肯定語句',
      '小步驟累積成就感',
      '正面自我對話',
      '接納失敗的勇氣',
    ],
  },
  {
    id: 'graduation',
    title: '生涯規劃與未來',
    description: '畢業在即，面對未來的無限可能，做好心理準備與規劃。',
    category: '生涯發展',
    tags: ['生涯規劃', '畢業準備'],
    image: '/topic-graduation.jpg',
    suggestedArticleTitles: [
      '畢業前的生涯規劃指南',
      '如何面對畢業焦慮',
      '從校園到職場的心理轉換',
    ],
    contentHints: [
      '生涯探索工具',
      '畢業焦慮的調適',
      '職場心理準備',
      '持續學習的心態',
    ],
  },
  {
    id: 'resilience',
    title: '心理韌性培養',
    description: '從逆境中成長，培養面對挑戰的心理彈性與復原力。',
    category: '心理韌性',
    tags: ['心理韌性', '抗壓能力'],
    image: '/topic-resilience.jpg',
    suggestedArticleTitles: [
      '培養心理韌性的五個習慣',
      '從挫折中重新站起',
      '打造你的心理防護罩',
    ],
    contentHints: [
      '韌性思維模式',
      '社會支持系統',
      '問題解決技巧',
      '意義建構方法',
    ],
  },
  {
    id: 'loneliness',
    title: '孤獨感與歸屬',
    description: '在人群中感到孤單？建立真實的連結與歸屬感。',
    category: '人際關係',
    tags: ['孤獨感', '歸屬感'],
    image: '/topic-relationship.jpg',
    suggestedArticleTitles: [
      '孤獨不是你的錯',
      '如何找到歸屬感',
      '一個人也能過得充實',
    ],
    contentHints: [
      '孤獨與獨處的區別',
      '建立社交連結的方法',
      '社群參與的管道',
      '自我陪伴的藝術',
    ],
  },
];

export const getRecommendedTopics = (): Topic[] => {
  return [topics[0], topics[2], topics[6]];
};

export const getTopicById = (id: string): Topic | undefined => {
  return topics.find((t) => t.id === id);
};
