import { Component } from '@angular/core';

import { UsbSyncServer } from '../palm-sync/sync-servers/usb-sync-server';

import {SyncConnectionOptions} from '../palm-sync/protocols/sync-connections';
import {SyncFn, SyncServer} from '../palm-sync/sync-servers/sync-server';
import pEvent from 'p-event';
import { SyncConnection } from '../palm-sync/protocols/sync-connections';
import { HANDELD_VENDORS_ID } from '../palm-sync/sync-servers/usb-device-configs';
import { writeDbFromBuffer } from '../palm-sync/sync-utils/write-db';
import { BehaviorSubject } from 'rxjs';
import { DatabaseHdrType, RawPdbDatabase, RawPrcDatabase, RsrcEntryType } from 'palm-pdb';

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
  selector: 'app-upload-prc',
  templateUrl: './upload-prc.component.html',
  styleUrls: ['./upload-prc.component.scss']
})
export class UploadPrcComponent {

  statusLabel = new BehaviorSubject<string>('Ready');
  isWebUsbSupported = false;
  bitmapBase64: string = '';
  
  ngOnInit(): void {
    this.webUsbSupportCheck();
  }

  webUsbSupportCheck() {
    this.isWebUsbSupported = 'usb' in navigator;

    if (!this.isWebUsbSupported) {
      this.statusLabel.next('Your browser does NOT support WebUSB, and it is required.');
    }
  }

  async customUpload(event: any) {
    // Access the files from the event
    const files: File[] = event.files;

    // Log the size of each file
    files.forEach(file => {
      console.log(`File Name: ${file.name}, Size: ${this.formatBytes(file.size)}`);
    });

    this.statusLabel.next('Press the hotsync button and select your device');
    await navigator.usb.requestDevice({ filters: HANDELD_VENDORS_ID });

    this.statusLabel.next('Starting sync...');
    await runSync(this.statusLabel, async (dlpConnection) => {
      this.statusLabel.next('Sync in progress...');
      
      for (let index = 0; index < files.length; index++) {
        const file = files[index];

        const arrbuf = await file.arrayBuffer();
        const buffer = Buffer.from(arrbuf);
  
        await writeDbFromBuffer(this.statusLabel, dlpConnection, buffer, { overwrite: true });
      }
    });

  }

  // Helper function to format bytes into human-readable sizes
  formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  async onFileSelect(event: any) {
    // Handle file select event
    // const arrbuf = await event.files[0].arrayBuffer();
    // const buffer = Buffer.from(arrbuf);

    // const header = DatabaseHdrType.from(buffer);
    // const rawDb = header.attributes.resDB
    //   ? RawPrcDatabase.from(buffer)
    //   : RawPdbDatabase.from(buffer);

    // console.log(rawDb);

    // console.log(rawDb.toJSON());

    // for (let index = 0; index < rawDb.records.length; index++) {
    //   const element = rawDb.records[index].entry as RsrcEntryType;

    //   if (element.type == "Tbmp"){
    //     const bf = rawDb.records[index].data;

    //     this.bitmapBase64 = bf.toString('base64');
    //     console.log(this.bitmapBase64);
    //     return;
    //   }
      
    // }
    
  }

}

