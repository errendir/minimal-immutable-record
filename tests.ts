import { Record, TrieRecord } from './index'

const commonRecordTest = (Record) => {
  it("should create record instance capable of retrieving all the set fields", () => {
    const RecordClass = Record({ a: null, b: null, c: null })
    const instance1 = new RecordClass({ a: 11, c: 13 })

    console.assert(instance1.get("a") === 11)
    console.assert(instance1.get("c") === 13)
  })

  it("should correctly handle records with only one field", () => {
    const RecordClass = Record({ a: 13 })
    const instance1 = new RecordClass({ a: 14 })

    console.assert(instance1.get("a") === 14)
  })

  it("should ignore additional fields when creating a record instance", () => {
    const RecordClass = Record({ a: null })
    const instance1 = new RecordClass({ c: 13 })

    console.assert(instance1.get("c") === undefined)
  })
}

describe("Record", () => {
  commonRecordTest(Record)

  it("should correctly return the default value for fields that were not passed during the instance creation", () => {
    const RecordClass = Record({ a: 18, b: "NotUndefined" })
    const instance1 = new RecordClass({ b: undefined })

    console.assert(instance1.get("a") === 18)
    console.assert(instance1.get("b") === undefined)
  })

  it("should correctly transition into a TrieRecord when .set is called", () => {
    const RecordClass = Record({ a: null, b: null, c: null })
    const instance1 = new RecordClass({ a: 11, c: 13 })
    const instance2 = instance1.set("a", 15)

    console.assert(instance1.get("a") === 11)
    console.assert(instance1 instanceof RecordClass)
    console.assert(instance2.get("a") === 15)
    console.assert(!(instance2 instanceof RecordClass))
  })
})

describe("TrieRecord", () => {
  commonRecordTest(TrieRecord)

  it("should correctly create simple instances", () => {
    const TrieRecordClass = TrieRecord({ a: 13, b: "IAmB" })
    const instance1 = new TrieRecordClass({ a: 14, b: "IAmNotB" })

    console.assert(instance1.get("a") === 14)
    console.assert(instance1.get("b") === "IAmNotB")
  })

  it("should create a new instance without modifying the original one", () => {
    const TrieRecordClass = TrieRecord({ a: null, b: null, c: null })
    const instance1 = new TrieRecordClass({ a: "a1", b: "b1", c: "c1" })
    const instance2 = instance1.set("a", "a2")
    const instance3 = instance2.set("a", "a3")

    console.assert(instance1.get("a") === "a1")
    console.assert(instance2.get("a") === "a2")
    console.assert(instance3.get("a") === "a3")
  })

  it("should correctly create instances with many fields", () => {
    const createProperties = (value: number) => {
      const object = {}
      for(let i=0; i<134; ++i) {
        object["prop" + i] = value + i
      }
      return object
    }
    const TrieRecordClass = TrieRecord<any>(createProperties(undefined))
    const instance1 = new TrieRecordClass(createProperties(123))

    console.assert(instance1.get("prop1") === 124)
  })
})