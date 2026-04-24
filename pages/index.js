// pages/index.js
import { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const CHARGES = [
  'Not being Corrupt', 'INTEGRITY', 'COMPETENCE', 'ACCOUNTABILITY', 'TRANSPARENCY',
  'JUSTICE', 'TRUTH', 'FREEDOM', 'EQUITY', 'CAPACITY', 'CARE',
  'COURAGE', 'EFFICIENCY', 'SECURITY', 'SAFETY', 'INNOVATION',
  'RELIABILITY', 'HUMANITY', 'DELIVERY', 'INCLUSION', 'POTENTIAL',
  'STEWARDSHIP', 'DISCIPLINE', 'EXCELLENCE',
];

const NOMINATOR_TYPES = [
  'an SPPG Student', 'a #Fixpolitics Member', 'an SPPG Faculty Member',
  'an SPPG graduate', 'A Member of the Press', 'A member of the public',
  'A prospective student',
];

const HOW_HEARD = [
  'Facebook', 'Instagram', 'X (Formerly Twitter)', 'LinkedIn',
  'WhatsApp', 'Shared by a friend', 'Google search',
  'Suggested by ChatGPT, Claude, Grok etc',
];

// ─────────────────────────────────────────────
// CANVAS HELPERS
// ─────────────────────────────────────────────

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 4) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  let lc = 0;
  for (let i = 0; i < words.length; i++) {
    const test = line + words[i] + ' ';
    if (ctx.measureText(test).width > maxWidth && i > 0) {
      if (lc >= maxLines - 1) {
        ctx.fillText(line.trimEnd() + '...', x, currentY);
        return;
      }
      ctx.fillText(line.trimEnd(), x, currentY);
      line = words[i] + ' ';
      currentY += lineHeight;
      lc++;
    } else {
      line = test;
    }
  }
  ctx.fillText(line.trimEnd(), x, currentY);
}

function drawSilhouette(ctx, cx, baseY) {
  ctx.save();
  ctx.translate(cx - 90, baseY - 270);
  ctx.scale(1.8, 1.8);
  ctx.fillStyle = 'rgba(4,4,4,0.96)';

  // Head
  ctx.beginPath();
  ctx.ellipse(50, 43, 26, 30, 0, 0, Math.PI * 2);
  ctx.fill();

  // Neck
  ctx.fillRect(44, 69, 12, 14);

  // Body / jacket
  ctx.beginPath();
  ctx.moveTo(8, 89);
  ctx.quadraticCurveTo(2, 81, 18, 77);
  ctx.lineTo(40, 85);
  ctx.lineTo(50, 108);
  ctx.lineTo(60, 85);
  ctx.lineTo(82, 77);
  ctx.quadraticCurveTo(98, 81, 92, 89);
  ctx.lineTo(90, 182);
  ctx.lineTo(10, 182);
  ctx.closePath();
  ctx.fill();

  // Left leg
  ctx.beginPath();
  ctx.moveTo(14, 178); ctx.lineTo(14, 255); ctx.lineTo(42, 255); ctx.lineTo(42, 178);
  ctx.closePath(); ctx.fill();

  // Right leg
  ctx.beginPath();
  ctx.moveTo(58, 178); ctx.lineTo(58, 255); ctx.lineTo(86, 255); ctx.lineTo(86, 178);
  ctx.closePath(); ctx.fill();

  // Left arm
  ctx.beginPath();
  ctx.moveTo(10, 89);
  ctx.bezierCurveTo(-8, 122, -5, 158, 0, 168);
  ctx.lineTo(14, 165);
  ctx.bezierCurveTo(10, 155, 8, 120, 22, 89);
  ctx.fill();

  // Right arm
  ctx.beginPath();
  ctx.moveTo(90, 89);
  ctx.bezierCurveTo(108, 122, 105, 158, 100, 168);
  ctx.lineTo(86, 165);
  ctx.bezierCurveTo(92, 155, 92, 120, 78, 89);
  ctx.fill();

  // Tie
  ctx.fillStyle = 'rgba(180,10,10,0.7)';
  ctx.beginPath();
  ctx.moveTo(47, 90); ctx.lineTo(50, 165); ctx.lineTo(53, 90);
  ctx.closePath(); ctx.fill();

  ctx.restore();
}

