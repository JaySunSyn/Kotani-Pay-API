import { Injectable } from '@nestjs/common';
import * as contractkit from '@celo/contractkit';
import * as bip39 from 'bip39-light';
import * as crypto from 'crypto';
import {
  createcypher,
  getPublicAddress,
} from '@kotanicore/blockchain/utilities';
import { AccountInterface } from '@kotanicore/repository/interface/account.interface';
const phone_hash_fn = 'sha1';
const iv = 'sdsdsdsaAqew2ewed'; //Todo:Replace from env;
const NODE_URL = 'https://celo-mainnet--rpc.datahub.figment.io/apikey/API_KEY/';
const kit = contractkit.newKit(NODE_URL);

@Injectable()
export class BlockchainService {
  //ChangeLog: Should return 24 hex
  getUserId = (senderMSISDN): Promise<string> => {
    return new Promise((resolve) => {
      const senderId = crypto
        .createHash(phone_hash_fn)
        .update(senderMSISDN)
        .digest('hex');
      resolve(senderId);
    });
  };

  retreiveCusdBalance = async (publicAddress: string) => {
    const cusdtoken = await kit.contracts.getStableToken();
    return await cusdtoken.balanceOf(publicAddress); // In cUSD
  };

  async createAccountInfo(phone: string): Promise<Partial<AccountInterface>> {
    const mnemonic = await bip39.generateMnemonic(256);
    const enc_seed = await createcypher(mnemonic, phone, iv);
    const publicAddress = await getPublicAddress(mnemonic);
    return {
      seedKey: enc_seed,
      publicAddress: publicAddress,
    };
  }

  getUserPrivateKey = async (seedCypher, senderMSISDN, iv) => {
    // try {
    //   const senderSeed = await decryptcypher(seedCypher, senderMSISDN, iv);
    //   const senderprivkey = `${await generatePrivKey(senderSeed)}`;
    //   return new Promise((resolve) => {
    //     resolve(senderprivkey);
    //   });
    // } catch (err) {
    //   console.log('Unable to decrypt cypher');
    // }
    return '';
  };
}
