export interface UserType {
    wallet?: {
      address: string;
    };
  }
  
  export interface ShareDataType {
    firstPartnerName: string;
    secondPartnerName: string;
    nftId: number;
    createdDate: string;
  }