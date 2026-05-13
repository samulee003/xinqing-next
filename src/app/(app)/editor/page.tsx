"use client";
import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import WechatPublishButton from '@/components/WechatPublishButton';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Compass,
  Sparkles,
  Layout,
  Code,
  Check,
  Search,
  ArrowRight,
  ArrowLeft,
  Wand2,
  RefreshCw,
  Copy,
  CheckCircle2,
  Download,
  Eye,
  Send,
  Info,
  Loader2,
  X,
  Clock,
} from 'lucide-react';
import { topics, getTopicById } from '@/data/topics';
import type { Topic } from '@/data/topics';

// ── Types ──────────────────────────────────────────────
interface GenParams {
  tone: string;
  length: string;
  imageStyle: string;
  extraPrompt: string;
}

interface GenContent {
  title: string;
  body: string;
  subtitle: string;
}

interface EditorState {
  selectedTopicId: string | null;
  params: GenParams;
  content: GenContent | null;
  editedTitle: string;
  editedBody: string;
  themeColor: string;
  fontSize: string;
  lineSpacing: string;
}

// ── Step config ────────────────────────────────────────
const steps = [
  { label: '選擇主題', icon: Compass },
  { label: 'AI 生成', icon: Sparkles },
  { label: '排版預覽', icon: Layout },
  { label: '輸出發布', icon: Code },
];

