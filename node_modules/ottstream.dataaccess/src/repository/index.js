// // repository/index.js
const authRepository = require('./auth/auth.repository');
const backupRepository = require('./backup/backup.repository');
const deviceOptionRepository = require('./device/device_option.repository');
const packagesRepository = require('./package/package.repository');
const creditRepository = require('./payment/credit.repository');
const balanceRepository = require('./payment/balance.repository');
const invoiceRepository = require('./payment/invoice.repository');
const transactionRepository = require('./payment/transaction.repository');
const tokenRepository = require('./user/token.repository');
const userRepository = require('./user/user.repository');
const userActivityRepository = require('./user/user_activity.repository');
const ottProviderRepository = require('./ottprovider/ottprovider.repository');
const ottProviderAddressRepository = require('./ottprovider/ottprovider_address.repository');
const ottProviderEmailRepository = require('./ottprovider/ottprovider_email.repository');
const ottProviderShippingProviderRepository = require('./ottprovider/ottprovider_shipping_provider.repository');
const ottProviderConversationProviderRepository = require('./ottprovider/ottprovider_conversation_provider.repository');
const ottProviderPaymentGatewayRepository = require('./ottprovider/ottprovider_payment_gateway.repository');
const ottProviderOtherApiRepository = require('./ottprovider/ottprovider_other_api.repository');
const ottProviderPrinterRepository = require('./ottprovider/ottprovider_printer.repository');
const ottProviderPhoneRepository = require('./ottprovider/ottprovider_phone.repository');
const ottProviderUiRepository = require('./ottprovider/ottprovider_ui.repository');
const ottProviderInfoRepository = require('./ottprovider/ottprovider_info.repository');
const ottProviderPaymentMethodRepository = require('./ottprovider/ottprovider_payment_method.repository');
const ottProviderInvoiceRepository = require('./ottprovider/ottprovider_invoice.repository');
const ottProviderPermissionRepository = require('./ottprovider/ottprovider_permission.repository');
const fileRepository = require('./file/file.repository');
const creditCardRepository = require('./payment/credit_card/credit_card.repository');
const paymentGatewayRepository = require('./payment/payment_gateway.repository');
const paymentMethodRepository = require('./payment/payment_method.repository');
const shippingProviderRepository = require('./payment/shipping_provider.repository');
const paymentImplementationRepository = require('./payment/payment_implementation.repository');
const permissionRepository = require('./role/permission.repository');
const roleRepository = require('./role/role.repository');
const languageUnitRepository = require('./language/language_unit.repository');
const languageUnitTranslationRepository = require('./language/language_unit_translation.repository');
const languageRepository = require('./language/language.repository');
const countryRepository = require('./country/country.repository');
const iconTypeRepository = require('./icon_type/icon_type.repository');
const systemVariableRepository = require('./system/system_variable.repository');
const channelIconSetTypeRepository = require('./channel/channel_icon_set_type.repository');
const channelCategoryRepository = require('./channel/channel_category.repository');
const packageRepository = require('./package/package.repository');
const channelIconSetRepository = require('./channel/channel_icon_set.repository');
const priceGroupRepository = require('./price/price_group.repository');
const bookingRepository = require('./booking/booking.repository');
const bookingGroupRepository = require('./booking/booking.repository');
const ageGroupRepository = require('./client/age_group.repository');
const currencyRepository = require('./currency/currency.repository');
const currencyCountryRepository = require('./currency/currency_country.repository');
const productRepository = require('./product/product.repository');
const productTypeRepository = require('./product/product_type.repository');
const productPriceGroupRepository = require('./product/product_price_group.repository');
const discountRepository = require('./discount/discount.repository');
const clientRepository = require('./client/client.repository');
const clientSharedRepository = require('./client/client.shared.repository');
const clientBillRepository = require('./client_bill/client_bill.repository');
const clientActivityRepository = require('./client/client_activity.repository');
const clientPaymentMethodRepository = require('./client/client_payment_method.repository');
const clientPackageRepository = require('./client/client_package.repository');
const clientLocationRepository = require('./client/client_location.repository');
const clientProfileRepository = require('./client/client_profile.repository');
const clientUsedDeviceRepository = require('./client/client_used_device.repository');
const clientUsedDeviceActivityRepository = require('./client/client_used_device_activity.repository');
const subscriptionRepository = require('./subscription/subscription.repository');
const serverRepository = require('./server/server.repository');
const packageChannelRepository = require('./package/package_channel.repository');
const groupRepository = require('./group/group.repository');
const channelRepository = require('./channel/channel.repository');
const iconRepository = require('./icon/icon.repository');
const equipmentRepository = require('./equipement/equipement.repository');
const equipmentTypeRepository = require('./equipement/equipement_type.repository');
const equipmentInstallerRepository = require('./equipement/equipement_installer.repository');
const equipmentSubscriptionRepository = require('./subscription/equipment_subscription.repository');
const calendarEventRepository = require('./calendar/calendar_event.repository');
const commentRepository = require('./comment/comment.repository');
const notificationRepository = require('./notification/notification.repository');
const shippingRepository = require('./shipping/shipping.repository');
const geoipRepository = require('./geoip/geoip.repository');
const easyshipCourierRepository = require('./shipping/easyship_courier.repository');
const bankNameRepository = require('./payment/bank_name.repository');
const chatRepository = require('./chat/chat.repository');
const smsRepository = require('./sms/sms.repository');
const helpRepository = require('./help/help.repository');
const telegramBotRepository = require('./telegram_bot/telegram_bot.repository');

