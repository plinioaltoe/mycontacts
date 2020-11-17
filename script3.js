const inquirer = require('inquirer')
const { MongoClient } = require('mongodb')
const URL = "mongodb://localhost:27017/mycontacts"

const client = new MongoClient(URL, { useUnifiedTopology: true })

client.connect()
const database = client.db('mycontacts')

const listar = async (col) => {
  if (col) {
    const documents = await database.collection(col).find().toArray()
    console.table(documents)
    options()
  }
}

const buscarPorNome = (col) => {
  inquirer.prompt(
    [
      {
        type: "input",
        name: "name",
        message: "Digite o nome do contato para pesquisar",
      }
    ]
  ).then(async function ({ name }) {
    const documents = await database.collection(col).find({
      name: { '$regex': name }
    }).toArray()
    console.table(documents)
    options()
  }
  ).catch((errors) => {
    console.log(`Deu errado algo com ${errors}`)
  })
}

const buscarPorTelEEndereco = (col) => {
  inquirer.prompt(
    [
      {
        type: "input",
        name: "tel",
        message: "Digite o telefone",
      },
      {
        type: "input",
        name: "address",
        message: "Digite o endereço",
      }
    ]
  ).then(async function ({ tel, address }) {
    const documents = await database.collection(col).find({
      tel: { '$regex': tel },
      address: { '$regex': address }
    }).toArray()
    console.table(documents)
    options()
  }
  ).catch((errors) => {
    console.log(`Deu errado algo, verifique se a collection existe.`, errors)
  })
}


async function options() {
  const collections = await database.listCollections().toArray()
  inquirer.prompt(
    [
      {
        type: "rawlist",
        name: "folder",
        message: "Escolha sua collection",
        choices: collections.map(col => col.name)
      },
      {
        type: "rawlist",
        name: "option",
        message: "Escolha sua opção",
        choices: ["Listar tudo", "Buscar por nome", "Buscar por tel e Endereco"]
      },
    ]
  ).then(({ option, folder }) => {
    switch (option) {
      case "Listar tudo":
        listar(folder)
        break;
      case "Buscar por nome":
        buscarPorNome(folder)
        break;
      case "Buscar por tel e Endereco":
        buscarPorTelEEndereco(folder)
        break;
      default:
        options()
        break;
    }
  }).catch((errors) => {
    console.log(`Deu errado algo aqui`, errors)
  })
}

options()