async function generateWantedCard({ nomineeName, charge, comment }) {
  if (typeof document === 'undefined') return null;
  await document.fonts.ready;

  const canvas = document.createElement('canvas');
  const W = 900, H = 1200;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // ── BACKGROUND: dark grunge concrete ──
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, W, H);

  // Procedural noise texture
  const imgData = ctx.getImageData(0, 0, W, H);
  const px = imgData.data;
  for (let i = 0; i < px.length; i += 4) {
    const n = (Math.random() - 0.5) * 55;
    px[i]   = Math.max(0, Math.min(255, px[i]   + n));
    px[i+1] = Math.max(0, Math.min(255, px[i+1] + n));
    px[i+2] = Math.max(0, Math.min(255, px[i+2] + n));
  }
  ctx.putImageData(imgData, 0, 0);

  // Scan lines
  ctx.fillStyle = 'rgba(0,0,0,0.09)';
  for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);

  // Vignette
  const vig = ctx.createRadialGradient(W/2, H/2, H * 0.25, W/2, H/2, H * 0.75);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.45)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);

  // ── TOP HEADER STRIP ──
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, W, 82);

  // SPPG logo blocks (mimicking the multicolor logo)
  const lx = 22, ly = 16, lw = 46, lh = 46;
  const logoColors = ['#CC1111','#1A7A3C','#D4A017','#1E55AA'];
  const half = lw / 2;
  ctx.fillStyle = logoColors[0]; ctx.fillRect(lx, ly, half, half);
  ctx.fillStyle = logoColors[1]; ctx.fillRect(lx + half, ly, half, half);
  ctx.fillStyle = logoColors[2]; ctx.fillRect(lx, ly + half, half, half);
  ctx.fillStyle = logoColors[3]; ctx.fillRect(lx + half, ly + half, half, half);
  // SPPG text over logo
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = `bold 10px 'Oswald', sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('SPPG', lx + lw/2, ly + lh/2 + 4);

  ctx.font = `600 13px 'Oswald', sans-serif`;
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'left';
  ctx.fillText('SCHOOL OF POLITICS, POLICY & GOVERNANCE', lx + lw + 12, ly + 22);
  ctx.font = `300 11px 'Oswald', sans-serif`;
  ctx.fillStyle = '#AAAAAA';
  ctx.fillText('CLASS OF 2027  ·  WantedForNigeria.com', lx + lw + 12, ly + 42);

  // ── RED CIRCLE ──
  ctx.beginPath();
  ctx.arc(W / 2, 460, 315, 0, Math.PI * 2);
  ctx.fillStyle = '#C41010';
  ctx.fill();

  // Inner glow on circle
  const cg = ctx.createRadialGradient(W/2, 380, 80, W/2, 460, 315);
  cg.addColorStop(0, 'rgba(255,60,60,0.25)');
  cg.addColorStop(1, 'rgba(0,0,0,0.2)');
  ctx.beginPath();
  ctx.arc(W / 2, 460, 315, 0, Math.PI * 2);
  ctx.fillStyle = cg;
  ctx.fill();

  // ── #WANTED FOR NIGERIA ──
  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur = 18;
  ctx.font = `bold 98px 'Bebas Neue', Impact, sans-serif`;
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText('#WANTED', W / 2, 234);

  ctx.font = `bold 50px 'Bebas Neue', Impact, sans-serif`;
  ctx.fillStyle = '#F0F0E8';
  ctx.fillText('FOR NIGERIA', W / 2, 287);
  ctx.shadowBlur = 0;

  // ── SILHOUETTE ──
  drawSilhouette(ctx, W / 2, 690);

  // ── CHARGES LABEL ──
  ctx.font = `bold 72px 'Bebas Neue', Impact, sans-serif`;
  ctx.fillStyle = '#FFD700';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.95)';
  ctx.shadowBlur = 14;
  ctx.fillText('C H A R G E S', W / 2, 805);
  ctx.shadowBlur = 0;

  // ── CHARGES BADGE ──
  const badgeText = charge;
  ctx.font = `bold 15px 'Oswald', sans-serif`;
  const bw2 = ctx.measureText(badgeText).width + 28;
  roundRect(ctx, W / 2 - bw2 / 2, 812, bw2, 28, 5);
  ctx.fillStyle = '#D4A017';
  ctx.fill();
  ctx.fillStyle = '#000000';
  ctx.textAlign = 'center';
  ctx.fillText(badgeText, W / 2, 831);

  // ── CHARGES BOX ──
  const bx = 52, by = 848, bwBox = 796, bhBox = 195;
  roundRect(ctx, bx, by, bwBox, bhBox, 14);
  ctx.fillStyle = 'rgba(0,0,0,0.88)';
  ctx.fill();
  roundRect(ctx, bx, by, bwBox, bhBox, 14);
  ctx.strokeStyle = 'rgba(255,215,0,0.22)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  const firstName = nomineeName.trim().split(' ')[0];
  const chargesText = comment && comment.trim()
    ? `${firstName} is accused of ${charge.toLowerCase()} — "${comment.trim()}"`
    : `${firstName} is charged with ${charge.toLowerCase()} against Nigeria. This individual is Wanted for their country.`;

  ctx.font = `20px 'Courier New', Courier, monospace`;
  ctx.fillStyle = '#EFEFEF';
  ctx.textAlign = 'left';
  wrapText(ctx, chargesText, bx + 28, by + 52, bwBox - 56, 36, 4);

  // ── NOMINEE NAME ──
  ctx.font = `bold 50px 'Bebas Neue', Impact, sans-serif`;
  ctx.fillStyle = '#D4A017';
  ctx.textAlign = 'left';
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 8;
  ctx.fillText(nomineeName.toUpperCase(), 58, 1080);
  ctx.shadowBlur = 0;

  // ── BOTTOM TEXT ──
  ctx.font = `17px 'Courier New', Courier, monospace`;
  ctx.fillStyle = '#CCCCCC';
  ctx.fillText('Is this you? or you know someone like this.', 58, 1112);
  ctx.font = `bold 17px 'Courier New', Courier, monospace`;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('Please report', 58, 1134);

  // ── SOCIAL HANDLE ──
  ctx.font = `600 13px 'Oswald', sans-serif`;
  ctx.fillStyle = '#888888';
  ctx.fillText('f  ⊙  𝕏  ▶  in  @THESPPG', 58, 1158);

  // ── APPLY BUTTON ──
  const btnX = 520, btnY = 1068, btnW = 322, btnH = 82;
  const btnGrad = ctx.createLinearGradient(btnX, btnY, btnX + btnW, btnY + btnH);
  btnGrad.addColorStop(0, '#1A7A3C');
  btnGrad.addColorStop(1, '#0D5526');
  roundRect(ctx, btnX, btnY, btnW, btnH, 42);
  ctx.fillStyle = btnGrad;
  ctx.fill();
  ctx.font = `300 15px 'Oswald', sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.textAlign = 'center';
  ctx.fillText('Join our Next Class', btnX + btnW / 2, btnY + 30);
  ctx.font = `bold 28px 'Bebas Neue', Impact, sans-serif`;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('Apply Now ›', btnX + btnW / 2, btnY + 60);

  // Red curved arrow (decorative)
  ctx.beginPath();
  ctx.moveTo(310, 1120);
  ctx.quadraticCurveTo(400, 1090, 510, 1108);
  ctx.strokeStyle = '#CC1111';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  // Arrowhead
  ctx.fillStyle = '#CC1111';
  ctx.beginPath();
  ctx.moveTo(510, 1108);
  ctx.lineTo(498, 1100);
  ctx.lineTo(502, 1116);
  ctx.closePath();
  ctx.fill();

  // ── DOMAIN PILL ──
  const dpW = 360, dpH = 36;
  const dpX = (W - dpW) / 2, dpY = 1155;
  roundRect(ctx, dpX, dpY, dpW, dpH, 18);
  ctx.fillStyle = '#CC1111';
  ctx.fill();
  ctx.font = `600 16px 'Oswald', sans-serif`;
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText('nigeria.thesppg.org/apply', W / 2, dpY + 23);

  return canvas.toDataURL('image/png');
}

// ─────────────────────────────────────────────
// MAIN PAGE COMPONENT
// ─────────────────────────────────────────────

