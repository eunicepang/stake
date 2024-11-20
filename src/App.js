import { Box, Button, Flex, Input, Heading, ChakraProvider } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import Stake from './abis/Stake.json';
const { ethers } = require("ethers");

function App() {

  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [totalAmountStaked, setTotalAmountStaked] = useState(0);
  const [amountToStake, setAmountToStake] = useState("");
  const [amountToUnstake, setAmountToUnstake] = useState("");
  const [currentAmountStaked, setCurrentAmountStaked] = useState(0);
  const [currentUserRewards, setCurrentUserRewards] = useState(0);

  let contractAddress = "0x3E12958f171ba5634209B2Bc68f78e1DDB0f2c5B";

  const web3Handler = async () => {

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0])
    }
    catch (error) {
      if (error.code === -32002) {
        console.error("A connection request is already pending. Please wait.");
      } else {
        console.error(error);
      }
    }

    const contractInstance = new ethers.Contract(contractAddress, Stake.abi, signer);
    setContract(contractInstance);
    console.log("Contract Instance: " + contractInstance);

    const totalStaked = await contractInstance.totalAmountStaked();
    setTotalAmountStaked(totalStaked);
    console.log("Total amount staked: " + totalStaked);

    const currentUserStaked = await contractInstance.getAmountStaked(account);
    setCurrentAmountStaked(currentUserStaked);
    console.log("Current amount you have staked: " + currentUserStaked);

    const userRewards = await contractInstance.getRewardsForUser(account);
    setCurrentUserRewards(userRewards);
    console.log("Current number of rewards you have to claim: " + userRewards);
  }

  useEffect(() => {
    web3Handler();

    window.ethereum.on('accountsChanged', (accounts) => {
      setAccount(accounts[0]);
    });
  }, []);

  const stake = async () => {
    if(amountToStake === "") {
      return alert("Please enter an amount to stake");
    } else {
      let valueInWei = ethers.parseEther(amountToStake);
       
      try{
        const tx = await contract.stake({value: valueInWei});
        await tx.wait();
        setAmountToStake("");
      } catch(error) {
        console.log(error);
      }
    }
  };

  const unstake = async () => {
    if(amountToUnstake === "") {
      return alert("Please enter an amount to unstake");
    } else {
      let valueInWei = ethers.parseEther(amountToUnstake);
       
      try{
        const tx = await contract.unstake(valueInWei);
        await tx.wait();
        setAmountToUnstake("");
      } catch(error) {
        console.log(error);
      }
    }
  };

  const claim = async () => {
    try{
      const tx = await contract.claimRewards();
      await tx.wait();
    } catch(error) {
      console.log(error);
    }
  };

  
  return (
    <ChakraProvider>
    <Box>
      <Box 
        p={8} 
        bg="blue.200" 
        color="black" 
        textAlign="center" 
        borderRadius="md" 
        maxW="100%" 
        mx="auto" 
        boxShadow="lg"
      >
        <Heading as="h1" size="2xl" fontWeight="bold" mb={4}>
        Stake your ETH and earn RWD tokens!
        </Heading>
      </Box>
      <Box
        fontSize={20} 
        textAlign="center"
      >
        <h2> Total amount staked: {ethers.formatEther(totalAmountStaked).toString()} ETH </h2>
        <h2> Amount you staked: {ethers.formatEther(currentAmountStaked).toString()} ETH </h2>
      </Box>
      
      <Flex>
        <Input
          m={10}
          w="600px"
          border="2px solid" 
          borderColor="gray.300"
          placeholder="Enter amount to stake"
          value={amountToStake}
          onChange={(e) => setAmountToStake(e.target.value)}
        />
        <Button
          m={10}
          fontSize={20} 
          onClick={stake} 
          bgColor="teal"
          w="600px"
        >
          Stake
        </Button>
      </Flex>
      <Flex>
        <Input
            m={10}
            w="600px"
            border="2px solid" 
            borderColor="gray.300"
            placeholder="Enter amount to unstake"
            value={amountToUnstake}
            onChange={(e) => setAmountToUnstake(e.target.value)}
          />
          <Button
            m={10}
            fontSize={20} 
            onClick={unstake} 
            bgColor="teal"
            w="600px"
          >
            Unstake
          </Button>
      </Flex>
        <Box 
          fontSize={20} 
          textAlign="center"
        >
          <p>
            Rewards available to claim: {currentUserRewards.toString()} RWDs
          </p>
          <Button
            m={10}
            fontSize={20} 
            onClick={claim} 
            bgColor="teal"
            w="600px"
          >
            Claim!
          </Button>
        </Box>
    </Box>
    </ChakraProvider>
  );
}

export default App;