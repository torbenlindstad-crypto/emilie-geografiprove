/** Apps Script: mottak for to geografiprøver (samme Google Sheets-arbeidsbok).
 * Dette er kun kildekoden i GitHub. Lim inn hele filen i Apps Script-prosjektet
 * som er knyttet til regnearket, og velg Implementer > Administrer implementeringer
 * > Rediger > Ny versjon > Implementer.
 * Ingen OpenAI API eller AI-vurdering. Prøve 1 beholdes uendret.
 */
const OLD_EXAM = 'Geografi VG1 – Jordas indre og berggrunnen';
const QUIZ2_EXAM = 'Geografi VG1 – Flervalgsprøve 2';
const OLD_SHEET = 'Besvarelser';
const QUIZ2_SHEET = 'Flervalg 2';
const QUIZ2_ANSWER_SHEET = 'Fasit flervalg 2';

function doPost(e) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(25000)) return ContentService.createTextOutput('BUSY');
  try {
    if (!e || !e.postData || !e.postData.contents || e.postData.contents.length > 3000000) {
      return ContentService.createTextOutput('INVALID');
    }
    const p = JSON.parse(e.postData.contents);
    if (typeof p.student !== 'string' || p.student.trim().length < 1 ||
        p.student.length > 100 || !/^[a-f0-9-]{36}$/i.test(p.receipt || '')) {
      return ContentService.createTextOutput('INVALID');
    }
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return ContentService.createTextOutput('MISSING_SPREADSHEET');
    const safeStudent = protectFormula_(p.student.trim());

    if (p.exam === OLD_EXAM && p.version === 2) {
      // Samme format og 10 svar som i prøve 1.
      if (!Array.isArray(p.answers) || p.answers.length !== 10) {
        return ContentService.createTextOutput('INVALID');
      }
      const sheet = ss.getSheetByName(OLD_SHEET);
      if (!sheet) return ContentService.createTextOutput('MISSING_SHEET');
      if (hasReceipt_(sheet, p.receipt)) return ContentService.createTextOutput('DUPLICATE');
      const answers = p.answers.map((a, i) => {
        if (Number(a.number) !== i + 1 || typeof a.text !== 'string' || a.text.length > 50000) {
          throw new Error('Invalid essay answer');
        }
        return protectFormula_(a.text);
      });
      sheet.appendRow([new Date(), p.receipt, safeStudent, p.exam, ...answers]);
      return ContentService.createTextOutput('RECEIVED');
    }

    if (p.exam === QUIZ2_EXAM && p.version === 1) {
      if (!Array.isArray(p.answers) || p.answers.length !== 32) {
        return ContentService.createTextOutput('INVALID');
      }
      const sheet = ss.getSheetByName(QUIZ2_SHEET);
      const keySheet = ss.getSheetByName(QUIZ2_ANSWER_SHEET);
      if (!sheet || !keySheet) return ContentService.createTextOutput('MISSING_SHEET');
      if (hasReceipt_(sheet, p.receipt)) return ContentService.createTextOutput('DUPLICATE');
      const choices = p.answers.map((a, i) => {
        if (Number(a.number) !== i + 1 || !/^[A-D]$/.test(a.choice || '')) {
          throw new Error('Invalid multiple choice answer');
        }
        return a.choice;
      });
      const correct = keySheet.getRange(2, 2, 32, 1).getValues().map(row => row[0]);
      if (correct.length !== 32 || correct.some(x => !/^[A-D]$/.test(String(x)))) {
        return ContentService.createTextOutput('INVALID_ANSWER_KEY');
      }
      const score = choices.reduce((sum, choice, i) => sum + Number(choice === correct[i]), 0);
      sheet.appendRow([new Date(), p.receipt, safeStudent, p.exam, ...choices, score]);
      return ContentService.createTextOutput('RECEIVED');
    }
    return ContentService.createTextOutput('INVALID_EXAM');
  } catch (err) {
    console.error(err);
    return ContentService.createTextOutput('ERROR');
  } finally {
    lock.releaseLock();
  }
}

function protectFormula_(value) {
  return value.replace(/^\s*[=+@-]/, "'$&");
}

function hasReceipt_(sheet, receipt) {
  const last = sheet.getLastRow();
  return last > 1 && sheet.getRange(2, 2, last - 1, 1).getValues().some(row => row[0] === receipt);
}
