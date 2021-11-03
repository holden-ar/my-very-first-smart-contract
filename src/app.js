App = {
    nftContractAddress: "0x8C917fDE016E32944D663C254BcFeCB09C866844",
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
        App.web3 = new Web3(Web3.givenProvider || "ws://localhost:7545");

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

        App.walletUsers["0x61A1BdcF6947A0DB5052796BfFc2B09b742511e2".toLowerCase()] = "Marcelo";
        App.walletUsers["0x9dCb029930A1d1B4cBCC77DC90Ce8d7cAE88ddd6".toLowerCase()] = "Julián";
        App.walletUsers["0xF87b4306E5219c691142D45DE44E15a2Bf2cfe0b".toLowerCase()] = "Enzo";

        App.currentUserName = App.walletUsers[String(App.walletAccount)];
    },

    loadContract: async () => {
        // Create a JavaScript version of the smart contract
        const Subasta = await $.getJSON('SubastaNft.json')
        App.contracts.Subasta = TruffleContract(Subasta)
        App.contracts.Subasta.setProvider(App.web3Provider)

        // Hydrate the smart contract with values from the blockchain
        App.subasta = await App.contracts.Subasta.deployed()
    },

    


    setLoading: (boolean) => {
        App.loading = boolean
        const loader = $('#loader')
        const content = $('#content')
        if (boolean) {
            loader.show()
            content.hide()
        } else {
            loader.hide()
            content.show()
        }
    },

    render: async () => {
        // Prevent double render
        if (App.loading) {
            return
        }

        // Update app loading state
        App.setLoading(true)

        // Render username
        $('#usuario').html(App.currentUserName)

        // Render Account
        $('#account').html(App.walletAccount)

        // Update loading state
        App.setLoading(false)
    },

   
    crear: async () => {
        App.setLoading(true)
        await App.subasta.crearSubasta(App.nftContractAddress, 1, 10000, { from: App.walletAccount })
        window.location.reload()
    },

    cancel: async () => {
        App.setLoading(true)
        await App.subasta.cancelarSubasta(App.nftContractAddress, 1, { from: App.walletAccount })
        window.location.reload()
    }
}

$(() => {
    $(window).load(() => {
        App.load()

        // Bid
        $("#btnBid").on('click', function () {
            App.bid()
        });

        // withdraw
        $("#btnWithdraw").on('click', function () {
            App.withdraw()
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