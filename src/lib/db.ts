const Key_userSettings = 'userSettings';

export function saveUserSettings(settings: any) {
  let _settings = JSON.stringify(settings);
  localStorage.setItem(Key_userSettings, _settings);
}

export function getUserSettings() {
  let _settings = localStorage.getItem(Key_userSettings);
  if (_settings) {
    return JSON.parse(_settings);
  }
  return false;
}

class TwoCatsDB {
  request: IDBOpenDBRequest;
  db: IDBDatabase;
  constructor() {
    let request = window.indexedDB.open("TwoCatsDB", 1);

    request.onerror = (event) => {
      // 使用 request.errorCode 来做点什么！
      console.error(`数据库错误：${event}`);
    };
    request.onsuccess = (event) => {
      // 使用 request.result 来做点什么！
    };

    this.request = request;
    this.db = request.result;
  }
}

