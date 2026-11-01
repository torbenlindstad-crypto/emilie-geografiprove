/**
 * Google Apps Script – geografiprøve 1 + flervalgsprøve 2.
 * Sett inn i regnearkets Apps Script-editor, og distribuer en NY webapp-versjon.
 * Prøve 1 forblir kompatibel.
 * Prøve 2: obligatorisk e-post, poengberegning, tilbakemelding og e-post.
 * Ingen AI/API-nøkler. Alle fasitsvar hentes fra den private fanen.
 */
const ESSAY_TITLE = 'Geografi VG1 – Jordas indre og berggrunnen';
const QUIZ_TITLE = 'Geografi VG1 – Flervalgsprøve 2';
const ESSAY_SHEET = 'Besvarelser';
const QUIZ_SHEET = 'Flervalg 2';
const KEY_SHEET = 'Fasit flervalg 2';
const QUIZ_LENGTH = 32;
const RECEIPT_PATTERN = /^[a-f0-9-]{36}$/i;
const EMAIL_PATTERN = /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/;

function output_(value) {
  return ContentService.createTextOutput(value);
}
function safeCell_(input) {
  return String(input).replace(/^\s*[=+@-]/, "'$&");
}
function isDuplicate_(sheet, receipt) {
  const last = sheet.getLastRow();
  if (last < 2) return false;
  return !!sheet.getRange(2, 2, last - 1, 1)
    .createTextFinder(receipt).matchEntireCell(true).findNext();
}
function quizKey_(ss) {
  const sheet = ss.getSheetByName(KEY_SHEET);
  if (!sheet) throw new Error('MISSING_KEY_SHEET');
  const rows = sheet.getRange(2, 1, QUIZ_LENGTH, 6).getValues();
  return rows.map((r, i) => {
    const entry = {
      number: Number(r[0]),
      correct: String(r[1]),
      topic: String(r[2]),
      explanation: String(r[3]),
      question: String(r[4]),
      correctText: String(r[5])
    };
    if (entry.number !== i + 1 || !/^[A-D]$/.test(entry.correct) ||
        !entry.explanation || !entry.question || !entry.correctText) {
      throw new Error('INVALID_KEY_ROW_' + (i + 2));
    }
    return entry;
  });
}
function checkSubmission_(p) {
  return p && typeof p.student === 'string' && p.student.trim().length > 0 &&
    p.student.length <= 100 && RECEIPT_PATTERN.test(p.receipt || '');
}
function doPost(e) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(25000)) return output_('BUSY');
  try {
    if (!e || !e.postData || !e.postData.contents || e.postData.contents.length > 3000000) {
      return output_('INVALID');
    }
    const p = JSON.parse(e.postData.contents);
    if (!checkSubmission_(p)) return output_('INVALID');
    const ss = SpreadsheetApp.openById('1W6z74XULvu4yDwUAaxwEYDu0V79QC3_rN3fjvJFQXg0');
    if (!ss) return output_('MISSING_SHEET');

    if (p.exam === ESSAY_TITLE && p.version === 2) {
      if (!Array.isArray(p.answers) || p.answers.length !== 10) return output_('INVALID');
      const sheet = ss.getSheetByName(ESSAY_SHEET);
      if (!sheet) return output_('MISSING_SHEET');
      if (isDuplicate_(sheet, p.receipt)) return output_('DUPLICATE');
      const answers = p.answers.map((a, i) => {
        if (Number(a.number) !== i + 1 || typeof a.text !== 'string' ||
            a.text.length > 50000) throw new Error('BAD_ESSAY_ANSWER');
        return safeCell_(a.text);
      });
      sheet.appendRow([new Date(), p.receipt, safeCell_(p.student.trim()), p.exam, ...answers]);
      return output_('RECEIVED');
    }

    if (p.exam !== QUIZ_TITLE || p.version !== 1) return output_('INVALID_EXAM');
    if (!Array.isArray(p.answers) || p.answers.length !== QUIZ_LENGTH ||
        typeof p.email !== 'string' || p.email.length > 254 ||
        !EMAIL_PATTERN.test(p.email.trim())) return output_('INVALID');

    const sheet = ss.getSheetByName(QUIZ_SHEET);
    if (!sheet) return output_('MISSING_SHEET');
    if (isDuplicate_(sheet, p.receipt)) return output_('DUPLICATE');

    const choices = p.answers.map((answer, i) => {
      if (Number(answer.number) !== i + 1 || !/^[A-D]$/.test(answer.choice || '')) {
        throw new Error('INVALID_QUIZ_CHOICE');
      }
      return answer.choice;
    });
    const key = quizKey_(ss);
    const score = choices.reduce((sum, value, i) => sum + (value === key[i].correct ? 1 : 0), 0);
    const email = p.email.trim().toLowerCase();
    sheet.appendRow([
      new Date(), p.receipt, safeCell_(p.student.trim()), p.exam,
      ...choices, score, email, 'PENDING', score / QUIZ_LENGTH
    ]);
    SpreadsheetApp.flush();
    const savedRow = sheet.getLastRow();
    let emailStatus = 'FAILED';
    try {
      // Åpent mottak: begrens antall e-postforsøk for å redusere risiko for misbruk.
      const now = Date.now();
      const first = Math.max(2, savedRow - 199);
      const count = savedRow >= first ? savedRow - first + 1 : 0;
      const rows = count ? sheet.getRange(first, 1, count, 39).getValues() : [];
      const today = rows.filter(r => r[0] instanceof Date &&
        now - r[0].getTime() >= 0 && now - r[0].getTime() < 86400000);
      const toThisEmail = today.filter(r => String(r[37]).toLowerCase() === email).length;
      const sentToday = today.filter(r => r[38] === 'SENT').length;
      if (toThisEmail > 2 || sentToday >= 40) {
        emailStatus = 'LIMIT';
      } else if (MailApp.getRemainingDailyQuota() < 1) {
        emailStatus = 'QUOTA';
      } else {
        const body = [
          'Geografiprøve 2 – resultat',
          '',
          'Du fikk ' + score + ' av ' + QUIZ_LENGTH + ' poeng.',
          'Dette er en øvingsprøve, ikke en offisiell karakter.',
          'Kvittering: ' + p.receipt,
          '',
          'Dine svar og forklaringer:',
          ''
        ];
        key.forEach((item, i) => {
          body.push(
            (i + 1) + '. ' + item.question,
            'Ditt svar: ' + choices[i] + (choices[i] === item.correct ? ' (riktig)' : ' (feil)'),
            'Riktig svar: ' + item.correct + ' – ' + item.correctText,
            'Hvorfor: ' + item.explanation,
            ''
          );
        });
        MailApp.sendEmail(email, 'Resultatet ditt – Geografiprøve 2 (' +
          score + '/32)', body.join('\n'));
        emailStatus = 'SENT';
      }
    } catch (mailError) {
      console.error('Email failure for receipt ' + p.receipt + ': ' + mailError);
      emailStatus = 'FAILED';
    }
    sheet.getRange(savedRow, 39).setValue(emailStatus);
    return output_('RECEIVED');
  } catch (err) {
    console.error('doPost failed: ' + err);
    return output_('ERROR');
  } finally {
    lock.releaseLock();
  }
}

