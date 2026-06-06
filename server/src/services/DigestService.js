const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const { Question } = require('../models/Question');
const { PracticeSession } = require('../models/PracticeSession');
const LLMService = require('./LLMService');

class DigestService {
  // ─── Calculate Default Practice Day ─────────────────────────────────────────
  getDefaultPracticeDay(schedule, sessionCreatedAt) {
    if (!schedule) return '1';
    const dayKeys = Object.keys(schedule).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
    if (dayKeys.length === 0) return '1';

    const start = sessionCreatedAt ? new Date(sessionCreatedAt) : new Date();
    const today = new Date();
    const diffMs = today.setHours(0, 0, 0, 0) - start.setHours(0, 0, 0, 0);
    const dayOffset = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const todayPracticeDay = dayOffset + 1;

    const todayKey = String(todayPracticeDay);
    if (schedule[todayKey]) {
      return todayKey;
    }
    return dayKeys[0];
  }

  // ─── Format Difficulty Badge ────────────────────────────────────────────────
  getDifficultyStyle(diff) {
    const d = (diff || 'Medium').toLowerCase();
    if (d === 'easy') return { bg: '#e6f4ea', text: '#137333', label: 'Easy' };
    if (d === 'hard') return { bg: '#fce8e6', text: '#c5221f', label: 'Hard' };
    return { bg: '#fef7e0', text: '#b06000', label: 'Medium' };
  }

