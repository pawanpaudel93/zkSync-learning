const ethers = require("ethers");
const utils = require("./utils");

(async () => {
  const networkName = process.env.NETWORK_NAME;
  const SLEEP_INTERVAL = process.env.SLEEP_INTERVAL || 5000;
  const zkSyncProvider = await utils.getZkSyncProvider(networkName);
  const ethersProvider = await utils.getEthereumProvider(networkName);
  const tokenSet = zkSyncProvider.tokenSet;

  const bobRinkebyWallet = new ethers.Wallet(
    process.env.BOB_PRIVATE_KEY,
    ethersProvider
  );
  console.log(`Bob's Rinkeby address is: ${bobRinkebyWallet.address}`);
  console.log(
    `Bob's initial balance on Rinkeby is: ${ethers.utils.formatEther(
      await bobRinkebyWallet.getBalance()
    )}`
  );
  const bobZkSyncWallet = await utils.initAccount(
    bobRinkebyWallet,
    zkSyncProvider
  );

  process.on("SIGINT", () => {
    console.log("Disconnecting");
    // Disconnect
    process.exit();
  });

  setInterval(async () => {
    await utils.displayZkSyncBalance(bobZkSyncWallet, tokenSet);
    console.log("---");
  }, SLEEP_INTERVAL);
})();
