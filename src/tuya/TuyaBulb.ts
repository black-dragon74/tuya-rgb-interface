import axios from 'axios';
import { Logger, PlatformConfig } from 'homebridge';
import { EventEmitter } from 'stream';
import { TUYA_BRIDGE_ERROR_CODES } from '../utils/const';

interface TuyaBulbState {
  power: boolean;
  online: boolean;
}

class TuyaBulb extends EventEmitter {
  private _id: string;
  private _log: Logger;
  private _config: PlatformConfig;
  private _state: TuyaBulbState;
  private _state_cache: TuyaBulbState;
  private API_URL: string;

  constructor(id: string, log: Logger, config: PlatformConfig) {
    super();
    this._id = id;
    this._log = log;
    this._config = config;

    this._state = {} as TuyaBulbState;
    this._state_cache = {} as TuyaBulbState;
    this.API_URL = config.api;

    this._log.info('Initializing TuyaBulb', this.API_URL);

    setInterval(() => {
      this._log.debug('Polling state for', this._id);
      this.getPeriodicState();
      this._log.debug('State:', this._state);
    }, 5000);

    setInterval(() => {
      this.watchState();
    }, 1000);
  }

  async turnOn() {
    const powerURL = `${this.API_URL}/${this._id}/on`;
    try {
      const req = await axios.get(powerURL);
      const resp = req.data;

      if (resp.status === 'OK') {
        this._log.info('Bulb turned on');
        this._state = { ...this._state, power: true };
      }
    } catch (err: any) {
      this._log.error('Exception turning on bulb:', err.message);
    }
  }

  getPower() {
    if (this._state.power === undefined) {
      return false;
    }

    return this._state.power;
  }

  getOnline() {
    return this._state.online;
  }

  async turnOff() {
    const powerURL = `${this.API_URL}/${this._id}/off`;
    try {
      const req = await axios.get(powerURL);
      const resp = req.data;

      if (resp.status === 'OK') {
        this._log.info('Bulb turned off');
        this._state = { ...this._state, power: false };
      }
    } catch (err: any) {
      this._log.error('Exception turning off bulb:', err.message);
    }
  }

  watchState() {
    if (this._state_cache.power !== this._state.power) {
      this._log.info('Power state changed to', this._state.power);
      this.emit('power', this._state.power);
    }

    if (this._state_cache.online !== this._state.online) {
      this._log.info('Online state changed to', this._state.online);
      this.emit('online', this._state.online);
    }

    this._state_cache = { ...this._state };
  }

  /**
   * Meant to the setup with a times that polls the state of the buld
   * from the Tuya Bridge API. It gets the state and then parses the DPS
   */
  async getPeriodicState() {
    const stateURL = `${this.API_URL}/${this._id}/status`;

    try {
      const req = await axios.get(stateURL);
      const resp = req.data;

      if (resp.Err) {
        this._log.error('Error getting state from Tuya Bridge API:', resp.Err);

        if (parseInt(resp.Err) === TUYA_BRIDGE_ERROR_CODES.ERR_OFFLINE) {
          this._log.error('Device is offline');
          this._state = { ...this._state, online: false };
        }

        return;
      }

      if (!resp.dps) {
        this._log.error('No DPS in response from Tuya Bridge API');
        return;
      }

      this._state = { ...this._state, online: true, power: resp.dps['20'] === true };
    } catch (err: any) {
      // Handle error
      this._log.error('Exception getting state from Tuya Bridge API:', err.message);
    }
  }
}

export default TuyaBulb;
