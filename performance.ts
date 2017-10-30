import { Record as MinimalRecord } from './'
import { NaiveRecord } from './naive'
import { Record as ImmutableJSRecord } from 'immutable'

const createAndModifyManyRecordInstances = (name, Record, numberOfInstances, numberOfModifications, numberOfReads) => {
  const defaultValues = { 
    a: 11, b: 13, c: null,
    longPropertyName1: null,
    longPropertyName2: null,
    longPropertyName3: "SOMETHING"
  }
  const keys = Object.keys(defaultValues)
  const RecordClass = Record(defaultValues)

  const instances = []
  console.time(`${name} - creating ${numberOfInstances} instances`)
  for(let i=0; i<numberOfInstances; ++i) {
    instances.push(RecordClass({
      a: Math.random()*50,
      b: Math.random()*30,
      longPropertyName1: "ckvxnkmadkqjwkjdkxd",
      longPropertyName2: "skdjkjwekjweeroie",
      longPropertyName3: "sdajksdjkwesdkjwe",
    }))
  }
  console.timeEnd(`${name} - creating ${numberOfInstances} instances`)

  console.time(`${name} - making ${numberOfModifications} modifications on random instances`)
  for(let i=0; i<numberOfModifications; ++i) {
    const instanceId = Math.floor(Math.random()*instances.length)
    instances[instanceId] = instances[instanceId].set(
      keys[Math.floor(Math.random()*keys.length)],
      Math.random()*80
    )
  }
  console.timeEnd(`${name} - making ${numberOfModifications} modifications on random instances`)

  console.time(`${name} - making ${numberOfReads} reads on random instances`)
  for(let i=0; i<numberOfReads; ++i) {
    const instanceId = Math.floor(Math.random()*instances.length)
    instances[instanceId].get(keys[Math.floor(Math.random()*keys.length)])
  }
  console.timeEnd(`${name} - making ${numberOfReads} reads on random instances`)
}

const numberOfInstances = 300000
const numberOfModifications = 300000
const numberOfReads = 300000

createAndModifyManyRecordInstances("naive-record", NaiveRecord, numberOfInstances, numberOfModifications, numberOfReads)
createAndModifyManyRecordInstances("immutable-js", ImmutableJSRecord, numberOfInstances, numberOfModifications, numberOfReads)
createAndModifyManyRecordInstances("minimal-immutable-record", MinimalRecord, numberOfInstances, numberOfModifications, numberOfReads)