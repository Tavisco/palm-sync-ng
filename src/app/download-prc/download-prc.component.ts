import { Component } from '@angular/core';
import { DlpDBInfoType } from '../palm-sync/protocols/dlp-commands';
import { BehaviorSubject } from 'rxjs';
import { readDbList, readRawDb } from '../palm-sync/sync-utils/read-db';
import * as pEvent from 'p-event';
import { SyncConnectionOptions, SyncConnection } from '../palm-sync/protocols/sync-connections';
import { SyncFn, SyncServer } from '../palm-sync/sync-servers/sync-server';
import { UsbSyncServer } from '../palm-sync/sync-servers/usb-sync-server';
import { HANDELD_VENDORS_ID } from '../palm-sync/sync-servers/usb-device-configs';
import { RawPdbDatabase, RawPrcDatabase } from 'palm-pdb';


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
  sourceDatabases: DlpDBInfoType[] = [];
  selectedDatabases: DlpDBInfoType[] = [];
  statusLabel = new BehaviorSubject<string>('Ready');

  async load() {
    this.loading = true;
    this.statusLabel.next('Press the hotsync button and select your device');
    await navigator.usb.requestDevice({ filters: HANDELD_VENDORS_ID });

    await runSync(this.statusLabel, async (dlpConnection) => {
      try {
        this.sourceDatabases = await readDbList(this.statusLabel, dlpConnection, {
          ram: true,
          rom: false,
        });

        //console.log(this.sourceDatabases);
      } catch (error) {
        console.log(error);
      }
    });

    this.loading = false;
  }

  async downloadSelected() {
    this.loading = true;

    this.statusLabel.next('Press the hotsync button and select your device');
    await navigator.usb.requestDevice({ filters: HANDELD_VENDORS_ID });

    let resources: (RawPdbDatabase | RawPrcDatabase)[] = []

    await runSync(this.statusLabel, async (dlpConnection) => {
      try {
        for (const db of this.selectedDatabases) {
          console.log(`Start pulling ${db.name}`);
          this.statusLabel.next(`Pulling ${db.name}`);
          const rawDb = await readRawDb(this.statusLabel, dlpConnection, db.name);
          const ext = rawDb.header.attributes.resDB ? 'prc' : 'pdb';
          const fileName = `${db.name}.${ext}`;
          console.log(`Successfully pulled ${fileName}`);
          resources.push(rawDb);
        }

      } catch (error) {
        console.log(error);
      }
    });

    console.log('Finished downloading!');
    console.log(resources);

    resources.forEach(rsc => {
      const file = new Blob([rsc.serialize()], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(file);

      const a = document.createElement('a');
      a.href = url;
      const ext = rsc.header.attributes.resDB ? 'prc' : 'pdb';
      const fileName = `${rsc.header.name}.${ext}`;
      a.download = fileName;
      a.click();
    
    });

    this.loading = false;
  }

}
