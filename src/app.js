App = {
    loading: false,
    contracts: {},
    walletUsers: [],

    load: async () => {
        await App.loadWeb3()
        await App.loadAccount()
        await App.loadContract()
        await App.loadAuctionInfo()
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
        // Legacy dapp browsers...
        else if (window.web3) {
            console.log('Legacy dapp browsers...')
            App.web3Provider = web3.currentProvider
            window.web3 = new Web3(web3.currentProvider)
            // Acccounts always exposed
            web3.eth.sendTransaction({/* ... */ })
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

        App.walletUsers["0x61A1BdcF6947A0DB5052796BfFc2B09b742511e2".toLowerCase()] = "Marcelo Gallardo";
        App.walletUsers["0x9dCb029930A1d1B4cBCC77DC90Ce8d7cAE88ddd6".toLowerCase()] = "Julián Alvarez";
        App.walletUsers["0xF87b4306E5219c691142D45DE44E15a2Bf2cfe0b".toLowerCase()] = "Enzo Perez";

        App.currentUserName = App.walletUsers[String(App.walletAccount)];
    },

    loadContract: async () => {
        // Create a JavaScript version of the smart contract
        const Subasta = await $.getJSON('Subasta.json')
        App.contracts.Subasta = TruffleContract(Subasta)
        App.contracts.Subasta.setProvider(App.web3Provider)

        // Hydrate the smart contract with values from the blockchain
        App.subasta = await App.contracts.Subasta.deployed()
    },

    loadAuctionInfo: async () => {
        App.status = await App.subasta.Estado()
        App.start = await App.subasta.subasta_inicio()
        App.end = await App.subasta.subasta_finaliza()
        let bid = await App.subasta.ofertaGanadora()

        App.higherBid = String(App.web3.utils.fromWei(bid, 'ether'))
        App.winerAccount = await App.subasta.oferenteGanador()
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

        // Render startDate
        var startDate = new Date(App.start * 1000);
        $('#inicio').html(startDate.toLocaleString())

        // Render endDate
        var endDate = new Date(App.end * 1000);
        App.endDate =endDate.toLocaleString()
        $('#fin').html(endDate.toLocaleString())

        // Render status
        await App.renderStatusLegend(String(App.status), App.end * 1000)
        

        const mensaje = "Mejor oferta <b>" + App.walletUsers[String(App.winerAccount.toLowerCase())] + "</b> " + App.higherBid + " eth."
        $('#ganador').html(mensaje)



        // Update loading state
        App.setLoading(false)
    },

    ofertar: async () => {
        App.setLoading(true)
        const ammount = $('#ammount').val() * 1000000000000000000;
        await App.subasta.ofertar({ from: App.walletAccount, value: ammount })
        window.location.reload()
    },

    retirar: async () => {
        App.setLoading(true)
        await App.subasta.retirar({ from: App.walletAccount })
        window.location.reload()
    },

    finalizar: async () => {
        App.setLoading(true)
        await App.subasta.cancelarSubasta({ from: App.walletAccount })
        window.location.reload()
    },

    renderStatusLegend: async (status, endDate) => {
        var statusLegend;
        currentDate = Date.now()
        var badgeStyle;
        var statusMessage;
        var controlIsActive;
        switch (status) {
            case "0":
                statusLegend = "Cancelada";
                badge = "bg-danger"
                statusMessage = "Finalizó el "+App.endDate
                controlIsActive =  false
                break;
            case "1":
                if (currentDate > endDate)
                {
                    statusLegend = "finalizada"
                    badgeStyle = "bg-danger"
                    statusMessage = "Finalizó el "+App.endDate
                    controlIsActive =  false

                }
                else
                {
                    statusLegend = "En Curso"
                    badgeStyle = "bg-success"
                    statusMessage = "Finaliza el "+App.endDate
                    controlIsActive =  true
                }
                break;
        }
        $('#status').removeClass("bg-success")
        $('#status').removeClass("bg-danger")
        $('#status').addClass(badgeStyle)
        $('#status').html(statusLegend)
        $('#statusDate').html(statusMessage)
        $( "#ammount" ).prop( "disabled", !controlIsActive);
        $( "#btnBid" ).prop( "disabled", !controlIsActive);

    }



}

$(() => {
    $(window).load(() => {
        App.load()

        // Ofertar
        $("#btnBid").on('click', function () {
            App.ofertar()
        });

        // Retirar
        $("#btnWidraw").on('click', function () {
            App.retirar()
        });

        // Finalizar
        $("#btnCancel").on('click', function () {
            App.finalizar()
        });

    })
})