declare module 'bakong-khqr' {
  export class IndividualInfo {
    constructor(
      bakongAccountID: string,
      merchantName: string,
      merchantCity: string,
      optional?: {
        amount?: number;
        currency?: number;
        billNumber?: string;
        storeLabel?: string;
        terminalLabel?: string;
        mobileNumber?: string;
        purposeOfTransaction?: string;
        expirationTimestamp?: number;
        languagePreference?: string;
        merchantNameAlternateLanguage?: string;
        merchantCityAlternateLanguage?: string;
        accountInformation?: string;
        acquiringBank?: string;
        upiMerchantAccount?: string;
        merchantCategoryCode?: string;
      }
    );
  }

  export class MerchantInfo extends IndividualInfo {
    constructor(
      bakongAccountID: string,
      merchantName: string,
      merchantCity: string,
      merchantID: string,
      acquiringBank: string,
      optional?: {
        amount?: number;
        currency?: number;
        billNumber?: string;
        storeLabel?: string;
        terminalLabel?: string;
        mobileNumber?: string;
        purposeOfTransaction?: string;
        expirationTimestamp?: number;
        languagePreference?: string;
        merchantNameAlternateLanguage?: string;
        merchantCityAlternateLanguage?: string;
        accountInformation?: string;
        upiMerchantAccount?: string;
        merchantCategoryCode?: string;
      }
    );
  }

  export class BakongKHQR {
    generateIndividual(individualInfo: IndividualInfo): KHQRResponse;
    generateMerchant(merchantInfo: MerchantInfo): KHQRResponse;
    static decode(KHQRString: string): KHQRResponse;
    static decodeNonKhqr(KHQRString: string): KHQRResponse;
    static verify(KHQRString: string): { isValid: boolean };
    static generateDeepLink(url: string, qr: string, sourceInfo?: SourceInfo): Promise<KHQRResponse>;
    static checkBakongAccount(url: string, bakongID: string): Promise<KHQRResponse>;
  }

  export interface KHQRData {
    qr: string;
    md5: string;
  }

  export interface KHQRResponse {
    data?: KHQRData;
    status?: any;
    qr?: string;
    md5?: string;
  }

  export class SourceInfo {
    constructor(appIconUrl: string, appName: string, appDeepLinkCallback: string);
  }

  export const khqrData: {
    currency: {
      usd: number;
      khr: number;
    };
    merchantType: {
      merchant: string;
      individual: string;
    };
  };
}
