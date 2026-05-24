const expenseCategoryText = {
  food: { en: 'Food', th: 'อาหาร' },
  travel: { en: 'Travel', th: 'เดินทาง' },
  shopping: { en: 'Shopping', th: 'ช้อปปิ้ง' },
  gaming: { en: 'Gaming', th: 'เกม' },
  investment: { en: 'Investment', th: 'ลงทุน' },
  bills: { en: 'Bills', th: 'บิล' },
  home: { en: 'Home', th: 'บ้าน' },
  health: { en: 'Health', th: 'สุขภาพ' },
}

const mistakeText = {
  'No Confirmation': { en: 'No Confirmation', th: 'ไม่มีคอนเฟิร์ม' },
  'Early Entry': { en: 'Early Entry', th: 'เข้าเร็วเกินไป' },
  FOMO: { en: 'FOMO', th: 'กลัวตกรถ' },
  'Revenge Trading': { en: 'Revenge Trading', th: 'เทรดแก้แค้น' },
  'Over Risk': { en: 'Over Risk', th: 'เสี่ยงเกินไป' },
  'No Stop Loss': { en: 'No Stop Loss', th: 'ไม่ตั้ง Stop Loss' },
  'Moving SL': { en: 'Moving SL', th: 'เลื่อน SL' },
  Overtrading: { en: 'Overtrading', th: 'เทรดมากเกินไป' },
}

const emotionText = {
  Calm: { en: 'Calm', th: 'สงบ' },
  Confident: { en: 'Confident', th: 'มั่นใจ' },
  Neutral: { en: 'Neutral', th: 'กลาง ๆ' },
  Anxious: { en: 'Anxious', th: 'กังวล' },
  Excited: { en: 'Excited', th: 'ตื่นเต้น' },
  Fearful: { en: 'Fearful', th: 'กลัว' },
  Angry: { en: 'Angry', th: 'หงุดหงิด' },
  Euphoric: { en: 'Euphoric', th: 'ดีใจเกินไป' },
}

const resultText = {
  Win: { en: 'Win', th: 'ชนะ' },
  Loss: { en: 'Loss', th: 'แพ้' },
  Pending: { en: 'Pending', th: 'รอผล' },
  Breakeven: { en: 'Breakeven', th: 'เสมอทุน' },
}

const directionText = {
  Long: { en: 'Buy', th: 'ซื้อ' },
  Short: { en: 'Sell', th: 'ขาย' },
  Buy: { en: 'Buy', th: 'ซื้อ' },
  Sell: { en: 'Sell', th: 'ขาย' },
  Neutral: { en: 'Neutral', th: 'เป็นกลาง' },
  'No Trade Day': { en: 'No Trade Day', th: 'งดเทรด' },
}

const themeText = {
  neon: {
    name: { en: 'Dark', th: 'ดาร์ก' },
    description: { en: 'Clean dark mode with subtle scan glow', th: 'โหมดมืดเรียบหรูพร้อมเอฟเฟกต์แสงสแกนเบา ๆ' },
  },
  crimson: {
    name: { en: 'Space', th: 'อวกาศ' },
    description: { en: 'Deep space with nebula glow and soft twinkling stars', th: 'อวกาศลึกพร้อมแสงเนบิวลาและดาวกระพริบเบา ๆ' },
  },
  cyan: {
    name: { en: 'Water', th: 'น้ำ' },
    description: { en: 'Deep water blue with aqua glow', th: 'โทนน้ำลึกสีน้ำเงินพร้อมแสงอควา' },
  },
  amber: {
    name: { en: 'Snow', th: 'หิมะ' },
    description: { en: 'Frosted white and icy blue', th: 'โทนขาวเย็นแบบหิมะและน้ำแข็ง' },
  },
  solar: {
    name: { en: 'Leaf Falling', th: 'ใบไม้ร่วง' },
    description: { en: 'Rose autumn palette with falling maple leaves', th: 'โทนใบไม้เปลี่ยนสีพร้อมใบเมเปิ้ลร่วง' },
  },
}

