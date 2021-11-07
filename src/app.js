App = {
    loading: false,
    currentNft: null,
    nftList: [],
    contracts: {},
    walletUsers: [],

    load: async () => {
        console.log("Load Method")
        let isOk = await App.checkModernBrowser()

        
        await App.loadAccount()

        let main = $("#content")
        if(App.walletAccount)
        {
            await App.loadContract()
            await App.loadNfts()
            await App.render()
            main.show(500);
        }
        else
        {
            await App.renderWallet(App.walletAccount)
            main.hide()
        }
    },

    // Carga Web3 provider
    checkModernBrowser: async () => {
        console.log("checkModernBrowser Method")
        // Modern dapp browsers...
        if (!window.ethereum) {
            alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
        }
    },

    // Carga las cuentas de la billetera
    loadAccount: async () => {
        console.log("loadAccount Method")
        // Set the current mm account
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        App.walletAccount = accounts[0];
        console.log("Cuenta MM: ", App.walletAccount)
    },

    // Carga los contratos con los que interactua la DAPP
    loadContract: async () => {
        console.log("loadContract Method")

        //Subasta
        const Subasta = await $.getJSON('SubastaNft.json')
        App.contracts.Subasta = TruffleContract(Subasta)
        App.contracts.Subasta.setProvider(window.ethereum)

        //Nft
        const Nft = await $.getJSON('Nft4Auctions.json')
        App.contracts.Nft = TruffleContract(Nft)
        App.contracts.Nft.setProvider(window.ethereum)

        // Hydrate the smart contract with values from the blockchain
        App.subasta = await App.contracts.Subasta.deployed()
        App.nft = await App.contracts.Nft.deployed()
    },

    // Carga los NFT que tiene la billetera
    loadNfts: async () => {
        console.log("loadNfts Method")
        
        //Clear any existing nft tokenId
        App.nftList= new Array()

        let logs = await App.nft.getPastEvents('Transfer', {
            filter: {address: App.walletAccount},
            fromBlock: 0,
            toBlock: 'latest'
        });


        //const { from, to, tokenId } = log.args;
        logs.forEach(function(log) {
            let addressFrom = log.args[0]
            let addressTo = log.args[1]
            let tokenId = log.args[2].toString()
            

            if (App.walletAccount.toUpperCase() == addressTo.toUpperCase()) {
                App.nftList.push(tokenId);
            }
            else if(App.walletAccount.toUpperCase() == addressFrom.toUpperCase())
            {
                App.nftList.splice($.inArray(tokenId, App.nftList),1);
            }
        })
    },

    // Muestra/Oculta un spinner para indicar si se esta trabajando
    setLoading: (boolean) => {
        App.loading = boolean
        let loader = $('#loader')
        if (boolean) {
            loader.removeClass("d-none").addClass("d-block")
        } else {
            loader.removeClass("d-block").addClass("d-none")
        }
    },


    render: async () => {
        console.log("Render Method")
        // Prevent double render
        if (App.loading) {
            return
        }
        // Update app loading state
        App.setLoading(true)

        // Render Account
        await App.renderWallet(App.walletAccount)

        //Render Nft List
        await App.renderWalletNft()

        // Update loading state
        App.setLoading(false)
    },

    renderWallet: async (walletAddress) => {
        
        let walletAuth = $('#authWallet')
        let login = $('#btnLogin')

        if(walletAddress) {
            
            $('#account').html(walletAddress)
            walletAuth.show()
            login.hide()
        }
        else
        {
            walletAuth.hide()
            login.show()
        }

    },

    renderWalletNft: async () => {
        console.log("renderWalletNft Method")
        $("#nftList").empty();
        App.nftList.forEach(function(tokenId) {
            let itemId = "token"+tokenId
            item = '<a href="#" id="'+itemId+'" class="list-group-item list-group-item-action nft">NFT #'+tokenId+'</a>'
                
            $("#nftList").append(item)
            $("#"+itemId).on('click', function () { App.renderNft(tokenId); return false; });
            
        })

        if(App.nftList.length > 0)
        {
            App.renderNft(App.nftList[0])
        }
    },

    renderNft: async (id) => {
        console.log("renderNft Method")
        if(id != null)
       { App.currentNft = id
        await App.nft.tokenURI(id).then((result) => {

            var url = result.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");
            $.getJSON( url, function( json ) {
                let imgUrl = "https://gateway.pinata.cloud/ipfs/"+json.hash
                $('#nft_image').attr("src",imgUrl);
                $('#nft_title').html(json.name);
                $('#nft_author').html(json.by);


              });
        })
        .catch((error) => {
          alert(error.message)
        });}
    },

    connectWallet: async () => {
        console.log("debo conectar")
        try {
            // Will open the MetaMask UI
            // You should disable this button while the request is pending!
            await ethereum.request({ method: 'eth_requestAccounts' });
          } catch (error) {
            console.error(error);
          }
        return false;
    },

   
    crear: async () => {
        App.setLoading(true)

        // Autoriza a usar el ntft
        await App.nft.approve(App.subasta.address, App.currentNft, { from: App.walletAccount })
        .then((result) => {
            // Transfiere el nft al contrato
            App.subasta.crearSubasta(App.nft.address, App.currentNft, 10000, { from: App.walletAccount }).then((result) => {
                window.location.reload()
            })
            .catch((error) => {
              alert(error.message)
              App.setLoading(false)
            });
          })
          .catch((error) => {
            alert(error.message)
            App.setLoading(false)
          });


        
    },

    cancel: async () => {
        App.setLoading(true)

        let tokenId = $('#auctionId').val();
        await App.subasta.cancelarSubasta(App.nft.address, tokenId, { from: App.walletAccount })
        .then((result) => {
            window.location.reload()
          })
          .catch((error) => {
            alert(error.message)
            App.setLoading(false)
          });
        
    }
}

$(() => {
    $(window).load(() => {
        App.load()

         // detect Metamask account change
         window.ethereum.on('accountsChanged', function (accounts) {
            App.load()
        });       

         // Create
         $("#btnSignIn").on('click', function () {
            App.connectWallet()
        });


         // Create
         $("#btnCreate").on('click', function () {
            App.crear()
        });

        // Cancel
        $("#btnCancel").on('click', function () {
            App.cancel()
        });


        
    })
})