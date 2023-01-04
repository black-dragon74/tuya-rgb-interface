import * as dotenv from 'dotenv';
dotenv.config();

export const API_URL = process.env.TUYA_API_URL || 'http://192.168.0.177:5000';

export const enum TUYA_BULB_DPS {
  POWER = 20,
  MODE,
  BRIGHTNESS,
  COLOR_TEMP,
  COLOR,
  SCENE_MODE,
  TTL,
}

export const enum TUYA_BRIDGE_ERROR_CODES {
  ERR_JSON = 900,
  ERR_CONNECT,
  ERR_TIMEOUT,
  ERR_RANGE,
  ERR_PAYLOAD,
  ERR_OFFLINE,
  ERR_STATE,
  ERR_FUNCTION,
  ERR_DEVTYPE,
  ERR_CLOUDKEY,
  ERR_CLOUDRESP,
  ERR_CLOUDTOKEN,
  ERR_PARAMS,
  ERR_CLOUD,
}
