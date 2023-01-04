import axios from 'axios';

class BridgeAPI {
  private API_URL: string;
  constructor(api_url: string) {
    // Nothing
    this.API_URL = api_url;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async getDevices(): Promise<any[] | null> {
    try {
      const resp = await axios.get(`${this.API_URL}/devices`);

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
