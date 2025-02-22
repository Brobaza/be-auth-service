export enum ErrorDictionary {
  INTERNAL_SERVER_ERROR = 'InternalServerError',
  NOT_FOUND = 'NotFound',
  FORBIDDEN = 'Forbidden',
  BAD_REQUEST = 'BadRequest',

  // * auth
  EMAIL_TAKEN = 'EmailTaken',
  PASSWORD_NOT_CHANGED = 'PasswordNotChanged',
  EMAIL_OR_PHONE_NOT_VERIFIED = 'EmailOrPhoneNotVerified',

  // * user
  EMAIL_VERIFIED = 'EmailVerified',

  // * verification
  VERIFICATION_NOT_FOUND = 'VerificationNotFound',
  VERIFICATION_EXPIRED = 'VerificationExpired',

  //* category
  CATEGORY_NOT_FOUND = 'CategoryNotFound',
  PARENT_CATEGORY_NOT_FOUND = 'ParentCategoryNotFound',
  CATEGORY_SLUG_TAKEN = 'CategorySlugAlreadyTaken',
  CATEGORY_CIRCULAR_REFERENCE = 'CategoryCircularReference',

  //* product
  PRODUCT_NOT_FOUND = 'ProductNotFound',
  PRODUCT_OUT_OF_STOCK = 'ProductOutOfStock',
  PRODUCT_SLUG_TAKEN = 'ProductSlugAlreadyTaken',

  //* bank
  BANK_NOT_FOUND = 'BankNotFound',

  //* bank account
  BANK_ACCOUNT_NOT_FOUND = 'BankAccountNotFound',

  //* transaction
  TRANSACTION_STATUS_INVALID = 'TransactionStatusInvalid',

  //* wallet
  WALLET_BALANCE_NOT_ENOUGH = 'WalletBalanceNotEnough',

  //* order
  EVENT_POINT_ALREADY_PURCHASED = 'EventPointAlreadyPurchased',
  EVENT_SOLD_OUT = 'EventSoldOut',
  EVENT_DRAW_IN_PROGRESS = 'EventDrawInProgress',
  EVENT_POINT_ALREADY_RESERVED = 'EventPointAlreadyReserved',
  ORDER_NOT_PENDING = 'OrderNotPending',
  ORDER_NOT_MATCH_USER = 'OrderNotMatchUser',
  EVENT_POINT_INVALID = 'EventPointInvalid',
  UNAUTHORIZED = 'Unauthorized',
  UNPROCESSABLE_ENTITY = 'UnprocessableEntity',

  EMAIL_AND_PHONE_NOT_VERIFIED = 'EmailAndPhoneNotVerified',
  USER_NOTFOUND = 'UserNotFound',
  UNSUPPORTED_VERIFICATION_TYPE = 'UnsupportedVerificationType',
  TO_MANY_VERIFICATION_REQUEST = 'ToManyVerificationRequest',
  EMAIL_ALREADY_TAKEN = 'EmailAlreadyTaken',
  USERNAME_ALREADY_TAKEN = 'UsernameAlreadyTaken',
  USER_ALREADY_ADMIN = 'UserAlreadyAdmin',
  USER_ALREADY_INACTIVE = 'UserAlreadyInactive',
  USER_ALREADY_ACTIVE = 'UserAlreadyActive',

  USERNAME_OR_PASSWORD_INCORRECT = 'UsernameOrPasswordIncorrect',
  USERNAME_INCORRECT = 'UsernameIncorrect',

  DEPOSIT_REQUEST_NOTFOUND = 'DepositRequestNotfound',
  EVENT_NOTFOUND = 'EventNotfound',
  EVENT_IN_PROCESS = 'EventInProcess',
  EVENT_SESSION_NOTFOUND = 'EventSessionNotfound',
  EVENT_SESSION_IN_PROCESS = 'EventSessionInProcess',

  USER_BANK_ACCOUNT_NOTFOUND = 'UserBankAccountNotfound',

  // * s3
  S3_ERROR_UPLOADING_FILE = 'S3ErrorUploadingFile',
  S3_ERROR_DELETING_FILE = 'S3ErrorDeletingFile',
  S3_ERROR_GENERATING_UPLOAD_TOKEN = 'S3ErrorGeneratingUploadToken',
  S3_ERROR_GENERATING_URL = 'S3ErrorGeneratingUrl',
  S3_ERROR_UPLOADING_FILE_WITH_URL = 'S3ErrorUploadingFileWithUrl',
  S3_NOTFOUND = 'S3NotFound',
  // * banner
  PARENT_BANNER_NOT_FOUND = 'ParentBannerNotFound',
  BANNER_SLUG_TAKEN = 'BannerSlugTaken',
  BANNER_CIRCULAR_REFERENCE = 'BannerCircularReference',
  BANNER_NOT_FOUND = 'BannerNotFound',
  BANNER_ORDER_IN_PAGE_TAKEN = 'BannerOrderInPageTaken',

  EVENT_SLUG_ALREADY_TAKEN = 'EventSlugAlreadyTaken',

  POINT_INVALID = 'PointInvalid',
  POINT_RESERVED = 'PointReserved',
  DAILY_EVENT_SOLD_OUT = 'DailyEventSoldOut',
  USER_MAX_POINTS_PURCHASED = 'UserMaxPointsPurchased',

  START_TIME_INVALID = 'StartTimeInvalid',
  END_TIME_INVALID = 'EndTimeInvalid',
  RANGE_TIME_INVALID = 'RangeTimeInvalid',

  RANGE_POINT_LANGUAGE_INVALID = 'RangePointLanguageInvalid',

  EVENT_NOT_AVAILABLE = 'EventNotAvailable',
  DAILY_EVENT_NOT_AVAILABLE = 'DailyEventNotAvailable',

  ORDER_NOTFOUND = 'OrderNotfound',
  ORDER_NOT_BELONG_TO_USER = 'OrderNotBelongToUser',
  ORDER_ALREADY_PAID = 'OrderAlreadyPaid',
  ORDER_ALREADY_CANCLLED = 'OrderAlreadyCancelled',
  INSUFFICIENT_BALANCE = 'InsufficientBalance',
  CAN_NOT_CANCEL_ORDER_WHEN_EVENT_DRAWING = 'CanNotCancelOrderWhenEventDrawing',

  MAIL_HISTORY_NOT_FOUND = 'MailHistoryNotFound',

  // * Discount
  DISCOUNT_NOT_FOUND = 'DiscountNotFound',
  DISCOUNT_TAKEN = 'DiscountTaken',
  DISCOUNT_IS_EXPIRED = 'DiscountIsExpired',
  DISCOUNT_HAS_USED = 'DiscountHasUsed',
  DISCOUNT_IS_NO_LONGER_AVAILABLE = 'DiscountIsNoLongerAvailable',
  DISCOUNT_CODE_INVALID = 'DiscountCodeInvalid',

  // * WithDraw
  WITHDRAW_NOT_FOUND = 'WithdrawNotFound',
  NOTIFICATION_NOTFOUND = 'NOTIFICATION_NOTFOUND',

  DAILY_JACKPOT_END = 'DAILY_JACKPOT_END',

  WEEKLY_JACKPOT_END = 'WEEKLY_JACKPOT_END',

  MONTHLY_JACKPOT_END = 'WEEKLY_JACKPOT_END_JACKPOT_END',

  // * Daily Jackpot
  DAILY_JACKPOT_NOTFOUND = 'DailyJackpotNotFound',
}
