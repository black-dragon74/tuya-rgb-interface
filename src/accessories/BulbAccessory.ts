import { CharacteristicValue, PlatformAccessory, Service } from 'homebridge';
import { TuyaRGBInterfacePlatform } from '../platform';
import TuyaBulb from '../tuya/TuyaBulb';

class BulbAccessory {
  private service: Service;
  private readonly TuyaBulb: TuyaBulb;

  constructor(
    private readonly platform: TuyaRGBInterfacePlatform, // Contains homebridge platform
    private readonly accessory: PlatformAccessory, // This is an accessory we created in the platform
  ) {
    // Set the bulb
    this.TuyaBulb = new TuyaBulb(accessory.context.device.id, platform.log);

    // set accessory information
    this.accessory
      .getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Nicks Tuya RGB Interface')
      .setCharacteristic(this.platform.Characteristic.Model, 'TuyaLocalBridge v1')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, this.accessory.context.device.id);

    // get the LightBulb service if it exists, otherwise create a new LightBulb service
    this.service = this.accessory.getService(this.platform.Service.Lightbulb) || this.accessory.addService(this.platform.Service.Lightbulb);

    // Set the name that is displayed in the Home app
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);

    // Watch for state changes to update the state asynchonously
    this.TuyaBulb.on('power', (currentPower: boolean) => {
      this.platform.log.info('Power changed to', currentPower);
      this.service.updateCharacteristic(this.platform.Characteristic.On, currentPower);
    });

    this.TuyaBulb.on('online', (isConnected: boolean) => {
      if (!isConnected) {
        this.platform.log.info('Device went offline');
        throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
      }
      this.platform.log.info('Device came back online!');
      this.service.updateCharacteristic(this.platform.Characteristic.On, this.TuyaBulb.getPower());
    });

    // Add handlers for the On/Off Characteristic
    this.service
      .getCharacteristic(this.platform.Characteristic.On)
      .onGet(() => {
        this.platform.log.info('Get On:', this.accessory.displayName);
        return this.TuyaBulb.getPower();
      })
      .onSet(async (value: CharacteristicValue) => {
        this.platform.log.info('Set On:', this.accessory.displayName, value);
        if ((value as boolean) === true) {
          await this.TuyaBulb.turnOn();
        } else {
          await this.TuyaBulb.turnOff();
        }
      });
  }
}

export default BulbAccessory;
