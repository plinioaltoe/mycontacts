const inquirer = require('inquirer')
const { MongoClient } = require('mongodb')
const URL = "mongodb://localhost:27017/mycontacts"

const client = new MongoClient(URL, { useUnifiedTopology: true })

client.connect()
const database = client.db('mycontacts')

const listarOrdenado = async (col) => {

  inquirer.prompt(
    [
      {
        type: "rawlist",
        name: "sort",
        message: "Sort Type",
        choices: [
          { name: "Asc", value: 1 },
          { name: "Desc", value: -1 }
        ]
      }
    ]
  ).then(async function ({ sort }) {
    const documents = await database.collection(col).find()
      .collation({ locale: 'en' })
      .sort({
        name: sort
      })
      .toArray()
    console.table(documents)
    options()
  }
  ).catch((errors) => {
    console.log(`Deu errado algo com ${errors}`)
  })

}

const listarPaginado = async (col, pag = 0) => {

  const pageSize = 2;
  const documents = await database.collection(col).find()
    .limit(pageSize).skip(pag * pageSize).toArray()
  console.table(documents)

  if (documents.length < pageSize) {
    options()
    return
  }


  inquirer.prompt(
    [
      {
        type: "confirm",
        name: "more",
        message: "Próxima página?",
      }
    ]
  ).then(async function ({ more }) {
    if (more) {
      listarPaginado(col, pag + 1)
    } else {
      options()
    }
  }).catch((errors) => {
    console.log(`Deu errado algo com ${errors}`)
  })
}

const listarNomes = async (col) => {
  const documents = await database.collection(col).find().project({
    name: 1,
    _id: 0
  }).toArray()
  console.table(documents)
  options()
}


async function options() {
  const collections = await database.listCollections().toArray()
  inquirer.prompt(
    [
      {
        type: "rawlist",
        name: "collection",
        message: "Escolha sua collection",
        choices: collections.map(col => col.name)
      },
      {
        type: "rawlist",
        name: "option",
        message: "Escolha sua opção",
        choices: ["Listar nomes", "Order lista", "Listar tudo"]
      },
    ]
  ).then(({ option, collection }) => {
    switch (option) {
      case "Listar nomes":
        listarNomes(collection)
        break;
      case "Order lista":
        listarOrdenado(collection)
        break;
      case "Listar tudo":
        listarPaginado(collection)
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

