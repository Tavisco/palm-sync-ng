/** Writing PDB / PRC files to a Palm OS device using HotSync.
 *
 * References:
 *   - pilot-link's pi_file_install() function:
 *     https://github.com/jichu4n/pilot-link/blob/master/libpisock/pi-file.c#L784
 *   - coldsync's upload_database() function:
 *     https://github.com/dwery/coldsync/blob/master/src/install.c#L49
 *
 * @module
 */

import {
  DatabaseHdrType,
  RawPdbDatabase,
  RawPdbRecord,
  RawPrcDatabase,
  RawPrcRecord,
} from 'palm-pdb';

import {
  DlpCloseDBReqType,
  DlpCreateDBReqType,
  DlpDeleteDBReqType,
  DlpOpenConduitReqType,
  DlpRecordAttrs,
  DlpResetSystemReqType,
  DlpWriteAppBlockReqType,
  DlpWriteRecordReqType,
  DlpWriteResourceReqType,
  DlpWriteSortBlockReqType,
} from '../protocols/dlp-commands';
import {DlpRespErrorCode} from '../protocols/dlp-protocol';
import {DlpConnection} from '../protocols/sync-connections';
import { BehaviorSubject } from 'rxjs';

/** Options to {@link readDb} and {@link readRawDb}. */
export interface WriteDbOptions {
  /** Card number on the Palm OS device (typically 0). */
  cardNo?: number;
  /** Whether to overwrite an existing database.
   *
   * If false (the default), an error will be thrown if a database with the same
   * name already exists on the device.
   *
   * If true, an existing database on the device with the same name will be overwritten.
   */
  overwrite?: boolean;
}

function log(statusLabel: BehaviorSubject<string>, dbName: String, msg: string) {
  console.log(`${dbName} - ${msg}`);
  statusLabel.next(`${dbName} - ${msg}`);
}

export async function writeDbFromBuffer(
  statusLabel: BehaviorSubject<string>,
  dlpConnection: DlpConnection,
  buffer: Buffer,
  opts: WriteDbOptions = {}
): Promise<void> {
  const header = DatabaseHdrType.from(buffer);
  const rawDb = header.attributes.resDB
    ? RawPrcDatabase.from(buffer)
    : RawPdbDatabase.from(buffer);
  return writeRawDb(statusLabel, dlpConnection, rawDb, opts);
}

/** Install a database to a Palm OS device. */
export async function writeRawDb(
  statusLabel: BehaviorSubject<string>,
  dlpConnection: DlpConnection,
  /** Database to write. */
  db: RawPdbDatabase | RawPrcDatabase,
  {cardNo = 0, overwrite}: WriteDbOptions = {}
): Promise<void> {
  log(statusLabel, db.header.name, `Writing database ${db.header.name} to card ${cardNo}`);
  await dlpConnection.execute(DlpOpenConduitReqType.with());

  // TODO: pilot-link's pi_file_install() function checks the size of records,
  // and aborts if trying to install records exceeds 64k in size to an older
  // device (DLP version 1.4 / Palm OS 5.2 or later). We should do the same.

  // Whether to reset the device after install.
  let shouldReset =
    db.header.attributes.resetAfterInstall ||
    // All system updates have the creator 'ptch'
    db.header.creator === 'ptch';

  // 1. If we intend to overwrite, delete the database if it already exists.
  if (overwrite) {
    log(statusLabel, db.header.name, `Deleting existing database`);
    await dlpConnection.execute(
      DlpDeleteDBReqType.with({cardNo, name: db.header.name}),
      {ignoreErrorCode: DlpRespErrorCode.NOT_FOUND}
    );
  }

  // 2. Create the database.
  log(statusLabel, db.header.name, `Creating database`);
  const {dbId} = await dlpConnection.execute(
    DlpCreateDBReqType.with({
      creator: db.header.creator,
      type: db.header.type,
      cardNo,
      dbFlags: db.header.attributes,
      version: db.header.version,
      name: db.header.name,
    })
  );

  // 3. Write AppInfo block.
  if (db.appInfo && db.appInfo.getSerializedLength()) {
    log(statusLabel, db.header.name, `Writing AppInfo block`);
    await dlpConnection.execute(
      DlpWriteAppBlockReqType.with({dbId, data: db.appInfo.value})
    );
  }

  // 4. Write SortInfo block.
  if (db.sortInfo && db.sortInfo.getSerializedLength()) {
    log(statusLabel, db.header.name, `Writing SortInfo block`);
    await dlpConnection.execute(
      DlpWriteSortBlockReqType.with({dbId, data: db.sortInfo.value})
    );
  }

  // 5. Write records.
  if (db.header.attributes.resDB) {
    if (!(db instanceof RawPrcDatabase)) {
      console.error('Expected PRC database');
      throw new Error('Expected PRC database');
    }
    log(statusLabel, db.header.name, `Writing records`);
    for (let i = 0; i < db.records.length; i++) {
      //log(statusLabel, db.header.name, );
      statusLabel.next(`${db.header.name} - Writing resource ${i + 1} of ${db.records.length}`);
      const record = db.records[i];
      await dlpConnection.execute(
        createWriteResourceReqFromRawPrcRecord(dbId, record)
      );
      // If we see a 'boot' section, we should reset the system.
      if (record.entry.type === 'boot') {
        shouldReset = true;
      }
    }
  } else {
    if (!(db instanceof RawPdbDatabase)) {
      console.error('Expected PDB database');
      throw new Error('Expected PDB database');
    }
    for (let i = 0; i < db.records.length; i++) {
      statusLabel.next(`${db.header.name} - Writing record ${i + 1} of ${db.records.length}`);
      const record = db.records[i];
      await dlpConnection.execute(
        createWriteRecordReqFromRawPdbRecord(dbId, record)
      );
    }
  }

  // 6. Close the database.
  if (shouldReset) {
    log(statusLabel, db.header.name, `Resetting device`);
    await dlpConnection.execute(DlpResetSystemReqType.with());
  }
  log(statusLabel, db.header.name, 'Closing database');
  await dlpConnection.execute(DlpCloseDBReqType.with({dbId}));
}

export function createWriteRecordReqFromRawPdbRecord(
  dbId: number,
  record: RawPdbRecord
) {
  const {attributes, category} = DlpRecordAttrs.fromRecordAttrs(
    record.entry.attributes
  );
  return DlpWriteRecordReqType.with({
    dbId,
    recordId: record.entry.uniqueId,
    attributes,
    category,
    data: record.data,
  });
}

export function createWriteResourceReqFromRawPrcRecord(
  dbId: number,
  record: RawPrcRecord
) {
  return DlpWriteResourceReqType.with({
    dbId,
    type: record.entry.type,
    id: record.entry.resourceId,
    data: record.data,
  });
}
