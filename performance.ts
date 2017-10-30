import { Record as MinimalRecord } from './'
import { NaiveRecord } from './naive'
import { Record as ImmutableJSRecord } from 'immutable'
import * as SeamlessImmutable from 'seamless-immutable'

const SeamlessImmutableRecord = (defaultValues) => (values) => {
  const Proto = {
    set(key, value) {
      return wrap(this.siObject.set(key, value))
    },
    get(key) {
      return this.siObject[key]
    }
  }
  const wrap = (siObject) => Object.assign(Object.create(Proto), { siObject })

  return wrap(SeamlessImmutable(values))
}

const randInt = (min_inclusive, max_exclusive) => Math.floor(Math.random()*(max_exclusive-min_inclusive)) + min_inclusive

const randomString = length => Array.from(new Array(length)).map(_ => String.fromCharCode(randInt(97, 97+26))).join('')

const createAndModifyManyRecordInstances = ({ numberOfKeys, numberOfInstances, numberOfModifications, numberOfReads }) => {
  console.time("Preparing the test")
  const keys = Array.from(new Array(numberOfKeys)).map(() => {
    return randomString(Math.floor(Math.random()*50) + 20)
  })
  const defaultValues = {}
  keys.forEach(key => defaultValues[key] = randInt(0,500))

  const initialInstanceValues = []
  for(let i=0; i<numberOfInstances; ++i) {
    const values = {}
    keys.forEach(key => values[key] = randInt(0,500))
    initialInstanceValues.push(values)
  }
  console.timeEnd("Preparing the test")

  return (name, Record) => {
    const RecordClass = Record(defaultValues)

    const instances = []
    console.time(`${name} - creating ${numberOfInstances} instances`)
    for(let i=0; i<numberOfInstances; ++i) {
      instances.push(RecordClass(initialInstanceValues[i]))
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
}

const perfTest = createAndModifyManyRecordInstances({
  numberOfKeys: 25,
  numberOfInstances: 300000,
  numberOfModifications: 300000,
  numberOfReads: 300000,
})

perfTest("immutable-js", ImmutableJSRecord)
perfTest("minimal-immutable-record", MinimalRecord)
perfTest("naive-record", NaiveRecord)
perfTest("seamless-immutable", SeamlessImmutableRecord)
