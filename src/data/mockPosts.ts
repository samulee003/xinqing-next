export interface Post {
  id: string;
  title: string;
  topicId: string;
  topicName: string;
  status: 'published' | 'draft' | 'scheduled';
  date: string;
  thumbnail: string;
  excerpt: string;
}

export const mockPosts: Post[] = [
  {
    id: 'post-1',
    title: '期末不崩潰！壓力管理三步驟',
    topicId: 'stress',
    topicName: '壓力管理',
    status: 'published',
    date: '2024-12-01',
    thumbnail: '/topic-stress.jpg',
    excerpt: '期末考將至，如何幫助學生舒緩壓力、保持專注？',
  },
  {
    id: 'post-2',
    title: '宿舍相處的溝通藝術',
    topicId: 'relationship',
    topicName: '人際關係',
    status: 'published',
    date: '2024-11-28',
    thumbnail: '/topic-relationship.jpg',
    excerpt: '大學生活中的人際挑戰，從宿舍到社團的相處智慧。',
  },
  {
    id: 'post-3',
    title: '每天五分鐘正念練習',
    topicId: 'mindfulness',
    topicName: '正念練習',
    status: 'scheduled',
    date: '2024-12-15',
    thumbnail: '/topic-mindfulness.jpg',
    excerpt: '在忙碌中停下腳步，練習正念帶來的平靜力量。',
  },
  {
    id: 'post-4',
    title: '大學生的睡眠救星指南',
    topicId: 'sleep',
    topicName: '睡眠健康',
    status: 'draft',
    date: '2024-12-05',
    thumbnail: '/topic-sleep.jpg',
    excerpt: '良好的睡眠是身心健康的基礎，建立規律的作息習慣。',
  },
  {
    id: 'post-5',
    title: '考前不緊張的秘訣',
    topicId: 'anxiety',
    topicName: '焦慮調適',
    status: 'published',
    date: '2024-11-25',
    thumbnail: '/topic-anxiety.jpg',
    excerpt: '面對考試的緊張情緒，學習放鬆技巧與認知重建。',
  },
  {
    id: 'post-6',
    title: '建立自信的每日練習',
    topicId: 'confidence',
    topicName: '自信心',
    status: 'scheduled',
    date: '2024-12-18',
    thumbnail: '/topic-confidence.jpg',
    excerpt: '培養健康的自信心，肯定自己的價值與能力。',
  },
  {
    id: 'post-7',
    title: '認識你的情緒天氣',
    topicId: 'emotion',
    topicName: '情緒管理',
    status: 'published',
    date: '2024-11-20',
    thumbnail: '/topic-emotion.jpg',
    excerpt: '理解情緒的來源，學習健康的情感表達與調適方式。',
  },
  {
    id: 'post-8',
    title: '大學生的時間管理術',
    topicId: 'time',
    topicName: '時間管理',
    status: 'draft',
    date: '2024-12-10',
    thumbnail: '/topic-time.jpg',
    excerpt: '掌握時間分配的藝術，在學業與生活間找到平衡。',
  },
  {
    id: 'post-9',
    title: '從挫折中重新站起',
    topicId: 'resilience',
    topicName: '心理韌性',
    status: 'published',
    date: '2024-11-15',
    thumbnail: '/topic-resilience.jpg',
    excerpt: '從逆境中成長，培養面對挑戰的心理彈性與復原力。',
  },
  {
    id: 'post-10',
    title: '大學生的自我探索之旅',
    topicId: 'identity',
    topicName: '自我認同',
    status: 'published',
    date: '2024-11-10',
    thumbnail: '/topic-identity.jpg',
    excerpt: '在成長的路上，認識自己、接納自己，找到獨特的價值。',
  },
];

export const getRecentPosts = (count: number = 5): Post[] => {
  return mockPosts.slice(0, count);
};

export const getPostsByStatus = (status: Post['status']): Post[] => {
  return mockPosts.filter((p) => p.status === status);
};
