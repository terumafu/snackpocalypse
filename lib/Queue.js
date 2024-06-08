class Queue {
    constructor() {
        this.items = {}
        this.frontIndex = 0
        this.backIndex = 0
        this.size = 0;
    }
    enqueue(item) {
        this.items[this.backIndex] = item
        this.backIndex++
        this.size++;
        return item + ' inserted'
    }
    dequeue() {
        this.size--;
        const item = this.items[this.frontIndex]
        delete this.items[this.frontIndex]
        this.frontIndex++
        return item
    }
    peek() {
        return this.items[this.frontIndex]
    }
    get printQueue() {
        return this.items;
    }
    
}