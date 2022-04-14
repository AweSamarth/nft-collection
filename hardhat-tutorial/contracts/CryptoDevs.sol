//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IWhitelist.sol";

contract CryptoDevs is ERC721Enumerable, Ownable{
    
    string _baseTokenURI;
    IWhitelist whitelist;   
    bool public presaleStarted;
    uint256 public presaleEnded;
    uint256 public maxTokenIds=20;
    uint256 public tokenIds;
    uint256 public _price=0.01 ether;
    bool public _paused;
    modifier onlyWhenNotPaused{
        require(!_paused, "Contract currently paused");
        _;
    }


    constructor(string memory baseURI, address whitelistContract) ERC721("CryptoDevs", "CD"){
        _baseTokenURI= baseURI;
        whitelist=IWhitelist(whitelistContract);
    }

    function startPresale() public onlyOwner {
        //ownlyowner is a modifier from ownable.sol
        presaleStarted=true;
        presaleEnded = block.timestamp + 5 minutes;
    }



    function presaleMint() public payable onlyWhenNotPaused{
        require (presaleStarted && block.timestamp<presaleEnded, "Presale ended lmao");
        require(whitelist.whitelistedAddresses(msg.sender), "Not in the whitelist, fo");
        require(tokenIds<maxTokenIds, "Exceeded the limit");
        require(msg.value>=_price, "...and the rest?");

        tokenIds += 1;

        _safeMint(msg.sender, tokenIds);

    }




    function mint() public payable onlyWhenNotPaused{
        require(presaleStarted&&block.timestamp>presaleEnded, "Presale hasn't ended yet");
        require (tokenIds<maxTokenIds, "Exceeded the limit");
        require(msg.value>=_price, "...and the rest?");
        tokenIds+=1;
        

        _safeMint(msg.sender, tokenIds);
    }



    receive() external payable{}
 //just sending ether
    fallback() external payable{} 
//sending ether and data

function _baseURI() internal view override returns(string memory){
    return _baseTokenURI;
}


function setPaused(bool val) public onlyOwner{
    _paused = val;
}

  function withdraw() public onlyOwner{
      address owner=owner();
      uint256 amount=address(this).balance;
      (bool sent, )=owner.call{value: amount}("");
      require(sent, "Failed to send ether");
  }  
}

