/* @flow */

import type Watcher from './watcher'
import { remove, isUndef, isPrimitive } from '../util/index'
import config from '../config'

let uid = 0

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */
export default class Dep {
  static target: ?Watcher;
  id: number;
  subs: Array<Watcher>;

  constructor () {
    this.id = uid++
    this.subs = []
    this.selfSubs = []
  }

  addSub (sub: Watcher) {
    this.subs.push(sub)
  }

  removeSub (sub: Watcher) {
    remove(this.subs, sub)
    remove(this.selfSubs, sub)
  }

  addSelfSub (sub: Watcher) {
    this.selfSubs.push(sub)
  }

  removeSelfSub (sub: Watcher) {
    remove(this.selfSubs, sub)
  }

  depend () {
    if (Dep.target) {
      Dep.target.addDep(this)
    }
  }

  notify (onlySelf: Boolean) {
    // stabilize the subscriber list first
    if (onlySelf) {
      const subs = this.selfSubs.slice()
      if (process.env.NODE_ENV !== 'production' && !config.async) {
        subs.sort((a, b) => b.id - a.id)
      }
      for (let i = subs.length - 1; i >=0; --i) {
        const sub = subs[i]
        sub.update()
        if (sub.deps[sub.deps.length - 1] === this) {
          continue
        }
        this.removeSelfSub(sub)
      }
    } else {
      const subs = this.subs.slice()
      // const subs = this.subs.slice()
      if (process.env.NODE_ENV !== 'production' && !config.async) {
        // subs aren't sorted in scheduler if not running async
        // we need to sort them now to make sure they fire in correct
        // order
        subs.sort((a, b) => a.id - b.id)
      }
      for (let i = 0, l = subs.length; i < l; i++) {
        subs[i].update()
      }
    }
  }
}

// The current target watcher being evaluated.
// This is globally unique because only one watcher
// can be evaluated at a time.
Dep.target = null
const targetStack = []

export function pushTarget (target: ?Watcher) {
  targetStack.push(target)
  Dep.target = target
}

export function popTarget () {
  targetStack.pop()
  Dep.target = targetStack[targetStack.length - 1]
}
