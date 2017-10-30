interface RecordClass<Shape> {
  new (values: Partial<Shape>): RecordInstance<Shape>
  (values: Partial<Shape>): RecordInstance<Shape>
}

interface RecordInstance<Shape> {
  get<K extends keyof Shape>(key: K): Shape[K]
  set<K extends keyof Shape>(key: K, value: Shape[K]): RecordInstance<Shape>
}

interface ThinRecordInstance<Shape> extends RecordInstance<Shape> {
  values: Partial<Shape>
}

const defineRecordGetters = <Shape>(keys: (keyof Shape)[], proto: any) => {
  for(const key of keys) {
    Object.defineProperty(proto, key, {
      get(this: ThinRecordInstance<Shape>) {
        return this.get(key as keyof Shape)
      },
      set() {
        throw new Error("How dare you!?")
      }
    })
  }
}

export function Record<Shape>(defaultValues: Shape): RecordClass<Shape> {
  const TrieRecordClass = TrieRecord<Shape>(defaultValues)

  const ThinRecordPrototype = {
    get<K extends keyof Shape>(this: ThinRecordInstance<Shape>, key: K): Shape[K] {
      if(this.values.hasOwnProperty(key) && defaultValues.hasOwnProperty(key)) {
        return this.values[key]
      } else {
        return defaultValues[key]
      }
    },
    set<K extends keyof Shape>(this: ThinRecordInstance<Shape>, key: K, value: Shape[K]): RecordInstance<Shape> {
      // Convert to full trie record instance
      const instance = TrieRecordClass(this.values);
      (TrieRecordClass as any)._putKeyValueIntoTrie(instance, key, value)
      return instance
    }
  }

  defineRecordGetters<Shape>(Object.keys(defaultValues) as any, ThinRecordPrototype)

  function createThinRecordInstance(this: ThinRecordInstance<Shape>, values) {
    if(!(this instanceof createThinRecordInstance)) {
      return new (createThinRecordInstance as any)(values)
    }
    if(values instanceof createThinRecordInstance) {
      return values
    }

    this.values = values
  }
  createThinRecordInstance.prototype = ThinRecordPrototype

  return createThinRecordInstance as RecordClass<Shape>
}

interface TrieRecordInstance<Shape> {
  tree: TrieNode<Shape> | Shape[keyof Shape]
}

type TrieNode<Shape> = {
  arrayOfSubTrees: TrieNode<Shape>[] | (Shape[keyof Shape])[]
}

const NUMBER_OF_HASH_BITS_PER_LEVEL = 5
const getCurrentLevelHash = number => number & ((1<<NUMBER_OF_HASH_BITS_PER_LEVEL)-1)
const moveOneLevelDown = number => number >> NUMBER_OF_HASH_BITS_PER_LEVEL

export function TrieRecord<Shape>(defaultValues: Shape): RecordClass<Shape> {
  const keyHashes: { [key in keyof Shape]: number } = {} as any
  const keys = Object.keys(defaultValues) as (keyof Shape)[]
  const numberOfLevels = Math.ceil(
    Math.log2(keys.length) / NUMBER_OF_HASH_BITS_PER_LEVEL
  )
  keys.forEach((key, i) => {
    keyHashes[key] = i
  })

  const TrieRecordPrototype = {
    get<K extends keyof Shape>(this: TrieRecordInstance<Shape>, key: K): Shape[K] {
      let hash = keyHashes[key]
      if(hash === undefined) return undefined
      let tree = this.tree
      let previousTree: TrieNode<Shape> | null = null
      let previousHash = null
      for(let level=0; level<numberOfLevels; ++level) {
        previousTree = tree as TrieNode<Shape>
        previousHash = getCurrentLevelHash(hash)
        tree = (tree as TrieNode<Shape>).arrayOfSubTrees[getCurrentLevelHash(hash)]
        hash = moveOneLevelDown(hash)
      }
      if(previousTree === null || previousTree.arrayOfSubTrees.hasOwnProperty(previousHash)) {
        return tree as Shape[keyof Shape]
      } else {
        return defaultValues[key]
      }
    },
    set<K extends keyof Shape>(this: TrieRecordInstance<Shape>, key: K, value: Shape[K]): RecordInstance<Shape> {
      const newInstance = Object.create(TrieRecordPrototype)

      let hash = keyHashes[key]
      let tree = this.tree
      let previousNewTree: TrieNode<Shape> | null = null
      let previousHash = null
      for(let level=0; level<numberOfLevels; ++level) {
        const newTree: TrieNode<Shape> = { arrayOfSubTrees: (tree as TrieNode<Shape>).arrayOfSubTrees.slice() }
        if(previousNewTree === null) {
          newInstance.tree = newTree
        } else {
          previousNewTree.arrayOfSubTrees[previousHash] = newTree
        }
        previousNewTree = newTree
        previousHash = getCurrentLevelHash(hash)
        tree = (tree as TrieNode<Shape>).arrayOfSubTrees[getCurrentLevelHash(hash)]
        hash = moveOneLevelDown(hash)
      }
      if(previousNewTree === null) {
        newInstance.tree = value
      } else {
        previousNewTree.arrayOfSubTrees[previousHash] = value
      }

      return newInstance
    }
  }

  defineRecordGetters<Shape>(Object.keys(defaultValues) as any, TrieRecordPrototype)

  function createTrieRecordInstance(this: any, values?: Partial<Shape>) {
    if(!(this instanceof createTrieRecordInstance)) {
      return new (createTrieRecordInstance as any)(values)
    }
    if(values instanceof createTrieRecordInstance) {
      return values
    }

    const initializeTheLevel = (level: number, node: TrieNode<Shape>) => {
      if(level === 0) return
      node.arrayOfSubTrees = new Array()
      if(level === 1) return
      for(let i=0; i<Math.pow(2,NUMBER_OF_HASH_BITS_PER_LEVEL); ++i) {
        const child: TrieNode<Shape> = {} as any
        initializeTheLevel(level-1, child);
        (node.arrayOfSubTrees as any).push(child)
      }
    }

    this.tree = {}
    initializeTheLevel(numberOfLevels, this.tree)
    if(values !== undefined) {
      for(const [key, value] of Object.entries(values)) {        
        _putKeyValueIntoTrie(this, key as keyof Shape, value)
      }
    }
  }

  function _putKeyValueIntoTrie<K extends keyof Shape>(recordInstance: TrieRecordInstance<Shape>, key: K, value: Shape[K]) {
    let hash = keyHashes[key as keyof Shape]
    let tree = recordInstance.tree
    let previousTree: TrieNode<Shape> | null = null
    let previousHash: number | null = null
    for(let level=0; level<numberOfLevels; ++level) {
      previousTree = tree as TrieNode<Shape>
      previousHash = getCurrentLevelHash(hash)
      tree = (tree as TrieNode<Shape>).arrayOfSubTrees[getCurrentLevelHash(hash)]
      hash = moveOneLevelDown(hash)
    }
    if(previousTree !== null) {
      previousTree.arrayOfSubTrees[previousHash] = value
    } else {
      recordInstance.tree = value
    }
  }

  createTrieRecordInstance.prototype = TrieRecordPrototype;
  (createTrieRecordInstance as any)._putKeyValueIntoTrie = _putKeyValueIntoTrie;

  return createTrieRecordInstance as RecordClass<Shape>
}

// TODO: Investigate a third type of record instance - one that holds its values
// in the originally passed object and only moves the ones that were explicitly set
// into the trie. Such datastructure would require looking up the data in both
// structures, with trie taking the priority