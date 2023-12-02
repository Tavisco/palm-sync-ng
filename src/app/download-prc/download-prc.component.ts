import { Component } from '@angular/core';
import { DlpDBInfoType } from '../palm-sync/protocols/dlp-commands';
import { BehaviorSubject } from 'rxjs';
import { readDbList } from '../palm-sync/sync-utils/read-db';
import * as pEvent from 'p-event';
import { SyncConnectionOptions, SyncConnection } from '../palm-sync/protocols/sync-connections';
import { SyncFn, SyncServer } from '../palm-sync/sync-servers/sync-server';
import { UsbSyncServer } from '../palm-sync/sync-servers/usb-sync-server';
import { HANDELD_VENDORS_ID } from '../palm-sync/sync-servers/usb-device-configs';


export async function runSync(
  statusLabel: BehaviorSubject<string>,
  /** Sync function to run for new connections. */
  syncFn: SyncFn,
  /** Additional options for the sync connection. */
  opts: SyncConnectionOptions = {}
) {
var syncServer: SyncServer = new UsbSyncServer(syncFn, opts);

syncServer.start(statusLabel);

console.log('Component: Waiting for connection...');
const connection: SyncConnection = await pEvent(syncServer, 'connect');
console.log('Component: Connected!');

await pEvent(syncServer, 'disconnect');

console.log('Component: Disconnected');

await syncServer.stop();
return connection;
}


@Component({
  selector: 'app-download-prc',
  templateUrl: './download-prc.component.html',
  styleUrls: ['./download-prc.component.scss']
})
export class DownloadPrcComponent {

  loading = false;
  databases: DlpDBInfoType[] = [];
  statusLabel = new BehaviorSubject<string>('Ready');

  async load() {

    this.statusLabel.next('Press the hotsync button and select your device');
    await navigator.usb.requestDevice({ filters: HANDELD_VENDORS_ID });

    await runSync(this.statusLabel, async (dlpConnection) => {
      try {
        this.databases = await readDbList(this.statusLabel, dlpConnection, {
          ram: true,
          rom: false,
        });
  
        console.log(this.databases.map(({name}) => `=> ${name}`).join('\n'));

        console.log(this.databases);
      } catch (error) {
        console.log(error);
      }
      
    });

  }

}
