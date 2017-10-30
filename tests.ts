import { Record, TrieRecord } from './index'
import { expect } from 'chai'

const commonRecordTest = (Record) => {
  it("should correctly create simple instances", () => {
    const RecordClass = Record({ a: 13, b: "IAmB" })
    const instance1 = new RecordClass({ a: 14, b: "IAmNotB" })

    expect(instance1.get("a")).to.equal(14)
    expect(instance1.get("b")).to.equal("IAmNotB")
  })

  it("should create record instance capable of retrieving all the set fields", () => {
    const RecordClass = Record({ a: null, b: null, c: null })
    const instance1 = new RecordClass({ a: 11, c: 13 })

    expect(instance1.get("a")).to.equal(11)
    expect(instance1.get("c")).to.equal(13)
  })

  it("should correctly handle records with only one field", () => {
    const RecordClass = Record({ a: 13 })
    const instance1 = new RecordClass({ a: 14 })

    expect(instance1.get("a")).to.equal(14)
  })

  it("should ignore additional fields when creating a record instance", () => {
    const RecordClass = Record({ a: null })
    const instance1 = new RecordClass({ c: 13 })

    expect(instance1.get("c")).to.equal(undefined)
  })

  it(".set should create a new instance without modifying the original one", () => {
    const RecordClass = Record({ a: null, b: null, c: null })
    const instance1 = new RecordClass({ a: "a1", b: "b1", c: "c1" })
    const instance2 = instance1.set("a", "a2")
    const instance3 = instance2.set("a", "a3")

    expect(instance1.get("a")).to.equal("a1")
    expect(instance2.get("a")).to.equal("a2")
    expect(instance3.get("a")).to.equal("a3")
  })

  it("should correctly create instances with many fields", () => {
    const createProperties = (value: number) => {
      const object = {}
      for(let i=0; i<134; ++i) {
        object["prop" + i] = value + i
      }
      return object
    }
    const RecordClass = Record(createProperties(undefined))
    const instance1 = new RecordClass(createProperties(123))

    expect(instance1.get("prop1")).to.equal(124)
  })

  it("should correctly return the default value for fields that were not passed during the instance creation", () => {
    const RecordClass = Record({ a: 18, b: "NotUndefined", c: null })
    const instance1 = new RecordClass({ b: undefined })

    expect(instance1.get("a")).to.equal(18)
    expect(instance1.get("b")).to.equal(undefined)
    expect(instance1.get("c")).to.equal(null)
  })
}

describe("Record", () => {
  commonRecordTest(Record)

  it("should correctly transition into a TrieRecord when .set is called", () => {
    const RecordClass = Record({ a: null, b: null, c: null })
    const instance1 = new RecordClass({ a: 11, c: 13 })
    const instance2 = instance1.set("a", 15)

    expect(instance1.get("a")).to.equal(11)
    expect(instance1).to.be.an.instanceof(RecordClass)
    expect(instance2.get("a")).to.equal(15)
    expect(instance2).to.not.be.an.instanceof(RecordClass)
  })
})

describe("TrieRecord", () => {
  commonRecordTest(TrieRecord)
})