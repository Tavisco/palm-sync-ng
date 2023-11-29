import { Component } from '@angular/core';

import { UsbSyncServer } from '../palm-sync/sync-servers/usb-sync-server';

import {DlpGetSysDateTimeReqType} from '../palm-sync/protocols/dlp-commands';
import {SyncConnectionOptions} from '../palm-sync/protocols/sync-connections';
import {SyncFn, SyncServer} from '../palm-sync/sync-servers/sync-server';
import pEvent from 'p-event';
import { SyncConnection } from '../palm-sync/protocols/sync-connections';
import { HANDELD_VENDORS_ID } from '../palm-sync/sync-servers/usb-device-configs';
import { writeDbFromBuffer } from '../palm-sync/sync-utils/write-db';

async function runSync(
    /** Sync function to run for new connections. */
    syncFn: SyncFn,
    /** Additional options for the sync connection. */
    opts: SyncConnectionOptions = {}
) {
  var syncServer: SyncServer = new UsbSyncServer(syncFn, opts);

  syncServer.start();

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



  async customUpload(event: any) {
    // Access the files from the event
    const files: File[] = event.files;

    // Log the size of each file
    files.forEach(file => {
      console.log(`File Name: ${file.name}, Size: ${this.formatBytes(file.size)}`);
    });

    await navigator.usb.requestDevice({ filters: HANDELD_VENDORS_ID});

    await runSync(async (dlpConnection) => {

      const arrbuf = await files[0].arrayBuffer();
      const buffer = Buffer.from(arrbuf);

      await writeDbFromBuffer(dlpConnection, buffer, { overwrite: true });

      // const reader = new FileReader();

      // reader.onload = async (event) => {
      //   if (event.target?.result) {
      //     const arrayBuffer = event.target.result as ArrayBuffer;
      //     const bufferFromArrayBuffer = Buffer.from(arrayBuffer);

      //     // Now you can use 'bufferFromArrayBuffer' as a Buffer object
      //     await writeDbFromBuffer(dlpConnection, bufferFromArrayBuffer, { overwrite: true });
      //   }
      // };

      // await reader.readAsArrayBuffer(files[0]);

      
      // console.log('Preparing command');
      // const {dateTime: deviceDateTime} = await dlpConnection.execute(
      //   DlpGetSysDateTimeReqType.with()
      // );
      // console.log('command executed!');
      // const lines: Array<[string, string]> = [
      //   ['OS version', dlpConnection.sysInfo.romSWVersion.toString()],
      //   ['DLP version', dlpConnection.sysInfo.dlpVer.toString()],
      //   ['User name', dlpConnection.userInfo.userName],
      //   ['Last sync PC', dlpConnection.userInfo.lastSyncPc.toString()],
      //   ['User ID', dlpConnection.userInfo.userId.toString()],
      //   ['Last sync', dlpConnection.userInfo.lastSyncDate.toLocaleString()],
      //   [
      //     'Last sync succ',
      //     dlpConnection.userInfo.succSyncDate.toLocaleString(),
      //   ],
      //   ['System time', deviceDateTime.toLocaleString()],
      // ];
      // console.log(
      //   lines.map(([label, value]) => `\t${label}:\t${value}`).join('\n')
      // );
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

  onFileSelect(event: any) {
    // Handle file select event
    console.log('File selected:', event);
  }

}
