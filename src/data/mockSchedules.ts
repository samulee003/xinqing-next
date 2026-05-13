export interface ScheduleItem {
  id: string;
  postId: string;
  title: string;
  date: string;
  time: string;
  status: 'scheduled' | 'published' | 'draft';
  topicColor: string;
}

export const mockSchedules: ScheduleItem[] = [
  {
    id: 'sched-1',
    postId: 'post-3',
    title: '每天五分鐘正念練習',
    date: '2024-12-15',
    time: '14:00',
    status: 'scheduled',
    topicColor: '#8A9B6E',
  },
  {
    id: 'sched-2',
    postId: 'post-6',
    title: '建立自信的每日練習',
    date: '2024-12-18',
    time: '10:00',
    status: 'scheduled',
    topicColor: '#E8C547',
  },
  {
    id: 'sched-3',
    postId: 'post-4',
    title: '大學生的睡眠救星指南',
    date: '2024-12-05',
    time: '16:00',
    status: 'draft',
    topicColor: '#3D7EAA',
  },
  {
    id: 'sched-4',
    postId: 'post-8',
    title: '大學生的時間管理術',
    date: '2024-12-10',
    time: '09:00',
    status: 'draft',
    topicColor: '#3D7EAA',
  },
];

export const getSchedulesForMonth = (year: number, month: number): ScheduleItem[] => {
  return mockSchedules.filter((s) => {
    const d = new Date(s.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });
};

export const getSchedulesForDate = (dateStr: string): ScheduleItem[] => {
  return mockSchedules.filter((s) => s.date === dateStr);
};
