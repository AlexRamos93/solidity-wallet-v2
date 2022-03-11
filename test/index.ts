import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, ContractTransaction } from "ethers";
import { Result } from "ethers/lib/utils";
import { ethers } from "hardhat";
import {
  Coin,
  Coin__factory,
  Wallet,
  WalletController,
  WalletController__factory,
  WalletFactory,
  WalletFactory__factory,
  Wallet__factory,
} from "../typechain";

let WalletFactoryContract: WalletFactory__factory;
let walletFactory: WalletFactory;
let WalletControllerContract: WalletController__factory;
let walletController: WalletController;
let WalletContract: Wallet__factory;
let wallet: Wallet;
let CoinContract: Coin__factory;
let coin: Coin;
let CoinContract2: Coin__factory;
let coin2: Coin;

let addr1: SignerWithAddress;
let addr2: SignerWithAddress;
let addr3: SignerWithAddress;
let addr4: SignerWithAddress;

describe("Test Contracts", async () => {
  before(() => setup());
  describe("Wallet Controller", async () => {
    it("Should add a new name to the name mapping", async () => {
      await walletController.setName(
        stringToBytes32("fake.eth"),
        addr1.address
      );
      expect(
        await walletController.getAddressByName(stringToBytes32("fake.eth"))
      ).to.be.eq(addr1.address);
    });
    it("Should correctly get a address by name", async () => {
      expect(
        await walletController.getAddressByName(stringToBytes32("fake.eth"))
      ).to.be.eq(addr1.address);
      expect(
        await walletController.getAddressByName(stringToBytes32("addr2.eth"))
      ).to.be.eq("0x0000000000000000000000000000000000000000");
    });
    it("Shouldnt add a name already registred", async () => {
      await expect(
        walletController.setName(stringToBytes32("fake.eth"), addr2.address)
      ).to.be.revertedWith("Name already been used");
    });
    it("Should return false or true when checked the availability of the name", async () => {
      expect(
        await walletController.checkAvailability(stringToBytes32("fake.eth"))
      ).to.be.false;
      expect(
        await walletController.checkAvailability(stringToBytes32("addr2.eth"))
      ).to.be.true;
    });
  });

  describe("Wallet Factory", async () => {
    it("Should create a new wallet clone with a unregistred name", async () => {
      const tx = await walletFactory.createWallet(stringToBytes32("addr1.eth"));
      const args = (await getFromEvent(tx, "WalletCreated")) || [];
      expect(
        ethers.utils.parseBytes32String(getFromArgs(args, "name"))
      ).to.be.eq("addr1.eth");
      const tx1 = await walletFactory
        .connect(addr2)
        .createWallet(stringToBytes32("addr2.eth"));
      const args1 = (await getFromEvent(tx1, "WalletCreated")) || [];
      expect(
        ethers.utils.parseBytes32String(getFromArgs(args1, "name"))
      ).to.be.eq("addr2.eth");
    });
    it("Shouldnt create a new wallet if the name is already been used", async () => {
      await expect(
        walletFactory.createWallet(stringToBytes32("addr1.eth"))
      ).to.be.revertedWith("Name already been used");
    });
  });

  describe("Wallet", async () => {
    let walletAddr1: string;
    let walletAddr2: string;
    let wallet1: Wallet;
    let wallet2: Wallet;
    before(async () => {
      walletAddr1 = await walletController.getAddressByName(
        stringToBytes32("addr1.eth")
      );
      walletAddr2 = await walletController.getAddressByName(
        stringToBytes32("addr2.eth")
      );
      await coin.transfer(walletAddr1, ethers.utils.parseEther("10"));
      await coin2.transfer(walletAddr1, ethers.utils.parseEther("10"));
      wallet1 = await ethers.getContractAt("Wallet", walletAddr1);
      wallet2 = await ethers.getContractAt("Wallet", walletAddr2);
    });
    it("Should successfully get the balance of a certain token", async () => {
      expect(NormalNumber(await wallet1.getBalance(coin.address))).to.be.eq(
        10000000000000000000
      );
    });
    it("Should successfully transfer from addr1.eth to addr2.eth using the wallet name", async () => {
      await wallet1.transfer(
        stringToBytes32("addr2.eth"),
        ethers.utils.parseEther("5"),
        coin.address
      );
      expect(NormalNumber(await wallet1.getBalance(coin.address))).to.be.eq(
        5000000000000000000
      );
      expect(
        NormalNumber(await wallet2.connect(addr2).getBalance(coin.address))
      ).to.be.eq(5000000000000000000);
    });
    it("Shouldnt allow not owner to get wallet balance", async () => {
      await expect(wallet2.getBalance(coin.address)).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });
    it("Shouldnt allow not owner to transfer coins", async () => {
      await expect(
        wallet2.transfer(
          stringToBytes32("addr1.eth"),
          ethers.utils.parseEther("5"),
          coin.address
        )
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
    it("Should return all balances from different coins", async () => {
      const balances = await wallet1.getAllBalances([
        coin.address,
        coin2.address,
      ]);
      expect(NormalNumber(balances[0])).to.be.eq(5000000000000000000);
      expect(NormalNumber(balances[1])).to.be.eq(10000000000000000000);
    });
  });
});

// HELPERS
const setup = async () => {
  WalletControllerContract = await ethers.getContractFactory(
    "WalletController"
  );
  walletController = await WalletControllerContract.deploy();
  WalletContract = await ethers.getContractFactory("Wallet");
  wallet = await WalletContract.deploy();
  WalletFactoryContract = await ethers.getContractFactory("WalletFactory");
  walletFactory = await WalletFactoryContract.deploy(
    wallet.address,
    walletController.address
  );
  CoinContract = await ethers.getContractFactory("Coin");
  CoinContract2 = await ethers.getContractFactory("Coin");
  coin = await CoinContract.deploy();
  coin2 = await CoinContract.deploy();
  await walletController.deployed();
  await wallet.deployed();
  await walletFactory.deployed();
  await coin.deployed();
  [addr1, addr2, addr3, addr4] = await ethers.getSigners();
};

const stringToBytes32 = (str: string) => ethers.utils.formatBytes32String(str);

const getFromEvent = async (tx: ContractTransaction, eventName: string) => {
  const cr = await tx.wait();
  const event = cr.events?.find((e) => e.event === eventName);
  return event?.args;
};

const getFromArgs = (args: Result, argName: string) => args[argName];

const NormalNumber = (bigNumber: BigNumber) => {
  const etherNumber = ethers.utils.formatEther(bigNumber);
  return Math.round(parseFloat(etherNumber) * 10 ** 18);
};
