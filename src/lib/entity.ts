// js对象

import { randomUUID } from "$lib/utils";

export class Message {
  id: number = 0;
  uuid: string;
  cid: string; // 会话 ID
  uid: string; // 用户 ID
  user: User;  // 用户
  content: any; // 消息内容
  type: string; // 消息类型
  time: Date; // 消息时间

  constructor() {
    // this.id = 0;
    this.uuid = randomUUID();
    this.cid = '';
    this.uid = '';
    this.user = new User();
    this.content = '';
    this.type = '';
    this.time = new Date();
  }

  setId(id: number) {
    this.id = id;
    return this;
  }

  copy(m: any) {
    this.id = m.id;
    this.uuid = m.uuid;
    this.cid = m.cdi;
    this.uid = m.uid;
    this.user = m.user;
    this.content = m.content;
    this.type = m.type;
    this.time = m.time;
    return this;
  }
}

export class UserSettings {
  language: string = '';
  voice = {};
}

export class User {
  id: number = 0;
  uuid: string;
  name: string;   // 用户名
  avatar: string; // 用户头像
  type: string;   // 用户类型，如普通用户、付费用户、订阅用户等
  role: string;   // 用户角色，系统/用户
  time: Date;     // 用户首次使用时间
  lasttime: Date;   // 用户最后一次使用时间
  settings: UserSettings; // 用户设置

  constructor() {
    this.uuid = '';
    this.name = '';
    this.avatar = '';
    this.type = '';
    this.role = '';
    this.time = new Date();
    this.lasttime = new Date();
    this.settings = new UserSettings();
  }
}