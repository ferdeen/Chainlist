pragma solidity ^0.4.2;

contract ChainList {
    // State variables
    address seller;
    string name;
    string description;
    uint256 price;


    // sell an article
    function sellArticle(string _name, string _description, uint256 _price) public {
        seller = msg.sender;
        name = _name;
        description = _description;
        price = _price;

    }

    // get the article
    // Setting the method to constant means the trx is free
    // when called.
    function getArticle() public constant returns (
        address _seller,
        string _name,
        string _description,
        uint256 _price) 
        {
            return(seller, name, description, price);
    }
}