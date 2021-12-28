import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { ethers } from "ethers";
import { create } from 'ipfs-http-client'
import myNFTs from "./myNFTs.json"


const MyNFT3 =() => {

    const contractAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'; //harhat address

    const client = create('https://ipfs.infura.io:5001/api/v0')

    let [blockchainProvider, setBlockchainProvider] = useState(undefined);
    let [metamask, setMetamask] = useState(undefined);
    let [metamaskNetwork, setMetamaskNetwork] = useState(undefined);
    let [metamaskSigner, setMetamaskSigner] = useState(undefined);
    const [networkId, setNetworkId] = useState(undefined);
    const [loggedInAccount, setAccounts] = useState(undefined);
    const [etherBalance, setEtherBalance] = useState(undefined);
    const [isError, setError] = useState(false);

    const[contract, setReadContract] = useState(null);
    const[writeContract, setWriteContract] = useState(null);
    const[execute, getExecute] = useState(null);

    const [connectWallet, setConnectWallet] = useState("Connect Wallet")
    const[owners, getOwners] = useState(undefined);
    const[contractBalance, getContractBalance] = useState(undefined);
    const[ownerBal, getOwnerBal] = useState(undefined);
    const[addrReceiver, setAddrReceiver] = useState(undefined);
    const[amtReceiver, setAmtReceiver] = useState(undefined);
    const[transferReq, getTransferReq] = useState(undefined);

    
    const[symbol, setSymbol] = useState(null);    
    const[name, setName] = useState(null);
    const[highestBid, getCurrentHighestBid] = useState(null);

    const [file, setFile] = useState(null);
    const [urlArr, setUrlArr] = useState([]);

    let alertMessage ;

    const connect = async () => {
        try {
            let provider, network, metamaskProvider, signer, accounts;

            if (typeof window.ethereum !== 'undefined') {
                try {
                    accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                    await handleAccountsChanged(accounts);
                } catch (err) {
                    if (err.code === 4001) {
                        console.log('Please connect to MetaMask.');
                    } else {
                        console.error(err);
                    }
                }
                //provider = new ethers.providers.JsonRpcProvider(`https://rinkeby.infura.io/v3/c811f30d8ce746e5a9f6eb173940e98a`)
                const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545")
                setBlockchainProvider(provider);
                network = await provider.getNetwork()
                console.log(network.chainId);
                setNetworkId(network.chainId);

                // Connect to Metamask  
                metamaskProvider = new ethers.providers.Web3Provider(window.ethereum)
                setMetamask(metamaskProvider)

                signer = await metamaskProvider.getSigner(accounts[0])
                setMetamaskSigner(signer)

                metamaskNetwork = await metamaskProvider.getNetwork();
                setMetamaskNetwork(metamaskNetwork.chainId);

                console.log(network);

                if (network.chainId !== metamaskNetwork.chainId) {
                    alert("Your Metamask wallet is not connected to " + network.name);

                    setError("Metamask not connected to RPC network");
                }
                let  tempContract = new ethers.Contract(contractAddress,myNFTs,provider);
                setReadContract(tempContract);
                let tempContract2 = new ethers.Contract(contractAddress,myNFTs,signer);
                setWriteContract(tempContract2);

            } else setError("Could not connect to any blockchain!!");

            return {
                provider, metamaskProvider, signer,
                network: network.chainId
            }

        } catch (e) {
            console.error(e);
            setError(e);
        }

    }


    const handleAccountsChanged = async (accounts) => {
        if (typeof accounts !== "string" || accounts.length < 1) {
            accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        }
        console.log("t1", accounts);
        if (accounts.length === 0) {
            // MetaMask is locked or the user has not connected any accounts
            alert('Please connect to MetaMask.');
        } else if (accounts[0] !== loggedInAccount) {
            setAccounts(accounts[0]);
            setConnectWallet("Wallet Connected");
        }
    }

    useEffect(() => {
        const init = async () => {

            const { provider, metamaskProvider, signer, network } = await connect();

            const accounts = await metamaskProvider.listAccounts();
            console.log(accounts[0]);
            setAccounts(accounts[0]);

            if (typeof accounts[0] == "string") {
                setEtherBalance(ethers.utils.formatEther(
                    String(await metamaskProvider.getBalance(accounts[0]))
                ));
            }
        }

        init();

        window.ethereum.on('accountsChanged', handleAccountsChanged);

        window.ethereum.on('chainChanged', function (networkId) {
            // Time to reload your interface with the new networkId
            //window.location.reload();
            unsetStates();
        })

    }, []);

    useEffect(() => {
        (async () => {
            if (typeof metamask == 'object' && typeof metamask.getBalance == 'function'
                && typeof loggedInAccount == "string") {
                    console.log(ethers.utils.formatEther(String(await metamask.getBalance(loggedInAccount))));
                setEtherBalance(ethers.utils.formatEther(String(await metamask.getBalance(loggedInAccount))));
                
            }
        })()
    }, [loggedInAccount]);

    const unsetStates = useCallback(() => {
        setBlockchainProvider(undefined);
        setMetamask(undefined);
        setMetamaskNetwork(undefined);
        setMetamaskSigner(undefined);
        setNetworkId(undefined);
        setAccounts(undefined);
        setEtherBalance(undefined);
        connectWallet(undefined);
        owners(undefined);
        contractBalance(undefined);
        ownerBal(undefined);
        addrReceiver(undefined);
        amtReceiver(undefined);
        setWriteContract(undefined);
        setReadContract(undefined);

    }, []);


    const isReady = useCallback(() => {

        return (
            typeof blockchainProvider !== 'undefined'
            && typeof metamask !== 'undefined'
            && typeof metamaskNetwork !== 'undefined'
            && typeof metamaskSigner !== 'undefined'
            && typeof networkId !== 'undefined'
            && typeof loggedInAccount !== 'undefined'
            && typeof etherBalance !== 'undefined'
            && typeof writeContract !== 'undefined'
            && typeof contractBalance !== 'undefined'
            && typeof ownerBal !== 'undefined'
            && typeof addrReceiver !== 'undefined'
            && typeof amtReceiver !== 'undefined'

        );
    }, [
        blockchainProvider,
        metamask,
        metamaskNetwork,
        metamaskSigner,
        networkId,
        loggedInAccount,
    ]);   

    const setHandler = async(event) => {
        event.preventDefault();
        let amount = event.target.setBid.value;
        if (amount < 0){
            throw new Error("Amount less than 0");
        }
        let amounts = String(ethers.utils.parseEther(String(amount)));
        console.log(amounts);
        await writeContract.SetBid({value: amounts});
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

    //const claimArticleOwnership =async(tokenid, text="") =>{
    //    try{
    //    const fileAdded = await client.add(text)
     //   const fileHash  = fileAdded.cid.toString()

    //    console.log(fileHash);
    //    const ipfsAddress = `https://ipfs.io/ipfs/${fileHash}/`;
    //    console.log(`https://ipfs.io/ipfs/${fileHash}/`);
        
    //     await writeContract.mint(ipfsAddress);

    //    } catch(e){
    //        throw new Error(e);
    //    }
        
    //}

    const retrieveFile = (e) => {
        const data = e.target.files[0];
        const reader = new window.FileReader();
        reader.readAsArrayBuffer(data);
    
        reader.onloadend = () => {
          setFile(Buffer(reader.result));
        };
    
        e.preventDefault();
      };
    
      const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
          const created = await client.add(file);
          const url = `https://ipfs.infura.io/ipfs/${created.path}`;
          console.log(url);
          setUrlArr((prev) => [...prev, url]);
          writeContract.mint(url);
        } catch (error) {
          console.log(error.message);
        }
      };

    const getNFT_Name = async() => {
        let val = await contract.nftName();
        console.log(val)
        setName(val);            
    }

    const getNFT_Symbol = async() => {
        let val = await contract.nftSymbol();
        console.log(val)
        setSymbol(val);
    }

    return(
        <>
            <div className ="image-nft">
            
            <div className ="App-header">

            <h4> Multi-Signature Project</h4>
            <button  type="button" className="button" onClick = {()=>connect()}> {connectWallet} </button>
            {loggedInAccount}
            <br /> <br />

            <form className = "input" onSubmit={setHandler}>
                    <input id ='setBid' type='number' placeholder ="Enter bid amount"/>
                    <button className = "button-73" type ={"submit"}> Bid Amount</button>
            </form>
            <br />

            <button className = "button-73" onClick ={getCurrentVal}> Highest Bidder </button>
                <h4>{highestBid}</h4>

            <button className = "button-73" onClick ={() => getNFT_Name()}> NFT Name </button> 
            <h4>{name}</h4>                
            <br/>
            
            <button className = "button-73" onClick ={() => getNFT_Symbol()}> NFT Symbol </button>
            <h4>{symbol}</h4>


            <div className="main">
            <form onSubmit={handleSubmit}>
            <input type="file" onChange={retrieveFile} />
            <button className = "button-73" type="submit">MINT</button>
            </form>
            </div>

            <div className="display">
            {urlArr.length !== 0
            ? urlArr.map((el) => <img src={el} alt="nfts" />)
            : <h3>Upload data</h3>}
            </div>


            </div>
        </div>

        </>
    )
}
export default MyNFT3;