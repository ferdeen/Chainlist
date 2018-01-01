// From powershell admin  call 'Truffle test' (or specify the test file if multiple test files - 'truffle test test/ChainListHappyPath.js')

// Contract to be tested
var ChainList = artifacts.require("./ChainList.sol");

// Test Suite
contract('ChainList', function(accounts) {

    var chainListInstance;
    var seller = accounts[1];
    var articleName = "Default Article";
    var articleDescription = "This is an article set by default";
    var articlePrice = 10;

    // Test case : check initial values 
     it("should be initialised with empty values", function() {
         return ChainList.deployed().then(function(instance) {
             return instance.getArticle.call();
         }).then(function(data) {
             assert.equal(data[0], 0x0, "seller must be empty");
             assert.equal(data[1], '', "article must be empty");
             assert.equal(data[2], '', "description must be empty");
             assert.equal(data[3].toNumber(), 0, "article price must be zero");
         });
     });

    // Test case : sell an article
    it("should sell an article", function() {
        return ChainList.deployed().then(function(instance) {
            chainListInstance = instance;
            return chainListInstance.sellArticle(articleName, 
                articleDescription,
                web3.toWei(articlePrice, "ether"),
                {from:seller});
        }).then(function() {
            return chainListInstance.getArticle.call();
        }).then(function(data) {
            assert.equal(data[0], seller, "seller must be " + seller);
            assert.equal(data[1], articleName, "article must be " + articleName);
            assert.equal(data[2], articleDescription, "description must be " + articleDescription);
            assert.equal(data[3].toNumber(), web3.toWei(articlePrice, "ether"), "article price must be " + web3.toWei(articlePrice, "ether"));
        });
    });

    // Test case : should check events
    it("should trigger an event when a new article is sold", function() {
        return ChainList.deployed().then(function(instance) {
            chainListInstance = instance;
            watcher = chainListInstance.sellArticleEvent();
            return chainListInstance.sellArticle(
                articleName,
                articleDescription,
                web3.toWei(articlePrice, "ether"), {
                    from: seller
                }
            );
        }).then(function() {
            return watcher.get();
        }).then(function(events) {
            assert.equal(events.length, 1, "should have recieved 1 event");
            assert.equal(events[0].args._seller, seller, "seller must be " + seller);
            assert.equal(events[0].args._name, articleName, "article name must be " + articleName);
            assert.equal(events[0].args._price.toNumber(), web3.toWei(articlePrice, "ether"), "article price must be " + web3.toWei(articlePrice, "ether"));
        });
    })
});