// ── Mock article content for each topic ────────────────
const mockArticles: Record<string, { title: string; subtitle: string; body: string }> = {
  stress: {
    title: '期末不崩潰！壓力管理三步驟',
    subtitle: '與壓力共處，找回內心的平靜與專注',
    body: `期末考將至，圖書館裡的氣氛越來越緊張。面對堆積如山的課本與報告，許多同學感到喘不過氣來。其實，壓力並不可怕，關鍵在於我們如何與它相處。\n\n第一步：覺察你的壓力訊號。當你發現自己開始失眠、食慾改變或容易煩躁時，這是身心在提醒你需要放慢腳步。試著每天花五分鐘，靜下心來問自己：「我現在感覺如何？」這個簡單的練習能幫助你更早發現壓力的蹤跡。\n\n第二步：建立你的療癒工具箱。每個人舒壓的方式不同，有些人喜歡運動流汗，有些人則偏好聽音樂或畫畫。找到至少三種讓你感到放鬆的活動，把它們寫下來貼在書桌前。當壓力來襲時，你就不需要臨時思考該怎麼辦。\n\n第三步：勇敢開口求助。心理諮商中心的大門永遠為你敞開。無論是學業壓力、人際困擾，或是單純想找個人聊聊，專業的心理師都會傾聽你的心聲。記得，尋求幫助不是軟弱，而是對自己溫柔的照顧。\n\n願每一位同學都能在期末季中找到屬於自己的節奏，穩穩地走好每一步。`,
  },
  anxiety: {
    title: '考前不緊張的秘訣：與焦慮和解',
    subtitle: '學習與緊張感共處，讓考試成為展現自己的舞台',
    body: `考試鈴聲即將響起，你的手心開始出汗、心跳加速。這些反應其實是你的身體在為你加油打氣！適度的焦慮能提升專注力，讓我們表現得更好。\n\n**深呼吸，找回身體的節奏**。試試「4-7-8 呼吸法」：吸氣四秒，屏息七秒，吐氣八秒。重複三次，你會發現身體漸漸放鬆下來。這個方法隨時隨地都能做，考場上更是你的秘密武器。\n\n**轉換想法，改變感受**。與其想「我好怕考不好」，不如告訴自己「我已經準備好了，我只需要盡力而為」。想法會影響情緒，而情緒會影響表現。每天寫下三句鼓勵自己的話，養成正向思考的習慣。\n\n**規律作息是最好的準備**。熬夜抱佛腳反而會讓大腦運作變慢。考前一週，盡量固定睡眠時間，讓大腦在考試時處於最佳狀態。記得，充足的睡眠比多讀一章書更重要。\n\n最後，想對你說：你的價值不是由一場考試決定的。無論結果如何，你都是獨一無二、值得被愛的。加油！`,
  },
  relationship: {
    title: '宿舍相處的溝通藝術',
    subtitle: '在人與人的交會中，找到舒適的距離與溫度',
    body: `大學宿舍是許多同學第一次的「群居生活」。來自不同背景、有著不同習慣的人們擠在同一個空間，摩擦在所難免。但這也是學習溝通與包容的最佳場域。\n\n**設立界線，尊重彼此的空間**。每個人對於「乾淨」和「安靜」的定義不同。開學初就邀請室友一起訂定宿舍公約：幾點後戴耳機、如何輪流打掃、能否帶朋友回來。把話說清楚，才能避免日後的誤會。\n\n**用「我訊息」取代「你指責」**。當室友的行為讓你不舒服時，試著說「我覺得有點吵，可以請你小聲一點嗎？」而不是「你好吵」。前者表達的是自己的感受，後者則像是指責，容易讓對方產生防衛心。\n\n**衝突是關係的轉機**。意見不合時，先深呼吸，給彼此冷靜的時間。然後找一個雙方都舒服的時機，坦誠地分享自己的感受與需求。記住，目標不是「贏」，而是「一起找到解決辦法」。\n\n如果你在人際關係中感到困擾，心理諮商中心提供個別諮商與人際團體，歡迎你來探索與成長。`,
  },
  emotion: {
    title: '認識你的情緒天氣',
    subtitle: '每一種情緒都是內心的訊息，學會傾聽與回應',
    body: `今天你的心情是晴天、多雲，還是暴風雨？就像天氣會變化一樣，我們的情緒也時時刻刻在流轉。情緒沒有好壞之分，每一種情緒都是內心在傳遞重要的訊息。\n\n**憤怒**在告訴你：「我的界線被侵犯了。」**悲傷**在說：「我需要時間療癒。」**焦慮**提醒：「這件事對我很重要。」**喜悅**則是在慶祝：「這讓我感到活著真美好！」\n\n試著每天寫「情緒日記」，不需要長，只需要回答三個問題：「今天最強烈的情緒是什麼？」「它想告訴我什麼？」「我需要怎樣的照顧？」這個簡單的練習能幫助你建立情緒覺察的能力。\n\n當負面情緒來襲時，允許自己感受它，而不是急著把它推開。找一個安全的方式宣洩：可能是運動、可能是畫畫、可能是找信任的朋友傾訴。如果情緒持續困擾你，心理諮商中心的心理師會陪伴你一起走過。\n\n願你能在情緒的起伏中，找到內心的安穩港灣。`,
  },
  identity: {
    title: '大學生的自我探索之旅',
    subtitle: '在迷惘中找方向，在探索中認識真實的自己',
    body: `「我是誰？我要往哪裡去？」這些問題可能在你夜深人靜時浮現。大學正是自我認同形成的關鍵時期，感到迷惘是正常的，甚至是有價值的——因為迷惘代表你在認真思考。\n\n**探索興趣，從嘗試開始**。修一堂從沒上過的課、參加一個社團、試試看實習。每一次嘗試都是在為自己收集線索。你不需要馬上找到答案，重要的是保持好奇與開放的心。\n\n**回顧生命故事**。找個安靜的下午，寫下：「過去讓我最驕傲的三件事」「我最在乎的三個價值」「五年後我希望過什麼樣的生活」。這些書寫能幫助你串起經驗的珍珠，看見自己獨特的輪廓。\n\n**接納不完美的自己**。自我認同不是變成「完美的某人」，而是「完整地接納自己」。包括你的優點與缺點、你的光芒與陰影。你不需要和別人比較，因為這世界上只有一個你。\n\n諮商中心提供生涯探索與自我成長的相關活動，歡迎關注我們的公告，一起踏上這趟認識自己的旅程。`,
  },
  sleep: {
    title: '大學生的睡眠救星指南',
    subtitle: '好好睡一覺，是對自己最基本的溫柔',
    body: `凌晨兩點，你還在滑手機嗎？根據調查，超過六成的大學生有睡眠不足的問題。熬夜或許能換來多一點娛樂時間，卻悄悄偷走了你的專注力、情緒穩定與免疫力。\n\n**建立睡前儀式**。睡前一小時遠離藍光，改成閱讀紙本書、聽輕音樂或做簡單的伸展。泡一杯無咖啡因的熱飲，讓身體知道「該準備睡覺囉」。固定的儀式能訓練大腦形成睡眠的制約反應。\n\n**打造適合睡眠的環境**。寢室溫度建議保持在18-22度，太熱會影響睡眠品質。使用遮光窗簾或眼罩隔絕光線，耳塞則能幫助隔絕噪音。如果室友作息不同，試著一起協商出彼此的「安靜時段」。\n\n**留意咖啡因與飲食**。下午三點後盡量避免攝取咖啡因，包括咖啡、茶和能量飲料。睡前吃太飽也會讓身體忙著消化而影響睡眠。如果睡前真的餓了，選擇少量好消化的食物。\n\n長期失眠可能影響身心健康。如果你已經嘗試調整但仍然睡不好，歡迎預約諮商中心的健康諮詢。`,
  },
  mindfulness: {
    title: '每天五分鐘正念練習',
    subtitle: '在呼吸之間，找回此刻的寧靜與力量',
    body: `你是否經常發現自己一邊吃飯一邊想事情、一邊走路一邊回訊息？我們的思緒總是飄向過去或未來，卻很少真正「在此刻」。正念練習就是訓練我們的心回到當下的溫柔方式。\n\n**正念呼吸：最簡單的開始**。找一個舒服的坐姿，輕輕閉上眼睛，將注意力放在呼吸上。感受空氣從鼻孔進入，充滿胸腔，再緩緩吐出。當思緒飄走時，不用責怪自己，溫柔地把它帶回呼吸就好。每天五分鐘，持續一週，你會發現自己的專注力提升了。\n\n**正念飲食：重新連結感官**。下次吃東西時，放下手機。觀察食物的顏色與形狀，聞聞它的香氣，細細咀嚼感受味道與口感的變化。你會驚訝地發現，原來平常錯過了這麼多美好的細節。\n\n**行走冥想：移動中的平靜**。在校園散步時，試著把注意力放在腳底與地面的接觸上。感受每一步的抬起、移動與落下。這不僅能讓你放鬆，還能讓平凡的通勤時光變成療癒的時刻。\n\n諮商中心每學期開設正念工作坊，由專業講師帶領練習。歡迎關注報名資訊，讓我們一起在忙碌中找到內心的綠洲。`,
  },
  time: {
    title: '大學生的時間管理術',
    subtitle: '掌握時間的主導權，在學業與生活間優雅起舞',
    body: `「時間不夠用」幾乎是每個大學生的心聲。課業、社團、打工、人際關係……事情這麼多，時間這麼少，怎麼辦？其實，時間管理不是擠出更多時間，而是把時間花在真正重要的事上。\n\n**區分緊急與重要**。把事情分成四類：緊急且重要（如明天要交的報告）、重要但不緊急（如規劃未來）、緊急但不重要（如某些訊息）、不緊急也不重要（如無意識刷手機）。把大部分時間投入「重要但不緊急」的事，你會發現生活變得從容許多。\n\n**番茄鐘工作法**。設定25分鐘專心做一件事，然後休息5分鐘。每四個番茄鐘後，休息15-30分鐘。這個方法能幫助你維持專注，同時避免長時間學習帶來的倦怠。\n\n**學會說「不」**。你的時間有限，不可能什麼都做。當有人邀請你參加活動時，先問自己：「這和我目前的目標一致嗎？」婉轉拒絕不需要感到愧疚，因為你在保護自己的時間與能量。\n\n如果你覺得壓力大到無法負荷，歡迎來諮商中心找人聊聊。我們陪你一起找到適合自己的生活節奏。`,
  },
  confidence: {
    title: '建立自信的每日練習',
    subtitle: '信心不是與生俱來的，而是每一天為自己累積的小勝利',
    body: `你是否常在機會來臨時想：「我不夠好，我不行。」這樣的念頭或許來自過去的經驗，或社會的比較。但好消息是：自信是可以培養的。以下是幾個每天都可以做的小練習。\n\n**寫下三件你做得好的事**。不一定要是什麼大事。今天準時起床、幫室友買了早餐、認真聽完一堂課——這些都值得被看見。持續這個練習，你會發現自己其實比想像中厲害。\n\n**改變你的身體語言**。研究發現，抬頭挺胸、雙手叉腰的「高權力姿勢」持續兩分鐘，就能降低壓力荷爾蒙、提升自信。下次上台報告前，找個角落試試看這個「神奇女俠姿勢」吧！\n\n**走出舒適圈的一小步**。自信來自「我做到了」的經驗。每天做一件稍微有點挑戰的事：主動跟店員說謝謝、在課堂上舉手發言、報名一個新活動。每完成一件，你的信心銀行就會多一枚硬幣。\n\n最後記得，你不需要完美才值得被肯定。現在的你，就已經足夠好了。如果想更深入探索自我，諮商中心隨時歡迎你。`,
  },
  graduation: {
    title: '畢業前的生涯規劃指南',
    subtitle: '從校園到職場，帶著勇氣與好奇啟程',
    body: `畢業季即將來臨，站在人生的十字路口，你可能感到興奮、期待，也有點不安。「接下來要去哪裡？」這個問題沒有標準答案，但你可以用系統性的方法幫助自己釐清方向。\n\n**盤點你的資產**。這裡的資產不只是錢，還包括你的技能、經驗、人脈和興趣。列出你大學四年學到的東西、做過的專案、認識的人。你會發現，原來自己累積了這麼多。\n\n**資訊訪談，打開視野**。不確定某個行業適不適合你？透過學長姐或 LinkedIn 聯繫在該領域工作的人，約一次30分鐘的咖啡聊天。問問他們每天的工作內容、喜歡和不喜歡的地方。這比網路上的資訊真實多了。\n\n**允許自己慢慢來**。不是每個人畢業後馬上就知道要做什麼。給自己一段「探索期」，嘗試不同的工作，從實作中學習。生涯是一場馬拉松，不是百米衝刺。\n\n面對畢業焦慮，你不需要獨自承擔。諮商中心提供生涯輔導服務，陪你一起描繪未來的藍圖。`,
  },
  resilience: {
    title: '培養心理韌性的五個習慣',
    subtitle: '像竹子一樣柔韌，在風雨中依然挺立',
    body: `生活總是充滿意想不到的挑戰：考試失利、感情受挫、健康出狀況……但有些人能在逆境中重新站起，甚至變得更強大。這種能力就是「心理韌性」，而它是可以培養的。\n\n**習慣一：換個角度看困境**。同樣半杯水，你可以說「只剩半杯」，也可以說「還有半杯」。練習在困難中尋找意義：「這件事教會了我什麼？」「一年後的我會怎麼看待這段經歷？」\n\n**習慣二：經營你的支持系統**。韌性不是「一個人撐住」，而是知道何時求助。平時就花時間經營友誼，在需要的時候，這些連結會成為你最堅強的後盾。\n\n**習慣三：照顧好身體這個容器**。規律運動、充足睡眠、均衡飲食——這些看似老生常談，卻是心理健康的基石。一個疲憊的身體，難以承載堅強的心靈。\n\n**習慣四：找到意義與目標**。知道自己「為什麼而努力」能給我們巨大的力量。這個「為什麼」可以是你的家人、夢想，或是想幫助的人。\n\n**習慣五：從小挑戰中練習**。韌性就像肌肉，需要訓練。每天做一件讓你有點緊張的事，漸漸地，你會發現自己越來越能面對人生的風浪。\n\n諮商中心開設韌性成長團體，歡迎有興趣的同學報名參加。`,
  },
  loneliness: {
    title: '孤獨不是你的錯',
    subtitle: '在人群中找到歸屬，首先要學會與自己同在',
    body: `即使身處擁擠的校園，你還是可能感到孤單。這種感覺並不代表你有問題——事實上，幾乎每個人在人生的某個階段都經歷過孤獨。孤獨是一種訊息，提醒著我們對連結的渴望。\n\n**區分孤獨與獨處**。獨處是一種選擇，可以讓人充電；孤獨則是感到與世界斷了線。如果你經常感到後者，試著主動採取一些小行動。\n\n**從微互動開始**。不需要立刻交到摯友，從身邊的小互動開始：跟便利商店店員說聲早安、問同學作業的問題、在社團活動中主動介紹自己。這些小小的連結，會慢慢累積成歸屬感。\n\n**找到你的「同類」**。參加你有興趣的活動或社團，在共同的興趣中，友誼自然會萌芽。當你身邊的人和你有相似的價值觀與興趣，孤獨感會大大減少。\n\n**學會陪伴自己**。獨處時可以做些讓自己開心的事：看一部喜歡的電影、去咖啡廳讀書、一個人散步。當你能享受獨處，你就不會因為怕孤單而勉強進入不適合的關係。\n\n如果孤獨感持續困擾著你，諮商中心的心理師會陪你一起探索如何建立更豐富的人際連結。`,
  },
};

