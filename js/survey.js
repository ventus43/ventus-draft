const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL || '';

const answers = { q1: '', q2: [], q3: [], q4: '', q5: '', q6: '', q7: '', q8: '' };
const TOTAL = 7;

/* ── Date range setup ── */
document.addEventListener('DOMContentLoaded', () => {
  const d = document.getElementById('q5-date');
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const maxDate  = new Date(); maxDate.setMonth(maxDate.getMonth() + 1);
  const fmt = dt => dt.toISOString().split('T')[0];
  d.min = fmt(tomorrow);
  d.max = fmt(maxDate);

  document.getElementById('privacyModal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });
});

/* ── Navigation ── */
function nextStep(from, to) {
  document.getElementById('progressContainer').style.display = 'block';
  goTo(from, to);
}

function goTo(from, to) {
  document.getElementById('step-' + from).classList.remove('active');
  setTimeout(() => {
    document.getElementById('step-' + to).classList.add('active');
    setProgress(to);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 110);
}

function setProgress(step) {
  if (step === 0) return;
  const pct = step === 7 ? 100 : Math.round(((step - 1) / TOTAL) * 100);
  document.getElementById('progressBar').style.width = pct + '%';
}

/* ── Radio (single, auto-advance) ── */
function selectRadio(el, key, value, from, to) {
  el.parentElement.querySelectorAll('.option-label').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  answers[key] = value;
  setTimeout(() => goTo(from, to), 300);
}

/* ── Checkbox (multi) ── */
function toggleCheck(el, key, value) {
  el.classList.toggle('selected');
  if (el.classList.contains('selected')) {
    if (!answers[key].includes(value)) answers[key].push(value);
  } else {
    answers[key] = answers[key].filter(v => v !== value);
  }
}

/* ── Date ── */
function nextDate() {
  const val = document.getElementById('q5-date').value;
  const err = document.getElementById('q5-error');
  if (!val) { err.style.display = 'block'; return; }
  err.style.display = 'none';
  answers.q5 = val;
  goTo(5, 6);
}

/* ── User info + open modal ── */
function openPrivacyModal() {
  const name = document.getElementById('q6-name').value.trim();
  const age  = document.getElementById('q7-age').value.trim();
  const tel  = document.getElementById('q8-tel').value.trim();
  const err  = document.getElementById('q6-error');
  if (!name || !age || !tel) { err.style.display = 'block'; return; }
  err.style.display = 'none';
  answers.q6 = name; answers.q7 = age; answers.q8 = tel;
  document.getElementById('privacyModal').classList.add('open');
}

/* ── Modal ── */
function closeModal() {
  document.getElementById('privacyModal').classList.remove('open');
  document.getElementById('privacyConsent').checked = false;
}

function confirmAndSubmit() {
  if (!document.getElementById('privacyConsent').checked) {
    alert('개인정보 수집 및 이용에 동의해 주세요.');
    return;
  }
  closeModal();
  goTo(6, 7);
  sendToSheets();
}

/* ── Google Sheets ── */
async function sendToSheets() {
  const payload = {
    타임스탬프:           new Date().toLocaleString('ko-KR'),
    인터뷰동의:           answers.q1,
    참여한문화행사:        answers.q2.join(', '),
    참여하고싶은문화행사:  answers.q3.join(', '),
    무료티켓의향:          answers.q4,
    인터뷰일정:           answers.q5,
    이름:                answers.q6,
    나이:                answers.q7,
    연락처:              answers.q8,
    개인정보동의:         '동의'
  };

  try {
    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    console.error('전송 오류:', e);
  }
}

/* ── 전역 노출 (HTML onclick에서 호출) ── */
window.nextStep         = nextStep;
window.goTo             = goTo;
window.selectRadio      = selectRadio;
window.toggleCheck      = toggleCheck;
window.nextDate         = nextDate;
window.openPrivacyModal = openPrivacyModal;
window.closeModal       = closeModal;
window.confirmAndSubmit = confirmAndSubmit;
