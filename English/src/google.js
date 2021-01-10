'use strict';

const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const Correlation = require('node-correlation');
const FormulaParser = require('hot-formula-parser').Parser;
const parser = new FormulaParser();

const avg = (acc, val, ind, arr) => (acc + val / arr.length);

const asyncify = fn => (...args) => new Promise(
  (resolve, reject) => fn(...args, 
    (err, data) => err === null ? resolve(data) : reject(err))
);

const dispersion = obj => {
  const entries = Object.entries(obj);
  let arr = [];
  entries.forEach(([key, value]) => arr = arr.concat(new Array(value).fill(key)));
  const average = arr.reduce(avg, 0);
  const disp = (acc, val, ind, arr) => (acc + Math.pow((average - val), 2) / arr.length);
  return arr.reduce(disp, 0);
};

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize (credentials, callback, idPrepod, idPrepodsData, response) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client, idPrepod, idPrepodsData, response);
  });
}

function getNewToken (oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error while trying to retrieve access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

const radial = [
  'Доступність навчальних матеріалів для засвоєння дисципліни',
  "Об'єктивність оцінювання",
  'Пунктуальність',
  'Організація часу на занятті',
  'Актуальність матеріалу',
  'Коректність викладача',
  'Своєчасність та достатність інформування '
]
const dist_quest = ['Проведення занять на дистанційному навчанні',
  "Підтримка зв'язку зі студентами на дистанційному навчанні",
  'Організація здачі робіт на дистанційному навчанні']

const yes_no = [
  'Наявність РСО',
  'Викладач систематично дозволяє здати на гарну оцінку завдання/контрольні роботи студентам, які погано володіють матеріалом',
  'Чи варто, на вашу думку, подовжувати контракт цьому викладачу']

const distributions = [
  'Як ви оцінюєте свій рівень після вивчення дисципліни',
  'Чи задовольнила вас якість викладання дисципліни '
]

function listMajors (auth, idPrepod, idPrepodsData, response) {
  const rowNumbers = idPrepod.split('%20');
  const result = {}
  const sheets = google.sheets({ version: 'v4', auth });

  const asyncGet = asyncify(sheets.spreadsheets.values.get.bind(sheets))
  asyncGet({
    spreadsheetId: idPrepodsData,
    range: 'Sheet1!A1:G'
  }).then(res => {
    const row = res.data.values[+rowNumbers[0] - 1];
    const prepodName = row[0];
    const regExpName = /.+(?=, Англ)/;
    // console.log(row)
    const prepodCutName = prepodName.match(regExpName)[0];
    result.name = prepodCutName;
    const picUrl = row[6];
    result.picURL = picUrl;
    const sheetUrl = row[3];
    const regExpId = /(?<=https:\/\/docs\.google\.com\/spreadsheets\/d\/)[^/]+/g;
    const sheetId = sheetUrl.match(regExpId)[0];
    return Promise.resolve({ sheetId, generalTable: res });
  }).then(res => Promise.all([
    asyncGet(
      {
        spreadsheetId: res.sheetId,
        range: 'Ответы на форму (1)!B1:Q'
      }
    ),
    res.generalTable
  ])
  ).then(res => {
    const generalTable = res[1]
    res = res[0]
    const rows = res.data.values;
    const keys = res.data.values[0];
    // console.log('ключи в данных: ', keys)
    for (let i = 0; i < keys.length; i++) {
      for (let c = 1; c < res.data.values.length; c++) {
        if (result[keys[i]]) result[keys[i]].push(res.data.values[c][i])
        else result[keys[i]] = [res.data.values[c][i]]
      }
    }
    result['Всього опитано'] = res.data.values.length - 1
    for (const key of radial) result[key] = result[key].reduce(avg, 0);
    for (const key of dist_quest) result[key] = result[key].reduce(avg, 0);
    const correct_answer_for_rso = 'РСО була оприлюднена у перші два тижні навчання'
    for (const key of yes_no) result[key] = result[key].map(x => { return (x === correct_answer_for_rso || x == 'Так') ? 100 : 0 }).reduce(avg, 0);
    for (const key of distributions) {
      res = {
        4: 0,
        3: 0,
        2: 0,
        1: 0,
        5: 0
      }
      result[key].forEach(x => { res[x] += 1 })
      result[key] = res
    }
    result.radial = radial
    result.yes_no = yes_no
    result.dist_quest = dist_quest
    result.distributions = distributions
    result.picUrl = res.picUrl;
    delete result['Ваша оцінка в заліковій з предмету']
    delete result['Вільний мікрофон']
    // console.log(result)
    if (rowNumbers.length > 1) {
      const row = generalTable.data.values[+rowNumbers[1] - 1];
      const sheetUrl = row[3];
      const regExpId = /(?<=https:\/\/docs\.google\.com\/spreadsheets\/d\/)[^/]+/g;
      const sheetId = sheetUrl.match(regExpId)[0];
      return Promise.resolve(sheetId);
    }
    const json = JSON.stringify(result);
    response.write(json);
    response.end();
    return Promise.resolve(null)
  }).then(sheetId => sheetId === null ? {} : asyncGet(
    {
      spreadsheetId: sheetId,
      range: 'Ответы на форму (1)!B1:T'
    }
  ).then(res => {
    const rows = res.data.values;
    const keys = res.data.values[0];
    const secondResult = {}
    // console.log('ключи в данных: ', keys)
    for (let i = 0; i < keys.length; i++) {
      for (let c = 1; c < res.data.values.length; c++) {
        if (secondResult[keys[i]]) secondResult[keys[i]].push(res.data.values[c][i])
        else secondResult[keys[i]] = [res.data.values[c][i]]
      }
    }
    secondResult['Всього опитано'] = res.data.values.length - 1
    // console.log(secondResult)
    const matches = {
      'Актуальність матеріалу': 'Актуальність лекційного матеріалу'
    }
    for (const key of radial) {
      let matchedKey = matches[key]
      if (matchedKey === undefined) matchedKey = key
      if (secondResult.hasOwnProperty(matchedKey)) {
        secondResult[key] = secondResult[matchedKey].reduce(avg, 0);
      }
    }
    for (const key of dist_quest) {
      if (secondResult.hasOwnProperty(key)) secondResult[key] = secondResult[key].reduce(avg, 0);
    }
    const correct_answer_for_rso = 'РСО була оприлюднена у перші два тижні навчання'
    for (const key of yes_no) {
      if (secondResult.hasOwnProperty(key)) secondResult[key] = secondResult[key].map(x => { return (x === correct_answer_for_rso || x == 'Так') ? 100 : 0 }).reduce(avg, 0);
    }
    delete result['Ваша оцінка в заліковій з предмету']
    delete result['Вільний мікрофон']
    
    const mergedKeys = [
      'Доступність навчальних матеріалів для засвоєння теорії',
      'Наявність переліку теоретичних питань, що будуть на заліку/екзамені',
      'Відповідність лабораторних та практичних завдань пройденому матеріалу',
      'Наявність РСО',
      'Організація часу на лекції',
      'Актуальність матеріалу',
      'Проведення лекцій на дистанційному навчанні'
    ]
    console.log(result)
    console.log(secondResult)
    // console.log(result)
    for (const key of mergedKeys) {
      if (secondResult.hasOwnProperty(key)) {
        const value1 = result[key]
        const opytanyh1 = result['Всього опитано']
        const value2 = secondResult[key]
        const opytanyh2 = secondResult['Всього опитано']
        const average = (value1 * opytanyh1 + value2 * opytanyh2) / (opytanyh1 + opytanyh2)
        console.log(key, average)
        result[key] = average
      }
    }
    const json = JSON.stringify(result);
    response.write(json);
    response.end();
  })
  )
    .catch(err => console.log(err));
}

const getJSON = (url, response) => {
  const regExp = /[^/]+/g;
  const [idPrepods, idPrepodsData] = url.match(regExp);
  fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    authorize(JSON.parse(content), listMajors, idPrepods, idPrepodsData, response);
  });
};

module.exports = getJSON;
