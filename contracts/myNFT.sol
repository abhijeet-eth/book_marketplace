// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
 
 
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./SimpleAuction.sol";
import "hardhat/console.sol";

contract myNFT is ERC721URIStorage , Ownable, Pausable{

   using Counters for Counters.Counter;
   Counters.Counter private _tokenIdCounter;

   string public nftName;
   string public nftSymbol;

   uint256 private openingTime;
   uint256 private biddingPeriod;

   SimpleAuction simpleAuction;

   constructor(string memory _nftName, string memory _nftSymbol) ERC721(_nftName, _nftSymbol) {
   nftName = _nftName;
   nftSymbol = _nftSymbol;
    
   openingTime = block.timestamp;
   biddingPeriod = openingTime + 3 minutes;

   simpleAuction = new SimpleAuction(biddingPeriod, payable(msg.sender));
  }

 
  modifier whileOpen {
    require(block.timestamp >= openingTime && block.timestamp <= biddingPeriod, "Bidding closed");
    _;
  }

  modifier whileBidClosed{
      require(block.timestamp >= biddingPeriod, "Bidding still open");
      _;
  }

  mapping(string => uint8) hashes;

  
  function SetBid() public whileOpen payable {
    require(msg.value > 0, "Incorrect input");
    simpleAuction.bid(msg.sender, msg.value);
      }
      
   function _getHighestBidder() external view returns(address, uint){
       return simpleAuction.getHighestBidder();
   }  
  

  function mint( string calldata _uri) external whileBidClosed {
    uint256 tokenId = _tokenIdCounter.current();
    _tokenIdCounter.increment();
    _safeMint(simpleAuction.highestBidder(), tokenId);
    _setTokenURI(tokenId, _uri);

  }
 
}
