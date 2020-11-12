const inquirer = require('inquirer')
const { MongoClient } = require('mongodb')
const URL = "mongodb://localhost:27017/mycontacts"
const contatos = require('./contacts')

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

const criar = (col) => {
  inquirer.prompt(
    [
      {
        type: "input",
        name: "name",
        message: "Digite o nome do contato",
      },
      {
        type: "input",
        name: "tel",
        message: "Digite o telefone do contato",
      },
      {
        type: "input",
        name: "address",
        message: "Digite o endereço do contato",
      },
    ]
  ).then(async function (answers) {
    await database.collection(col).insertOne(answers)
    console.log("Contato criado!")
    listar(col)
  }
  ).catch((errors) => {
    console.log(`Deu errado algo com ${errors}`)
  })
}

const apagar = (col) => {
  inquirer.prompt(
    [
      {
        type: "input",
        name: "name",
        message: "Digite o nome do contato",
      }
    ]
  ).then(async function (answer) {
    const apagou = await database.collection(col).deleteOne(answer)
    if (apagou) {
      console.log("Contato apagado!")
    }
    listar(col)
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
        choices: ["Listar", "Criar", "Apagar"]
      },
    ]
  ).then(function ({ option, folder }) {
    switch (option) {
      case "Listar":
        listar(folder)
        break;
      case "Criar":
        criar(folder)
        break;
      case "Apagar":
        apagar(folder)
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

