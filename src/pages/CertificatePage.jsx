import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { syncAchievements, useAchievements, useUserProfile } from '../hooks/useFirestore'
import { achievementCatalog } from '../lib/appConstants'
import { useI18n } from '../i18n'
import { getAchievementText } from '../lib/localization'

function formatDate(value, language) {
  const date = typeof value?.toDate === 'function' ? value.toDate() : value ? new Date(value) : null
  if (!date || Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat(language === 'th' ? 'th-TH' : 'en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function drawCenteredText(ctx, text, y, options = {}) {
  const {
    font = '40px Arial',
    color = '#eaffea',
    letterSpacing = 0,
    maxWidth = 1300,
  } = options

  ctx.font = font
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  if (!letterSpacing) {
    ctx.fillText(text, 800, y, maxWidth)
    return
  }

  const chars = [...text]
  const totalWidth = chars.reduce((sum, char) => sum + ctx.measureText(char).width + letterSpacing, 0) - letterSpacing
  let x = 800 - totalWidth / 2

  chars.forEach((char) => {
    ctx.fillText(char, x, y)
    x += ctx.measureText(char).width + letterSpacing
  })
}

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ')
  let line = ''
  let currentY = y

  words.forEach((word) => {
    const testLine = line ? `${line} ${word}` : word
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, currentY)
      line = word
      currentY += lineHeight
      return
    }
    line = testLine
  })

  if (line) ctx.fillText(line, x, currentY)
}

function drawSeal(ctx, x, y, code) {
  ctx.save()
  ctx.translate(x, y)

  ctx.strokeStyle = 'rgba(45,226,199,0.92)'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(0, 0, 126, 0, Math.PI * 2)
  ctx.stroke()

  ctx.strokeStyle = 'rgba(45,226,199,0.65)'
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.arc(0, 0, 88, 0, Math.PI * 2)
  ctx.stroke()

  for (let i = 0; i < 16; i += 1) {
    ctx.save()
    ctx.rotate((Math.PI * 2 * i) / 16)
    ctx.fillStyle = 'rgba(45,226,199,0.82)'
    ctx.font = '22px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(i % 2 ? '★' : '✓', 0, -108)
    ctx.restore()
  }

  ctx.font = '800 22px Rajdhani, Arial'
  ctx.fillStyle = '#2de2c7'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('ACHIEVEMENTS', 0, -92)
  ctx.fillText('COMPLETED', 0, 94)

  ctx.fillStyle = 'rgba(45,226,199,0.16)'
  ctx.beginPath()
  ctx.arc(0, 0, 66, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#2de2c7'
  ctx.font = '800 38px Rajdhani, Arial'
  ctx.fillText('TRADING', 0, -20)
  ctx.font = '700 18px Rajdhani, Arial'
  ctx.fillText('HQ ACCREDITATION', 0, 12)

  ctx.fillStyle = '#2de2c7'
  ctx.beginPath()
  ctx.roundRect(-36, 36, 72, 52, 8)
  ctx.fill()
  ctx.fillRect(-10, 86, 20, 20)
  ctx.fillRect(-34, 106, 68, 12)
  ctx.fillStyle = '#07102f'
  ctx.font = '34px Arial'
  ctx.fillText('★', 0, 65)

  ctx.font = '700 12px Rajdhani, Arial'
  ctx.fillStyle = 'rgba(234,255,234,0.72)'
  ctx.fillText(code, 0, 134)

  ctx.restore()
}

function drawSignature(ctx, x, y) {
  ctx.save()
  ctx.strokeStyle = 'rgba(234,255,234,0.74)'
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(x - 120, y + 20)
  ctx.bezierCurveTo(x - 70, y - 25, x - 30, y + 55, x + 12, y + 4)
  ctx.bezierCurveTo(x + 52, y - 42, x + 78, y + 38, x + 132, y - 10)
  ctx.stroke()

  ctx.strokeStyle = 'rgba(234,255,234,0.55)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(x - 180, y + 62)
  ctx.lineTo(x + 190, y + 62)
  ctx.stroke()

  ctx.fillStyle = 'rgba(234,255,234,0.74)'
  ctx.font = '18px Exo 2, Arial'
  ctx.textAlign = 'center'
  ctx.fillText('Co-Founder', x, y + 96)
  ctx.restore()
}

function drawBrandMark(ctx, x, y) {
  ctx.save()
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(x, y, 50, 8)
  ctx.fillRect(x + 10, y + 18, 40, 8)
  ctx.fillRect(x + 20, y + 36, 30, 8)
  ctx.font = '800 70px Rajdhani, Arial'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText('TRADING', x + 70, y - 8)
  ctx.font = '700 30px Rajdhani, Arial'
  ctx.fillText('HQ ACCREDITATION', x + 74, y + 62)
  ctx.restore()
}

function drawChecklistItem(ctx, x, y, label) {
  ctx.save()
  ctx.strokeStyle = '#2de2c7'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.arc(x, y, 15, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x - 7, y)
  ctx.lineTo(x - 1, y + 7)
  ctx.lineTo(x + 9, y - 8)
  ctx.stroke()
  ctx.fillStyle = 'rgba(234,255,234,0.88)'
  ctx.font = '700 18px Exo 2, Arial'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, x + 30, y)
  ctx.restore()
}

