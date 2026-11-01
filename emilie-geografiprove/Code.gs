/** Apps Script: knytt til svararket (Utvidelser > Apps Script).
 * Deploy: Web app / execute as me / access anyone (see README for limitations).
 * VIKTIG: Et offentlig mottak kan spammes; bruk kun til øvingsprøver.
 */
const SHEET_NAME = 'Besvarelser';
const EXPECTED_QUESTIONS = 10;
function doPost(e) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(25000)) return ContentService.createTextOutput('BUSY');
  try {
    const p = JSON.parse(e.postData.contents);
    if (p.exam !== 'Geografi VG1 – Jordas indre og berggrunnen' || p.version !== 2 ||
        typeof p.student !== 'string' || p.student.trim().length < 1 || p.student.length > 100 ||
        !/^[a-f0-9-]{36}$/i.test(p.receipt || '') || !Array.isArray(p.answers) || p.answers.length !== EXPECTED_QUESTIONS) {
      return ContentService.createTextOutput('INVALID');
    }
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) return ContentService.createTextOutput('MISSING_SHEET');
    const last = sheet.getLastRow();
    if (last > 1 && sheet.getRange(2,2,last-1,1).getValues().some(x=>x[0]===p.receipt)) return ContentService.createTextOutput('DUPLICATE');
    const answers = p.answers.map((a,i)=>{
      if (Number(a.number)!==i+1 || typeof a.text!=='string' || a.text.length>50000) throw new Error('Bad answer');
      return a.text.replace(/^[\s]*[=+@-]/,'\u2019$&'); // guard spreadsheet formula injection
    });
    sheet.appendRow([new Date(),p.receipt,p.student.trim(),p.exam,...answers]);
    return ContentService.createTextOutput('RECEIVED');
  } catch(err) {return ContentService.createTextOutput('ERROR');}
  finally {lock.releaseLock();}
}
