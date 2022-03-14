const ethers = require("ethers");
const utils = require("./utils");

(async () => {
  const token = "ETH";
  const amountToDeposit = "0.05";
  const amountToTransfer = "0.02";
  const amountToWithdraw = "0.002";
  const networkName = process.env.NETWORK_NAME;

  const zkSyncProvider = await utils.getZkSyncProvider(networkName);
  const ethersProvider = await utils.getEthereumProvider(networkName);
  console.log("Creating a new Rinkeby wallet for Alice");
  const aliceRinkebyWallet = new ethers.Wallet(
    process.env.ALICE_PRIVATE_KEY,
    ethersProvider
  );
  console.log(`Alice's Rinkeby address is: ${aliceRinkebyWallet.address}`);
  const aliceInitialRinkebyBalance = await aliceRinkebyWallet.getBalance();
  console.log(
    `Alice's initial balance on Rinkeby is: ${ethers.utils.formatEther(
      aliceInitialRinkebyBalance
    )}`
  );

  console.log("Creating a zkSync wallet for Alice");
  const aliceZkSyncWallet = await utils.initAccount(
    aliceRinkebyWallet,
    zkSyncProvider
  );

  console.log("Depositing...");
  await utils.depositToZkSync(aliceZkSyncWallet, token, amountToDeposit);
  await utils.displayZkSyncBalance(aliceZkSyncWallet);
  await utils.registerAccount(aliceZkSyncWallet);

  console.log("Transferring...");
  const transferFee = await utils.getFee(
    "Transfer",
    aliceRinkebyWallet.address,
    token,
    zkSyncProvider
  );
  await utils.transfer(
    aliceZkSyncWallet,
    process.env.BOB_ADDRESS,
    amountToTransfer,
    transferFee,
    token
  );

  console.log("Withdrawing...");
  const withdrawalFee = await utils.getFee(
    "Withdraw",
    aliceRinkebyWallet.address,
    token,
    zkSyncProvider
  );
  await utils.withdrawToEthereum(
    aliceZkSyncWallet,
    amountToWithdraw,
    withdrawalFee,
    token
  );
})();