const YOUTUBE_VIDEO_ID = 'j6pwvLrZMVw';

export default function Home() {
  // ── UI State ──
  const [activeForm, setActiveForm] = useState(null); // null | 'someone' | 'self'
  const [step, setStep] = useState('form'); // 'form' | 'card'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // ── Scoreboard ──
  const [score, setScore] = useState({ nominations: 0, applications: 0 });

  // ── Card ──
  const [cardUrl, setCardUrl] = useState(null);
  const [submittedData, setSubmittedData] = useState(null);

  // ── Refs ──
  const formSectionRef = useRef(null);

  // ── "Nominate Someone" form state ──
  const [someoneForm, setSomeoneForm] = useState({
    nominatorTypes: [],
    nomineeName: '', nomineeEmail: '', nomineeGender: '',
    nomineePhone: '', nominatorName: '', nominatorPhone: '',
    nominatorEmail: '', charges: '', chargesComment: '',
  });

  // ── "Nominate Yourself" form state ──
  const [selfForm, setSelfForm] = useState({
    fullName: '', email: '', gender: '', phone: '',
    charges: '', chargesComment: '', howHeard: [],
  });

  // ── Load scoreboard on mount, then poll every 2 minutes ──
  useEffect(() => {
    fetchScore();
    const interval = setInterval(fetchScore, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  async function fetchScore() {
    try {
      const res = await fetch('/api/scoreboard');
      if (res.ok) {
        const data = await res.json();
        setScore(data);
      }
    } catch (e) { /* silently ignore */ }
  }

  function handleCTAClick(type) {
    setActiveForm(type);
    setStep('form');
    setSubmitError('');
    setFieldErrors({});
    setCardUrl(null);
    setTimeout(() => {
      formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  }

  function validateSomeoneForm(f) {
    const errs = {};
    if (!f.nomineeName.trim()) errs.nomineeName = 'Required';
    if (!f.nomineeEmail.trim()) errs.nomineeEmail = 'Required';
    else if (!/\S+@\S+\.\S+/.test(f.nomineeEmail)) errs.nomineeEmail = 'Enter a valid email';
    if (!f.nomineeGender) errs.nomineeGender = 'Required';
    if (!f.nominatorName.trim()) errs.nominatorName = 'Required';
    if (!f.nominatorPhone.trim()) errs.nominatorPhone = 'Required';
    if (!f.nominatorEmail.trim()) errs.nominatorEmail = 'Required';
    else if (!/\S+@\S+\.\S+/.test(f.nominatorEmail)) errs.nominatorEmail = 'Enter a valid email';
    if (!f.charges) errs.charges = 'Select a charge';
    return errs;
  }

  function validateSelfForm(f) {
    const errs = {};
    if (!f.fullName.trim()) errs.fullName = 'Required';
    if (!f.email.trim()) errs.email = 'Required';
    else if (!/\S+@\S+\.\S+/.test(f.email)) errs.email = 'Enter a valid email';
    if (!f.gender) errs.gender = 'Required';
    if (!f.phone.trim()) errs.phone = 'Required';
    if (!f.charges) errs.charges = 'Select a charge';
    return errs;
  }

  // ── Handle toggle for multi-select arrays ──
  function toggleArrayItem(arr, item) {
    return arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item];
  }

  // ── Submit: Nominate Someone ──
  async function handleSomeoneSubmit(e) {
    e.preventDefault();
    const errs = validateSomeoneForm(someoneForm);
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      const firstErrEl = document.querySelector('.field-error');
      firstErrEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setFieldErrors({});
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/nominate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(someoneForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');

      // Optimistically increment score
      setScore(s => ({ ...s, nominations: s.nominations + 1 }));
      setSubmittedData(someoneForm);

      // Generate card
      const url = await generateWantedCard({
        nomineeName: someoneForm.nomineeName,
        charge: someoneForm.charges,
        comment: someoneForm.chargesComment,
      });
      setCardUrl(url);
      setStep('card');
      setTimeout(() => {
        formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Submit: Nominate Yourself ──
  async function handleSelfSubmit(e) {
    e.preventDefault();
    const errs = validateSelfForm(selfForm);
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      const firstErrEl = document.querySelector('.field-error');
      firstErrEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setFieldErrors({});
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/nominate-self', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selfForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');

      setScore(s => ({ ...s, nominations: s.nominations + 1 }));
      setSubmittedData(selfForm);

      const url = await generateWantedCard({
        nomineeName: selfForm.fullName,
        charge: selfForm.charges,
        comment: selfForm.chargesComment,
      });
      setCardUrl(url);
      setStep('card');
      setTimeout(() => {
        formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Download card ──
  function downloadCard() {
    if (!cardUrl) return;
    const name = (submittedData?.nomineeName || submittedData?.fullName || 'nominee').replace(/\s+/g, '-').toLowerCase();
    const a = document.createElement('a');
    a.href = cardUrl;
    a.download = `wanted-for-nigeria-${name}.png`;
    a.click();
  }

  // ── Share card ──
  async function shareCard(platform) {
    const applyUrl = 'https://nigeria.thesppg.org/apply';
    const text = `Nigeria needs you. Get your Wanted card and apply for SPPG Class of 2027. ${applyUrl} #WantedForNigeria`;

    if (platform === 'whatsapp') {
      // On mobile, Web Share API can share images
      if (navigator.share && cardUrl) {
        try {
          const blob = await (await fetch(cardUrl)).blob();
          const file = new File([blob], 'wanted-for-nigeria.png', { type: 'image/png' });
          await navigator.share({ files: [file], text });
          return;
        } catch (_) { /* fallback */ }
      }
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
    } else if (platform === 'telegram') {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(applyUrl)}&text=${encodeURIComponent(text)}`, '_blank');
    }
  }

  // ── Field error helper ──
  const fe = (key) => fieldErrors[key]
    ? <span className="field-error">{fieldErrors[key]}</span>
    : null;

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────

  return (
    <>
      <Head>
        <title>Wanted For Nigeria — SPPG Class of 2027</title>
        <meta name="description" content="Nigeria needs 1,000 leaders. Do you know one? Nominate them for the SPPG Class of 2027." />
        <meta property="og:title" content="Wanted For Nigeria" />
        <meta property="og:description" content="Nigeria needs 1,000 leaders. Is this you?" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      {/* ── NAV ── */}
      <nav className="nav">
        <div className="nav-inner">
          <a href="/" className="nav-brand">
            <span className="nav-logo-blocks">
              <span style={{background:'#CC1111'}}></span>
              <span style={{background:'#1A7A3C'}}></span>
              <span style={{background:'#D4A017'}}></span>
              <span style={{background:'#1E55AA'}}></span>
            </span>
            <span className="nav-title">
              <span className="nav-sppg">SPPG</span>
              <span className="nav-wanted">#WANTED FOR NIGERIA</span>
            </span>
          </a>
          <a href="https://nigeria.thesppg.org/apply" target="_blank" rel="noopener" className="nav-apply-btn">
            Apply Now
          </a>
        </div>
      </nav>

      {/* ── HERO VIDEO ── */}
      <section className="hero">
        <div className="video-wrapper">
          <iframe
            src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${YOUTUBE_VIDEO_ID}&controls=0&disablekb=1&fs=0&rel=0&modestbranding=1&showinfo=0`}
            title="Wanted For Nigeria"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        </div>
        <div className="hero-overlay">
          <div className="hero-content">
            <div className="hero-eyebrow">SPPG CLASS OF 2027</div>
            <h1 className="hero-title">
              Nigeria<br />
              <span className="hero-accent">Needs You.</span>
            </h1>
            <p className="hero-sub">1,000 leaders. The search begins now.</p>
          </div>
        </div>
        <div className="hero-fade" />
      </section>

      {/* ── CAMPAIGN + CTAs ── */}
      <section className="campaign">
        <div className="campaign-inner">
          <div className="campaign-text">
            <div className="section-label">THE MISSION</div>
            <h2 className="campaign-heading">
              The country isn't broken.<br />
              It's <em>waiting</em> for the right people.
            </h2>
            <p className="campaign-body">
              Nigeria doesn't have a resource problem. It has a leadership problem.
              The School of Politics, Policy & Governance is recruiting the next generation
              of public leaders — people with the competence, integrity, and courage to
              fix what's broken.
            </p>
            <p className="campaign-body">
              <strong>40% scholarships available.</strong> Don't let funding be the reason Nigeria loses you.
            </p>
          </div>

          <div className="campaign-ctas">
            <div className="cta-label">Who are you nominating?</div>
            <button
              className={`cta-btn cta-primary ${activeForm === 'someone' ? 'active' : ''}`}
              onClick={() => handleCTAClick('someone')}
            >
              <span className="cta-icon">◉</span>
              <span>
                <span className="cta-btn-title">Nominate Someone</span>
                <span className="cta-btn-sub">You know someone Nigeria needs</span>
              </span>
            </button>
            <button
              className={`cta-btn cta-secondary ${activeForm === 'self' ? 'active' : ''}`}
              onClick={() => handleCTAClick('self')}
            >
              <span className="cta-icon">◈</span>
              <span>
                <span className="cta-btn-title">Nominate Yourself</span>
                <span className="cta-btn-sub">You believe it is you</span>
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* ── SCOREBOARD ── */}
      <section className="scoreboard">
        <div className="scoreboard-inner">
          <div className="score-block">
            <div className="score-number">{score.nominations.toLocaleString()}</div>
            <div className="score-label">Nominated</div>
          </div>

          <div className="score-divider">
            <div className="score-mission">Nigeria needs</div>
            <div className="score-target">1,000</div>
            <div className="score-mission">leaders</div>
          </div>

          <div className="score-block">
            <div className="score-number">{score.applications.toLocaleString()}</div>
            <div className="score-label">Applied</div>
          </div>
        </div>
        <div className="scoreboard-bar">
          <div
            className="scoreboard-fill"
            style={{ width: `${Math.min(100, (score.applications / 1000) * 100)}%` }}
          />
        </div>
        <div className="scoreboard-pct">
          {((score.applications / 1000) * 100).toFixed(1)}% of the way there
        </div>
      </section>

      {/* ── FORM SECTION ── */}
      {activeForm && (
        <section ref={formSectionRef} className="form-section">
          <div className="form-section-inner">
            {/* Header */}
            <div className="form-header">
              <div className="form-header-left">
                <div className="section-label">
                  {activeForm === 'someone' ? 'NOMINATE SOMEONE' : 'NOMINATE YOURSELF'}
                </div>
                <h2 className="form-title">
                  {activeForm === 'someone'
                    ? 'Tell us about them.'
                    : 'Step forward.'}
                </h2>
              </div>
              <button className="form-toggle-btn" onClick={() => handleCTAClick(activeForm === 'someone' ? 'self' : 'someone')}>
                Switch to: {activeForm === 'someone' ? 'Nominate Yourself' : 'Nominate Someone'} →
              </button>
            </div>

            {step === 'form' && activeForm === 'someone' && (
              <form className="nom-form" onSubmit={handleSomeoneSubmit} noValidate>
                {/* Who is the nominator */}
                <div className="form-group full">
                  <label className="form-label">Which of this best describes you?: <span className="req">*</span></label>
                  <div className="checkbox-grid">
                    {NOMINATOR_TYPES.map(t => (
                      <label key={t} className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={someoneForm.nominatorTypes.includes(t)}
                          onChange={() => setSomeoneForm(f => ({
                            ...f, nominatorTypes: toggleArrayItem(f.nominatorTypes, t)
                          }))}
                        />
                        <span>{t}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-row">
                  {/* Nominee details */}
                  <div className="form-col">
                    <div className="form-col-heading">About the Nominee</div>
                    <div className="form-group">
                      <label className="form-label">Nominee's Full Name <span className="req">*</span></label>
                      <input type="text" required value={someoneForm.nomineeName}
                        className={fieldErrors.nomineeName ? 'has-error' : ''}
                        onChange={e => setSomeoneForm(f => ({ ...f, nomineeName: e.target.value }))}
                        placeholder="Full name of the person you're nominating" />
                      {fe('nomineeName')}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Nominee's Email <span className="req">*</span></label>
                      <input type="email" required value={someoneForm.nomineeEmail}
                        className={fieldErrors.nomineeEmail ? 'has-error' : ''}
                        onChange={e => setSomeoneForm(f => ({ ...f, nomineeEmail: e.target.value }))}
                        placeholder="Their email address" />
                      {fe('nomineeEmail')}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Nominee's Gender <span className="req">*</span></label>
                      <select required value={someoneForm.nomineeGender}
                        className={fieldErrors.nomineeGender ? 'has-error' : ''}
                        onChange={e => setSomeoneForm(f => ({ ...f, nomineeGender: e.target.value }))}>
                        <option value="">Select gender</option>
                        <option>Male</option>
                        <option>Female</option>
                      </select>
                      {fe('nomineeGender')}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Nominee's Phone</label>
                      <input type="tel" value={someoneForm.nomineePhone}
                        onChange={e => setSomeoneForm(f => ({ ...f, nomineePhone: e.target.value }))}
                        placeholder="Optional" />
                    </div>
                  </div>

                  {/* Nominator details */}
                  <div className="form-col">
                    <div className="form-col-heading">About You</div>
                    <div className="form-group">
                      <label className="form-label">Your Full Name <span className="req">*</span></label>
                      <input type="text" required value={someoneForm.nominatorName}
                        className={fieldErrors.nominatorName ? 'has-error' : ''}
                        onChange={e => setSomeoneForm(f => ({ ...f, nominatorName: e.target.value }))}
                        placeholder="Your full name" />
                      {fe('nominatorName')}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Your Phone Number <span className="req">*</span></label>
                      <input type="tel" required value={someoneForm.nominatorPhone}
                        className={fieldErrors.nominatorPhone ? 'has-error' : ''}
                        onChange={e => setSomeoneForm(f => ({ ...f, nominatorPhone: e.target.value }))}
                        placeholder="Your phone number" />
                      {fe('nominatorPhone')}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Your Email <span className="req">*</span></label>
                      <input type="email" required value={someoneForm.nominatorEmail}
                        className={fieldErrors.nominatorEmail ? 'has-error' : ''}
                        onChange={e => setSomeoneForm(f => ({ ...f, nominatorEmail: e.target.value }))}
                        placeholder="Your email address" />
                      {fe('nominatorEmail')}
                    </div>
                  </div>
                </div>

                {/* Charges */}
                <div className="form-group">
                  <label className="form-label">What are you charging them with? <span className="req">*</span></label>
                  <select required value={someoneForm.charges}
                    className={fieldErrors.charges ? 'has-error' : ''}
                    onChange={e => setSomeoneForm(f => ({ ...f, charges: e.target.value }))}>
                    <option value="">Select one charge</option>
                    {CHARGES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  {fe('charges')}
                </div>
                <div className="form-group">
                  <label className="form-label">Explain the charges <span className="optional">(optional — will appear on their card)</span></label>
                  <textarea rows="3" value={someoneForm.chargesComment}
                    onChange={e => setSomeoneForm(f => ({ ...f, chargesComment: e.target.value }))}
                    placeholder="e.g. Amaka is a nurse who refuses to collect bribes to admit patients. Nigeria needs her in government." />
                </div>

                {submitError && <div className="form-error">{submitError}</div>}

                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Nomination & Generate Card →'}
                </button>
              </form>
            )}

            {step === 'form' && activeForm === 'self' && (
              <form className="nom-form" onSubmit={handleSelfSubmit} noValidate>
                <div className="form-row">
                  <div className="form-col">
                    <div className="form-group">
                      <label className="form-label">Full Name <span className="req">*</span></label>
                      <input type="text" required value={selfForm.fullName}
                        className={fieldErrors.fullName ? 'has-error' : ''}
                        onChange={e => setSelfForm(f => ({ ...f, fullName: e.target.value }))}
                        placeholder="State your full name correctly" />
                      {fe('fullName')}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email <span className="req">*</span></label>
                      <input type="email" required value={selfForm.email}
                        className={fieldErrors.email ? 'has-error' : ''}
                        onChange={e => setSelfForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="Please put in a functional email" />
                      {fe('email')}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Gender <span className="req">*</span></label>
                      <select required value={selfForm.gender}
                        className={fieldErrors.gender ? 'has-error' : ''}
                        onChange={e => setSelfForm(f => ({ ...f, gender: e.target.value }))}>
                        <option value="">Select gender</option>
                        <option>Male</option>
                        <option>Female</option>
                      </select>
                      {fe('gender')}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number <span className="req">*</span></label>
                      <input type="tel" required value={selfForm.phone}
                        className={fieldErrors.phone ? 'has-error' : ''}
                        onChange={e => setSelfForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder="Your phone number" />
                      {fe('phone')}
                    </div>
                  </div>

                  <div className="form-col">
                    <div className="form-group">
                      <label className="form-label">What are you charging yourself with? <span className="req">*</span></label>
                      <select required value={selfForm.charges}
                        className={fieldErrors.charges ? 'has-error' : ''}
                        onChange={e => setSelfForm(f => ({ ...f, charges: e.target.value }))}>
                        <option value="">Select one charge</option>
                        {CHARGES.map(c => <option key={c}>{c}</option>)}
                      </select>
                      {fe('charges')}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Comment on the charges <span className="optional">(optional)</span></label>
                      <textarea rows="3" value={selfForm.chargesComment}
                        onChange={e => setSelfForm(f => ({ ...f, chargesComment: e.target.value }))}
                        placeholder="Tell us why this charge fits you. This will appear on your card." />
                    </div>
                    <div className="form-group">
                      <label className="form-label">How did you hear about us?</label>
                      <div className="checkbox-grid small">
                        {HOW_HEARD.map(h => (
                          <label key={h} className="checkbox-item">
                            <input
                              type="checkbox"
                              checked={selfForm.howHeard.includes(h)}
                              onChange={() => setSelfForm(f => ({
                                ...f, howHeard: toggleArrayItem(f.howHeard, h)
                              }))}
                            />
                            <span>{h}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {submitError && <div className="form-error">{submitError}</div>}

                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit & Get Your Wanted Card →'}
                </button>
              </form>
            )}

            {/* ── CARD DISPLAY ── */}
            {step === 'card' && cardUrl && (
              <div className="card-section">
                <div className="card-success-msg">
                  <span className="card-success-icon">✓</span>
                  {activeForm === 'someone'
                    ? `Nomination submitted. ${submittedData?.nomineeName}'s card is ready.`
                    : `You're in. Your card is ready.`}
                </div>

                <div className="card-display">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cardUrl} alt="Wanted For Nigeria card" className="card-img" />

                  <div className="card-actions">
                    <div className="card-action-heading">Share this card privately</div>
                    <div className="card-action-buttons">
                      <button className="share-btn whatsapp" onClick={() => shareCard('whatsapp')}>
                        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        WhatsApp
                      </button>
                      <button className="share-btn twitter" onClick={() => shareCard('twitter')}>
                        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.733-8.835L1.254 2.25H8.08l4.259 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        Twitter / X
                      </button>
                      <button className="share-btn telegram" onClick={() => shareCard('telegram')}>
                        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                        Telegram
                      </button>
                      <button className="share-btn download" onClick={downloadCard}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                        Download PNG
                      </button>
                    </div>

                    <div className="card-next-action">
                      {activeForm === 'self' ? (
                        <a href="https://nigeria.thesppg.org/apply" target="_blank" rel="noopener" className="next-action-btn primary">
                          Complete Your Application →
                          <span>nigeria.thesppg.org/apply</span>
                        </a>
                      ) : (
                        <button className="next-action-btn secondary" onClick={() => {
                          setSomeoneForm({ nominatorTypes: [], nomineeName: '', nomineeEmail: '', nomineeGender: '', nomineePhone: '', nominatorName: someoneForm.nominatorName, nominatorPhone: someoneForm.nominatorPhone, nominatorEmail: someoneForm.nominatorEmail, charges: '', chargesComment: '' });
                          setStep('form');
                          setCardUrl(null);
                          formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}>
                          Nominate Another Person →
                          <span>Nigeria needs 1,000 leaders. Keep going.</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-logo-blocks">
              <span style={{background:'#CC1111'}}></span>
              <span style={{background:'#1A7A3C'}}></span>
              <span style={{background:'#D4A017'}}></span>
              <span style={{background:'#1E55AA'}}></span>
            </div>
            <div>
              <div className="footer-school">School of Politics, Policy & Governance</div>
              <div className="footer-tag">#WantedForNigeria · Class of 2027</div>
            </div>
          </div>
          <div className="footer-links">
            <a href="https://thesppg.org" target="_blank" rel="noopener">thesppg.org</a>
            <a href="https://nigeria.thesppg.org/apply" target="_blank" rel="noopener">Apply Now</a>
            <a href="https://twitter.com/thesppg" target="_blank" rel="noopener">@THESPPG</a>
          </div>
        </div>
      </footer>

      {/* ─────────────────────────────────────────────
          STYLES
      ───────────────────────────────────────────── */}
      <style jsx global>{`
        /* NAV */
        .nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          background: rgba(10,10,10,0.92);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .nav-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .nav-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .nav-logo-blocks {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2px;
          width: 28px;
          height: 28px;
          border-radius: 4px;
          overflow: hidden;
        }
        .nav-logo-blocks span {
          display: block;
        }
        .nav-title {
          display: flex;
          flex-direction: column;
          line-height: 1.1;
        }
        .nav-sppg {
          font-family: var(--font-ui);
          font-size: 10px;
          font-weight: 600;
          color: var(--grey);
          letter-spacing: 2px;
        }
        .nav-wanted {
          font-family: var(--font-display);
          font-size: 18px;
          color: var(--white);
          letter-spacing: 1px;
        }
        .nav-apply-btn {
          font-family: var(--font-ui);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          padding: 8px 20px;
          background: var(--red);
          color: var(--white);
          border-radius: 3px;
          transition: background 0.2s;
        }
        .nav-apply-btn:hover { background: var(--red-light); }

        /* HERO */
        .hero {
          position: relative;
          width: 100%;
          padding-top: 56.25%; /* 16:9 */
          overflow: hidden;
        }
        .video-wrapper {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
        }
        .video-wrapper iframe {
          width: 100%;
          height: 100%;
          pointer-events: none;
          border: none;
        }
        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to right, rgba(0,0,0,0.75) 40%, rgba(0,0,0,0.2));
          display: flex;
          align-items: center;
          padding: 0 6%;
          padding-top: 64px;
        }
        .hero-fade {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 40%;
          background: linear-gradient(to bottom, transparent, var(--bg));
          pointer-events: none;
        }
        .hero-content {
          max-width: 560px;
        }
        .hero-eyebrow {
          font-family: var(--font-ui);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 3px;
          color: var(--gold);
          margin-bottom: 16px;
        }
        .hero-title {
          font-family: var(--font-display);
          font-size: clamp(60px, 9vw, 110px);
          line-height: 0.92;
          color: var(--white);
          margin-bottom: 16px;
        }
        .hero-accent {
          color: var(--red-light);
        }
        .hero-sub {
          font-family: var(--font-ui);
          font-size: clamp(14px, 2vw, 18px);
          color: rgba(245,245,240,0.7);
          font-weight: 300;
          letter-spacing: 1px;
        }

        /* CAMPAIGN */
        .campaign {
          background: var(--bg-2);
          padding: 80px 24px;
          border-top: 1px solid var(--border);
        }
        .campaign-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }
        .section-label {
          font-family: var(--font-ui);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 3px;
          color: var(--red);
          margin-bottom: 16px;
        }
        .campaign-heading {
          font-family: var(--font-display);
          font-size: clamp(36px, 4vw, 52px);
          line-height: 1.1;
          color: var(--white);
          margin-bottom: 20px;
        }
        .campaign-heading em {
          font-style: italic;
          color: var(--gold);
        }
        .campaign-body {
          font-family: var(--font-body);
          font-size: 17px;
          color: var(--grey-light);
          line-height: 1.75;
          margin-bottom: 12px;
        }
        .campaign-body strong {
          color: var(--white);
        }
        .cta-label {
          font-family: var(--font-ui);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 2px;
          color: var(--grey);
          margin-bottom: 16px;
          text-transform: uppercase;
        }
        .cta-btn {
          display: flex;
          align-items: center;
          gap: 18px;
          width: 100%;
          padding: 22px 24px;
          border-radius: 6px;
          border: 2px solid transparent;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 12px;
          text-align: left;
        }
        .cta-btn:last-child { margin-bottom: 0; }
        .cta-primary {
          background: var(--red);
          color: var(--white);
        }
        .cta-primary:hover, .cta-primary.active {
          background: var(--red-dark);
          transform: translateY(-1px);
          box-shadow: 0 8px 30px rgba(204,17,17,0.35);
        }
        .cta-secondary {
          background: transparent;
          border-color: var(--gold);
          color: var(--gold);
        }
        .cta-secondary:hover, .cta-secondary.active {
          background: rgba(212,160,23,0.08);
          transform: translateY(-1px);
        }
        .cta-icon {
          font-size: 24px;
          opacity: 0.85;
          flex-shrink: 0;
        }
        .cta-btn > span:last-child {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .cta-btn-title {
          font-family: var(--font-display);
          font-size: 22px;
          letter-spacing: 0.5px;
          display: block;
        }
        .cta-btn-sub {
          font-family: var(--font-ui);
          font-size: 12px;
          font-weight: 300;
          opacity: 0.7;
          letter-spacing: 0.5px;
          display: block;
        }

        /* SCOREBOARD */
        .scoreboard {
          background: var(--bg);
          padding: 64px 24px 48px;
          border-top: 1px solid var(--border);
          text-align: center;
        }
        .scoreboard-inner {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 60px;
          max-width: 800px;
          margin: 0 auto 32px;
        }
        .score-block {
          text-align: center;
        }
        .score-number {
          font-family: var(--font-display);
          font-size: clamp(64px, 10vw, 100px);
          line-height: 1;
          color: var(--white);
          letter-spacing: -2px;
        }
        .score-label {
          font-family: var(--font-ui);
          font-size: 12px;
          letter-spacing: 3px;
          color: var(--grey);
          text-transform: uppercase;
          margin-top: 8px;
        }
        .score-divider {
          text-align: center;
          padding: 0 20px;
        }
        .score-mission {
          font-family: var(--font-ui);
          font-size: 13px;
          letter-spacing: 2px;
          color: var(--grey);
          text-transform: uppercase;
        }
        .score-target {
          font-family: var(--font-display);
          font-size: clamp(38px, 6vw, 60px);
          color: var(--gold);
          line-height: 1.1;
        }
        .scoreboard-bar {
          max-width: 600px;
          margin: 0 auto 12px;
          height: 4px;
          background: rgba(255,255,255,0.08);
          border-radius: 2px;
          overflow: hidden;
        }
        .scoreboard-fill {
          height: 100%;
          background: linear-gradient(to right, var(--red), var(--gold));
          border-radius: 2px;
          transition: width 1s ease;
          min-width: 2px;
        }
        .scoreboard-pct {
          font-family: var(--font-ui);
          font-size: 12px;
          color: var(--grey);
          letter-spacing: 1px;
        }

        /* FORM SECTION */
        .form-section {
          background: var(--bg-2);
          border-top: 1px solid var(--border);
          padding: 64px 24px 80px;
        }
        .form-section-inner {
          max-width: 1100px;
          margin: 0 auto;
        }
        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 40px;
          flex-wrap: wrap;
          gap: 16px;
        }
        .form-title {
          font-family: var(--font-display);
          font-size: clamp(36px, 5vw, 54px);
          color: var(--white);
          line-height: 1;
        }
        .form-toggle-btn {
          font-family: var(--font-ui);
          font-size: 13px;
          color: var(--gold);
          background: none;
          border: 1px solid rgba(212,160,23,0.3);
          padding: 8px 16px;
          border-radius: 3px;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
        }
        .form-toggle-btn:hover {
          background: rgba(212,160,23,0.08);
          border-color: var(--gold);
        }

        /* FORM ELEMENTS */
        .nom-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
        }
        .form-col {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .form-col-heading {
          font-family: var(--font-ui);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 3px;
          color: var(--red);
          text-transform: uppercase;
          padding-bottom: 8px;
          border-bottom: 1px solid var(--border);
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .form-group.full {
          grid-column: 1 / -1;
        }
        .form-label {
          font-family: var(--font-ui);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.5px;
          color: var(--grey-light);
          text-transform: uppercase;
        }
        .req { color: var(--red); }
        .optional {
          font-weight: 300;
          text-transform: none;
          color: var(--grey);
          font-size: 11px;
          letter-spacing: 0;
        }
        .nom-form input:not([type="checkbox"]),
        .nom-form select,
        .nom-form textarea {
          background: var(--bg-3);
          border: 1px solid var(--border);
          color: var(--white);
          padding: 12px 16px;
          font-family: var(--font-ui);
          font-size: 15px;
          font-weight: 300;
          border-radius: 4px;
          width: 100%;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          -webkit-appearance: none;
          appearance: none;
        }
        .nom-form input:not([type="checkbox"]):focus,
        .nom-form select:focus,
        .nom-form textarea:focus {
          border-color: var(--gold);
          background: var(--bg-4);
        }
        .nom-form input:not([type="checkbox"])::placeholder,
        .nom-form textarea::placeholder {
          color: rgba(255,255,255,0.2);
        }
        .nom-form select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          padding-right: 36px;
          cursor: pointer;
        }
        .nom-form select option {
          background: var(--bg-3);
        }
        .nom-form textarea {
          resize: vertical;
          min-height: 88px;
        }

        /* CHECKBOXES */
        .checkbox-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 10px;
        }
        .checkbox-grid.small {
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        }
        .checkbox-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background: var(--bg-3);
          border: 1px solid var(--border);
          border-radius: 4px;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
          font-family: var(--font-ui);
          font-size: 13px;
          font-weight: 300;
          color: var(--grey-light);
        }
        .checkbox-item:hover {
          border-color: rgba(212,160,23,0.4);
          background: var(--bg-4);
        }
        .checkbox-item input[type="checkbox"] {
          width: 16px !important;
          height: 16px !important;
          padding: 0 !important;
          min-width: unset !important;
          flex-shrink: 0;
          accent-color: var(--gold);
          border: none !important;
          background: none !important;
        }

        /* FORM ERROR */
        .form-error {
          background: rgba(204,17,17,0.12);
          border: 1px solid rgba(204,17,17,0.4);
          color: #FF7777;
          padding: 12px 16px;
          border-radius: 4px;
          font-family: var(--font-ui);
          font-size: 14px;
        }
        .field-error {
          display: block;
          font-family: var(--font-ui);
          font-size: 12px;
          color: #FF6666;
          margin-top: 4px;
          letter-spacing: 0.3px;
        }
        .has-error {
          border-color: rgba(204,17,17,0.7) !important;
          background: rgba(204,17,17,0.06) !important;
        }

        /* SUBMIT BUTTON */
        .submit-btn {
          width: 100%;
          padding: 20px 32px;
          background: var(--red);
          color: #FFFFFF;
          font-family: var(--font-display);
          font-size: 24px;
          letter-spacing: 2px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
          text-transform: uppercase;
          box-shadow: 0 4px 20px rgba(204,17,17,0.4);
        }
        .submit-btn:hover:not(:disabled) {
          background: #991010;
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(204,17,17,0.5);
        }
        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* CARD SECTION */
        .card-section {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        .card-success-msg {
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: var(--font-ui);
          font-size: 16px;
          color: var(--white);
          background: rgba(26,122,60,0.15);
          border: 1px solid rgba(26,122,60,0.35);
          padding: 14px 20px;
          border-radius: 5px;
        }
        .card-success-icon {
          width: 24px;
          height: 24px;
          background: var(--green);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          flex-shrink: 0;
        }
        .card-display {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 48px;
          align-items: start;
        }
        .card-img {
          max-width: 360px;
          width: 100%;
          border-radius: 8px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.6);
        }
        .card-actions {
          display: flex;
          flex-direction: column;
          gap: 24px;
          padding-top: 8px;
        }
        .card-action-heading {
          font-family: var(--font-ui);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 3px;
          color: var(--grey);
          text-transform: uppercase;
        }
        .card-action-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .share-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 13px 16px;
          border-radius: 5px;
          border: none;
          font-family: var(--font-ui);
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: opacity 0.15s, transform 0.1s;
        }
        .share-btn:hover { opacity: 0.88; transform: translateY(-1px); }
        .share-btn:active { transform: translateY(0); }
        .share-btn.whatsapp { background: #25D366; color: #000; }
        .share-btn.twitter  { background: #000000; color: #fff; border: 1px solid #333; }
        .share-btn.telegram { background: #0088cc; color: #fff; }
        .share-btn.download { background: var(--gold); color: #000; }

        .card-next-action {
          margin-top: 8px;
          border-top: 1px solid var(--border);
          padding-top: 24px;
        }
        .next-action-btn {
          display: flex;
          flex-direction: column;
          gap: 4px;
          width: 100%;
          padding: 18px 22px;
          border-radius: 5px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }
        .next-action-btn.primary {
          background: var(--green);
          border: none;
          color: var(--white);
          font-family: var(--font-display);
          font-size: 20px;
          letter-spacing: 0.5px;
          text-decoration: none;
        }
        .next-action-btn.primary:hover {
          background: var(--green-dark);
        }
        .next-action-btn.secondary {
          background: transparent;
          border: 1px solid rgba(212,160,23,0.4);
          color: var(--gold);
          font-family: var(--font-display);
          font-size: 20px;
          letter-spacing: 0.5px;
        }
        .next-action-btn.secondary:hover {
          background: rgba(212,160,23,0.06);
        }
        .next-action-btn span {
          font-family: var(--font-ui);
          font-size: 11px;
          font-weight: 300;
          opacity: 0.65;
          letter-spacing: 0.5px;
          display: block;
          text-transform: none;
        }

        /* FOOTER */
        .footer {
          background: var(--bg);
          border-top: 1px solid var(--border);
          padding: 40px 24px;
        }
        .footer-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 24px;
        }
        .footer-brand {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .footer-logo-blocks {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2px;
          width: 32px;
          height: 32px;
          border-radius: 5px;
          overflow: hidden;
        }
        .footer-logo-blocks span { display: block; }
        .footer-school {
          font-family: var(--font-ui);
          font-size: 13px;
          font-weight: 600;
          color: var(--white);
        }
        .footer-tag {
          font-family: var(--font-ui);
          font-size: 11px;
          color: var(--grey);
          letter-spacing: 1px;
        }
        .footer-links {
          display: flex;
          gap: 24px;
        }
        .footer-links a {
          font-family: var(--font-ui);
          font-size: 13px;
          color: var(--grey);
          transition: color 0.2s;
        }
        .footer-links a:hover { color: var(--white); }

       /* ── RESPONSIVE ── */
      @media (max-width: 768px) {
        .hero { padding-top: 75%; }
        .hero-title { font-size: 52px; }

        .campaign {
          padding: 40px 20px;
        }
        .campaign-inner {
          grid-template-columns: 1fr;
          gap: 32px;
        }
        .campaign-heading {
          font-size: 32px;
        }
        .campaign-text {
          order: 1;
        }
        .campaign-ctas {
          order: 2;
          width: 100%;
        }
        .cta-btn {
          padding: 18px 20px;
        }
        .cta-btn-title {
          font-size: 20px;
        }
        .cta-btn-sub {
          font-size: 12px;
        }

        .scoreboard-inner {
          gap: 24px;
        }
        .score-number { font-size: 56px; }
        .score-target { font-size: 38px; }

        .form-section { padding: 40px 16px 60px; }
        .form-row { grid-template-columns: 1fr; gap: 20px; }
        .form-header { flex-direction: column; align-items: flex-start; }
        .form-toggle-btn { font-size: 12px; padding: 7px 12px; }

        .card-display {
          grid-template-columns: 1fr;
          gap: 24px;
        }
        .card-img { max-width: 100%; }

        .footer-inner { flex-direction: column; align-items: flex-start; }
        .footer-links { flex-wrap: wrap; gap: 16px; }

        .nav-wanted { font-size: 14px; }

        .checkbox-grid { grid-template-columns: 1fr 1fr; }

        .card-action-buttons {
          grid-template-columns: 1fr 1fr;
        }
      }

      @media (max-width: 480px) {
        .hero-title { font-size: 42px; }
        .campaign-heading { font-size: 28px; }
        .score-number { font-size: 48px; }
        .checkbox-grid { grid-template-columns: 1fr; }
        .cta-btn-title { font-size: 18px; }
        .card-action-buttons { grid-template-columns: 1fr; }
      }
      `}</style>
    </>
  );
}
