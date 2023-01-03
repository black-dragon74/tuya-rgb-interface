import axios from 'axios';
import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';

import { TuyaRGBInterfacePlatform } from './platform';
import { API_URL } from './utils/const';

export class ExamplePlatformAccessory {
  private service: Service;
  private exampleStates = {
    On: false,
    Brightness: 100,
  };

  constructor(
    private readonly platform: TuyaRGBInterfacePlatform,
    private readonly accessory: PlatformAccessory,
  ) {

    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Default-Manufacturer')
      .setCharacteristic(this.platform.Characteristic.Model, 'Default-Model')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, 'Default-Serial');

    // get the LightBulb service if it exists, otherwise create a new LightBulb service
    // you can create multiple services for each accessory
    this.service = this.accessory.getService(this.platform.Service.Lightbulb) || this.accessory.addService(this.platform.Service.Lightbulb);

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.id);

    // each service must implement at-minimum the "required characteristics" for the given service type
    // see https://developers.homebridge.io/#/service/Lightbulb

    // register handlers for the On/Off Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setOn.bind(this))                // SET - bind to the `setOn` method below
      .onGet(this.getOn.bind(this));               // GET - bind to the `getOn` method below
  }


  async setOn(value: CharacteristicValue) {
    let url: string;
    if (value as boolean === true) {
      url = `${API_URL}/${this.accessory.context.id}/on`;
    } else {
      url = `${API_URL}/${this.accessory.context.id}/off`;
    }
    try {
      await axios.get(url);
    } catch (err) {
      throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    }
  }

  /**
   * If your device takes time to respond you should update the status of your device
   * asynchronously instead using the `updateCharacteristic` method instead.

   * @example
   * this.service.updateCharacteristic(this.platform.Characteristic.On, true)
   */
  async getOn(): Promise<CharacteristicValue> {
    try {
      const resp = await axios.get(`${API_URL}/${this.accessory.context.id}/power`);
      this.platform.log.debug(`Power status of ${this.accessory.context.id} is ${resp.data.power}`);

      return resp.data.power as boolean;

    } catch (err: unknown) {
      this.platform.log.error(err as string);
      throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    }
  }

}