/**
 * Lesbart JSONP-oppslag for én tilfeldig kvitterings-ID. Returnerer aldri navn
 * eller e-post. Kun prøve 2, og kun etter at lagring og e-postforsøk er ferdig.
 * Ikke bruk til sensitive prøver; dette er en offentlig øvingsløsning.
 */
function doGet(e) {
  const p = (e && e.parameter) || {};
  const prefix = String(p.prefix || '');
  const receipt = String(p.receipt || '');
  if (!['result', 'check'].includes(p.action) || !/^quiz2_cb_[a-zA-Z0-9_]{8,48}$/.test(prefix)) {
    return output_('INVALID');
  }
  let result = {status: 'pending'};
  try {
    if (p.action === 'check') {
      const number = Number(p.number);
      const choice = String(p.choice || '');
      if (Number.isInteger(number) && number >= 1 && number <= QUIZ_LENGTH &&
          /^[A-D]$/.test(choice)) {
        const key = quizKey_(SpreadsheetApp.openById('1W6z74XULvu4yDwUAaxwEYDu0V79QC3_rN3fjvJFQXg0'));
        const item = key[number - 1];
        result = {
          status: 'checked',
          number: number,
          selected: choice,
          isCorrect: choice === item.correct,
          correct: item.correct,
          correctText: item.correctText,
          explanation: item.explanation
        };
      }
    } else if (RECEIPT_PATTERN.test(receipt)) {
      const ss = SpreadsheetApp.openById('1W6z74XULvu4yDwUAaxwEYDu0V79QC3_rN3fjvJFQXg0');
      const sheet = ss.getSheetByName(QUIZ_SHEET);
      if (sheet && sheet.getLastRow() > 1) {
        const found = sheet.getRange(2, 2, sheet.getLastRow() - 1, 1)
          .createTextFinder(receipt).matchEntireCell(true).findNext();
        if (found) {
          const row = sheet.getRange(found.getRow(), 1, 1, 39).getValues()[0];
          if (row[3] === QUIZ_TITLE && row[38] !== 'PENDING') {
            const key = quizKey_(ss);
            const feedback = key.map((item, i) => {
              const chosen = String(row[i + 4]);
              return {
                number: i + 1,
                selected: chosen,
                correct: item.correct,
                isCorrect: chosen === item.correct,
                correctText: item.correctText,
                explanation: item.explanation
              };
            });
            const score = feedback.filter(item => item.isCorrect).length;
            result = {
              status: 'ready',
              score: score,
              total: QUIZ_LENGTH,
              emailStatus: String(row[38]),
              feedback: feedback
            };
          }
        }
      }
    }
  } catch (err) {
    console.error('doGet: ' + err);
    result = {status: 'error'};
  }
  return ContentService.createTextOutput(prefix + '(' + JSON.stringify(result) + ');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

// Velg denne funksjonen og trykk «Kjør» i Apps Script for å godkjenne
// e-posttilgangen uten å sende en testmelding.
function sjekkEpostTillatelse() {
  Logger.log('Ledige e-postmottakere i dag: ' + MailApp.getRemainingDailyQuota());
}

// Kjør denne funksjonen i Apps Script ved første oppsett.
// Den kontrollerer regnearktilgang uten å lagre svar eller sende e-post.
function testMottak() {
  const ss = SpreadsheetApp.openById('1W6z74XULvu4yDwUAaxwEYDu0V79QC3_rN3fjvJFQXg0');
  const a = ss.getSheetByName('Flervalg 2');
  const b = ss.getSheetByName('Fasit flervalg 2');
  if (!a || !b) throw new Error('Mangler arkfane');
  const n = b.getRange('B2:B33').getValues().filter(r => /^[A-D]$/.test(r[0])).length;
  if (n !== 32) throw new Error('Mangler riktige svar i fasiten');
  Logger.log('OK: regneark og 32 fasitsvar er tilgjengelige. Ingen innlevering ble sendt.');
}
