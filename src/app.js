App = {
    loading: false,
    currentNft: null,
    nftList: [],
    contracts: {},
    walletUsers: [],

    load: async () => {
        await App.loadWeb3()
        await App.loadAccount()
        await App.loadContract()
        await App.loadNfts()
        await App.render()
    },

    // Carga Web3 provider
    loadWeb3: async () => {
        // Modern dapp browsers...
        if (window.ethereum) {
            try {
                App.web3Provider = web3.currentProvider
                // Request account access if needed
                await ethereum.enable()
                // Acccounts now exposed
                web3.eth.sendTransaction({/* ... */ })

            } catch (error) {
                // User denied account access...
            }
        }
        // Non-dapp browsers...
        else {
            console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
        }
    },

    // Carga las cuentas de la billetera
    loadAccount: async () => {
        // Set the current blockchain account
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        App.walletAccount = accounts[0];
    },

    // Carga los contratos con los que interactua la DAPP
    loadContract: async () => {
        // Create a JavaScript version of the smart contract

        //Subasta
        const Subasta = await $.getJSON('SubastaNft.json')
        App.contracts.Subasta = TruffleContract(Subasta)
        App.contracts.Subasta.setProvider(App.web3Provider)

        //Nft
        const Nft = await $.getJSON('Nft4Auctions.json')
        App.contracts.Nft = TruffleContract(Nft)
        App.contracts.Nft.setProvider(App.web3Provider)

        // Hydrate the smart contract with values from the blockchain
        App.subasta = await App.contracts.Subasta.deployed()
        App.nft = await App.contracts.Nft.deployed()
    },

    // Carga los NFT que tiene la billetera
    loadNfts: async () => {
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
        console.log(App.nftList)
    },

    // Muestra/Oculta un spinner para indicar si se esta trabajando
    setLoading: (boolean) => {
        App.loading = boolean
        const loader = $('#loader')
        if (boolean) {
            loader.show()
        } else {
            loader.hide()
        }
    },


    render: async () => {

        // Prevent double render
        if (App.loading) {
            return
        }
        // Update app loading state
        App.setLoading(true)

        // Render Account
        $('#account').html(App.walletAccount)

        //Render Nft List
        await App.renderWalletNft()

        // Update loading state
        App.setLoading(false)
    },

    renderWalletNft: async () => {
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