function exportCompletionCertificate({ traderName, unlockedCount, totalCount, userId, preview = false }) {
  const canvas = document.createElement('canvas')
  canvas.width = 1600
  canvas.height = 1130

  const ctx = canvas.getContext('2d')
  const issuedAt = new Date()
  const dateText = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(issuedAt)

  // ─── Background: dark navy ───
  ctx.fillStyle = '#0b1437'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // ─── Double border frame ───
  const frameMargin = 76
  const innerFrameMargin = 94
  ctx.strokeStyle = 'rgba(255,255,255,0.90)'
  ctx.lineWidth = 6
  ctx.strokeRect(frameMargin, frameMargin, canvas.width - frameMargin * 2, canvas.height - frameMargin * 2)
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'
  ctx.lineWidth = 2
  ctx.strokeRect(innerFrameMargin, innerFrameMargin, canvas.width - innerFrameMargin * 2, canvas.height - innerFrameMargin * 2)

  // ─── Brand Logo (top-left): three horizontal bars + TRADING HQ text ───
  function drawLogo(x, y) {
    ctx.save()
    ctx.fillStyle = '#ffffff'
    // three stacked bars (like FXIFY logo lines)
    ctx.fillRect(x, y, 56, 10)
    ctx.fillRect(x + 14, y + 20, 42, 10)
    ctx.fillRect(x + 28, y + 40, 28, 10)
    // Bold brand name
    ctx.font = '800 58px Arial Black, Arial'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText('TRADING HQ', x + 78, y - 6)
    // Sub label
    ctx.font = '500 20px Arial'
    ctx.fillStyle = 'rgba(255,255,255,0.75)'
    ctx.fillText('ACCREDITATION', x + 82, y + 56)
    ctx.restore()
  }
  drawLogo(110, 108)

  // ─── Top-right: "CERTIFICATE OF ACHIEVEMENT" ───
  ctx.font = '700 36px Arial'
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  ctx.fillText('CERTIFICATE', 1480, 148)
  ctx.font = '400 36px Arial'
  ctx.fillText('OF ACHIEVEMENT', 1480, 192)

  // ─── Subtitle ───
  ctx.font = '400 22px Arial'
  ctx.fillStyle = 'rgba(255,255,255,0.75)'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('THIS CERTIFICATE IS PROUDLY PRESENTED TO:', 800, 315)

  // ─── Trader Name ───
  ctx.font = '700 72px Arial'
  ctx.fillStyle = '#ffffff'
  ctx.fillText(traderName, 800, 415, 1300)

  // ─── Horizontal divider ───
  ctx.strokeStyle = 'rgba(255,255,255,0.60)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(110, 478)
  ctx.lineTo(1490, 478)
  ctx.stroke()

  // ─── Achievement headline (line 1: mixed colour inline) ───
  ctx.font = '700 28px Arial'
  ctx.textBaseline = 'middle'
  const headY = 528
  const prefix = 'THIS TRADER HAS '
  const highlightText = 'SUCCESSFULLY ACHIEVED'
  const suffix = ' ALL THE ACHIEVEMENTS'
  const prefixW = ctx.measureText(prefix).width
  const highlightW = ctx.measureText(highlightText).width
  const suffixW = ctx.measureText(suffix).width
  const totalLineW = prefixW + highlightW + suffixW
  let lx = 800 - totalLineW / 2
  ctx.textAlign = 'left'
  ctx.fillStyle = '#ffffff'
  ctx.fillText(prefix, lx, headY)
  lx += prefixW
  ctx.fillStyle = '#2de2c7'
  ctx.fillText(highlightText, lx, headY)
  lx += highlightW
  ctx.fillStyle = '#ffffff'
  ctx.fillText(suffix, lx, headY)

  // line 2
  ctx.textAlign = 'center'
  ctx.fillStyle = '#ffffff'
  ctx.font = '700 28px Arial'
  ctx.fillText('IN THE TRADING HQ EVALUATION.', 800, 572)

  // ─── Body paragraph ───
  ctx.font = '400 21px Arial'
  ctx.fillStyle = 'rgba(255,255,255,0.80)'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  drawWrappedText(
    ctx,
    'This accomplishment reflects outstanding performance, consistent discipline, and exceptional risk management throughout the evaluation process. You have demonstrated the skills and mindset of a professional trader. Congratulations on reaching this remarkable milestone.',
    800, 624, 1060, 33
  )

  // ─── PREVIEW watermark ───
  if (preview) {
    ctx.save()
    ctx.translate(800, 560)
    ctx.rotate(-0.22)
    ctx.font = '800 160px Arial Black, Arial'
    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('PREVIEW', 0, 0)
    ctx.restore()
  }

  // ─── Date (bottom-left) ───
  ctx.font = '500 42px Arial'
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(dateText, 295, 820)
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(110, 862)
  ctx.lineTo(490, 862)
  ctx.stroke()
  ctx.font = '700 17px Arial'
  ctx.fillStyle = 'rgba(255,255,255,0.65)'
  ctx.fillText('DATE', 295, 888)

  // ─── Seal (center, positioned in lower section clear of body text) ───
  function drawFxifySeal(sx, sy) {
    ctx.save()
    ctx.translate(sx, sy)

    const R  = 112   // outer ring
    const Ri = 87    // inner ring
    const Rt = 78    // arc text radius (inside inner ring)

    // Outer dashed ring
    ctx.strokeStyle = '#2de2c7'
    ctx.lineWidth = 2.5
    ctx.setLineDash([7, 5])
    ctx.beginPath()
    ctx.arc(0, 0, R, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])

    // Inner solid ring
    ctx.strokeStyle = '#2de2c7'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(0, 0, Ri, 0, Math.PI * 2)
    ctx.stroke()

    // Stars & checks between rings
    const midR = (R + Ri) / 2
    for (let i = 0; i < 16; i++) {
      const a = (Math.PI * 2 * i) / 16 - Math.PI / 2
      ctx.save()
      ctx.translate(Math.cos(a) * midR, Math.sin(a) * midR)
      ctx.font = '11px Arial'
      ctx.fillStyle = '#2de2c7'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(i % 2 ? '\u2605' : '\u2713', 0, 0)
      ctx.restore()
    }

    // TOP arc: "ACHIEVEMENTS" — each char placed going left→right across top
    // angle centered at -π/2 (north), span 130°
    ;(function() {
      const text = 'ACHIEVEMENTS'
      const span = 130 * Math.PI / 180
      const aStart = -Math.PI / 2 - span / 2
      const step   = span / (text.length - 1)
      ctx.font = '700 13px Arial'
      ctx.fillStyle = '#2de2c7'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      for (let i = 0; i < text.length; i++) {
        const a = aStart + i * step
        ctx.save()
        ctx.translate(Math.cos(a) * Rt, Math.sin(a) * Rt)
        ctx.rotate(a + Math.PI / 2)  // face outward on top = rotate by a+90°
        ctx.fillText(text[i], 0, 0)
        ctx.restore()
      }
    })()

    // BOTTOM arc: "COMPLETED" — chars placed going RIGHT→LEFT (reversed) across bottom
    // so that when rotated they read left-to-right
    // angle centered at +π/2 (south), span 100°
    ;(function() {
      const text = 'COMPLETED'
      const span = 100 * Math.PI / 180
      const aStart = Math.PI / 2 + span / 2   // start from right side
      const step   = -span / (text.length - 1) // step leftward (decreasing angle)
      ctx.font = '700 13px Arial'
      ctx.fillStyle = '#2de2c7'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      for (let i = 0; i < text.length; i++) {
        const a = aStart + i * step
        ctx.save()
        ctx.translate(Math.cos(a) * Rt, Math.sin(a) * Rt)
        ctx.rotate(a - Math.PI / 2)  // face outward on bottom
        ctx.fillText(text[i], 0, 0)
        ctx.restore()
      }
    })()

    // Inner tinted circle
    ctx.fillStyle = 'rgba(45,226,199,0.10)'
    ctx.beginPath()
    ctx.arc(0, 0, Ri - 10, 0, Math.PI * 2)
    ctx.fill()

    // Logo: 3 bars (left-aligned, decreasing width)
    ctx.fillStyle = '#2de2c7'
    ;[[-20, 40], [-14, 28], [-8, 16]].forEach(([x, w], i) => {
      ctx.fillRect(x, -54 + i * 12, w, 7)
    })

    // Brand text
    ctx.font = '700 12px Arial'
    ctx.fillStyle = '#2de2c7'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('TRADING HQ', 0, -13)
    ctx.font = '500 9px Arial'
    ctx.fillText('ACCREDITATION', 0, 1)

    // Trophy cup body
    ctx.fillStyle = '#2de2c7'
    ctx.beginPath()
    ctx.roundRect(-20, 14, 40, 28, 5)
    ctx.fill()
    // Stem
    ctx.fillRect(-6, 42, 12, 9)
    // Base
    ctx.fillRect(-17, 51, 34, 7)
    // Star
    ctx.fillStyle = '#0b1437'
    ctx.font = '18px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('\u2605', 0, 28)

    ctx.restore()
  }
  drawFxifySeal(800, 820)

  // ─── Signature (right) ───
  function drawFxifySignature(sx, sy) {
    ctx.save()
    // Signature stroke
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'
    ctx.lineWidth = 3.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(sx - 130, sy + 15)
    ctx.bezierCurveTo(sx - 75, sy - 30, sx - 20, sy + 60, sx + 18, sy)
    ctx.bezierCurveTo(sx + 58, sy - 50, sx + 90, sy + 40, sx + 145, sy - 15)
    ctx.stroke()
    // Underline — full width, clearly visible
    ctx.strokeStyle = 'rgba(255,255,255,0.60)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(sx - 190, sy + 58)
    ctx.lineTo(sx + 205, sy + 58)
    ctx.stroke()
    // Label
    ctx.fillStyle = 'rgba(255,255,255,0.80)'
    ctx.font = '400 18px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Co - Founder', sx, sy + 88)
    ctx.restore()
  }
  drawFxifySignature(1265, 815)

  // ─── Bottom checklist row ───
  const checklist = ['PROFIT TARGET', 'RISK MANAGEMENT', 'TRADING DISCIPLINE', 'CONSISTENCY', 'RULES COMPLIANCE']
  const checkY = 970
  const checkStartX = 130
  const checkSpacing = 284

  checklist.forEach((item, index) => {
    const bx = checkStartX + index * checkSpacing
    // Circle check icon
    ctx.strokeStyle = '#2de2c7'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(bx, checkY, 16, 0, Math.PI * 2)
    ctx.stroke()
    ctx.strokeStyle = '#2de2c7'
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(bx - 7, checkY + 1)
    ctx.lineTo(bx - 1, checkY + 8)
    ctx.lineTo(bx + 9, checkY - 8)
    ctx.stroke()
    // Label
    ctx.font = '700 17px Arial'
    ctx.fillStyle = 'rgba(255,255,255,0.88)'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(item, bx + 28, checkY)
    // Vertical divider (except last)
    if (index < checklist.length - 1) {
      const divX = bx + checkSpacing - 14
      ctx.strokeStyle = '#0b1437'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(divX, checkY - 24)
      ctx.lineTo(divX, checkY + 24)
      ctx.stroke()
    }
  })

  // ─── Bottom tagline ───
  ctx.font = '700 15px Arial'
  ctx.fillStyle = '#2de2c7'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const tagline = 'COMPLETED WITH EXCELLENCE. APPROVED FOR FUNDING.'
  const tagChars = [...tagline]
  const tagSpacing = 5
  const tagWidth = tagChars.reduce((sum, ch) => sum + ctx.measureText(ch).width + tagSpacing, 0) - tagSpacing
  let tx = 800 - tagWidth / 2
  tagChars.forEach((ch) => {
    ctx.fillText(ch, tx, 1022)
    tx += ctx.measureText(ch).width + tagSpacing
  })

  // ─── Download ───
  const link = document.createElement('a')
  const safeName = traderName.replace(/[^a-z0-9ก-๙]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'trader'
  link.download = `trading-hq-certificate-${preview ? 'preview-' : ''}${safeName}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

export default function CertificatePage() {
  const { user } = useAuth()
  const { language } = useI18n()
  const { data: achievements, loading } = useAchievements(user?.uid)
  const { profile } = useUserProfile(user?.uid)

  useEffect(() => {
    if (!user?.uid) return
    syncAchievements(user.uid, { silent: true })
  }, [user?.uid])

  const unlocked = achievements
    .map((achievement) => {
      const meta = achievementCatalog.find((item) => item.key === achievement.key)
      return meta ? { ...meta, unlockedAt: achievement.unlockedAt } : null
    })
    .filter(Boolean)

  const latest = unlocked[0]
  const traderName = profile?.profile?.name || profile?.name || 'Trader'
  const totalAchievements = achievementCatalog.length
  const isComplete = unlocked.length >= totalAchievements
  const [certificateName, setCertificateName] = useState(traderName)
  const progressPercent = totalAchievements ? Math.min(100, Math.round((unlocked.length / totalAchievements) * 100)) : 0

  useEffect(() => {
    setCertificateName((current) => current?.trim() ? current : traderName)
  }, [traderName])

  const getCertificateName = () => traderName

  const handleExport = () => {
    if (!isComplete) return
    const certificateName = getCertificateName()

    exportCompletionCertificate({
      traderName: certificateName,
      unlockedCount: unlocked.length,
      totalCount: totalAchievements,
      userId: user?.uid,
    })
  }

  const handlePreviewExport = () => {
    const certificateName = getCertificateName()

    exportCompletionCertificate({
      traderName: certificateName,
      unlockedCount: unlocked.length,
      totalCount: totalAchievements,
      userId: user?.uid,
      preview: true,
    })
  }

  const journeyItems = [
    ['🏆', `${unlocked.length} / ${totalAchievements}`, 'Achievements Unlocked', '#b885ff'],
    ['⭐', isComplete ? 'Legacy Complete' : 'Commitment', isComplete ? 'Certificate Ready' : 'Outstanding', '#f6d689'],
    ['📈', `${progressPercent}% Progress`, isComplete ? 'Milestone Complete' : 'On Your Way to Greatness', '#33d69f'],
  ]

  const copy = language === 'th'
    ? {
      title: 'ใบรับรอง',
      subtitle: 'ใบรับรองสำหรับนักเทรดที่พิสูจน์วินัยผ่าน Achievement',
      proof: 'หลักฐานแห่งวินัย สัญลักษณ์แห่งเส้นทางของคุณ',
      badge: 'ใบรับรอง TRADING HQ',
      presentedTo: 'มอบให้แก่',
      recognition: <>เพื่อยกย่องความทุ่มเทอย่างต่อเนื่อง<br />วินัย และความมุ่งมั่นในการเติบโต</>,
      earned: 'คุณลงมือทำ และคุณคู่ควรกับสิ่งนี้',
      status: 'สถานะใบรับรอง',
      completion: 'ความคืบหน้า',
      unlocked: 'ปลดล็อกแล้ว',
      export: 'Export ใบรับรอง',
      preview: 'ดูตัวอย่าง / ทดสอบ Export',
      lockedHint: 'ปลดล็อก Achievement ให้ครบก่อน',
      journey: 'เส้นทางของคุณ',
      quote: <>มีวินัยวันนี้<br />มีอิสระในวันหน้า<br />ทิ้งผลงานไว้เป็นตำนาน</>,
      journeyTitles: {
        'Achievements Unlocked': 'Achievement ที่ปลดล็อกแล้ว',
        'Legacy Complete': 'เส้นทางสำเร็จสมบูรณ์',
        Commitment: 'ความมุ่งมั่น',
        'Certificate Ready': 'พร้อมออกใบรับรอง',
        Outstanding: 'ยอดเยี่ยม',
        'Milestone Complete': 'ถึงเป้าหมายแล้ว',
        'On Your Way to Greatness': 'กำลังเดินหน้าสู่เป้าหมาย',
      },
    }
    : {
      title: 'CERTIFICATE',
      subtitle: 'Export a verified certificate after unlocking every achievement',
      proof: 'A proof of your discipline. A symbol of your journey.',
      badge: 'TRADING HQ CERTIFICATE',
      presentedTo: 'Proudly presented to',
      recognition: <>In recognition of your unwavering dedication,<br />discipline, and commitment to growth.</>,
      earned: 'You did the work. You earned this.',
      status: 'Certificate Status',
      completion: 'Completion',
      unlocked: 'achievements unlocked',
      export: 'Export Certificate',
      preview: 'Preview / Test Export',
      lockedHint: 'Unlock all achievements first',
      journey: 'Your Journey So Far',
      quote: <>Discipline today.<br />Freedom tomorrow.<br />Legacy forever.</>,
      journeyTitles: {},
    }

  return (
    <div
      style={{
        flex: 1,
        overflow: 'hidden',
        padding: '12px clamp(10px, 1.3vw, 18px)',
        background:
          'radial-gradient(circle at 48% 15%, rgba(255,205,97,0.16), transparent 22%), radial-gradient(circle at 18% 28%, rgba(139,92,246,0.16), transparent 30%), linear-gradient(135deg, rgba(3,5,18,0.98), rgba(8,10,28,0.98) 52%, rgba(4,8,18,0.98))',
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 330px', gap: 16, alignItems: 'stretch', height: '100%' }}>
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            minHeight: 0,
            height: 'calc(100vh - 24px)',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 24,
            padding: '10px clamp(14px, 2.2vw, 36px)',
            border: '1px solid rgba(244,190,91,0.34)',
            background:
              'radial-gradient(circle at 50% 8%, rgba(139,92,246,0.2), transparent 26%), linear-gradient(180deg, rgba(12,12,38,0.92), rgba(5,7,20,0.96))',
            boxShadow: '0 0 60px rgba(255,183,64,0.08), inset 0 0 80px rgba(139,92,246,0.08)',
          }}
        >
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.75, backgroundImage: 'radial-gradient(circle at 12% 20%, rgba(255,212,104,0.8) 0 1px, transparent 2px), radial-gradient(circle at 78% 18%, rgba(170,132,255,0.8) 0 1px, transparent 2px), radial-gradient(circle at 42% 32%, rgba(255,255,255,0.55) 0 1px, transparent 2px), radial-gradient(circle at 88% 70%, rgba(255,212,104,0.55) 0 1px, transparent 2px)', backgroundSize: '180px 180px, 240px 240px, 130px 130px, 210px 210px' }} />
          <div style={{ position: 'absolute', left: -38, top: 58, width: 220, height: 520, opacity: 0.18, borderRadius: '50%', borderLeft: '3px solid rgba(255,212,104,0.65)', transform: 'rotate(12deg)' }} />
          <div style={{ position: 'absolute', right: -38, top: 58, width: 220, height: 520, opacity: 0.18, borderRadius: '50%', borderRight: '3px solid rgba(255,212,104,0.65)', transform: 'rotate(-12deg)' }} />

          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <div style={{ margin: '0 auto 8px', width: 60, height: 60, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle, rgba(255,238,164,0.95), rgba(174,104,255,0.28) 42%, rgba(255,180,61,0.14) 72%, transparent 73%)', border: '1px solid rgba(255,216,125,0.55)', boxShadow: '0 0 30px rgba(255,194,78,0.28)' }}>
              <div style={{ fontSize: 48, filter: 'drop-shadow(0 0 12px rgba(255,210,99,0.8))' }}>✦</div>
            </div>

            <div style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(34px, 5vw, 58px)', lineHeight: 0.92, fontWeight: 700, letterSpacing: 5, color: '#f6d689', textShadow: '0 0 18px rgba(255,193,73,0.36)' }}>
              {copy.title}
            </div>
            <div style={{ width: 'min(520px, 80%)', height: 1, margin: '14px auto 10px', background: 'linear-gradient(90deg, transparent, rgba(255,215,125,0.88), transparent)' }} />
            <div style={{ display: 'none', fontSize: 12, color: '#bfc7e9', lineHeight: 1.35 }}>
              {language === 'th' ? 'ใบรับรองสำหรับนักเทรดที่พิสูจน์วินัยผ่าน Achievement' : 'Export a verified certificate after unlocking every achievement'}
            </div>
            <div style={{ fontSize: 12, color: '#bfc7e9', lineHeight: 1.35 }}>
              {copy.subtitle}
            </div>
            <div style={{ marginTop: 5, fontFamily: 'Georgia, serif', fontSize: 13, letterSpacing: 1.6, color: '#f6d689', textTransform: 'uppercase' }}>
              {copy.proof}
            </div>

            <div style={{ position: 'relative', margin: '14px auto 0', maxWidth: 920, minHeight: 250, borderRadius: 24, padding: '24px clamp(16px, 3.4vw, 48px)', border: '2px solid rgba(246,214,137,0.78)', background: 'linear-gradient(180deg, rgba(16,13,43,0.76), rgba(8,10,30,0.86))', boxShadow: '0 0 36px rgba(255,185,65,0.16), inset 0 0 32px rgba(255,185,65,0.07)' }}>
              <div style={{ position: 'absolute', inset: 12, border: '1px solid rgba(246,214,137,0.22)', borderRadius: 22, pointerEvents: 'none' }} />
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 24px', borderRadius: 999, border: '1px solid rgba(246,214,137,0.44)', background: 'linear-gradient(90deg, rgba(82,45,125,0.72), rgba(30,21,62,0.86))', color: '#f6d689', fontFamily: 'Georgia, serif', fontSize: 16, letterSpacing: 2 }}>
                <span>🏆</span>
                {copy.badge}
              </div>
              <div style={{ marginTop: 14, fontSize: 11, color: '#9fa8d1', letterSpacing: 4, textTransform: 'uppercase' }}>
                {copy.presentedTo}
              </div>
              <div style={{ marginTop: 4, fontFamily: 'Georgia, serif', fontSize: 'clamp(34px, 6vw, 56px)', lineHeight: 1, fontWeight: 700, color: '#ffe7a8', textShadow: '0 0 18px rgba(255,192,76,0.34)' }}>
                {getCertificateName()}
              </div>
              <div style={{ width: 'min(520px, 75%)', height: 1, margin: '10px auto 8px', background: 'linear-gradient(90deg, transparent, rgba(246,214,137,0.55), transparent)' }} />
              <div style={{ color: '#d5daf3', fontSize: 13, lineHeight: 1.45 }}>
                {copy.recognition}
              </div>
              <div style={{ marginTop: 8, fontFamily: 'Georgia, serif', fontSize: 13, letterSpacing: 2.2, color: '#f6d689', textTransform: 'uppercase' }}>
                {copy.earned}
              </div>
              <div style={{ margin: '10px auto -14px', width: 58, height: 58, borderRadius: '50%', display: 'grid', placeItems: 'center', color: '#f6d689', background: 'radial-gradient(circle, rgba(82,45,125,0.98), rgba(29,20,58,0.95))', border: '2px solid rgba(246,214,137,0.72)', boxShadow: '0 0 24px rgba(255,185,65,0.3)' }}>
                <span style={{ fontSize: 38 }}>🏆</span>
              </div>
            </div>

            <div style={{ display: 'none' }}>
              {[
                ['▣', 'VERIFIED & SECURE', 'Progress Verified'],
                ['◈', 'PERMANENT RECORD', 'Forever Yours'],
                ['★', 'SHARE YOUR SUCCESS', 'Inspire Others'],
              ].map(([icon, title, sub]) => (
                <div key={title} style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center', borderRight: title === 'SHARE YOUR SUCCESS' ? 'none' : '1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ color: '#f6d689', fontSize: 22 }}>{icon}</span>
                  <span style={{ textAlign: 'left' }}>
                    <div style={{ fontFamily: 'Rajdhani', fontSize: 13, fontWeight: 900, letterSpacing: 2, color: '#f7d894' }}>{title}</div>
                    <div style={{ fontSize: 11, color: '#7d87ae' }}>{sub}</div>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <aside style={{ display: 'grid', gap: 12 }}>
          <div className="glass-card" style={{ padding: 18, borderColor: 'rgba(246,214,137,0.36)', background: 'linear-gradient(180deg, rgba(10,15,34,0.92), rgba(6,10,22,0.94))' }}>
            <div className="card-title" style={{ color: '#bfc7e9', justifyContent: 'space-between' }}>
              {copy.status}
              <span style={{ width: 26, height: 1, background: '#f6d689' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
              <div style={{ fontSize: 10, color: '#9fa8d1', letterSpacing: 2, textTransform: 'uppercase' }}>{copy.completion}</div>
              <div style={{ fontFamily: 'Rajdhani', fontSize: 24, fontWeight: 900, color: '#b885ff' }}>{progressPercent}%</div>
            </div>
            <div className="progress-bar" style={{ height: 7, marginTop: 8, background: 'rgba(255,255,255,0.08)' }}>
              <div className="progress-fill" style={{ width: `${progressPercent}%`, background: 'linear-gradient(90deg, #b885ff, #f6d689)' }} />
            </div>
            <div style={{ marginTop: 12, color: '#aeb7dd', fontSize: 12 }}>
              {unlocked.length} / {totalAchievements} {copy.unlocked}
            </div>
            <button
              type="button"
              className={isComplete ? 'btn-primary' : 'btn-ghost'}
              onClick={handleExport}
              disabled={!isComplete || loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: 16, background: isComplete ? 'linear-gradient(90deg, #d59b35, #f6d689)' : undefined, color: isComplete ? '#120b18' : '#9fa8d1', borderColor: 'rgba(246,214,137,0.34)', opacity: isComplete ? 1 : 0.58, fontSize: 0 }}
            >
              <span style={{ fontSize: 13 }}>⬇ {copy.export}</span>
              ⬇ Export Certificate
            </button>
            <button type="button" className="btn-ghost" onClick={handlePreviewExport} disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 12, borderColor: 'rgba(159,168,209,0.28)', color: '#bfc7e9', fontSize: 0 }}>
              <span style={{ fontSize: 13 }}>◉ {copy.preview}</span>
              ◉ Preview / Test Export
            </button>
            {!isComplete && (
              <div style={{ marginTop: 14, textAlign: 'center', fontSize: 11, color: '#7d87ae' }}>
                {copy.lockedHint}
              </div>
            )}
          </div>

          <div className="glass-card" style={{ padding: 18, borderColor: 'rgba(246,214,137,0.22)', background: 'linear-gradient(180deg, rgba(10,15,34,0.9), rgba(6,10,22,0.94))' }}>
            <div className="card-title" style={{ color: '#bfc7e9', justifyContent: 'space-between' }}>
              {copy.journey}
              <span style={{ width: 26, height: 1, background: '#f6d689' }} />
            </div>
            {journeyItems.map(([icon, title, sub, color]) => (
              <div key={title} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ width: 48, height: 48, borderRadius: 13, display: 'grid', placeItems: 'center', fontSize: 22, background: `${color}22`, border: `1px solid ${color}33` }}>{icon}</div>
                <div>
                  <div style={{ fontFamily: 'Rajdhani', fontSize: 18, fontWeight: 900, color }}>{copy.journeyTitles[title] || title}</div>
                  <div style={{ fontSize: 12, color: '#7d87ae' }}>{copy.journeyTitles[sub] || sub}</div>
                </div>
              </div>
            ))}
            <div style={{ marginTop: 12, padding: 14, borderRadius: 14, textAlign: 'center', color: '#aeb7dd', fontStyle: 'italic', lineHeight: 1.55, border: '1px solid rgba(246,214,137,0.18)', background: 'rgba(255,255,255,0.03)' }}>
              <div style={{ color: '#f6d689', fontSize: 28, lineHeight: 1 }}>“</div>
              {copy.quote}
              <div style={{ color: '#f6d689', fontSize: 28, lineHeight: 1 }}>”</div>
            </div>
            {false && latest && (
              <div style={{ marginTop: 16, fontSize: 11, color: '#7d87ae' }}>
                Latest: <span style={{ color: '#f6d689' }}>{getAchievementText(latest, language).title}</span> · {formatDate(latest.unlockedAt, language)}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '22px clamp(14px, 2vw, 28px) 32px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 18, marginBottom: 18, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontFamily: 'Rajdhani', fontSize: 34, fontWeight: 900, color: 'var(--ng)', letterSpacing: 2.5, textTransform: 'uppercase' }}>
            {language === 'th' ? 'ใบรับรอง' : 'CERTIFICATE'}
          </div>
          <div style={{ marginTop: 6, maxWidth: 560, fontSize: 13, color: 'var(--text3)', lineHeight: 1.55 }}>
            {language === 'th' ? 'ใบรับรองจะ export ได้เมื่อปลดล็อก Achievement ครบทุกอัน' : 'Export a verified certificate after unlocking every achievement'}
          </div>
        </div>

        <div className="glass-card" style={{ width: 'min(100%, 360px)', display: 'flex', flexDirection: 'column', gap: 10, padding: 16, borderColor: 'rgba(255,204,0,0.22)' }}>
          <label style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: 1.8, textTransform: 'uppercase' }}>
              {language === 'th' ? 'ชื่อบนใบ Certificate' : 'Certificate Name'}
            </span>
            <input
              type="text"
              value={certificateName}
              onChange={(event) => setCertificateName(event.target.value)}
              placeholder={language === 'th' ? 'ชื่อที่จะแสดงบนใบ Certificate' : 'Name shown on certificate'}
              style={{ width: '100%' }}
            />
          </label>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: 1.5, textTransform: 'uppercase' }}>
              {language === 'th' ? 'ความคืบหน้า' : 'Completion'}
            </div>
            <div style={{ fontFamily: 'Rajdhani', fontSize: 18, fontWeight: 900, color: isComplete ? '#ffcc00' : 'var(--ng)' }}>
              {progressPercent}%
            </div>
          </div>
          <div className="progress-bar" style={{ height: 6, background: 'rgba(255,255,255,0.06)' }}>
            <div className="progress-fill" style={{ width: `${progressPercent}%`, background: isComplete ? 'linear-gradient(90deg, #ffcc00, #fff3a3)' : undefined }} />
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>
            {unlocked.length} / {totalAchievements} {language === 'th' ? 'Achievement' : 'achievements unlocked'}
          </div>
          <button
            type="button"
            className={isComplete ? 'btn-primary' : 'btn-ghost'}
            onClick={handleExport}
            disabled={!isComplete || loading}
            style={{ justifyContent: 'center', opacity: isComplete ? 1 : 0.55, cursor: isComplete ? 'pointer' : 'not-allowed' }}
            title={isComplete ? (language === 'th' ? 'Export ใบรับรอง' : 'Export certificate') : (language === 'th' ? 'ปลดล็อก Achievement ให้ครบก่อน' : 'Unlock every achievement first')}
          >
            {language === 'th' ? 'Export ใบรับรอง' : 'Export Certificate'}
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={handlePreviewExport}
            disabled={loading}
            style={{ justifyContent: 'center' }}
            title={language === 'th' ? 'ดาวน์โหลดใบ Preview เพื่อทดสอบ' : 'Download a preview certificate for testing'}
          >
            {language === 'th' ? 'Preview / ทดสอบ Export' : 'Preview / Test Export'}
          </button>
          {!isComplete && (
            <div style={{ fontSize: 10, color: 'var(--text3)', textAlign: 'center', padding: '2px 4px' }}>
              {language === 'th' ? 'ปลดล็อกให้ครบทุก Achievement ก่อน' : 'Unlock all achievements first'}
            </div>
          )}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
        style={{
          minHeight: 280,
          padding: 'clamp(22px, 4vw, 42px)',
          marginBottom: 20,
          borderColor: isComplete ? 'rgba(255,204,0,0.6)' : 'rgba(255,204,0,0.38)',
          background: 'radial-gradient(circle at 18% 12%, rgba(255,204,0,0.18), transparent 30%), radial-gradient(circle at 84% 22%, rgba(var(--ng-rgb),0.12), transparent 26%), linear-gradient(145deg, rgba(14,18,26,0.98), rgba(5,8,14,0.98))',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', inset: 16, border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, pointerEvents: 'none' }} />
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, maxWidth: 920, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'Rajdhani', fontSize: 13, fontWeight: 900, letterSpacing: 4, color: '#ffcc00', marginBottom: 22, padding: '8px 14px', borderRadius: 999, border: '1px solid rgba(255,204,0,0.22)', background: 'rgba(255,204,0,0.08)' }}>
            <span>🏆</span>
            {language === 'th' ? 'ใบรับรอง TRADING HQ' : 'TRADING HQ CERTIFICATE'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 2.5 }}>
            {isComplete
              ? (language === 'th' ? 'พร้อมออกใบรับรองให้แก่' : 'Ready to certify')
              : (language === 'th' ? 'ความคืบหน้าของ' : 'Progress for')}
          </div>
          <div style={{ fontFamily: 'Rajdhani', fontSize: 'clamp(42px, 7vw, 76px)', fontWeight: 900, color: 'var(--text)', margin: '6px 0 8px', lineHeight: 0.95 }}>
            {getCertificateName()}
          </div>
          <div style={{ width: 'min(720px, 100%)', height: 1, margin: '20px auto', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.42), transparent)' }} />
          <div style={{ fontSize: 13, color: 'var(--text2)', margin: '0 auto 22px', maxWidth: 740, lineHeight: 1.7 }}>
            {isComplete
              ? (language === 'th' ? 'คุณปลดล็อก Achievement ครบทั้งหมดแล้ว สามารถ Export ใบรับรองได้' : 'All achievements completed. You can export your certificate.')
              : (language === 'th' ? 'เมื่อปลดล็อกครบทุก Achievement ปุ่ม Export จะเปิดใช้งาน' : 'The export button unlocks after every achievement is completed.')}
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 16, border: `1px solid ${isComplete ? '#ffcc00aa' : 'var(--border2)'}`, background: isComplete ? 'rgba(255,204,0,0.1)' : 'rgba(var(--ng-rgb),0.06)', boxShadow: isComplete ? '0 0 24px rgba(255,204,0,0.22)' : 'none' }}>
            <span style={{ fontSize: 26 }}>{isComplete ? '🏆' : '📜'}</span>
            <span style={{ textAlign: 'left' }}>
              <div style={{ fontFamily: 'Rajdhani', fontSize: 18, fontWeight: 800, color: isComplete ? '#ffcc00' : 'var(--ng)' }}>
                {unlocked.length} / {totalAchievements} {language === 'th' ? 'ความสำเร็จ' : 'ACHIEVEMENTS'}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text3)' }}>
                {latest ? `${language === 'th' ? 'ล่าสุด' : 'Latest'}: ${getAchievementText(latest, language).title} · ${formatDate(latest.unlockedAt, language)}` : (language === 'th' ? 'ยังไม่มี Achievement ที่ปลดล็อก' : 'No unlocked achievements yet')}
              </div>
            </span>
          </div>
        </div>
      </motion.div>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, margin: '4px 0 12px' }}>
        <div>
          <div className="card-title" style={{ marginBottom: 4 }}>
            {language === 'th' ? 'Achievement ที่ปลดล็อกแล้ว' : 'Unlocked Achievements'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>
            {language === 'th' ? 'รายการนี้ใช้ตรวจสถานะก่อนออกใบรับรอง' : 'Use this list to review your certificate progress'}
          </div>
        </div>
        <div style={{ fontFamily: 'Rajdhani', fontSize: 18, fontWeight: 900, color: isComplete ? '#ffcc00' : 'var(--ng)' }}>
          {unlocked.length}/{totalAchievements}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
        {loading && <div style={{ color: 'var(--text3)', fontSize: 12 }}>{language === 'th' ? 'กำลังโหลด...' : 'Loading...'}</div>}
        {!loading && unlocked.map((achievement, index) => (
          <motion.div
            key={achievement.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="glass-card"
            style={{ padding: 16, borderColor: `${achievement.color}33`, minHeight: 96, background: `linear-gradient(135deg, ${achievement.bg}, rgba(255,255,255,0.015))` }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ width: 46, height: 46, flex: '0 0 46px', borderRadius: 14, background: achievement.bg, border: `1px solid ${achievement.color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 21, boxShadow: `0 0 18px ${achievement.color}22` }}>
                {achievement.icon}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: 'Rajdhani', fontSize: 15, fontWeight: 900, color: achievement.color, lineHeight: 1.15 }}>{getAchievementText(achievement, language).title}</div>
                <div style={{ marginTop: 4, fontSize: 11, color: 'var(--text3)', lineHeight: 1.35 }}>{getAchievementText(achievement, language).sub}</div>
                <div style={{ marginTop: 8, display: 'inline-flex', padding: '3px 7px', borderRadius: 999, border: '1px solid var(--border)', fontSize: 9, color: 'var(--text3)' }}>{formatDate(achievement.unlockedAt, language)}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
