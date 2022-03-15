const ethers = require("ethers");
const utils = require("./utils");

(async () => {
  const token = "USDC";
  const amountToDeposit = "6.0";
  const amountToTransfer = "2.0";
  const amountToWithdraw = "2.0";
  const networkName = process.env.NETWORK_NAME;

  const zkSyncProvider = await utils.getZkSyncProvider(networkName);
  const ethersProvider = await utils.getEthereumProvider(networkName);
  console.log("Creating a new Rinkeby wallet for Alice");
  const aliceRinkebyWallet = new ethers.Wallet(
    process.env.ALICE_PRIVATE_KEY,
    ethersProvider
  );
  console.log(`Alice's Rinkeby address is: ${aliceRinkebyWallet.address}`);

  console.log("Creating a zkSync wallet for Alice");
  const aliceZkSyncWallet = await utils.initAccount(
    aliceRinkebyWallet,
    zkSyncProvider
  );

  const tokenSet = zkSyncProvider.tokenSet;
  const aliceInitialRinkebyBalance = await aliceZkSyncWallet.getEthereumBalance(
    token
  );
  console.log(
    `Alice's initial balance on Rinkeby is: ${tokenSet.formatToken(
      token,
      aliceInitialRinkebyBalance
    )}`
  );

  await aliceZkSyncWallet.approveERC20TokenDeposits(token);

  console.log("Depositing...");
  await utils.depositToZkSync(
    aliceZkSyncWallet,
    token,
    amountToDeposit,
    tokenSet
  );
  await utils.displayZkSyncBalance(aliceZkSyncWallet, tokenSet);
  await utils.registerAccount(aliceZkSyncWallet, tokenSet);

  console.log("Transferring...");
  const transferFee = await utils.getFee(
    "Transfer",
    aliceRinkebyWallet.address,
    token,
    zkSyncProvider,
    tokenSet
  );
  await utils.transfer(
    aliceZkSyncWallet,
    process.env.BOB_ADDRESS,
    amountToTransfer,
    transferFee,
    token,
    tokenSet
  );

  console.log("Withdrawing...");
  const withdrawalFee = await utils.getFee(
    "Withdraw",
    aliceRinkebyWallet.address,
    token,
    zkSyncProvider,
    tokenSet
  );
  await utils.withdrawToEthereum(
    aliceZkSyncWallet,
    amountToWithdraw,
    withdrawalFee,
    token,
    tokenSet
  );
})();
