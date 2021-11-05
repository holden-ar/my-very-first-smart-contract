App = {
    loading: false,
    contracts: {},
    walletUsers: [],

    load: async () => {
        await App.loadWeb3()
        await App.loadAccount()
        await App.loadContract()
        await App.render()
    },

    // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
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

    loadAccount: async () => {
        // Set the current blockchain account
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        App.walletAccount = accounts[0];
    },

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

        // Update loading state
        App.setLoading(false)
    },

   
    crear: async () => {
        App.setLoading(true)

        // Autoriza a usar el ntft
        await App.nft.approve(App.subasta.address, 1, { from: App.walletAccount })
        .then((result) => {
            // Transfiere el nft al contrato
            App.subasta.crearSubasta(App.nft.address, 1, 10000, { from: App.walletAccount }).then((result) => {
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
        await App.subasta.cancelarSubasta(App.nft.address, 1, { from: App.walletAccount })
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