// ── Tone options ───────────────────────────────────────
const toneOptions = [
  { value: '溫暖陪伴', label: '溫暖陪伴' },
  { value: '專業科普', label: '專業科普' },
  { value: '輕鬆活潑', label: '輕鬆活潑' },
  { value: '深刻反思', label: '深刻反思' },
];

const lengthOptions = [
  { value: 'short', label: '簡短', wordCount: '約 800 字' },
  { value: 'medium', label: '適中', wordCount: '約 1200 字' },
  { value: 'long', label: '詳細', wordCount: '約 1800 字' },
];

const imageStyleOptions = ['水彩插畫', '簡約線條', '攝影寫實', '手繪塗鴉'];

const themeColors = [
  { name: '溫柔藍', primary: '#3D7EAA', secondary: '#E8C547' },
  { name: '自然綠', primary: '#8A9B6E', secondary: '#E8C547' },
  { name: '暖陽橘', primary: '#D4930D', secondary: '#C4594B' },
  { name: '簡約灰', primary: '#1B2A41', secondary: '#8A9B6E' },
];

// ── Step Indicator ─────────────────────────────────────
function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="bg-card-light border-b border-border-custom py-4 px-6 lg:px-12">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;

          return (
            <div key={index} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-2">
                <motion.div
                  initial={false}
                  animate={{
                    scale: isCurrent ? [0.9, 1] : 1,
                  }}
                  transition={{ duration: 0.2 }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
                    isCompleted
                      ? 'bg-accent-green'
                      : isCurrent
                      ? 'bg-primary-blue ring-2 ring-primary-blue/30'
                      : 'bg-border-custom'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
                  ) : (
                    <Icon
                      className={`w-4 h-4 ${
                        isCurrent ? 'text-white' : 'text-text-dark/30'
                      }`}
                      strokeWidth={2}
                    />
                  )}
                </motion.div>
                <span
                  className={`text-xs font-medium transition-colors duration-300 ${
                    isCompleted
                      ? 'text-accent-green'
                      : isCurrent
                      ? 'text-primary-blue font-bold'
                      : 'text-text-dark/40'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-3 transition-colors duration-300 ${
                    index < currentStep ? 'bg-primary-blue' : 'bg-border-custom'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Step 1: Topic Selection ────────────────────────────
function Step1TopicSelection({
  selectedTopicId,
  onSelect,
  searchQuery,
  onSearchChange,
  customTopic,
  onCustomTopicChange,
  onUseCustomTopic,
}: {
  selectedTopicId: string | null;
  onSelect: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  customTopic: string;
  onCustomTopicChange: (v: string) => void;
  onUseCustomTopic: () => void;
}) {
  const filteredTopics = topics.filter(
    (t) =>
      t.title.includes(searchQuery) ||
      t.tags.some((tag) => tag.includes(searchQuery)) ||
      t.category.includes(searchQuery)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
      className="px-6 lg:px-12 py-8 lg:py-12"
    >
      <div className="max-w-5xl mx-auto">
        <h2 className="font-display text-[28px] text-text-dark mb-2">
          選擇一個主題開始創作
        </h2>
        <p className="text-base text-text-dark/60 mb-8">
          選擇下方主題，AI 將為你生成專屬的心理健康文章與配圖
        </p>

        {/* Search bar */}
        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dark/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="搜尋主題、標籤..."
            className="w-full h-11 pl-10 pr-4 rounded-lg border border-border-custom bg-bg-light text-sm text-text-dark placeholder:text-text-dark/40 focus:outline-none focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all"
          />
        </div>

        {/* Topic cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredTopics.map((topic, i) => (
              <motion.button
                key={topic.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.4, delay: i * 0.04, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
                onClick={() => onSelect(topic.id)}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left bg-card-light hover:shadow-card-hover ${
                  selectedTopicId === topic.id
                    ? 'border-primary-blue shadow-card-hover scale-[1.02]'
                    : 'border-transparent hover:border-primary-blue/50'
                }`}
              >
                <img
                  src={topic.image}
                  alt={topic.title}
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-[15px] font-semibold text-text-dark truncate">
                    {topic.title}
                  </p>
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    {topic.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] px-2.5 py-0.5 rounded-full bg-primary-blue/10 text-primary-blue font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all duration-200 ${
                    selectedTopicId === topic.id
                      ? 'bg-primary-blue border-primary-blue scale-100'
                      : 'border-border-custom'
                  }`}
                >
                  {selectedTopicId === topic.id && (
                    <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
                  )}
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {filteredTopics.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-text-dark/20 mx-auto mb-4" />
            <p className="text-text-dark/50">沒有符合「{searchQuery}」的主題</p>
          </div>
        )}

        {/* Custom topic input */}
        <div className="mt-10 pt-8 border-t border-border-custom">
          <p className="text-sm text-text-dark/50 mb-3">或輸入自定義主題</p>
          <div className="flex gap-3 max-w-lg">
            <input
              type="text"
              value={customTopic}
              onChange={(e) => onCustomTopicChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && customTopic.trim()) onUseCustomTopic();
              }}
              placeholder="例如：宿舍衝突怎麼辦？"
              className="flex-1 h-11 px-4 rounded-lg border border-border-custom bg-bg-light text-sm text-text-dark placeholder:text-text-dark/40 focus:outline-none focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all"
            />
            {customTopic.trim() && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={onUseCustomTopic}
                className="h-11 px-5 rounded-lg bg-primary-blue text-text-light text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                使用此主題
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}


// ── Step 2: AI Generation ──────────────────────────────
function Step2AIGeneration({
  topic,
  params,
  onParamsChange,
  content,
  isGenerating,
  onGenerate,
  onNext,
  onPrev,
}: {
  topic: Topic | null;
  params: GenParams;
  onParamsChange: (p: GenParams) => void;
  content: GenContent | null;
  isGenerating: boolean;
  onGenerate: () => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const [genPhase, setGenPhase] = useState(0);
  const genPhases = ['正在為你撰寫文章...', '正在構思配圖...', '正在排版...'];

  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      setGenPhase((p) => (p + 1) % genPhases.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isGenerating]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="px-6 lg:px-12 py-8 lg:py-12"
    >
      <div className="max-w-6xl mx-auto">
        {/* Selected topic info */}
        {topic && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-8 p-4 rounded-xl bg-card-light border border-border-custom"
          >
            <img src={topic.image} alt={topic.title} className="w-14 h-14 rounded-lg object-cover" />
            <div>
              <p className="text-sm text-text-dark/50 mb-0.5">已選主題</p>
              <p className="font-semibold text-text-dark">{topic.title}</p>
            </div>
          </motion.div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Parameters panel */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full lg:w-[40%] space-y-6"
          >
            <h3 className="font-sans text-lg font-bold text-text-dark">文章設定</h3>

            {/* Title input */}
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">文章標題</label>
              <input
                type="text"
                value={content?.title || ''}
                readOnly
                placeholder="點擊「AI 生成文章」後自動產生"
                className="w-full h-11 px-4 rounded-lg border border-border-custom bg-bg-light text-sm text-text-dark placeholder:text-text-dark/40 focus:outline-none focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20"
              />
              <p className="text-[13px] text-text-dark/50 mt-1.5">
                可修改為更貼近你們中心的風格
              </p>
            </div>

            {/* Tone */}
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">語調風格</label>
              <div className="flex flex-wrap gap-2">
                {toneOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => onParamsChange({ ...params, tone: opt.value })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      params.tone === opt.value
                        ? 'bg-primary-blue text-text-light'
                        : 'bg-bg-light text-text-dark/70 border border-border-custom hover:border-primary-blue/50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Length */}
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">文章長度</label>
              <div className="flex gap-2">
                {lengthOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => onParamsChange({ ...params, length: opt.value })}
                    className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border ${
                      params.length === opt.value
                        ? 'bg-primary-blue text-text-light border-primary-blue'
                        : 'bg-bg-light text-text-dark/70 border-border-custom hover:border-primary-blue/50'
                    }`}
                  >
                    <div>{opt.label}</div>
                    <div className="text-[11px] opacity-70 mt-0.5">{opt.wordCount}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Image style */}
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">配圖風格</label>
              <select
                value={params.imageStyle}
                onChange={(e) => onParamsChange({ ...params, imageStyle: e.target.value })}
                className="w-full h-11 px-4 rounded-lg border border-border-custom bg-bg-light text-sm text-text-dark focus:outline-none focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 appearance-none cursor-pointer"
              >
                {imageStyleOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Extra prompt */}
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                額外指示（選填）
              </label>
              <textarea
                value={params.extraPrompt}
                onChange={(e) => onParamsChange({ ...params, extraPrompt: e.target.value })}
                placeholder="例如：提到學校的心理諮商預約方式..."
                className="w-full min-h-[100px] p-4 rounded-lg border border-border-custom bg-bg-light text-sm text-text-dark placeholder:text-text-dark/40 focus:outline-none focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 resize-none leading-relaxed"
              />
            </div>

            {/* Generate button */}
            <button
              onClick={onGenerate}
              disabled={isGenerating}
              className="w-full h-12 rounded-lg bg-primary-blue text-text-light text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>生成中...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>AI 生成文章</span>
                </>
              )}
            </button>
          </motion.div>

          {/* Right: Preview panel */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="w-full lg:w-[60%]"
          >
            <AnimatePresence mode="wait">
              {!content && !isGenerating && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full min-h-[400px] rounded-xl border border-dashed border-border-custom bg-card-light"
                >
                  <Sparkles className="w-16 h-16 text-text-dark/15 mb-4" />
                  <p className="text-base text-text-dark/40">
                    點擊左側「AI 生成文章」按鈕開始創作
                  </p>
                </motion.div>
              )}

              {isGenerating && (
                <motion.div
                  key="generating"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full min-h-[400px] rounded-xl bg-card-light border border-border-custom relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-primary-blue/5 animate-pulse" />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    className="w-16 h-16 rounded-full bg-primary-blue flex items-center justify-center mb-6 relative z-10"
                  >
                    <Sparkles className="w-7 h-7 text-white" />
                  </motion.div>
                  <p className="text-text-dark/70 text-base relative z-10">
                    {genPhases[genPhase]}
                  </p>
                </motion.div>
              )}

              {content && !isGenerating && (
                <motion.div
                  key="content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-xl bg-card-light border border-border-custom overflow-hidden"
                >
                  {/* Cover image */}
                  {topic && (
                    <div className="relative h-[200px] overflow-hidden">
                      <img
                        src={topic.image}
                        alt={content.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <h4 className="text-white text-xl font-bold drop-shadow-lg">
                          {content.title}
                        </h4>
                      </div>
                    </div>
                  )}

                  {/* Article body preview */}
                  <div className="p-6 max-h-[500px] overflow-y-auto">
                    {content.subtitle && (
                      <p className="text-[15px] text-text-dark/70 text-center italic mb-6">
                        {content.subtitle}
                      </p>
                    )}
                    <div className="prose prose-sm max-w-none">
                      {content.body.split('\\n\\n').map((para, i) => {
                        if (para.startsWith('**') && para.includes('**')) {
                          const clean = para.replace(/\\*\\*/g, '');
                          return (
                            <h5 key={i} className="text-lg font-bold text-primary-blue mt-6 mb-3">
                              {clean}
                            </h5>
                          );
                        }
                        return (
                          <p key={i} className="text-base text-text-dark leading-[1.8] mb-4 indent-[2em]">
                            {para.replace(/\\n/g, ' ').replace(/\\*\\*/g, '')}
                          </p>
                        );
                      })}
                    </div>
                    <div className="mt-6 p-4 rounded-lg bg-accent-green/[0.08]">
                      <p className="text-sm text-accent-green text-center">
                        如果你需要進一步的支持，歡迎預約心理諮商中心的服務，我們一直都在。
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}


// ── Step 3: Layout Preview ─────────────────────────────
function Step3LayoutPreview({
  content,
  topic,
  editedTitle,
  editedBody,
  onTitleChange,
  onBodyChange,
  themeColor,
  onThemeColorChange,
  fontSize,
  onFontSizeChange,
  lineSpacing,
  onLineSpacingChange,
  onNext,
  onPrev,
}: {
  content: GenContent;
  topic: Topic | null;
  editedTitle: string;
  editedBody: string;
  onTitleChange: (v: string) => void;
  onBodyChange: (v: string) => void;
  themeColor: string;
  onThemeColorChange: (v: string) => void;
  fontSize: string;
  onFontSizeChange: (v: string) => void;
  lineSpacing: string;
  onLineSpacingChange: (v: string) => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const fontSizeMap: Record<string, string> = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  };

  const lineSpacingMap: Record<string, string> = {
    tight: 'leading-relaxed',
    normal: 'leading-[1.8]',
    loose: 'leading-loose',
  };

  const selectedTheme = themeColors.find((c) => c.name === themeColor) || themeColors[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="px-6 lg:px-12 py-8 lg:py-12"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Settings panel */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-[35%] space-y-6"
          >
            <h3 className="font-sans text-lg font-bold text-text-dark">排版設定</h3>

            {/* Edit title */}
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">文章標題</label>
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => onTitleChange(e.target.value)}
                className="w-full h-11 px-4 rounded-lg border border-border-custom bg-bg-light text-sm text-text-dark focus:outline-none focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20"
              />
            </div>

            {/* Edit body */}
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">文章內容</label>
              <textarea
                value={editedBody}
                onChange={(e) => onBodyChange(e.target.value)}
                rows={12}
                className="w-full p-4 rounded-lg border border-border-custom bg-bg-light text-sm text-text-dark focus:outline-none focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 resize-y leading-relaxed"
              />
            </div>

            {/* Theme color */}
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">配色風格</label>
              <div className="flex gap-3">
                {themeColors.map((tc) => (
                  <button
                    key={tc.name}
                    onClick={() => onThemeColorChange(tc.name)}
                    className={`w-14 h-14 rounded-xl transition-all duration-150 hover:scale-105 ${
                      themeColor === tc.name
                        ? 'ring-2 ring-offset-2 ring-primary-blue scale-105'
                        : ''
                    }`}
                    style={{ backgroundColor: tc.primary }}
                    title={tc.name}
                  />
                ))}
              </div>
            </div>

            {/* Font size */}
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">字體大小</label>
              <div className="flex gap-2">
                {['small', 'medium', 'large'].map((s) => (
                  <button
                    key={s}
                    onClick={() => onFontSizeChange(s)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all border ${
                      fontSize === s
                        ? 'bg-primary-blue text-text-light border-primary-blue'
                        : 'bg-bg-light text-text-dark/70 border-border-custom hover:border-primary-blue/50'
                    }`}
                  >
                    {s === 'small' ? '小' : s === 'medium' ? '中' : '大'}
                  </button>
                ))}
              </div>
            </div>

            {/* Line spacing */}
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">行距</label>
              <div className="flex gap-2">
                {['tight', 'normal', 'loose'].map((s) => (
                  <button
                    key={s}
                    onClick={() => onLineSpacingChange(s)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all border ${
                      lineSpacing === s
                        ? 'bg-primary-blue text-text-light border-primary-blue'
                        : 'bg-bg-light text-text-dark/70 border-border-custom hover:border-primary-blue/50'
                    }`}
                  >
                    {s === 'tight' ? '緊湊' : s === 'normal' ? '適中' : '寬鬆'}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right: Live preview */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full lg:w-[65%] flex justify-center"
          >
            {/* Phone mockup */}
            <div className="w-full max-w-[375px] bg-card-light rounded-2xl shadow-floating overflow-hidden">
              {/* Phone status bar decoration */}
              <div className="h-8 bg-bg-dark flex items-center justify-between px-6">
                <span className="text-[10px] text-text-light/80 font-mono">
                  {new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full border border-text-light/60" />
                  <div className="w-3 h-3 rounded-full border border-text-light/60" />
                </div>
              </div>

              {/* WeChat header */}
              <div className="bg-bg-dark/5 px-4 py-3 flex items-center gap-2 border-b border-border-custom">
                <div className="w-7 h-7 rounded-full bg-primary-blue flex items-center justify-center">
                  <span className="text-[10px] text-text-light font-bold">心</span>
                </div>
                <span className="text-sm font-medium text-text-dark">心晴助手</span>
              </div>

              {/* Article content */}
              <div className="p-5 max-h-[600px] overflow-y-auto">
                {/* Cover image */}
                {topic && (
                  <div className="relative h-[160px] rounded-lg overflow-hidden mb-5">
                    <img
                      src={topic.image}
                      alt={editedTitle}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>
                )}

                <motion.h1
                  key={editedTitle + themeColor}
                  initial={{ opacity: 0.7 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className={`font-bold text-text-dark text-center mb-3 ${
                    fontSize === 'small' ? 'text-lg' : fontSize === 'large' ? 'text-2xl' : 'text-xl'
                  }`}
                  style={{ color: selectedTheme.primary }}
                >
                  {editedTitle}
                </motion.h1>

                <div className="text-center text-xs text-text-dark/40 mb-4">
                  心晴助手 · {new Date().toLocaleDateString('zh-TW')}
                </div>

                <div className={`${fontSizeMap[fontSize]} ${lineSpacingMap[lineSpacing]}`}>
                  {editedBody.split('\\n\\n').map((para, i) => {
                    if (para.startsWith('**') && para.includes('**')) {
                      const clean = para.replace(/\\*\\*/g, '');
                      return (
                        <h5
                          key={i}
                          className="font-bold mt-5 mb-2"
                          style={{ color: selectedTheme.primary }}
                        >
                          {clean}
                        </h5>
                      );
                    }
                    return (
                      <p key={i} className="text-text-dark mb-3 indent-8">
                        {para.replace(/\\n/g, ' ').replace(/\\*\\*/g, '')}
                      </p>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-border-custom text-center">
                  <p className="text-xs text-text-dark/50 mb-2">
                    大學心理諮商中心 · 關心你的心理健康
                  </p>
                  <p className="text-xs text-primary-blue">
                    閱讀原文 · 點讚 · 在看
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}


// ── Step 4: HTML Output & Publish ──────────────────────
function Step4HTMLOutput({
  content,
  topic,
  themeColor,
  editedTitle,
  editedBody,
  onPrev,
}: {
  content: GenContent;
  topic: Topic | null;
  themeColor: string;
  editedTitle: string;
  editedBody: string;
  onPrev: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [published, setPublished] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduled, setScheduled] = useState(false);
  const codeRef = useRef<HTMLPreElement>(null);

  const selectedTheme = themeColors.find((c) => c.name === themeColor) || themeColors[0];

  const htmlCode = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${editedTitle}</title>
  <style>
    body { margin:0; padding:0; background:#f5f5f5; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; }
    .container { max-width:640px; margin:0 auto; background:#fff; }
    .cover { width:100%; height:240px; object-fit:cover; }
    .content { padding:24px 20px; }
    .title { font-size:22px; font-weight:bold; color:${selectedTheme.primary}; text-align:center; margin-bottom:8px; }
    .meta { text-align:center; font-size:13px; color:#999; margin-bottom:20px; }
    .body { font-size:16px; line-height:1.8; color:#333; }
    .body p { text-indent:2em; margin-bottom:12px; }
    .body h3 { color:${selectedTheme.primary}; font-size:18px; margin-top:24px; }
    .footer { margin-top:24px; padding:16px; background:rgba(138,155,110,0.08); border-radius:8px; text-align:center; font-size:14px; color:#5B8C5A; }
  </style>
</head>
<body>
  <div class="container">
    <img src="${topic?.image || ''}" class="cover" alt="cover">
    <div class="content">
      <h1 class="title">${editedTitle}</h1>
      <p class="meta">心晴助手 · ${new Date().toLocaleDateString('zh-TW')}</p>
      <div class="body">
        ${editedBody.split('\\n\\n').map((p) => `<p>${p.replace(/\\n/g, '<br>').replace(/\\*\\*/g, '')}</p>`).join('\\n        ')}
      </div>
      <div class="footer">
        如果你需要進一步的支持，歡迎預約心理諮商中心的服務<br>
        我們一直都在 💚
      </div>
    </div>
  </div>
</body>
</html>`;

  const handleCopyHTML = async () => {
    try {
      await navigator.clipboard.writeText(htmlCode);
      setCopied(true);
      toast.success('HTML 已複製到剪貼簿');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('複製失敗，請手動複製');
    }
  };

  const handleDownloadHTML = () => {
    const blob = new Blob([htmlCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${editedTitle}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('HTML 檔案已下載');
  };

  const handleCopyPlainText = async () => {
    try {
      await navigator.clipboard.writeText(editedBody.replace(/\\n/g, '\\n'));
      toast.success('純文字已複製到剪貼簿');
    } catch {
      toast.error('複製失敗');
    }
  };

  const handleSchedule = () => {
    if (!scheduleDate || !scheduleTime) {
      toast.error('請選擇日期和時間');
      return;
    }
    setScheduled(true);
    toast.success(`已設定排程：${scheduleDate} ${scheduleTime}`);
  };

  const handlePublish = () => {
    setShowPublishModal(true);
  };

  const confirmPublish = () => {
    setPublished(true);
    setShowPublishModal(false);
    toast.success('貼文已成功發布！');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="px-6 lg:px-12 py-8 lg:py-12"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: HTML Code */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full lg:w-1/2"
          >
            <h3 className="font-sans text-lg font-bold text-text-dark mb-1">
              微信公眾號 HTML
            </h3>
            <p className="text-[13px] text-text-dark/50 mb-4">
              複製下方代碼，貼上到微信公眾號編輯器
            </p>

            <div className="relative rounded-lg bg-bg-dark overflow-hidden">
              <button
                onClick={handleCopyHTML}
                className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/10 text-text-light text-xs hover:bg-white/20 transition-colors"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent-green" />
                    <span className="text-accent-green">已複製！</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>複製</span>
                  </>
                )}
              </button>
              <pre
                ref={codeRef}
                className="p-5 pt-12 overflow-auto text-[13px] font-mono leading-[1.7] max-h-[calc(100dvh-280px)]"
              >
                <code className="text-text-light/90">{htmlCode}</code>
              </pre>
            </div>

            {/* Info note */}
            <div className="mt-4 flex items-start gap-3 p-4 rounded-lg bg-accent-green/[0.08]">
              <Info className="w-5 h-5 text-accent-green flex-shrink-0 mt-0.5" />
              <p className="text-sm text-accent-green">
                此 HTML 已針對微信公眾號優化，包含圖片、樣式與排版，可直接貼上使用
              </p>
            </div>

            {/* Export buttons */}
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleDownloadHTML}
                className="flex-1 h-11 rounded-lg border border-primary-blue text-primary-blue text-sm font-medium hover:bg-primary-blue/5 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                下載 HTML 檔案
              </button>
              <button
                onClick={handleCopyPlainText}
                className="flex-1 h-11 rounded-lg border border-primary-blue text-primary-blue text-sm font-medium hover:bg-primary-blue/5 transition-colors flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" />
                複製純文字
              </button>
            </div>
          </motion.div>

          {/* Right: Final preview + Publish actions */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="w-full lg:w-1/2"
          >
            <h3 className="font-sans text-lg font-bold text-text-dark mb-4">最終預覽</h3>

            {/* Phone frame */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number], delay: 0.2 }}
              className="mx-auto w-[320px] rounded-3xl border-[6px] border-bg-dark shadow-[0_12px_40px_rgba(0,0,0,0.15)] overflow-hidden bg-card-light"
            >
              {/* Status bar */}
              <div className="h-7 bg-bg-dark flex items-center justify-between px-5">
                <span className="text-[9px] text-text-light/80 font-mono">
                  {new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <div className="flex gap-0.5">
                  <div className="w-2.5 h-2.5 rounded-full border border-text-light/60" />
                  <div className="w-2.5 h-2.5 rounded-full border border-text-light/60" />
                </div>
              </div>

              {/* WeChat header */}
              <div className="bg-bg-dark/5 px-3 py-2.5 flex items-center gap-2 border-b border-border-custom">
                <div className="w-6 h-6 rounded-full bg-primary-blue flex items-center justify-center">
                  <span className="text-[9px] text-text-light font-bold">心</span>
                </div>
                <span className="text-xs font-medium text-text-dark">心晴助手</span>
              </div>

              {/* Content */}
              <div className="p-4 max-h-[360px] overflow-y-auto">
                {topic && (
                  <div className="relative h-[120px] rounded-lg overflow-hidden mb-4">
                    <img src={topic.image} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>
                )}
                <h4
                  className="text-base font-bold text-center mb-2"
                  style={{ color: selectedTheme.primary }}
                >
                  {editedTitle}
                </h4>
                <div className="text-center text-[10px] text-text-dark/40 mb-3">
                  心晴助手 · {new Date().toLocaleDateString('zh-TW')}
                </div>
                <p className="text-xs text-text-dark/80 leading-relaxed line-clamp-6">
                  {editedBody.replace(/\\n/g, ' ').replace(/\\*\\*/g, '').slice(0, 120)}...
                </p>
                <div className="mt-4 pt-3 border-t border-border-custom text-center">
                  <p className="text-[10px] text-text-dark/40">
                    大學心理諮商中心
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Publish / Schedule actions */}
            <div className="mt-8 space-y-4">
              {published ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-6 rounded-xl bg-accent-green/10 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                  >
                    <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
                  </motion.div>
                  <p className="text-lg font-bold text-success mb-1">發布成功！</p>
                  <p className="text-sm text-success/70">貼文已發布到微信公眾號</p>
                </motion.div>
              ) : scheduled ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-6 rounded-xl bg-primary-blue/10 text-center"
                >
                  <Clock className="w-10 h-10 text-primary-blue mx-auto mb-3" />
                  <p className="text-base font-bold text-primary-blue mb-1">已設定排程</p>
                  <p className="text-sm text-primary-blue/70">
                    {scheduleDate} {scheduleTime} 將自動發布
                  </p>
                </motion.div>
              ) : (
                <>
                  {/* Schedule section */}
                  <div className="p-4 rounded-xl bg-card-light border border-border-custom">
                    <p className="text-sm font-medium text-text-dark mb-3">排程發布</p>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="date"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        className="flex-1 h-10 px-3 rounded-lg border border-border-custom bg-bg-light text-sm text-text-dark focus:outline-none focus:border-primary-blue"
                      />
                      <input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="flex-1 h-10 px-3 rounded-lg border border-border-custom bg-bg-light text-sm text-text-dark focus:outline-none focus:border-primary-blue"
                      />
                    </div>
                    <button
                      onClick={handleSchedule}
                      className="w-full h-10 rounded-lg border border-primary-blue text-primary-blue text-sm font-medium hover:bg-primary-blue/5 transition-colors flex items-center justify-center gap-2"
                    >
                      <Clock className="w-4 h-4" />
                      設定排程
                    </button>
                  </div>

                  {/* Immediate publish to WeChat */}
                  <WechatPublishButton
                    title={editedTitle}
                    content={htmlCode}
                  />
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* Publish Confirmation Modal */}
        <AnimatePresence>
          {showPublishModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
              onClick={() => setShowPublishModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.25 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-card-light rounded-2xl p-8 max-w-sm w-full shadow-floating"
              >
                <h4 className="text-xl font-bold text-text-dark mb-3 text-center">
                  確認發布
                </h4>
                <p className="text-sm text-text-dark/60 text-center mb-6">
                  確認要立即發布嗎？發布後將出現在公眾號中。
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPublishModal(false)}
                    className="flex-1 h-11 rounded-lg border border-border-custom text-text-dark/70 text-sm font-medium hover:bg-bg-light transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={confirmPublish}
                    className="flex-1 h-11 rounded-lg bg-success text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    確認發布
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}


// ── Main EditorPage ────────────────────────────────────
function EditorPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlTopic = searchParams.get('topic');
  const savedState = (() => {
    try {
      const raw = localStorage.getItem('editor-state');
      return raw ? (JSON.parse(raw) as Partial<EditorState>) : null;
    } catch {
      return null;
    }
  })();

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(
    urlTopic || savedState?.selectedTopicId || null
  );
  const [params, setParams] = useState<GenParams>(
    savedState?.params || {
      tone: '溫暖陪伴',
      length: 'medium',
      imageStyle: '水彩插畫',
      extraPrompt: '',
    }
  );
  const [content, setContent] = useState<GenContent | null>(savedState?.content || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editedTitle, setEditedTitle] = useState(savedState?.editedTitle || '');
  const [editedBody, setEditedBody] = useState(savedState?.editedBody || '');
  const [themeColor, setThemeColor] = useState(savedState?.themeColor || '溫柔藍');
  const [fontSize, setFontSize] = useState(savedState?.fontSize || 'medium');
  const [lineSpacing, setLineSpacing] = useState(savedState?.lineSpacing || 'normal');
  const [customTopic, setCustomTopic] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedTopic = selectedTopicId ? (getTopicById(selectedTopicId) ?? null) : null;

  // Auto-save to localStorage
  useEffect(() => {
    const state: Partial<EditorState> = {
      selectedTopicId,
      params,
      content,
      editedTitle,
      editedBody,
      themeColor,
      fontSize,
      lineSpacing,
    };
    localStorage.setItem('editor-state', JSON.stringify(state));
  }, [selectedTopicId, params, content, editedTitle, editedBody, themeColor, fontSize, lineSpacing]);

  // Handle URL topic param
  useEffect(() => {
    if (urlTopic && getTopicById(urlTopic)) {
      setSelectedTopicId(urlTopic);
      router.replace('/editor', { scroll: false });
    }
  }, [urlTopic]);

  const handleSelectTopic = (id: string) => {
    setSelectedTopicId(id);
  };

  const handleUseCustomTopic = () => {
    if (!customTopic.trim()) return;
    // Use the loneliness topic as base for custom topics
    setSelectedTopicId('loneliness');
    toast.success(`已設定自定義主題：${customTopic.trim()}`);
  };

  const handleGenerate = () => {
    if (!selectedTopic) return;
    setIsGenerating(true);

    // Simulate AI generation with timeout
    setTimeout(() => {
      const article = mockArticles[selectedTopic.id];
      if (article) {
        const newContent: GenContent = {
          title: article.title,
          subtitle: article.subtitle,
          body: article.body,
        };
        setContent(newContent);
        setEditedTitle(article.title);
        setEditedBody(article.body);
      }
      setIsGenerating(false);
      toast.success('文章生成完成！');
    }, 2500);
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 0:
        return !!selectedTopicId;
      case 1:
        return !!content;
      case 2:
        return true;
      default:
        return false;
    }
  };

  const stepLabels = ['選擇主題', 'AI 生成', '排版預覽', '輸出發布'];

  return (
    <div className="min-h-[100dvh]">
      {/* Step Indicator */}
      <StepIndicator currentStep={currentStep} />

      {/* Step content */}
      <AnimatePresence mode="wait">
        {currentStep === 0 && (
          <Step1TopicSelection
            key="step1"
            selectedTopicId={selectedTopicId}
            onSelect={handleSelectTopic}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            customTopic={customTopic}
            onCustomTopicChange={setCustomTopic}
            onUseCustomTopic={handleUseCustomTopic}
          />
        )}
        {currentStep === 1 && (
          <Step2AIGeneration
            key="step2"
            topic={selectedTopic}
            params={params}
            onParamsChange={setParams}
            content={content}
            isGenerating={isGenerating}
            onGenerate={handleGenerate}
            onNext={() => setCurrentStep(2)}
            onPrev={() => setCurrentStep(0)}
          />
        )}
        {currentStep === 2 && (
          <Step3LayoutPreview
            key="step3"
            content={content || { title: '', subtitle: '', body: '' }}
            topic={selectedTopic}
            editedTitle={editedTitle}
            editedBody={editedBody}
            onTitleChange={setEditedTitle}
            onBodyChange={setEditedBody}
            themeColor={themeColor}
            onThemeColorChange={setThemeColor}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
            lineSpacing={lineSpacing}
            onLineSpacingChange={setLineSpacing}
            onNext={() => setCurrentStep(3)}
            onPrev={() => setCurrentStep(1)}
          />
        )}
        {currentStep === 3 && (
          <Step4HTMLOutput
            key="step4"
            content={content || { title: '', subtitle: '', body: '' }}
            topic={selectedTopic}
            themeColor={themeColor}
            editedTitle={editedTitle}
            editedBody={editedBody}
            onPrev={() => setCurrentStep(2)}
          />
        )}
      </AnimatePresence>

      {/* Bottom action bar */}
      <div className="sticky bottom-0 left-0 right-0 h-16 bg-card-light border-t border-border-custom flex items-center justify-between px-6 lg:px-12 z-20">
        {currentStep > 0 ? (
          <button
            onClick={() => setCurrentStep(currentStep - 1)}
            className="flex items-center gap-2 h-10 px-5 rounded-lg text-primary-blue text-sm font-medium hover:bg-primary-blue/5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            上一步{currentStep > 0 ? `：${stepLabels[currentStep - 1]}` : ''}
          </button>
        ) : (
          <div />
        )}

        {currentStep < 3 && (
          <button
            onClick={() => canGoNext() && setCurrentStep(currentStep + 1)}
            disabled={!canGoNext()}
            className="flex items-center gap-2 h-10 px-6 rounded-lg bg-primary-blue text-text-light text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            下一步{currentStep < 3 ? `：${stepLabels[currentStep + 1]}` : ''}
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100dvh-56px)] bg-bg-light flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-dark/60 text-sm">載入中...</p>
        </div>
      </div>
    }>
      <EditorPageContent />
    </Suspense>
  );
}
