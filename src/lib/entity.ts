// js对象

import { randomUUID } from "$lib/utils";

export class Message {
  id: string;
  cid: string;
  user: User;
  content: string;
  type: string;
  time: Date;

  constructor(cid: string, user: User) {
    this.id = randomUUID();
    this.cid = cid;
    this.user = user;
    this.content = '';
    this.type = '';
    this.time = new Date();
  }
}

export class UserSettings {

}

export class User {
  id: string;
  name: string;
  settings: UserSettings;

  constructor() {
    this.id = '';
    this.name = '';
    this.settings = new UserSettings();
  }
}