export const NaiveRecord = (defaultValues) => {
  const NaiveRecordPrototype = {
    get(key) {
      return this.values[key]
    },
    set(key, value) {
      return createNaiveRecordInstance({ ...this.values, [key]: value })
    }
  }

  function createNaiveRecordInstance(values) {
    if(!(this instanceof createNaiveRecordInstance)) {
      return new (createNaiveRecordInstance as any)(values)
    }
    if(values instanceof createNaiveRecordInstance) {
      return values
    }

    this.values = values
  }
  createNaiveRecordInstance.prototype = NaiveRecordPrototype

  return createNaiveRecordInstance
}