const achievementText = {
  first_trade: ['First Trade Logged', 'Log your very first trade', 'บันทึกเทรดแรก', 'บันทึกการเทรดครั้งแรกของคุณ'],
  first_win: ['First Win', 'Close your first winning trade', 'ชนะครั้งแรก', 'ปิดเทรดชนะครั้งแรก'],
  first_loss: ['First Loss', 'Log your first losing trade with discipline', 'แพ้ครั้งแรก', 'บันทึกเทรดแพ้ครั้งแรกอย่างมีวินัย'],
  trades_10: ['10 Trades Logged', 'Build your first 10-trade sample size', 'บันทึก 10 เทรด', 'สร้างชุดข้อมูล 10 เทรดแรก'],
  trades_25: ['25 Trades Logged', 'Reach 25 completed trades', 'บันทึก 25 เทรด', 'สะสมเทรดครบ 25 ครั้ง'],
  trades_50: ['50 Trades Logged', 'Track 50 trades in your journal', 'บันทึก 50 เทรด', 'บันทึกเทรดครบ 50 ครั้งใน Journal'],
  trades_100: ['100 Trades Logged', 'Reach a 100-trade milestone', 'บันทึก 100 เทรด', 'ถึงเป้าหมาย 100 เทรด'],
  trades_200: ['200 Trades Logged', 'Reach a 200-trade milestone', 'บันทึก 200 เทรด', 'ถึงเป้าหมาย 200 เทรด'],
  trades_1000: ['1000 Trades Logged', 'Join the 1000-trade club', 'บันทึก 1000 เทรด', 'เข้าสู่คลับ 1000 เทรด'],
  a_setup_hunter: ['A Setup Hunter', 'Log 10 trades with Setup Grade A', 'นักล่าเซ็ตอัพ A', 'บันทึกเทรดเกรด A ครบ 10 ครั้ง'],
  boring_is_good: ['Boring Is Good', 'Complete 10 trades without any logged mistakes', 'น่าเบื่อคือดี', 'ทำเทรดครบ 10 ครั้งโดยไม่มี Mistake ที่บันทึกไว้'],
  journal_discipline: ['Journal Discipline', 'Write notes for 20 trades', 'วินัยการจดบันทึก', 'เขียนโน้ตประกอบเทรดครบ 20 ครั้ง'],
  one_pair_focus: ['One Pair Focus', 'Log 20 trades on the same pair', 'โฟกัสคู่เดียว', 'บันทึกเทรดคู่เงินเดียวกันครบ 20 ครั้ง'],
  win_rate_60: ['60% Win Rate', 'Maintain 60%+ win rate over your latest 20 trades', 'อัตราชนะ 60%', 'รักษา Win Rate 60%+ จาก 20 เทรดล่าสุด'],
  win_rate_70: ['70% Win Rate', 'Maintain 70%+ win rate over your latest 20 trades', 'อัตราชนะ 70%', 'รักษา Win Rate 70%+ จาก 20 เทรดล่าสุด'],
  win_rate_80: ['80% Win Rate', 'Maintain 80%+ win rate over your latest 20 trades', 'อัตราชนะ 80%', 'รักษา Win Rate 80%+ จาก 20 เทรดล่าสุด'],
  win_rate_65_50: ['Consistent Win Rate', 'Maintain 65%+ win rate over your latest 50 trades', 'Win Rate สม่ำเสมอ', 'รักษา Win Rate 65%+ จาก 50 เทรดล่าสุด'],
  wins_5: ['5 Wins', 'Close 5 winning trades', 'ชนะ 5 ครั้ง', 'ปิดเทรดชนะครบ 5 ครั้ง'],
  losses_10: ['10 Losses Logged', 'Keep journaling through 10 losing trades', 'บันทึกแพ้ 10 ครั้ง', 'ยังจดบันทึกต่อเนื่องแม้แพ้ครบ 10 ครั้ง'],
  rr_1_2_5: ['RR Above 1:2', 'Hit at least 1:2 RR on 5 trades', 'RR มากกว่า 1:2', 'ทำ RR อย่างน้อย 1:2 ครบ 5 เทรด'],
  rr_1_3_5: ['RR Above 1:3', 'Hit at least 1:3 RR on 5 trades', 'RR มากกว่า 1:3', 'ทำ RR อย่างน้อย 1:3 ครบ 5 เทรด'],
  rr_master: ['RR Master', 'Average at least 1:3 RR over your latest 30 completed trades', 'ปรมาจารย์ RR', 'มี RR เฉลี่ยอย่างน้อย 1:3 จาก 30 เทรดล่าสุด'],
  high_rr_sniper: ['High RR Sniper', 'Hit at least 1:4 RR on 5 trades', 'สไนเปอร์ RR สูง', 'ทำ RR อย่างน้อย 1:4 ครบ 5 เทรด'],
  green_day_1: ['First Green Day', 'Finish a day with net profit', 'วันเขียวแรก', 'จบวันด้วยกำไรสุทธิ'],
  green_week: ['Green Week', 'Finish a week in profit', 'สัปดาห์เขียว', 'จบสัปดาห์ด้วยกำไร'],
  green_month: ['Green Month', 'Finish a month in profit', 'เดือนเขียว', 'จบเดือนด้วยกำไร'],
  return_5: ['+5% Return', 'Grow trading equity by 5% from your starting balance', 'ผลตอบแทน +5%', 'เพิ่มพอร์ตเทรด 5% จากเงินเริ่มต้น'],
  return_10: ['+10% Return', 'Grow trading equity by 10% from your starting balance', 'ผลตอบแทน +10%', 'เพิ่มพอร์ตเทรด 10% จากเงินเริ่มต้น'],
  return_20: ['+20% Return', 'Grow trading equity by 20% from your starting balance', 'ผลตอบแทน +20%', 'เพิ่มพอร์ตเทรด 20% จากเงินเริ่มต้น'],
  return_50: ['+50% Return', 'Grow trading equity by 50% from your starting balance', 'ผลตอบแทน +50%', 'เพิ่มพอร์ตเทรด 50% จากเงินเริ่มต้น'],
  return_100: ['+100% Return', 'Double your trading equity from your starting balance', 'ผลตอบแทน +100%', 'เพิ่มพอร์ตเทรดเป็นสองเท่าจากเงินเริ่มต้น'],
  return_1000: ['+1000% Return', 'Grow trading equity by 1000% from your starting balance', 'ผลตอบแทน +1000%', 'เพิ่มพอร์ตเทรด 1000% จากเงินเริ่มต้น'],
  clean_week: ['Clean Week', 'Have a trading week with no logged mistakes', 'สัปดาห์สะอาด', 'มีสัปดาห์เทรดโดยไม่มี Mistake ที่บันทึกไว้'],
  clean_month: ['Clean Month', 'Have a trading month with no logged mistakes', 'เดือนสะอาด', 'มีเดือนเทรดโดยไม่มี Mistake ที่บันทึกไว้'],
  gold_hunter: ['Gold Hunter', 'Log 25 XAUUSD trades', 'นักล่าทองคำ', 'บันทึกเทรด XAUUSD ครบ 25 ครั้ง'],
  lot_1: ['1 Lot Traded', 'Accumulate 1.00 total lot size across all trades', 'สะสม 1 Lot', 'สะสม Lot รวมครบ 1.00 lot'],
  lot_10: ['10 Lots Traded', 'Accumulate 10.00 total lot size across all trades', 'สะสม 10 Lots', 'สะสม Lot รวมครบ 10.00 lots'],
  lot_100: ['100 Lots Traded', 'Accumulate 100.00 total lot size across all trades', 'สะสม 100 Lots', 'สะสม Lot รวมครบ 100.00 lots'],
  note_master: ['Note Master', 'Write notes for 50 trades', 'เจ้าแห่งโน้ต', 'เขียนโน้ตประกอบเทรดครบ 50 ครั้ง'],
  mistake_aware: ['Mistake Aware', 'Log 10 mistakes to study your patterns', 'รู้ทันข้อผิดพลาด', 'บันทึก Mistake ครบ 10 ครั้งเพื่อศึกษารูปแบบของตัวเอง'],
  cashflow_starter: ['Cash Flow Starter', 'Create your first deposit and first expense', 'เริ่มต้น Cash Flow', 'บันทึกฝากเงินและรายจ่ายครั้งแรก'],
}

