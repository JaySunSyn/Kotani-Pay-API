import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocumentInterface } from '@kotanicore/repository/interface/user-document.interface';
import { AccountDocumentInterface } from '@kotanicore/repository/interface/account-document.interface';
import { KycDocumentInterface } from '@kotanicore/repository/interface/kyc-document.interface';
import { AccountInterface } from '@kotanicore/repository/interface/account.interface';
import { UserInterface } from '@kotanicore/repository/interface/user.interface';

/**/
export class BaseMongoRepository {
  constructor(
    @InjectModel('user')
    private readonly userModel: Model<UserDocumentInterface>,
    @InjectModel('accounts')
    private readonly accountModel: Model<AccountDocumentInterface>,
    @InjectModel('kycdata')
    private readonly kycModel: Model<KycDocumentInterface>,
  ) {}

  checkIfUserExists = async (phone: string): Promise<UserInterface> => {
    const user = await this.userModel.findOne({ phoneNumber: phone }).exec();
    if (!user) {
      return null;
    }
    return {
      id: '',
      phoneNumber: user.phoneNumber,
      password: user.password,
      name: user.name,
      email: user.email,
    };
  };

  getUserDetails = async (userId) => await this.userModel.findById(userId);

  checkisUserKyced = async (userId) =>
    await this.kycModel.exists({ _id: userId });

  createUser = async (userData): Promise<Partial<UserInterface>> => {
    //TODO: encrypt Password
    const user = await this.userModel.create(userData);
    return {
      phoneNumber: user.phoneNumber,
      name: user.name,
      email: user.email,
    };
  };

  createAccount = async (accountData) =>
    await this.accountModel.create(accountData);

  setUserKyc = async (kycData) => await this.kycModel.create(kycData);

  getAccountInfo = async (userId): Promise<AccountInterface> => {
    const result = await this.accountModel.findById(userId).exec();
    return {
      id: result._id,
      seedKey: result.seedKey,
      publicAddress: result.publicAddress,
    };
  };
}
