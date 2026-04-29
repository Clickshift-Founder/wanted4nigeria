// pages/index.js
import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

const CHARGES = [
  'INTEGRITY', 'COMPETENCE', 'ACCOUNTABILITY', 'TRANSPARENCY',
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

export default function Home() {
  const [activeForm, setActiveForm] = useState(null);
  const [step, setStep] = useState('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submittedData, setSubmittedData] = useState(null);
  const [score, setScore] = useState({ nominations: 0, applications: 0 });
  const formSectionRef = useRef(null);

  const [someoneForm, setSomeoneForm] = useState({
    nominatorTypes: [], nomineeName: '', nomineeEmail: '',
    nomineeGender: '', nomineePhone: '', nominatorName: '',
    nominatorPhone: '', nominatorEmail: '', charges: '', chargesComment: '',
  });

  const [selfForm, setSelfForm] = useState({
    fullName: '', email: '', gender: '', phone: '',
    charges: '', chargesComment: '', howHeard: [],
  });

  useEffect(() => {
    fetchScore();
    const interval = setInterval(fetchScore, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  async function fetchScore() {
    try {
      const res = await fetch('/api/scoreboard');
      if (res.ok) setScore(await res.json());
    } catch (_) {}
  }

  function toggleArrayItem(arr, item) {
    return arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item];
  }

  function handleCTAClick(type) {
    setActiveForm(type);
    setStep('form');
    setSubmitError('');
    setFieldErrors({});
    setSubmittedData(null);
    setTimeout(() => {
      formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  }

  function validateSomeoneForm(f) {
    const errs = {};
    if (!f.nomineeName.trim())    errs.nomineeName    = 'Required';
    if (!f.nomineeEmail.trim())   errs.nomineeEmail   = 'Required';
    else if (!/\S+@\S+\.\S+/.test(f.nomineeEmail)) errs.nomineeEmail = 'Enter a valid email';
    if (!f.nomineeGender)         errs.nomineeGender  = 'Required';
    if (!f.nominatorName.trim())  errs.nominatorName  = 'Required';
    if (!f.nominatorPhone.trim()) errs.nominatorPhone = 'Required';
    if (!f.nominatorEmail.trim()) errs.nominatorEmail = 'Required';
    else if (!/\S+@\S+\.\S+/.test(f.nominatorEmail)) errs.nominatorEmail = 'Enter a valid email';
    if (!f.charges)               errs.charges        = 'Select a charge';
    return errs;
  }

  function validateSelfForm(f) {
    const errs = {};
    if (!f.fullName.trim()) errs.fullName = 'Required';
    if (!f.email.trim())    errs.email    = 'Required';
    else if (!/\S+@\S+\.\S+/.test(f.email)) errs.email = 'Enter a valid email';
    if (!f.gender)          errs.gender   = 'Required';
    if (!f.phone.trim())    errs.phone    = 'Required';
    if (!f.charges)         errs.charges  = 'Select a charge';
    return errs;
  }

  const fe = (key) => fieldErrors[key]
    ? <span className="field-error">{fieldErrors[key]}</span>
    : null;

  async function handleSomeoneSubmit(e) {
    e.preventDefault();
    const errs = validateSomeoneForm(someoneForm);
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }
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
      setScore(s => ({ ...s, nominations: s.nominations + 1 }));
      setSubmittedData(someoneForm);
      setStep('success');
      setTimeout(() => {
        formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSelfSubmit(e) {
    e.preventDefault();
    const errs = validateSelfForm(selfForm);
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }
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
      setStep('success');
      setTimeout(() => {
        formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function resetSomeoneForm() {
    setSomeoneForm({
      nominatorTypes: [], nomineeName: '', nomineeEmail: '',
      nomineeGender: '', nomineePhone: '',
      nominatorName: someoneForm.nominatorName,
      nominatorPhone: someoneForm.nominatorPhone,
      nominatorEmail: someoneForm.nominatorEmail,
      charges: '', chargesComment: '',
    });
    setStep('form');
    setSubmittedData(null);
    setSubmitError('');
    formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <>
      <Head>
        <title>Wanted For Nigeria — SPPG Class of 2027</title>
        <meta name="description" content="Nigeria needs 1,000 leaders. Do you know one? Nominate them for the SPPG Class of 2027." />
        <meta property="og:title" content="#WantedForNigeria" />
        <meta property="og:description" content="Nigeria needs 1,000 leaders. Is this you?" />
        <meta property="og:image" content="/wanted.jpg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      {/* NAV */}
      <nav className="nav">
        <div className="nav-inner">
          <a href="/" className="nav-brand">
            <div className="nav-logo-blocks">
              <span style={{background:'#CC1111'}}></span>
              <span style={{background:'#1A7A3C'}}></span>
              <span style={{background:'#D4A017'}}></span>
              <span style={{background:'#1E55AA'}}></span>
            </div>
            <div className="nav-title">
              <span className="nav-sppg">SPPG</span>
              <span className="nav-wanted">#WANTED FOR NIGERIA</span>
            </div>
          </a>
          <a href="https://nigeria.thesppg.org/apply" target="_blank" rel="noopener" className="nav-apply-btn">
            Apply Now
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-img-wrap">
          <img src="/wanted.jpg" alt="Wanted For Nigeria" className="hero-img" />
        </div>
        <div className="hero-overlay">
          <div className="hero-content">
            <div className="hero-eyebrow">SPPG CLASS OF 2027</div>
            <h1 className="hero-title">
              Nigeria<br />
              <span className="hero-accent">Needs You.</span>
            </h1>
            <p className="hero-sub">1,000 leaders. The search begins now.</p>
            <div className="hero-btns">
              <button className="hero-btn-primary" onClick={() => handleCTAClick('someone')}>
                Nominate Someone
              </button>
              <button className="hero-btn-secondary" onClick={() => handleCTAClick('self')}>
                Nominate Yourself
              </button>
            </div>
          </div>
        </div>
        <div className="hero-fade" />
      </section>

      {/* CAMPAIGN */}
      <section className="campaign">
        <div className="campaign-inner">
          <div className="campaign-text">
            <div className="section-label">THE MISSION</div>
            <h2 className="campaign-heading">
              The country isn&apos;t broken.<br />
              It&apos;s <em>waiting</em> for the right people.
            </h2>
            <p className="campaign-body">
              Nigeria doesn&apos;t have a resource problem. It has a leadership problem.
              The School of Politics, Policy &amp; Governance is recruiting the next generation
              of public leaders &mdash; people with the competence, integrity, and courage to
              fix what&apos;s broken.
            </p>
            <p className="campaign-body scholarship-line">
              <strong>40% scholarships available.</strong> Don&apos;t let funding be the reason Nigeria loses you.
            </p>
          </div>

          <div className="campaign-ctas">
            <div className="cta-label">Who are you nominating?</div>
            <button
              className={`cta-btn cta-primary${activeForm === 'someone' ? ' active' : ''}`}
              onClick={() => handleCTAClick('someone')}
            >
              <span className="cta-icon">&#9711;</span>
              <span className="cta-btn-text">
                <span className="cta-btn-title">Nominate Someone</span>
                <span className="cta-btn-sub">You know someone Nigeria needs</span>
              </span>
            </button>
            <button
              className={`cta-btn cta-secondary${activeForm === 'self' ? ' active' : ''}`}
              onClick={() => handleCTAClick('self')}
            >
              <span className="cta-icon">&#9672;</span>
              <span className="cta-btn-text">
                <span className="cta-btn-title">Nominate Yourself</span>
                <span className="cta-btn-sub">You believe it is you</span>
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* SCOREBOARD */}
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
            style={{ width: `${Math.min(100, Math.max(0.3, (score.applications / 1000) * 100))}%` }}
          />
        </div>
        <div className="scoreboard-pct">
          {((score.applications / 1000) * 100).toFixed(1)}% of the way there
        </div>
      </section>

      {/* FORM SECTION */}
      {activeForm && (
        <section ref={formSectionRef} className="form-section">
          <div className="form-section-inner">

            {/* SUCCESS: self */}
            {step === 'success' && activeForm === 'self' && (
              <div className="success-screen">
                <div className="success-icon">&#10003;</div>
                <div className="success-eyebrow">Nomination received</div>
                <h2 className="success-heading">
                  You&apos;ve been charged.<br />Now answer the call.
                </h2>
                <p className="success-body">
                  Nigeria is waiting for people like you. The next step is your application.
                  Take it now &mdash; <strong>40% scholarships available</strong>.
                </p>
                <a
                  href="https://nigeria.thesppg.org/apply"
                  target="_blank"
                  rel="noopener"
                  className="success-cta-btn"
                >
                  Complete Your Application &rarr;
                </a>
                <button className="success-secondary-btn" onClick={() => handleCTAClick('self')}>
                  &larr; Nominate again
                </button>
              </div>
            )}

            {/* SUCCESS: someone */}
            {step === 'success' && activeForm === 'someone' && (
              <div className="success-screen">
                <div className="success-icon">&#10003;</div>
                <div className="success-eyebrow">Nomination submitted</div>
                <h2 className="success-heading">
                  {submittedData?.nomineeName} has been nominated.
                </h2>
                <p className="success-body">
                  Nigeria needs 1,000 leaders. You&apos;ve found one &mdash; don&apos;t stop here.
                  Every nomination brings the country one step closer.
                </p>
                <button className="success-cta-btn" onClick={resetSomeoneForm}>
                  Nominate Another Person &rarr;
                </button>
                <a
                  href="https://nigeria.thesppg.org/apply"
                  target="_blank"
                  rel="noopener"
                  className="success-secondary-btn"
                >
                  Apply yourself instead
                </a>
              </div>
            )}

            {/* FORMS */}
            {step === 'form' && (
              <>
                <div className="form-header">
                  <div className="form-header-left">
                    <div className="section-label">
                      {activeForm === 'someone' ? 'NOMINATE SOMEONE' : 'NOMINATE YOURSELF'}
                    </div>
                    <h2 className="form-title">
                      {activeForm === 'someone' ? 'Tell us about them.' : 'Step forward.'}
                    </h2>
                  </div>
                  <button
                    className="form-toggle-btn"
                    onClick={() => handleCTAClick(activeForm === 'someone' ? 'self' : 'someone')}
                  >
                    Switch: {activeForm === 'someone' ? 'Nominate Yourself' : 'Nominate Someone'} &rarr;
                  </button>
                </div>

                {activeForm === 'someone' && (
                  <form className="nom-form" onSubmit={handleSomeoneSubmit} noValidate>
                    <div className="form-group full">
                      <label className="form-label">Which of this best describes you?</label>
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
                      <div className="form-col">
                        <div className="form-col-heading">About the Nominee</div>
                        <div className="form-group">
                          <label className="form-label">Nominee&apos;s Full Name <span className="req">*</span></label>
                          <input type="text" required value={someoneForm.nomineeName}
                            className={fieldErrors.nomineeName ? 'has-error' : ''}
                            onChange={e => setSomeoneForm(f => ({ ...f, nomineeName: e.target.value }))}
                            placeholder="Full name of the person you're nominating" />
                          {fe('nomineeName')}
                        </div>
                        <div className="form-group">
                          <label className="form-label">Nominee&apos;s Email <span className="req">*</span></label>
                          <input type="email" required value={someoneForm.nomineeEmail}
                            className={fieldErrors.nomineeEmail ? 'has-error' : ''}
                            onChange={e => setSomeoneForm(f => ({ ...f, nomineeEmail: e.target.value }))}
                            placeholder="Their email address" />
                          {fe('nomineeEmail')}
                        </div>
                        <div className="form-group">
                          <label className="form-label">Nominee&apos;s Gender <span className="req">*</span></label>
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
                          <label className="form-label">Nominee&apos;s Phone <span className="optional">(optional)</span></label>
                          <input type="tel" value={someoneForm.nomineePhone}
                            onChange={e => setSomeoneForm(f => ({ ...f, nomineePhone: e.target.value }))}
                            placeholder="Their phone number" />
                        </div>
                      </div>

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
                        <div className="form-group">
                          <label className="form-label">Charge <span className="req">*</span></label>
                          <select required value={someoneForm.charges}
                            className={fieldErrors.charges ? 'has-error' : ''}
                            onChange={e => setSomeoneForm(f => ({ ...f, charges: e.target.value }))}>
                            <option value="">Select one charge</option>
                            {CHARGES.map(c => <option key={c}>{c}</option>)}
                          </select>
                          {fe('charges')}
                        </div>
                        <div className="form-group">
                          <label className="form-label">Explain the charges <span className="optional">(optional)</span></label>
                          <textarea rows="3" value={someoneForm.chargesComment}
                            onChange={e => setSomeoneForm(f => ({ ...f, chargesComment: e.target.value }))}
                            placeholder="e.g. Amaka is a nurse who refuses to collect bribes to admit patients. Nigeria needs her." />
                        </div>
                      </div>
                    </div>

                    {submitError && <div className="form-error">{submitError}</div>}
                    <button type="submit" className="submit-btn" disabled={isSubmitting}>
                      {isSubmitting ? 'Submitting\u2026' : 'Submit Nomination \u2192'}
                    </button>
                  </form>
                )}

                {activeForm === 'self' && (
                  <form className="nom-form" onSubmit={handleSelfSubmit} noValidate>
                    <div className="form-row">
                      <div className="form-col">
                        <div className="form-col-heading">About You</div>
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
                            placeholder="A functional email address" />
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
                        <div className="form-col-heading">Your Charge</div>
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
                          <textarea rows="4" value={selfForm.chargesComment}
                            onChange={e => setSelfForm(f => ({ ...f, chargesComment: e.target.value }))}
                            placeholder="Tell us why this charge fits you." />
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
                      {isSubmitting ? 'Submitting\u2026' : 'Submit & Proceed to Application \u2192'}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-logo-blocks">
              <span style={{background:'#CC1111'}}></span>
              <span style={{background:'#1A7A3C'}}></span>
              <span style={{background:'#D4A017'}}></span>
              <span style={{background:'#1E55AA'}}></span>
            </div>
            <div className="footer-brand-text">
              <div className="footer-school">School of Politics, Policy &amp; Governance</div>
              <div className="footer-tag">#WantedForNigeria &middot; Class of 2027</div>
              <div className="footer-tagline">
                Nigeria doesn&apos;t have a resource problem.<br />
                It has a leadership problem.
              </div>
            </div>
          </div>
          <div className="footer-links">
            <a href="https://thesppg.org" target="_blank" rel="noopener">thesppg.org</a>
            <a href="https://nigeria.thesppg.org/apply" target="_blank" rel="noopener">Apply Now &rarr;</a>
            <a href="https://twitter.com/thesppg" target="_blank" rel="noopener">@THESPPG</a>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copy">
            &copy; {new Date().getFullYear()} School of Politics, Policy &amp; Governance. All rights reserved.
          </div>
          <div className="footer-hashtag">#WANTEDFORNIGERIA</div>
        </div>
      </footer>

      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg:#0D0D0D; --bg-2:#141414; --bg-3:#1C1C1C; --bg-4:#242424;
          --red:#CC1111; --red-dark:#991010; --red-light:#E53333;
          --green:#1A7A3C; --green-dark:#0E5526;
          --gold:#D4A017; --gold-light:#F0BB2A;
          --white:#F5F5F0; --grey:#888888; --grey-light:#BBBBBB;
          --border:rgba(255,255,255,0.08);
          --font-display:'Bebas Neue',Impact,'Arial Narrow',sans-serif;
          --font-ui:'Oswald','Arial Narrow',sans-serif;
          --font-body:'Lora',Georgia,serif;
        }
        html { scroll-behavior: smooth; }
        body { background:var(--bg); color:var(--white); font-family:var(--font-body); font-size:16px; line-height:1.6; -webkit-font-smoothing:antialiased; }
        input,select,textarea,button { font-family:inherit; }
        a { color:inherit; text-decoration:none; }
        img { max-width:100%; display:block; }
        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-track { background:var(--bg); }
        ::-webkit-scrollbar-thumb { background:var(--red); border-radius:3px; }

        /* NAV */
        .nav { position:fixed; top:0; left:0; right:0; z-index:100; background:rgba(10,10,10,0.94); backdrop-filter:blur(14px); border-bottom:1px solid rgba(255,255,255,0.06); }
        .nav-inner { max-width:1200px; margin:0 auto; padding:0 24px; height:64px; display:flex; align-items:center; justify-content:space-between; }
        .nav-brand { display:flex; align-items:center; gap:12px; }
        .nav-logo-blocks { display:grid; grid-template-columns:1fr 1fr; gap:2px; width:30px; height:30px; border-radius:4px; overflow:hidden; flex-shrink:0; }
        .nav-logo-blocks span { display:block; }
        .nav-title { display:flex; flex-direction:column; line-height:1.1; }
        .nav-sppg { font-family:var(--font-ui); font-size:10px; font-weight:600; color:var(--grey); letter-spacing:2px; }
        .nav-wanted { font-family:var(--font-display); font-size:18px; color:var(--white); letter-spacing:1px; }
        .nav-apply-btn { font-family:var(--font-ui); font-size:13px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; padding:10px 24px; background:var(--red); color:var(--white); border-radius:4px; border:none; cursor:pointer; transition:background 0.2s,transform 0.1s; box-shadow:0 2px 12px rgba(204,17,17,0.35); }
        .nav-apply-btn:hover { background:var(--red-dark); transform:translateY(-1px); }

        /* HERO */
        .hero { position:relative; width:100%; min-height:100vh; overflow:hidden; padding-top:64px; }
        .hero-img-wrap { position:absolute; inset:0; }
        .hero-img { width:100%; height:100%; object-fit:cover; object-position:center top; }
        .hero-overlay { position:relative; z-index:2; min-height:calc(100vh - 64px); display:flex; align-items:center; padding:60px 6%; background:linear-gradient(to right,rgba(0,0,0,0.82) 0%,rgba(0,0,0,0.55) 55%,rgba(0,0,0,0.1) 100%); }
        .hero-fade { position:absolute; bottom:0; left:0; right:0; height:220px; background:linear-gradient(to bottom,transparent,var(--bg)); pointer-events:none; z-index:3; }
        .hero-content { max-width:580px; position:relative; z-index:4; }
        .hero-eyebrow { font-family:var(--font-ui); font-size:13px; font-weight:700; letter-spacing:4px; color:var(--gold); margin-bottom:20px; text-transform:uppercase; }
        .hero-title { font-family:var(--font-display); font-size:clamp(72px,10vw,130px); line-height:0.9; color:var(--white); margin-bottom:20px; }
        .hero-accent { color:var(--red-light); }
        .hero-sub { font-family:var(--font-ui); font-size:clamp(15px,2vw,20px); color:rgba(245,245,240,0.75); font-weight:300; letter-spacing:1.5px; margin-bottom:40px; }
        .hero-btns { display:flex; gap:14px; flex-wrap:wrap; }
        .hero-btn-primary { font-family:var(--font-display); font-size:22px; letter-spacing:1px; padding:16px 36px; background:var(--red); color:var(--white); border:none; border-radius:5px; cursor:pointer; transition:background 0.2s,transform 0.15s,box-shadow 0.2s; box-shadow:0 4px 20px rgba(204,17,17,0.4); }
        .hero-btn-primary:hover { background:var(--red-dark); transform:translateY(-2px); box-shadow:0 8px 30px rgba(204,17,17,0.5); }
        .hero-btn-secondary { font-family:var(--font-display); font-size:22px; letter-spacing:1px; padding:14px 36px; background:transparent; color:var(--gold); border:2px solid var(--gold); border-radius:5px; cursor:pointer; transition:all 0.2s; }
        .hero-btn-secondary:hover { background:rgba(212,160,23,0.1); transform:translateY(-2px); }

        /* CAMPAIGN */
        .campaign { background:var(--bg-2); padding:88px 24px; border-top:1px solid var(--border); }
        .campaign-inner { max-width:1100px; margin:0 auto; display:grid; grid-template-columns:1fr 1fr; gap:80px; align-items:center; }
        .section-label { font-family:var(--font-ui); font-size:11px; font-weight:700; letter-spacing:3px; color:var(--red); margin-bottom:16px; text-transform:uppercase; }
        .campaign-heading { font-family:var(--font-display); font-size:clamp(36px,4vw,54px); line-height:1.08; color:var(--white); margin-bottom:24px; }
        .campaign-heading em { font-style:italic; color:var(--gold); }
        .campaign-body { font-family:var(--font-body); font-size:17px; color:var(--grey-light); line-height:1.8; margin-bottom:16px; }
        .campaign-body strong { color:var(--white); }
        .scholarship-line { background:rgba(212,160,23,0.07); border-left:3px solid var(--gold); padding:12px 16px; border-radius:0 4px 4px 0; margin-top:8px; }
        .cta-label { font-family:var(--font-ui); font-size:11px; font-weight:700; letter-spacing:3px; color:var(--grey); margin-bottom:18px; text-transform:uppercase; }
        .cta-btn { display:flex; align-items:center; gap:20px; width:100%; padding:24px 28px; border-radius:8px; border:2px solid transparent; cursor:pointer; transition:all 0.2s; margin-bottom:14px; text-align:left; }
        .cta-btn:last-child { margin-bottom:0; }
        .cta-primary { background:var(--red); color:var(--white); box-shadow:0 4px 20px rgba(204,17,17,0.3); }
        .cta-primary:hover, .cta-primary.active { background:var(--red-dark); transform:translateY(-2px); box-shadow:0 8px 32px rgba(204,17,17,0.45); }
        .cta-secondary { background:transparent; border-color:var(--gold); color:var(--gold); }
        .cta-secondary:hover, .cta-secondary.active { background:rgba(212,160,23,0.08); transform:translateY(-2px); box-shadow:0 4px 20px rgba(212,160,23,0.15); }
        .cta-icon { font-size:26px; opacity:0.85; flex-shrink:0; }
        .cta-btn-text { display:flex; flex-direction:column; gap:4px; }
        .cta-btn-title { font-family:var(--font-display); font-size:24px; letter-spacing:0.5px; display:block; line-height:1; }
        .cta-btn-sub { font-family:var(--font-ui); font-size:13px; font-weight:300; opacity:0.75; letter-spacing:0.5px; display:block; }

        /* SCOREBOARD */
        .scoreboard { background:var(--bg); padding:72px 24px 56px; border-top:1px solid var(--border); text-align:center; }
        .scoreboard-inner { display:flex; justify-content:center; align-items:center; gap:64px; max-width:800px; margin:0 auto 36px; }
        .score-block { text-align:center; }
        .score-number { font-family:var(--font-display); font-size:clamp(64px,10vw,100px); line-height:1; color:var(--white); letter-spacing:-2px; }
        .score-label { font-family:var(--font-ui); font-size:12px; letter-spacing:3px; color:var(--grey); text-transform:uppercase; margin-top:8px; }
        .score-divider { text-align:center; padding:0 24px; }
        .score-mission { font-family:var(--font-ui); font-size:13px; letter-spacing:2px; color:var(--grey); text-transform:uppercase; }
        .score-target { font-family:var(--font-display); font-size:clamp(40px,6vw,64px); color:var(--gold); line-height:1.1; }
        .scoreboard-bar { max-width:600px; margin:0 auto 14px; height:5px; background:rgba(255,255,255,0.07); border-radius:3px; overflow:hidden; }
        .scoreboard-fill { height:100%; background:linear-gradient(to right,var(--red),var(--gold)); border-radius:3px; transition:width 1.2s ease; min-width:3px; }
        .scoreboard-pct { font-family:var(--font-ui); font-size:12px; color:var(--grey); letter-spacing:1px; }

        /* FORM SECTION */
        .form-section { background:var(--bg-2); border-top:1px solid var(--border); padding:72px 24px 88px; }
        .form-section-inner { max-width:1100px; margin:0 auto; }
        .form-header { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:44px; flex-wrap:wrap; gap:16px; }
        .form-title { font-family:var(--font-display); font-size:clamp(38px,5vw,58px); color:var(--white); line-height:1; }
        .form-toggle-btn { font-family:var(--font-ui); font-size:13px; color:var(--gold); background:none; border:1px solid rgba(212,160,23,0.35); padding:10px 18px; border-radius:4px; cursor:pointer; white-space:nowrap; transition:all 0.2s; letter-spacing:0.3px; }
        .form-toggle-btn:hover { background:rgba(212,160,23,0.08); border-color:var(--gold); }

        /* FORM ELEMENTS */
        .nom-form { display:flex; flex-direction:column; gap:28px; }
        .form-row { display:grid; grid-template-columns:1fr 1fr; gap:36px; }
        .form-col { display:flex; flex-direction:column; gap:22px; }
        .form-col-heading { font-family:var(--font-ui); font-size:11px; font-weight:700; letter-spacing:3px; color:var(--red); text-transform:uppercase; padding-bottom:10px; border-bottom:1px solid var(--border); }
        .form-group { display:flex; flex-direction:column; gap:8px; }
        .form-group.full { grid-column:1/-1; }
        .form-label { font-family:var(--font-ui); font-size:12px; font-weight:700; letter-spacing:1px; color:var(--grey-light); text-transform:uppercase; }
        .req { color:var(--red); }
        .optional { font-weight:300; text-transform:none; color:var(--grey); font-size:11px; letter-spacing:0; }
        .nom-form input:not([type="checkbox"]), .nom-form select, .nom-form textarea { background:var(--bg-3); border:1px solid var(--border); color:var(--white); padding:13px 16px; font-family:var(--font-ui); font-size:15px; font-weight:300; border-radius:5px; width:100%; outline:none; transition:border-color 0.2s,background 0.2s; -webkit-appearance:none; appearance:none; }
        .nom-form input:not([type="checkbox"]):focus, .nom-form select:focus, .nom-form textarea:focus { border-color:var(--gold); background:var(--bg-4); }
        .nom-form input:not([type="checkbox"])::placeholder, .nom-form textarea::placeholder { color:rgba(255,255,255,0.18); }
        .nom-form select { background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 14px center; padding-right:38px; cursor:pointer; }
        .nom-form select option { background:var(--bg-3); }
        .nom-form textarea { resize:vertical; min-height:96px; }

        /* CHECKBOXES */
        .checkbox-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:10px; }
        .checkbox-grid.small { grid-template-columns:repeat(auto-fill,minmax(170px,1fr)); }
        .checkbox-item { display:flex; align-items:center; gap:10px; padding:10px 14px; background:var(--bg-3); border:1px solid var(--border); border-radius:5px; cursor:pointer; transition:border-color 0.15s,background 0.15s; font-family:var(--font-ui); font-size:13px; font-weight:300; color:var(--grey-light); user-select:none; }
        .checkbox-item:hover { border-color:rgba(212,160,23,0.45); background:var(--bg-4); }
        .checkbox-item input[type="checkbox"] { width:16px !important; height:16px !important; padding:0 !important; min-width:unset !important; flex-shrink:0; accent-color:var(--gold); border:none !important; background:none !important; cursor:pointer; }

        /* ERRORS */
        .form-error { background:rgba(204,17,17,0.1); border:1px solid rgba(204,17,17,0.4); color:#FF8080; padding:14px 18px; border-radius:5px; font-family:var(--font-ui); font-size:14px; }
        .field-error { display:block; font-family:var(--font-ui); font-size:12px; color:#FF6666; margin-top:4px; letter-spacing:0.3px; }
        .has-error { border-color:rgba(204,17,17,0.65) !important; background:rgba(204,17,17,0.05) !important; }

        /* SUBMIT */
        .submit-btn { width:100%; padding:20px 32px; background:var(--red); color:#FFF; font-family:var(--font-display); font-size:26px; letter-spacing:2px; border:none; border-radius:6px; cursor:pointer; transition:background 0.2s,transform 0.12s,box-shadow 0.2s; text-transform:uppercase; box-shadow:0 4px 24px rgba(204,17,17,0.4); }
        .submit-btn:hover:not(:disabled) { background:var(--red-dark); transform:translateY(-2px); box-shadow:0 8px 32px rgba(204,17,17,0.55); }
        .submit-btn:active:not(:disabled) { transform:translateY(0); }
        .submit-btn:disabled { opacity:0.5; cursor:not-allowed; }

        /* SUCCESS SCREEN */
        .success-screen { display:flex; flex-direction:column; align-items:center; text-align:center; padding:56px 24px; max-width:640px; margin:0 auto; }
        .success-icon { width:68px; height:68px; background:var(--green); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:30px; color:white; margin-bottom:28px; box-shadow:0 8px 32px rgba(26,122,60,0.45); }
        .success-eyebrow { font-family:var(--font-ui); font-size:11px; font-weight:700; letter-spacing:3px; color:var(--green); text-transform:uppercase; margin-bottom:14px; }
        .success-heading { font-family:var(--font-display); font-size:clamp(36px,5vw,52px); color:var(--white); line-height:1.1; margin-bottom:20px; }
        .success-body { font-family:var(--font-body); font-size:17px; color:var(--grey-light); line-height:1.75; margin-bottom:40px; }
        .success-body strong { color:var(--white); }
        .success-cta-btn { display:block; width:100%; padding:20px 32px; background:var(--green); color:var(--white); font-family:var(--font-display); font-size:26px; letter-spacing:1.5px; border:none; border-radius:6px; cursor:pointer; text-align:center; text-decoration:none; transition:background 0.2s,transform 0.12s,box-shadow 0.2s; box-shadow:0 4px 24px rgba(26,122,60,0.4); margin-bottom:14px; text-transform:uppercase; }
        .success-cta-btn:hover { background:var(--green-dark); transform:translateY(-2px); box-shadow:0 8px 32px rgba(26,122,60,0.5); }
        .success-secondary-btn { display:block; width:100%; padding:14px 24px; background:transparent; color:var(--grey-light); font-family:var(--font-ui); font-size:14px; letter-spacing:0.5px; border:1px solid var(--border); border-radius:6px; cursor:pointer; text-align:center; text-decoration:none; transition:border-color 0.2s,color 0.2s; }
        .success-secondary-btn:hover { border-color:rgba(255,255,255,0.25); color:var(--white); }

        /* FOOTER */
        .footer { background:#070707; border-top:1px solid rgba(255,255,255,0.06); padding:60px 24px 36px; }
        .footer-inner { max-width:1100px; margin:0 auto; display:grid; grid-template-columns:1fr auto; gap:48px; align-items:start; padding-bottom:44px; border-bottom:1px solid rgba(255,255,255,0.06); }
        .footer-brand { display:flex; align-items:flex-start; gap:18px; }
        .footer-logo-blocks { display:grid; grid-template-columns:1fr 1fr; gap:2px; width:38px; height:38px; border-radius:6px; overflow:hidden; flex-shrink:0; margin-top:3px; }
        .footer-logo-blocks span { display:block; }
        .footer-brand-text { display:flex; flex-direction:column; gap:4px; }
        .footer-school { font-family:var(--font-ui); font-size:15px; font-weight:700; color:var(--white); letter-spacing:0.5px; }
        .footer-tag { font-family:var(--font-ui); font-size:12px; color:var(--gold); letter-spacing:1px; }
        .footer-tagline { font-family:var(--font-body); font-size:14px; color:rgba(255,255,255,0.3); margin-top:10px; line-height:1.65; max-width:360px; }
        .footer-links { display:flex; flex-direction:column; gap:16px; align-items:flex-end; padding-top:4px; }
        .footer-links a { font-family:var(--font-ui); font-size:13px; font-weight:500; color:var(--grey); transition:color 0.2s; letter-spacing:0.5px; }
        .footer-links a:hover { color:var(--white); }
        .footer-bottom { max-width:1100px; margin:28px auto 0; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; }
        .footer-copy { font-family:var(--font-ui); font-size:11px; color:rgba(255,255,255,0.18); letter-spacing:0.3px; }
        .footer-hashtag { font-family:var(--font-display); font-size:18px; color:var(--red); letter-spacing:2px; }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .nav-wanted { font-size:15px; }
          .hero { min-height:100svh; }
          .hero-title { font-size:clamp(56px,14vw,80px); }
          .hero-overlay { padding:48px 6%; align-items:flex-end; padding-bottom:80px; }
          .hero-btns { flex-direction:column; }
          .hero-btn-primary, .hero-btn-secondary { width:100%; text-align:center; }
          .campaign { padding:56px 20px; }
          .campaign-inner { grid-template-columns:1fr; gap:40px; }
          .campaign-text { order:1; }
          .campaign-ctas { order:2; }
          .campaign-heading { font-size:34px; }
          .scoreboard { padding:56px 20px 44px; }
          .scoreboard-inner { gap:28px; }
          .score-number { font-size:60px; }
          .score-target { font-size:42px; }
          .form-section { padding:48px 16px 64px; }
          .form-header { flex-direction:column; align-items:flex-start; gap:14px; }
          .form-row { grid-template-columns:1fr; gap:24px; }
          .checkbox-grid { grid-template-columns:1fr 1fr; }
          .success-screen { padding:32px 16px; }
          .footer-inner { grid-template-columns:1fr; gap:36px; }
          .footer-links { align-items:flex-start; flex-direction:row; flex-wrap:wrap; gap:20px; }
          .footer-bottom { flex-direction:column; align-items:flex-start; gap:8px; }
        }
        @media (max-width: 480px) {
          .hero-title { font-size:52px; }
          .campaign-heading { font-size:28px; }
          .score-number { font-size:48px; }
          .score-target { font-size:36px; }
          .scoreboard-inner { gap:16px; }
          .cta-btn { padding:18px 20px; }
          .cta-btn-title { font-size:20px; }
          .checkbox-grid { grid-template-columns:1fr; }
          .checkbox-grid.small { grid-template-columns:1fr; }
          .submit-btn { font-size:20px; }
          .success-cta-btn { font-size:20px; }
        }
      `}</style>
    </>
  );
}