  // ─── Send Daily Digest ─────────────────────────────────────────────────────
  async sendDailyDigest(options = {}) {
    const destEmail = options.email || 'puneetgirdhar.in@gmail.com';
    
    // Find Practice Session
    let session;
    if (options.session) {
      session = await PracticeSession.findOne({ where: { id: options.session } });
    } else {
      session = await PracticeSession.findOne({ order: [['updatedAt', 'DESC']] });
    }

    if (!session) {
      throw new Error('No practice session found. Start a practice session first.');
    }

    console.log(`🎯 Active Session: "${session.sessionName}" (ID: ${session.id})`);

    // Parse schedule
    let schedule = session.schedule;
    if (typeof schedule === 'string') {
      schedule = JSON.parse(schedule);
    }

    // Determine Target Day
    const targetDay = options.day || this.getDefaultPracticeDay(schedule, session.createdAt);
    console.log(`📅 Target Practice Day: ${targetDay}`);

    const qIds = schedule[targetDay];
    if (!qIds || qIds.length === 0) {
      throw new Error(`No questions found for Day ${targetDay} in this session's schedule.`);
    }

    console.log(`📚 Found ${qIds.length} question IDs for Day ${targetDay}:`, qIds);

    // Fetch Full Question Details
    const dbQuestions = await Question.findAll({
      where: { id: qIds }
    });

    // Map questions to maintain schedule order
    const orderedQuestions = qIds
      .map(id => dbQuestions.find(q => q.id === id))
      .filter(Boolean);

    console.log(`✨ Hydrated ${orderedQuestions.length} questions from database.`);

    const enrichedProblems = [];
    for (let i = 0; i < orderedQuestions.length; i++) {
      const q = orderedQuestions[i];
      console.log(`🤖 [${i + 1}/${orderedQuestions.length}] Enriching "${q.title}"...`);

      let descriptionSummary = '<ul><li>No description summary available.</li></ul>';
      let explanation = '<ul><li>No explanation strategy available.</li></ul>';
      let mnemonic = 'No mnemonic visual trick available.';
      let criticalSnippet = '';

      try {
        const prompt = `You are an elite algorithms and coding interview coach.
For the following LeetCode/NeetCode question, generate:
1. An ultra-concise summary of the problem statement/description. Use HTML bullet points (<ul> and <li>). Max 2 bullets, max 10-12 words per bullet. State what is given and what to find in the simplest way possible.
2. An ultra-concise optimal solution strategy INCLUDING a 1-line pseudocode. Use HTML bullet points (<ul> and <li>). Max 3 bullets total:
   - Bullet 1: Optimal approach strategy & complexity (e.g., "O(E log V) T / O(V + E) S: Dijkstra's algorithm").
   - Bullet 2: Concise 1-line pseudocode of the core loop/conditional (e.g., "Pseudocode: while heap: pop min, relax neighbors, push").
   - Bullet 3: Minor key optimization or return condition (e.g., "Return max dist if visited n nodes, else -1").
   Keep all bullets extremely short, direct, and concise.
3. An ultra-concise mnemonic visual trick or metaphor (max 10 words). Sacrifice standard grammar for absolute brevity.
4. The absolute critical, most important section of the Python solution code (5-15 lines). Skip all trivial boilerplate, class/function definitions, parameter validations, and setups. Focus strictly on the core logic (e.g., the DP transition, the pointer updates, the backtracking loop, or search criteria) that solves the core challenge.
   VERY IMPORTANT: Generate the python code snippet WITH rich syntax highlighting using inline HTML <span> tags optimized for a white background. Use these specific hex colors for spans:
   - Keywords (def, for, while, if, else, return, in, and, or, not, etc.): <span style="color:#7c3aed;font-weight:bold;">keyword</span>
   - Built-in functions (len, range, min, max, list, dict, set, etc.): <span style="color:#0891b2;">builtin</span>
   - Strings: <span style="color:#059669;">"string"</span>
   - Numbers: <span style="color:#d97706;">number</span>
   - Comments: <span style="color:#64748b;font-style:italic;"># comment</span>
   - Function/Class names: <span style="color:#2563eb;font-weight:bold;">func_name</span>
   - Rest of standard code (variables, operators): standard text color (no tags, or color #0f172a).
   Make sure all non-tag special HTML characters (<, >) inside the code are correctly escaped as &lt; and &gt; so the HTML renders beautifully inside a pre code block.

Problem Title: ${q.title}
Category/Pattern: ${q.category || q.pattern}
Problem Statement/Description: 
${q.statement || q.description || 'N/A'}

Reference Python Solution Code:
${q.python_code || q.boilerplate || 'N/A'}

Return the response strictly as a JSON object with keys "description_summary", "explanation", "mnemonic", and "critical_snippet". Do not include any markdown formatting, backticks, or "json" blocks. Return ONLY the raw JSON string:
{
  "description_summary": "<ul><li>bullet 1</li><li>bullet 2</li></ul>",
  "explanation": "<ul><li>bullet 1</li><li>bullet 2</li><li>bullet 3</li></ul>",
  "mnemonic": "your ultra-concise mnemonic...",
  "critical_snippet": "your critical_snippet..."
}`;

        const textResponse = await LLMService.generateContent(prompt);
        const parsed = LLMService.extractJson(textResponse);
        if (parsed) {
          descriptionSummary = parsed.description_summary || descriptionSummary;
          explanation = parsed.explanation || explanation;
          mnemonic = parsed.mnemonic || mnemonic;
          criticalSnippet = parsed.critical_snippet || '';
        }
      } catch (err) {
        console.warn(`⚠️ Failed to generate LLM explanation/mnemonic for "${q.title}":`, err.message);
        // Fallback
        if (q.hints && Array.isArray(q.hints) && q.hints.length > 0) {
          explanation = `<ul>${q.hints.map(h => `<li>${h}</li>`).join('')}</ul>`;
        }
      }

      if (!criticalSnippet) {
        criticalSnippet = q.python_code || q.boilerplate || '# No code template available';
        const lines = criticalSnippet.split('\n');
        if (lines.length > 20) {
          criticalSnippet = lines.slice(0, 18).join('\n') + '\n# ... [code truncated]';
        }
      }

      enrichedProblems.push({
        id: q.id,
        title: q.title,
        difficulty: q.difficulty || 'Medium',
        category: q.category || q.pattern || 'Algorithms',
        leetcode_url: q.leetcode_url,
        neetcode_url: q.neetcode_url,
        youtube_url: q.youtube_url,
        descriptionSummary: descriptionSummary,
        explanation: explanation,
        mnemonic: mnemonic,
        code: criticalSnippet
      });
    }

    // Compile highly aesthetic HTML email template (Gmail-like Light Theme)
    console.log('🎨 Compiling premium Gmail-like light HTML email template...');
    const htmlEmail = this.compileHtmlEmail(targetDay, session.sessionName, enrichedProblems);

    // Save local copy in emails/
    const workspaceRoot = path.resolve(__dirname, '../../..');
    const emailsDir = path.join(workspaceRoot, 'emails');
    if (!fs.existsSync(emailsDir)) {
      fs.mkdirSync(emailsDir, { recursive: true });
    }

    const emailPath = path.join(emailsDir, `daily_digest_day_${targetDay}.html`);
    fs.writeFileSync(emailPath, htmlEmail, 'utf8');
    console.log(`💾 Saved local copy of the HTML email to: ${emailPath}`);

    // Send Email via SMTP/nodemailer
    const canSend = process.env.SMTP_HOST && process.env.SMTP_USER;
    if (canSend) {
      console.log(`✉️ Sending email to "${destEmail}" via SMTP (${process.env.SMTP_HOST})...`);
      
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS || process.env.SMTP_PASSWORD
        }
      });

      const mailOptions = {
        from: process.env.SMTP_FROM || `"LeetCode Tutor Daily" <${process.env.SMTP_USER}>`,
        to: destEmail,
        subject: `LeetCode Practice Day ${targetDay} - ${session.sessionName}`,
        html: htmlEmail
      };

      await transporter.sendMail(mailOptions);
      console.log(`🚀 Email dispatched successfully to ${destEmail}!`);
      return { success: true, targetDay, emailed: true, path: emailPath, questionsCount: enrichedProblems.length };
    } else {
      console.log('\n📢 Note: SMTP credentials are not configured in `.env`.');
      return { success: true, targetDay, emailed: false, path: emailPath, questionsCount: enrichedProblems.length };
    }
  }

  // ─── HTML Email Compiler (Light Mode, Gmail Style) ─────────────────────────
  compileHtmlEmail(day, sessionName, problems) {
    const problemsRows = problems.map((p, idx) => {
      const diff = this.getDifficultyStyle(p.difficulty);
      const highlightedCode = p.code;

      const links = [];
      if (p.leetcode_url) {
        links.push(`<a href="${p.leetcode_url}" class="pill-btn leetcode-btn" target="_blank">LeetCode</a>`);
      }
      if (p.neetcode_url) {
        links.push(`<a href="${p.neetcode_url}" class="pill-btn neetcode-btn" target="_blank">NeetCode</a>`);
      }
      if (p.youtube_url) {
        links.push(`<a href="${p.youtube_url}" class="pill-btn youtube-btn" target="_blank">Video</a>`);
      }
      const linksHtml = links.length > 0 ? links.join(' ') : '<span style="color:#5f6368;">No links</span>';

      return `
        <tr class="problem-row ${idx % 2 === 0 ? 'row-even' : 'row-odd'}">
          <td class="col-problem">
            <div class="problem-title-container">
              <span class="difficulty-badge" style="background-color: ${diff.bg}; color: ${diff.text};">${diff.label}</span>
              <span class="problem-title">${p.title}</span>
            </div>
            <div class="problem-category">${p.category}</div>
            <div class="problem-links">${linksHtml}</div>
          </td>
          <td class="col-description">
            <div class="bullet-list-container">${p.descriptionSummary}</div>
          </td>
          <td class="col-solution">
            <div class="bullet-list-container">${p.explanation}</div>
          </td>
          <td class="col-mnemonic">
            <div class="mnemonic-box">
              <strong style="color: #1a73e8; display: block; margin-bottom: 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">Mnemonic</strong>
              ${p.mnemonic}
            </div>
          </td>
          <td class="col-code">
            <div class="code-wrapper">
              <pre><code>${highlightedCode}</code></pre>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LeetCode Tutor Daily - Day ${day}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f1f3f4;
      font-family: "Google Sans", Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
      color: #202124;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f1f3f4;
      padding: 24px 12px;
      box-sizing: border-box;
    }
    .container {
      max-width: 1300px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #dadce0;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15);
    }
    .header {
      background-color: #ffffff;
      padding: 24px 20px;
      text-align: center;
      border-bottom: 1px solid #dadce0;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      color: #202124;
      letter-spacing: -0.01em;
    }
    .header p {
      margin: 6px 0 0 0;
      color: #5f6368;
      font-size: 13px;
    }
    .meta-badge {
      display: inline-block;
      margin-top: 12px;
      padding: 4px 10px;
      background-color: #e8f0fe;
      border: 1px solid #d2e3fc;
      border-radius: 9999px;
      color: #1a73e8;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .content {
      padding: 20px;
    }
    .table-container {
      width: 100%;
      overflow-x: auto;
      border-radius: 6px;
      border: 1px solid #dadce0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 13px;
      table-layout: fixed;
    }
    th {
      background-color: #f8f9fa;
      color: #5f6368;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0.05em;
      padding: 14px 12px;
      border-bottom: 2px solid #dadce0;
    }
    td {
      padding: 16px 12px;
      vertical-align: top;
      border-bottom: 1px solid #dadce0;
    }
    .row-even {
      background-color: #ffffff;
    }
    .row-odd {
      background-color: #f8f9fa;
    }
    .col-problem {
      width: 16%;
    }
    .col-description {
      width: 20%;
    }
    .col-solution {
      width: 28%;
    }
    .col-mnemonic {
      width: 14%;
    }
    .col-code {
      width: 22%;
    }
    .problem-title-container {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 5px;
      margin-bottom: 4px;
    }
    .difficulty-badge {
      display: inline-block;
      padding: 1px 5px;
      font-size: 9px;
      font-weight: 700;
      border-radius: 3px;
      text-transform: uppercase;
    }
    .problem-title {
      color: #202124;
      font-weight: 700;
      font-size: 14px;
      line-height: 1.3;
    }
    .problem-category {
      color: #5f6368;
      font-size: 11px;
      margin-bottom: 8px;
      font-weight: 500;
    }
    .problem-links {
      display: flex;
      flex-direction: column;
      gap: 5px;
      margin-top: 4px;
    }
    .pill-btn {
      display: inline-block;
      padding: 3px 6px;
      font-size: 10px;
      font-weight: 600;
      border-radius: 4px;
      text-decoration: none;
      transition: all 0.15s ease;
      text-align: center;
      border: 1px solid transparent;
    }
    .leetcode-btn {
      background-color: #fef7e0;
      color: #b06000;
      border-color: #fce8b2;
    }
    .leetcode-btn:hover {
      background-color: #feefc3;
    }
    .neetcode-btn {
      background-color: #e8f0fe;
      color: #1a73e8;
      border-color: #d2e3fc;
    }
    .neetcode-btn:hover {
      background-color: #d2e3fc;
    }
    .youtube-btn {
      background-color: #fce8e6;
      color: #c5221f;
      border-color: #fad2cf;
    }
    .youtube-btn:hover {
      background-color: #fad2cf;
    }
    .bullet-list-container {
      color: #3c4043;
      line-height: 1.5;
      font-size: 12.5px;
    }
    .bullet-list-container ul {
      margin: 0;
      padding-left: 14px;
    }
    .bullet-list-container li {
      margin-bottom: 8px;
    }
    .bullet-list-container li:last-child {
      margin-bottom: 0;
    }
    .mnemonic-box {
      background-color: #f8fafd;
      border: 1px solid #e8eaed;
      border-left: 3px solid #1a73e8;
      border-radius: 4px;
      padding: 8px 10px;
      color: #1a73e8;
      font-size: 12px;
      line-height: 1.4;
    }
    .code-wrapper {
      background-color: #f8f9fa;
      border: 1px solid #dadce0;
      border-radius: 4px;
      padding: 8px;
      max-height: 250px;
      overflow: auto;
    }
    pre {
      margin: 0;
    }
    code {
      font-family: ui-monospace, SFMono-Regular, Roboto Mono, Menlo, Monaco, Consolas, monospace;
      font-size: 11px;
      color: #202124;
      white-space: pre;
    }
    .footer {
      padding: 16px;
      text-align: center;
      border-top: 1px solid #dadce0;
      font-size: 11px;
      color: #5f6368;
      background-color: #f8f9fa;
    }
    .footer a {
      color: #1a73e8;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>🔥 LeetCode Tutor Daily Digest</h1>
        <p>Your curated algorithmic problem set for the day. Master the patterns.</p>
        <span class="meta-badge">Day ${day} • Session ${sessionName}</span>
      </div>
      <div class="content">
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th style="width: 16%;">Problem</th>
                <th style="width: 20%;">Goal</th>
                <th style="width: 28%;">Approach</th>
                <th style="width: 14%;">Mnemonic</th>
                <th style="width: 22%;">Code</th>
              </tr>
            </thead>
            <tbody>
              ${problemsRows}
            </tbody>
          </table>
        </div>
      </div>
      <div class="footer">
        <p>Sent with ❤️ by the Antigravity Coding Assistant.</p>
        <p>Keep grinding, Puneet! Consistent practice builds legendary intuition.</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;
  }
}

module.exports = new DigestService();