module.exports = {
  authRepository,
  backupRepository,
  deviceOptionRepository,
  packagesRepository,
  creditRepository,
  balanceRepository,
  invoiceRepository,
  transactionRepository,
  tokenRepository,
  userRepository,
  userActivityRepository,
  ottProviderRepository,
  ottProviderAddressRepository,
  ottProviderEmailRepository,
  ottProviderShippingProviderRepository,
  ottProviderConversationProviderRepository,
  ottProviderPaymentGatewayRepository,
  ottProviderOtherApiRepository,
  ottProviderPrinterRepository,
  ottProviderPhoneRepository,
  ottProviderUiRepository,
  ottProviderInfoRepository,
  ottProviderPaymentMethodRepository,
  ottProviderInvoiceRepository,
  ottProviderPermissionRepository,
  fileRepository,
  creditCardRepository,
  paymentGatewayRepository,
  paymentMethodRepository,
  shippingProviderRepository,
  paymentImplementationRepository,
  permissionRepository,
  roleRepository,
  languageUnitRepository,
  languageUnitTranslationRepository,
  languageRepository,
  countryRepository,
  iconTypeRepository,
  systemVariableRepository,
  channelIconSetTypeRepository,
  channelCategoryRepository,
  packageRepository,
  channelIconSetRepository,
  priceGroupRepository,
  bookingRepository,
  bookingGroupRepository,
  ageGroupRepository,
  currencyRepository,
  currencyCountryRepository,
  productRepository,
  productTypeRepository,
  productPriceGroupRepository,
  discountRepository,
  clientRepository,
  clientBillRepository,
  clientActivityRepository,
  clientPaymentMethodRepository,
  clientPackageRepository,
  clientSharedRepository,
  clientLocationRepository,
  clientProfileRepository,
  clientUsedDeviceRepository,
  clientUsedDeviceActivityRepository,
  subscriptionRepository,
  serverRepository,
  packageChannelRepository,
  groupRepository,
  channelRepository,
  iconRepository,
  equipmentRepository,
  equipmentTypeRepository,
  equipmentInstallerRepository,
  equipmentSubscriptionRepository,
  calendarEventRepository,
  commentRepository,
  notificationRepository,
  shippingRepository,
  geoipRepository,
  easyshipCourierRepository,
  bankNameRepository,
  chatRepository,
  smsRepository,
  helpRepository,
  telegramBotRepository
};
