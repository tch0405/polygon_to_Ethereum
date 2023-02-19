const { PolygonPOSClient } = require('@polygon/client-eth-pos');
const Web3 = require('web3');

// Polygon POS bridge configuration
const posClient = new PolygonPOSClient({
  parent: {
    provider: new Web3.providers.HttpProvider('https://rpc-mainnet.maticvigil.com'),
    defaultAccount: 'YOUR_POLYGON_ADDRESS',
    defaultGas: 8000000,
    defaultGasPrice: '1000000000',
  },
  child: {
    provider: new Web3.providers.HttpProvider('https://rpc-mainnet.matic.quiknode.pro'),
    defaultAccount: 'YOUR_POLYGON_ADDRESS',
    defaultGas: 8000000,
    defaultGasPrice: '1000000000',
  },
});

// Ethereum configuration
const ethereumProvider = new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID');
const web3 = new Web3(ethereumProvider);
const ethereumPrivateKey = 'YOUR_ETHEREUM_PRIVATE_KEY';

// Set the ERC20 token contract addresses for the token on both networks
const polygonTokenAddress = '0x123...'; // address of the token on Polygon
const ethereumTokenAddress = '0xabc...'; // address of the token on Ethereum

// Set the amount to transfer
const amount = 1000000000000000000; // 1 token in wei

(async () => {
  // Approve the token for transfer on Polygon
  const polygonTokenContract = new web3.eth.Contract(ABI, polygonTokenAddress);
  const approveTx = polygonTokenContract.methods.approve(posClient.getBridgeContract().address, amount).send({ from: 'YOUR_POLYGON_ADDRESS' });
  const approveTxReceipt = await approveTx;
  console.log(Approved ${amount} tokens for transfer on Polygon with tx hash ${approveTxReceipt.transactionHash});

  // Wait for the transaction to be confirmed on Polygon
  const approveTxReceiptConfirmed = await approveTx.confirm(1);
  console.log(Confirmed token approval transaction on Polygon with tx hash ${approveTxReceiptConfirmed.transactionHash});

  // Withdraw the token from Polygon to Ethereum
  const withdrawTx = posClient.withdrawERC20({
    childToken: polygonTokenAddress,
    rootToken: ethereumTokenAddress,
    amount,
    from: 'YOUR_POLYGON_ADDRESS',
    onRootChain: async (err, res) => {
      if (err) {
        console.error('Withdrawal failed:', err);
      } else {
        console.log(Withdrawn ${amount} tokens from Polygon to Ethereum with tx hash ${res.transactionHash});

        // Wait for the transaction to be confirmed on Ethereum
        const receipt = await web3.eth.getTransactionReceipt(res.transactionHash);
        console.log(Confirmed token withdrawal transaction on Ethereum with status ${receipt.status});
      }
    },
  });
})();