import axios from 'axios';
import { API_URL } from '../utils/const';

class BridgeAPI {
  private constructor(){
    // Nothing
  }

  public static shared = new BridgeAPI();

  public async getDevices(): Promise<string[]|null> {
    try {
      const resp = await axios.get(`${API_URL}/devices`);

      if (resp.status !== 200 || resp.data.status !== 'OK') {
        return null;
      }

      return resp.data.devices;
    } catch (err) {
      return null;
    }
  }
}

export default BridgeAPI;