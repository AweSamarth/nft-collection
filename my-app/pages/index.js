import Head from "next/head";
import Image from "next/image";
import { Content, Inter } from "@next/font/google";
import styles from "../styles/Home.module.css";
import { useEffect, useRef, useState } from "react";
import { providers, Contract, utils } from "ethers";
import Web3Modal from "web3modal";
import { NFT_CONTRACT_ABI, NFT_CONTRACT_ADDRESS } from "../constants";

const inter = Inter({ subsets: ["latin"] });
export default function Home() {
  const [ isowner, setIsowner] = useState(false)
  const [presaleStarted, setPresaleStarted] = useState(false)
  const [presaleEnded, setPresaleEnded] = useState(false)
  const web3ModalRef = useRef();
  const [walletConnected, setWalletConnected] = useState(false);
  const [loading, setLoading]  = useState(false)
  const [numTokensMinted, setNumTokensMinted] = useState("")
  const getOwner= async()=>{
    try {
      const signer = await getProviderOrSigner(true);
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, signer)
      const owner = await nftContract.owner()
      const userAddress = await signer.getAddress();
      if(owner.toLowerCase() === userAddress.toLowerCase() ){
        setIsowner(true)
      }
    } catch (error) {
      console.error(error)
    }
  }
  const getNumMintedTokens = async()=>{
    try {
      const provider = await getProviderOrSigner()
      const nftContract = new Contract (NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, provider)
      const numTokenIds = await nftContract.tokenIds()
      setNumTokensMinted(numTokenIds.toString())

    } catch (error) {
      console.error(error)
    }
  }
  const presaleMint = async()=>{
    try {
      const signer = await getProviderOrSigner(true);
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, signer)
      const txn = await nftContract.presaleMint({
        value:utils.parseEther("0.01")
      })
      setLoading(true);
      await txn.wait();
      setLoading(false);
      window.alert("Congratulations! You successfully minted a CryptoDev!")
    } catch (error) {
      console.error(error)
    }
  }
  const publicMint = async()=>{
    try {
      const signer = await getProviderOrSigner(true);
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, signer)
      const txn = await nftContract.mint({
        value:utils.parseEther("0.01")
      })
      setLoading(true);
      await txn.wait();
      setLoading(false);
      window.alert("Congratulations! You successfully minted a CryptoDev!")
    } catch (error) {
      console.error(error)
    }
  }
  const checkIfPresaleEnded = async() =>{
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );

      const presaleEndTime = await nftContract.presaleEnded();
      // but this will return a bignumber because uint256
      const currentTimeInSeconds = Date.now()/1000
      const hasPresaleEnded = presaleEndTime.lt(Math.floor(currentTimeInSeconds))
      setPresaleEnded(hasPresaleEnded)
    } catch (error) {
      console.error(error)
    }
  }
  const checkIfPresaleStarted = async () => {
    try {
      const provider = await getProviderOrSigner();
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_CONTRACT_ABI,
        provider
      );
      
      const isPresaleStarted = await nftContract.presaleStarted();
      if (!presaleStarted) {
        await getOwner();
      }
      setPresaleStarted(isPresaleStarted)
      return isPresaleStarted
    } catch (error) {
      console.error(error);
      return false
      //return values happen synchronously, state changes happen asynchronously. Because we have to check in the very next line
      //if presale has ended, just state changing won't have worked. So we are returning a value.
    }
  };

  const startPresale = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, signer)
      const txn = await nftContract.startPresale();
      await txn.wait();

    } catch (error) {
      console.error(error);
    }
  };

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (error) {
      console.error(error);
    }
  };
  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);
    const { chainId } = await web3Provider.getNetwork();
    if (chainId != 5) {
      window.alert("Goerli or go home");
      throw new Error("Incorrect Network");
    }
    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }

    return web3Provider;
  };
  const onPageLoad = async()=>{
    await connectWallet();
    await getOwner()
    const presaleStarted = await checkIfPresaleStarted()
    if (presaleStarted){
      await checkIfPresaleEnded()
    }
    await getNumMintedTokens()
    setInterval(async()=>{
      await getNumMintedTokens()
    }, 5*1000)

    setInterval(async()=>{
      const preSaleStarted= await checkIfPresaleStarted()
      if (presaleStarted){
        await checkIfPresaleEnded()
      }
    }, 5*1000)

  }

  function renderBody(){
    if(!walletConnected){
      return(
        <button onClick  = {connectWallet}  className={styles.button}>Connect your Wallet</button>
      )
    }
    if (loading){
      return(<span className={styles.description}><br />Loading...</span>)
    }

    if(isowner&&!presaleStarted){
      return(
        <button onClick={startPresale} className= {styles.button}>Start Presale</button>
      )
    }

    if (!presaleStarted){
      return(<div>
        <span className={styles.description}>Presale hasn't started yet, come back later</span>
      </div>)
    }
    if (presaleStarted && !presaleEnded){
      return (
        <div><span className={styles.description}>Presale has started. If your address is whitelisted, go ahead and mint a CryptoDev</span>
          <button className={styles.button} onClick={presaleMint}>Presale Mint🚀</button>
        
        </div>
      
        ) 
    }

    if (presaleEnded){
      return(
         <div><span className={styles.description}></span>Presale has ended. You can mint a CryptoDev in public sale, if any 
         remain.
         <button className={styles.button} onClick={publicMint}>Public Mint🚀</button>
         </div>
      )
    }
  }
  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      onPageLoad()
    }
  }, []);

  return (
    <div>
      <Head>
        <title>Crypto Devs NFT</title>
      </Head>

      <div className={styles.main}>
      <div>
        <h1 className = {styles.title}> Welcome to CryptoDevs NFT</h1>
        <span>This is a collection for developers in web3</span>
        <span className={styles.description}><br />{numTokensMinted}/20 have been minted already</span>
        {renderBody()}
        </div>
        <img className={styles.image} src="/cryptodevs/0.svg" /> 
      </div>
      <footer className={styles.footer}>Made with &#10084; by Crypto Devs</footer>
    </div>
  );
}
