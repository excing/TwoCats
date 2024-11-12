import { Message, User } from "./entity";

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

const Name_messageStore = 'messages';
const Name_userStore = 'users';
const Name_wordStore = 'words';

export let pageCount = 10; // 数据库查询每页大小

const insert = (
  db: IDBDatabase,
  v: Message | User,
) => {
  return new Promise((resolve, reject) => {
    let storeName = v instanceof Message ? Name_messageStore : Name_userStore;
    const transaction = db.transaction([storeName], "readwrite");
    const objectStore = transaction.objectStore(storeName);
    const _v = { ...v }
    Reflect.deleteProperty(_v, "id");
    const request = objectStore.put(_v);
    request.onsuccess = (e) => {
      resolve(e);
    };
    request.onerror = (e) => {
      reject(e);
    };
  })
}

/**
 * 
 * @param db 数据库 Indexeddb 实例
 * @param v 要删除的数据，如果 id 不为空，则删除指定 id 的数据，如果 id 为空而 type 不为空，则删除指定 type 的索引
 * @returns 返回一个 Promise
 */
const remove = (
  db: IDBDatabase,
  v: Message | User,
) => {
  return new Promise((resolve, reject) => {
    let storeName = v instanceof Message ? Name_messageStore : Name_userStore;

    const transaction = db.transaction([storeName], "readwrite");

    if (v.id) {
      const objectStore = transaction.objectStore(storeName);
      const request = objectStore.delete(v.id);
      request.onsuccess = (e) => {
        resolve(e);
      };
      request.onerror = (e) => {
        reject(e);
      };
    } else {
      // 在所有数据添加完毕后的处理
      transaction.oncomplete = (event) => {
        resolve(event);
      };
      transaction.onerror = (event) => {
        reject(event);
      };
      transaction.objectStore(storeName).deleteIndex(v.type);
    }
  })
}

const page = (
  db: IDBDatabase,
  v: Message | User,
  dir: number = 0,
) => {
  return new Promise((resolve, reject) => {
    let storeName = v instanceof Message ? Name_messageStore : Name_userStore;

    const objectStore = db.transaction([storeName]).objectStore(storeName);

    // 匹配所有大于指定 id 的，但不包括该 id
    const lowerBoundOpenKeyRange = v.id ? IDBKeyRange.lowerBound(v.id, true) : null;
    const request = objectStore.openCursor(lowerBoundOpenKeyRange, 0 <= dir ? 'next' : 'prev');
    const arr: any[] = [];
    let count = pageCount;
    request.onsuccess = (e) => {
      const cursor = request.result;
      if (cursor) {
        // 对记录进行一些操作。
        if (0 <= dir) { // next 查询时，最新记录在后
          arr.push(cursor.value);
        } else {        // prev 查询时，最新记录在前，unshift 将数据插入第一个
          arr.unshift(cursor.value);
        }
        if (0 === (--count)) {
          resolve({ arr });
        } else {
          cursor.continue();
        }
      } else {
        resolve({ arr });
      }
    };
    request.onerror = (e) => {
      reject(e);
    };
  })
}

const close = (db: IDBDatabase,) => {
  return new Promise((resolve, reject) => {
    db.onclose = (e) => {
      console.log('indexeddb closed');
    }
    db.close();
    console.log('indexeddb closing...');
  })
}

// todo: db 未正确关闭
export function opendb() {
  return new Promise((resolve, reject) => {
    let request = window.indexedDB.open("TwoCatsDB", 1);

    request.onupgradeneeded = (event) => {
      let db = request.result;

      if (!event.newVersion || 1 <= event.newVersion) {
        // 创建消息表
        // 创建一个对象存储来存储我们客户的相关信息，我们将“id”作为键路径
        // 因为 id 可以保证是不重复的。
        const msgStore = db.createObjectStore(Name_messageStore, { keyPath: "id", autoIncrement: true });
        msgStore.createIndex("uuid", "uuid", { unique: true });

        // 创建一个索引以通过 cid 来搜索客户。会话ID可能会重复，所以我们不能使用 unique 索引。
        msgStore.createIndex("cid", "cid", { unique: false });
        msgStore.createIndex("uid", "uid", { unique: false });
        msgStore.createIndex("content", "content", { unique: false });
        msgStore.createIndex("type", "type", { unique: false });
        msgStore.createIndex("time", "time", { unique: false });

        // 创建用户表
        const userStore = db.createObjectStore(Name_userStore, { keyPath: "id", autoIncrement: true });

        userStore.createIndex("uuid", "uuid", { unique: true });
        userStore.createIndex("name", "name", { unique: false });
        userStore.createIndex("avatar", "avatar", { unique: false });
        userStore.createIndex("type", "type", { unique: false });
        userStore.createIndex("role", "role", { unique: false });
        userStore.createIndex("settings", "settings", { unique: false });
        userStore.createIndex("time", "time", { unique: false });
        userStore.createIndex("last", "last", { unique: false });

        // 创建单词/句子表
        const wordStore = db.createObjectStore(Name_wordStore, { keyPath: "id", autoIncrement: true });

        wordStore.createIndex("text", "text", { unique: true });
        wordStore.createIndex("type", "type", { unique: false }); // 单词 or 句子
        wordStore.createIndex("result", "result", { unique: false });
      }

      // 使用邮箱建立索引，我们想确保客户的邮箱不会重复，所以我们使用 unique 索引。
      // objectStore.createIndex("email", "email", { unique: true });

      console.log('db onupgradeneeded');
    }

    request.onerror = (event) => {
      // 使用 request.errorCode 来做点什么！
      console.error(`数据库错误：${event}`);
      reject(event);
    };
    request.onsuccess = (event) => {
      // 使用 request.result 来做点什么！
      let db = request.result;

      resolve({ insert, remove, page, close, db });
    };
  })
}