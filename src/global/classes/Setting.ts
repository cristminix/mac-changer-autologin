import process from "node:process";
import { loadJsonFromFile, saveJsonObjectToFile } from "@/global/fn";

const jsonSettingsFilePath = process.env.SETTINGS_JSON_PATH as string;
export interface ISettingData {
  lastWifiMacAddr: string;
}
export class Setting {
  data: ISettingData = {
    lastWifiMacAddr: "",
  };
  loaded: boolean = false;
  static instance: Setting;
  static getInstance() {
    if (!Setting.instance) {
      Setting.instance = new Setting();
    }
    return Setting.instance;
  }

  constructor() {
    this.init();
  }

  async init() {
    this.data = await loadJsonFromFile(jsonSettingsFilePath);
    this.loaded = true;
  }

  async get(key: string, noCache = true): Promise<string> {
    if (!this.loaded || noCache) {
      await this.init();
    }
    console.log({ data: this.data });
    return this.data[key as keyof ISettingData];
  }

  async set(key: string, value: string): Promise<void> {
    if (!this.loaded) {
      await this.init();
    }
    this.data[key as keyof ISettingData] = value;
    await saveJsonObjectToFile(jsonSettingsFilePath, this.data);
  }
}