export function pickLang(value, language = 'en') {
  if (!value || typeof value !== 'object') return value
  return value[language === 'th' ? 'th' : 'en'] || value.en || value.th || ''
}

export function getExpenseCategoryLabel(category, language = 'en') {
  const key = typeof category === 'string' ? category : category?.key
  return pickLang(expenseCategoryText[key], language) || category?.label || key || '-'
}

export function getMistakeLabel(label, language = 'en') {
  return pickLang(mistakeText[label], language) || label || '-'
}

export function getEmotionLabel(label, language = 'en') {
  return pickLang(emotionText[label], language) || label || '-'
}

export function getResultLabel(label, language = 'en') {
  return pickLang(resultText[label], language) || label || '-'
}

export function getDirectionLabel(label, language = 'en') {
  return pickLang(directionText[label], language) || label || '-'
}

export function getThemeText(theme, language = 'en') {
  const text = themeText[theme?.value] || {}
  return {
    name: pickLang(text.name, language) || theme?.name || '',
    description: pickLang(text.description, language) || theme?.description || '',
  }
}

export function getAchievementText(achievement, language = 'en') {
  const item = achievementText[achievement?.key]
  if (!item) return { title: achievement?.title || '', sub: achievement?.sub || '' }
  return {
    title: language === 'th' ? item[2] : item[0],
    sub: language === 'th' ? item[3] : item[1],
  }
}
