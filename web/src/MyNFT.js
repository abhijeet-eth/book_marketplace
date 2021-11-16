
import React, {useState} from 'react';
import {ethers} from 'ethers';
import myNFTs from "./myNFTs.json"
import { create } from 'ipfs-http-client'

const MyNFT = () => {

    const client = create('https://ipfs.infura.io:5001/api/v0')

      console.log(client);
    
    const contractAddress = '0x0C3579eC422D350b4905B416B8a3D17Ff8bBB664';

    const[defaultAccount, setDefaultAccount] = useState(null);
    const[errorMessage, setErrorMessage] = useState(null);
    const[connButtonText, setConnButtonText] = useState('Connect Wallet');
    const[name, setName] = useState(null);
    const[symbol, setSymbol] = useState(null);
    
    const[highestBid, getCurrentHighestBid] = useState(null);

    const[provider, setProvider] = useState(null);
    const[signer, setSigner] = useState(null);
    const[contract, setContract] = useState(null);

    const connectWalletHandler = () => {
        if(window.ethereum){
            window.ethereum.request({method: 'eth_requestAccounts'})
            .then(result =>{
                console.log(result);
                accountChangeHandler(result[0]);
                setConnButtonText('Wallet Connected');
            })
        } else{
            setErrorMessage('MetaMask not connected. Please Install it');
        }
    }

    const accountChangeHandler = (newAccount) => {
        setDefaultAccount(newAccount);
        updateEthers();
    }

    const updateEthers = () => {
        let tempProvider = new ethers.providers.Web3Provider(window.ethereum);

        setProvider(tempProvider);
        
        let tempSigner = tempProvider.getSigner();
        setSigner(tempSigner);

        let tempContract = new ethers.Contract(contractAddress, myNFTs, tempSigner);  
        setContract(tempContract);  
    }
        const getCurrentVal = async() => {
           //try {
            let val = await contract._getHighestBidder();
            console.log(val);
            getCurrentHighestBid(String(val));
           //} catch (error) {
           //    console.log(error);
           //}
 
        }

        const setHandler = async(event) => {
            event.preventDefault();
            let amount = event.target.setBid.value;
            if (amount < 0){
                throw new Error("Amount less than 0");
            }
            amount = String(ethers.utils.parseEther(String(amount)));
            console.log(amount);
            await contract.SetBid({value: amount});
        }

            const claimArticleOwnership =async(tokenid, text="") =>{
                try{

                debugger;
                const fileAdded = await client.add(text)
                const fileHash  = fileAdded.cid.toString()
     
                console.log(fileHash);
                const ipfsAddress = `https://ipfs.io/ipfs/${fileHash}/`;
                console.log(`https://ipfs.io/ipfs/${fileHash}/`);
                
                 await contract.mint(ipfsAddress);
        
                } catch(e){
                    throw new Error(e);
                }
                
            } 

        const getNFT_Name = async() => {
            let val = await contract.nftName();
            setName(val);            
        }

        const getNFT_Symbol = async() => {
            let val = await contract.nftSymbol();
            setSymbol(val);
        }

    return(
        <div>
            <h4> Place your NFT Bid </h4>
            <button onClick = {connectWalletHandler}> {connButtonText} </button>
            <h3>Wallet Address: {defaultAccount} </h3>

            <form onSubmit={setHandler}>
                <input id ='setBid' type='number'/>
                <button type ={"submit"}> Bid Amount</button>
            </form>

            <button onClick ={getCurrentVal}> Highest Bidder </button>
            {highestBid}

            <button onClick ={() => claimArticleOwnership(1,"Your NFT")}> Mint NFT </button>

            <button onClick ={() => getNFT_Name()}> NFT Name </button>
            {name}

            <button onClick ={() => getNFT_Symbol()}> NFT Symbol </button>
            {symbol}
            

            {errorMessage}
        </div>
    )
}
export default MyNFT;