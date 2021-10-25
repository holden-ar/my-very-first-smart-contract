App = {
    loading: false,
    contracts: {},
    usuarios: [],
  
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
          web3.eth.sendTransaction({/* ... */})
          
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
        web3.eth.sendTransaction({/* ... */})
      }
      // Non-dapp browsers...
      else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
      }
    },
  
    loadAccount: async () => {
      // Set the current blockchain account
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      App.account = accounts[0];
        
      App.usuarios["0x61A1BdcF6947A0DB5052796BfFc2B09b742511e2".toLowerCase()] = "Marcelo";
      App.usuarios["0x9dCb029930A1d1B4cBCC77DC90Ce8d7cAE88ddd6".toLowerCase()] = "Julián";
      App.usuarios["0xF87b4306E5219c691142D45DE44E15a2Bf2cfe0b".toLowerCase()] = "Enzo";

      App.currentUser = App.usuarios[String(App.account)];
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
        App.inicia = await App.subasta.subasta_inicio()
        App.finaliza = await App.subasta.subasta_finaliza()
        let oferta = await App.subasta.ofertaGanadora()

        App.ofertaGanadora = String(App.web3.utils.fromWei(oferta, 'ether'))
        App.oferenteGanador =  await App.subasta.oferenteGanador()

        console.log(App.ofertaGanadora);
        console.log(App.oferenteGanador);
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
        
         // Render user
         $('#usuario').html(App.currentUser)

        // Render Account
        $('#account').html(App.account)

        // Render inicio
        var fechaInicio = new Date(App.inicia*1000);
        $('#inicio').html(fechaInicio.toLocaleString())

        // Render fin
        var fechaFin = new Date(App.finaliza*1000);
        $('#fin').html(fechaFin.toLocaleString())
    
         // Render status
         var estado = await App.mostrarEstado(String(App.status), App.finaliza*1000)
         $('#estado').html(estado)

        const mensaje = "Mejor oferta <b>"+App.usuarios[String(App.oferenteGanador.toLowerCase())]+"</b> "+App.ofertaGanadora+" eth."
         $('#ganador').html(mensaje)

         
    
        // Update loading state
        App.setLoading(false)
      },

      ofertar: async () => {
        App.setLoading(true)
        const ammount = $('#monto').val() * 1000000000000000000;
        await App.subasta.ofertar( {from: App.account, value: ammount})
        window.location.reload()
      },

      retirar: async () => {
        App.setLoading(true)
        await App.subasta.retirar({from: App.account})
        window.location.reload()
      },

      finalizar: async () => {
        App.setLoading(true)
        await App.subasta.cancelarSubasta({from: App.account})
        window.location.reload()
      },

      mostrarEstado: async (status, fechaFin) => {
        var retVal;
        ahora = Date.now()
        switch(status) {
            case "0":
              retVal = "Cancelada";
              break;
            case "1":
                if(ahora > fechaFin)
                    retVal = "finalizada";
                else
                    retVal = "En Curso";
              break;
          }
          return retVal;
      }


      
  }
  
  $(() => {
    $(window).load(() => {
      App.load()

        // Ofertar
        $("#btn_ofertar").on('click', function () {
            App.ofertar()
        });

        // Retirar
        $("#btn_retirar").on('click', function () {
            App.retirar()
        });

          // Finalizar
          $("#btn_finalizar").on('click', function () {
            App.finalizar()
        });

    })
  })