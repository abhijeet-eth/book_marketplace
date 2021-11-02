// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;
 
 
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "contracts/SimpleAuction.sol";
import "hardhat/console.sol";

contract myNFT is ERC721URIStorage , Ownable, Pausable{
   string public nftName;
   string public nftSymbol;

   uint256 private openingTime;
   uint256 private biddingPeriod;

   SimpleAuction simpleAuction;

   constructor(string memory _nftName, string memory _nftSymbol) ERC721(_nftName, _nftSymbol) {
   nftName = _nftName;
   nftSymbol = _nftSymbol;
    
   openingTime = block.timestamp;
   biddingPeriod = openingTime + 5 minutes;

   simpleAuction = new SimpleAuction(biddingPeriod, payable(msg.sender));
  }

 
  modifier whileOpen {
    require(block.timestamp >= openingTime && block.timestamp <= biddingPeriod, "Bidding closed");
    _;
  }

  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;
  mapping(string => uint8) hashes;

  
  function SetBid() public whileOpen payable {
    console.log("msg.value %s ", msg.value); 
    console.log("msg.sender %s ", msg.sender);  
    simpleAuction.bid();
      }
      
   function getHighestBidder() external view returns(address, uint){
       return simpleAuction.getHighestBidder();
   }  
  

  function mint(uint256 _tokenId, string calldata _uri) external whileOpen {
    _mint(simpleAuction.highestBidder(), _tokenId);
    _setTokenURI(_tokenId, _uri);

  }

  
 
}
//CONTRACT CODE: 0x4d03745891A926dbdFFe1EAf242c1e93E89514Da