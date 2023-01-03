import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { ExamplePlatformAccessory } from './platformAccessory';
import BridgeAPI from './api';

/**
 * HomebridgePlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
export class TuyaRGBInterfacePlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  // this is used to track restored cached accessories
  public readonly accessories: PlatformAccessory[] = [];

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.log.info('Initializing platform...');

    // Called when accessories are finished being restored from the disk
    this.api.on('didFinishLaunching', () => {
      this.log.info('didFinishLaunching called. Gonna discover devices now...');
      this.getLocalDevicesFromBridge();
    });
  }

  // This call to API will give us device IDs of all tuya bulbs on the network
  private async getLocalDevicesFromBridge() {
    for (const cachedAcc of this.accessories) {
      this.log.warn('Removing zombie accessory', cachedAcc.displayName);

      this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [cachedAcc]);
    }

    const devices = await BridgeAPI.shared.getDevices();

    if (devices !== null) {
      this.log.info(`Found ${devices?.length} local devices from the bridge`);

      for (const device of devices) {
        const uuid = this.api.hap.uuid.generate(device);

        // Create and register the device with HB
        const accessory = new this.api.platformAccessory(device, uuid);

        // Store the ID in it's context
        accessory.context.id = device;

        // Setup and create handlers
        new ExamplePlatformAccessory(this, accessory);

        // Register with the API
        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      }
    } else {
      this.log.warn('No available accessories to process');
    }
  }

  /**
   * This function is invoked when homebridge restores cached accessories from disk at startup.
   * It should be used to setup event handlers for characteristics and update respective values.
   */
  configureAccessory(accessory: PlatformAccessory) {
    this.accessories.push(accessory);
  }
}
