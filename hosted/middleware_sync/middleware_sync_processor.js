// schedule to generate invoices
const cron = require('node-cron');
const logger = require('../../utils/logger/logger');
const {service} = require('ottstream.service');
const LocationSyncService = service.syncLocationService;
const {OttSyncService} = service.syncOttproviderService;
const PackageSyncService = service.syncPackageService;
 
// const OttSyncService = require('../../services/sync/ott_provider/ott_sync.service');
// const LocationSyncService = require('../../services/sync/location/location_sync.service');
// const PackageSyncService = require('../../services/sync/package/package_sync.service');
// const serviceCollection = require('../../services/service_collection');

const middlewareSyncCron = async () => {
  const callMinutes = '*/1 * * * *';
  cron.schedule(callMinutes, async function () {
    try {
      logger.info(`cron job: processing middleware syncs..`);
      await OttSyncService.syncProviders();
      await LocationSyncService.syncLocations();
      // await LocationSyncService.syncUsedDevices();
      await PackageSyncService.syncOptionsHosted();
      logger.info(`cron job. middleare syncs done...`);
    } catch (ex) {
      logger.error(ex);
    }
  });
};

module.exports = {
  middlewareSyncCron,
};
