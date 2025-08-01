"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/global/fn/pupTest.ts
var process2 = __toESM(require("node:process"));

// src/global/classes/Setting.ts
var import_node_process = __toESM(require("node:process"));
var jsonSettingsFilePath = import_node_process.default.env.SETTINGS_JSON_PATH ?? "settings.json";
var Setting = class _Setting {
  data = {
    lastWifiMacAddr: ""
  };
  loaded = false;
  static instance;
  static getInstance() {
    if (!_Setting.instance) {
      _Setting.instance = new _Setting();
    }
    return _Setting.instance;
  }
  constructor() {
    this.init();
  }
  async init() {
    this.data = await loadJsonFromFile(jsonSettingsFilePath);
    this.loaded = true;
  }
  async get(key, noCache = true) {
    if (!this.loaded || noCache) {
      await this.init();
    }
    return this.data[key];
  }
  async set(key, value) {
    if (!this.loaded) {
      await this.init();
    }
    this.data[key] = value;
    await saveJsonObjectToFile(jsonSettingsFilePath, this.data);
  }
};

// src/global/fn/convertMacToUrl.ts
function convertMacToUrl(mac, loginUrl) {
  const upperMac = mac.toUpperCase();
  const encodedMac = encodeURIComponent(`T-${upperMac}`);
  return `${loginUrl}?dst=&username=${encodedMac}`;
}

// src/global/fn/fetchWithTimeout.ts
async function fetchWithTimeout(url, options = {}, timeout = 5e3) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error(`Request to ${url} timed out after ${timeout} ms`);
    }
    throw err;
  }
}

// src/global/fn/pupTest.ts
var routerIp = process2.env.ROUTER_IP;
async function pupTest(macAddr) {
  if (macAddr.length < 1)
    return;
  console.log(`pupTest()`);
  const settings = Setting.getInstance();
  const loginUrl = `http://${routerIp}/login`;
  const finalUrl = convertMacToUrl(macAddr, loginUrl);
  let newPageResp = null;
  try {
    newPageResp = await fetchWithTimeout(finalUrl).then((r) => r.text());
  } catch (e) {
    console.error(e);
  }
  console.log(finalUrl, newPageResp);
  if (newPageResp !== null) {
    await settings.set("lastWifiMacAddr", macAddr);
  }
}

// src/global/fn/getCurrentWifiMacAddr.ts
var import_os = __toESM(require("os"));
function getCurrentWifiMacAddr(netIfaceName) {
  const networkInterfaces = import_os.default.networkInterfaces();
  let macAddr = "";
  const wifiInterface = networkInterfaces[netIfaceName];
  if (wifiInterface) {
    const wifiDetails = wifiInterface.find(
      (iface) => iface.family === "IPv4" && !iface.internal
    );
    if (wifiDetails) {
      macAddr = wifiDetails.mac;
    } else {
      console.log("WiFi interface found, but no IPv4 details available.");
    }
  } else {
    console.log("WiFi interface not found. Make sure the name is correct.");
  }
  return macAddr;
}

// src/global/fn/loadJsonFromFile.ts
var fs = __toESM(require("node:fs"));
async function loadJsonFromFile(path) {
  let jsonObject = {};
  try {
    const buffer = await fs.readFileSync(path, "utf8");
    jsonObject = JSON.parse(buffer);
  } catch (err) {
    console.error("Could not read JSON from file: ", err);
  }
  return jsonObject;
}

// src/global/fn/saveJsonObjectToFile.ts
var fs2 = __toESM(require("node:fs"));
async function saveJsonObjectToFile(path, data) {
  let jsonObject = {};
  let validated = false;
  try {
    const buffer = await fs2.readFileSync(path, "utf8");
    jsonObject = JSON.parse(buffer);
    if (typeof data === "object") {
      const dataKeys = Object.keys(data);
      for (const key of dataKeys) {
        jsonObject[key] = data[key];
      }
    }
    validated = true;
  } catch (err) {
    console.error("Could not read JSON from file: ", err);
  }
  if (validated) {
    console.log("Saved JSON to file: ", path);
    await fs2.writeFileSync(path, JSON.stringify(jsonObject, null, 2));
  }
  return jsonObject;
}

// src/main.ts
var process3 = __toESM(require("node:process"));

// src/global/fn/isInternetConnected.ts
var import_https = __toESM(require("https"));
async function isInternetConnected() {
  return new Promise((resolve) => {
    const req = import_https.default.get("https://www.google.com", { timeout: 3e3 }, (res) => {
      resolve(true);
    });
    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
  });
}

// src/global/fn/waitForMacChanges.ts
async function waitForMacChanges(timeout = 1e3, netIfaceName, callback) {
  const settings = Setting.getInstance();
  let callbackIsRunning = false;
  setInterval(async () => {
    const currentWifiMacAddr = getCurrentWifiMacAddr(netIfaceName);
    const lastWifiMacAddr = await settings.get("lastWifiMacAddr");
    let connected = await isInternetConnected();
    if (currentWifiMacAddr !== lastWifiMacAddr && !connected) {
      if (typeof callback === "function") {
        await callback(currentWifiMacAddr);
      }
    } else {
      if (!connected) {
        if (typeof callback === "function") {
          console.log(`Calling callback again because inet not connected`);
          await callback(currentWifiMacAddr);
        }
      }
      console.log(connected, `Waiting for mac changes  ${currentWifiMacAddr}`);
    }
  }, timeout);
}

// src/main.ts
var networkInterfaceName = process3.env.NETWORK_IFACE_NAME;
if (process3.platform === "win32") {
  networkInterfaceName = process3.env.NETWORK_IFACE_NAME_WIN;
}
var main = async () => {
  let pupIsRunning = false;
  await waitForMacChanges(3e3, networkInterfaceName, async (macAddr) => {
    console.log("Mac Changed", macAddr);
    if (!pupIsRunning) {
      try {
        pupIsRunning = true;
        await pupTest(macAddr);
        pupIsRunning = false;
      } catch (e) {
        console.error(e);
        pupIsRunning = false;
      }
    } else {
      console.log("pup is Running");
    }
  });
};
main();
