App = {
  web3Provider: null,
  contracts: {},
  account: 0x0,

  init: function() {
    // Load Articles
    // var articlesRow = $('#articlesRow');
    // var articleTemplate = $('#articleTemplate')

    // articleTemplate.find('.panel-title').text("article one");
    // articleTemplate.find('.article-description').text("Description for this article");
    // articleTemplate.find('.article-price').text("10.23");
    // articleTemplate.find('.article-seller').text("0x012345678901234567890123456789");
    
    // articlesRow.append(articleTemplate.html());

    return App.initWeb3();
  },

  initWeb3: function() {
    // Initialize web3 and set the provider to the testRPC.
    if (typeof web3 != 'undefined') {
        App.web3Provider = web3.currentProvider;
        web3 = new Web3(web3.currentProvider);
    } else {
        // set the provider you want from web3.providers
        App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
        web3 = new Web3(App.web3Provider);
    }

    App.displayAccountInfo();
    return App.initContract();
  },

  displayAccountInfo: function() {
      web3.eth.getCoinbase(function(err, account) { // async callback function
        if (err === null) {
          App.account = account;
          $("#account").text("Account : " + account);
          web3.eth.getBalance(account, function(err, balance) { // async callback function
            if (err === null) {
              $("#accountBalance").text("ETH Balance : " + web3.fromWei(balance, "ether"));
            }
          });
        }
      });
  },

  initContract: function() {
    $.getJSON('ChainList.json', function(chainListArtifact) {

      // Get the necessary contract artifact file and use it to instantiate a
      // truffle contract abstraction
      App.contracts.ChainList = TruffleContract(chainListArtifact);

      // Set the provider for our contract
      App.contracts.ChainList.setProvider(App.web3Provider);

      // Listen to events
      App.listenToEvents();
// figure out why the event change doesn't refresh the front end.


      return App.reloadArticles();
    });    
  },

  reloadArticles: function () {

      // refresh account information becuase the balance may have changed
      App.displayAccountInfo();

      App.contracts.ChainList.deployed().then(function(instance) {  
          return instance.getArticle.call();          
      }).then(function(article) {
        if (article[0] == 0X0) {
          // no article 
          return;
        }
      
      // Retrieve and clear the article placeholder
      var articlesRow = $('#articlesRow');
      articlesRow.empty();

      // Retrieve and fill the articles template
      var articleTemplate = $('#articleTemplate');
      articleTemplate.find('.panel-title').text(article[1]);
      articleTemplate.find('.article-description').text(article[2]);
      articleTemplate.find('.article-price').text(web3.fromWei(article[3], "ether"));      

      var seller = article[0];
      if (seller == App.account) {
        seller = "You";
      }

      articleTemplate.find('.article-seller').text(seller);

      // add this new article
      articlesRow.append(articleTemplate.html());
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  sellArticle: function() {
      // retrieve details of the article in the dialog
      var _article_name = $("#article_name").val();
      var _description = $("#article_description").val();
      var _price = web3.toWei(parseFloat($("#article_price").val() || 0), "ether");

      if ((_article_name.trim() == '') || (_price == 0)) {
        // nothing to sell
        return false;
      }

      App.contracts.ChainList.deployed().then(function(instance) {
        return instance.sellArticle(_article_name, _description, _price, {
            from: App.account, 
            gas: 500000
        });
      }).then(function(result){

      }).catch(function(err) {
          console.error(err);
      });
  },

  // Listen to events raised from the contract
  listenToEvents: function() {
    App.contracts.ChainList.deployed().then(function(instance) {
      instance.sellArticleEvent({}, {
        fromBlock : 0,
        toBlock: 'latest'
      }).watch(function(error, event){  // callback when event triggers
        $("#events").append('<li class="list-group-item">' + event.args._name + 
      ' is for sale' + '</li>');
      });
    });
  },


  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
  },

  markAdopted: function(adopters, account) {
    /*
     * Replace me...
     */
  },

  handleAdopt: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    /*
     * Replace me...
     */
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
