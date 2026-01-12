export function Data() {
    this.store = new WeakMap();
}

Data.prototype = {
    set(element, key, value) {
        if (!this.store.has(element))
            this.store.set(element, {});
        this.store.get(element)[key] = value;
    },
    get(element, key) {
        if (!this.store.has(element)) return undefined;
        if (key === undefined) return this.store.get(element);
        return this.store.get(element)[key];
    },
    hasData(element) {
        return this.store.get(element);
    },
    remove(element, key) {
        if (!this.store.has(element)) return;
        if (key === undefined) 
            this.store.delete(element);
        else 
            delete this.store.get(element)[key];
    },
    access(element, key, value) {
        if (value === undefined) return this.get(element, key);
        this.set(element, key, value);
        return value;
    }    
}

export const dataUser = new Data();