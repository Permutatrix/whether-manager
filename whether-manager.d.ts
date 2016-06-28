declare module 'whether-manager' {
  
  export interface Node<A> {
    name?: string;
    nodes: Node<{}>[];
    values: A[];
    getNodes(copy?: boolean): Node<{}>[];
    has(node: Node<{}>): boolean;
    get<B>(node: Node<B>, unvalue?: A & B): A & B;
    set<B>(node: Node<B>, value?: A & B): boolean;
    remove(node: Node<{}>): boolean;
  }
  
  export interface Group {
    getNodes(copy?: boolean): Node<{}>[];
    has(node: Node<{}>): boolean;
  }
  
  export interface Family extends Group {
    nodes: Node<{}>[];
    on(type: 'add' | 'remove', callback: (node: Node<{}>) => any): void;
    on(callback: (node: Node<{}>) => any): void;
    off(type: 'add' | 'remove', callback: (node: Node<{}>) => any): void;
    off(callback: (node: Node<{}>) => any): void;
  }
  
  export interface Supernode<A> extends Node<A>, Family {
    on(type: 'add' | 'update' | 'remove', callback: (node: Node<{}>, value: A) => any): void;
    on(callback: (node: Node<{}>, value: A) => any): void;
    off(type: 'add' | 'update' | 'remove', callback: (node: Node<{}>, value: A) => any): void;
    off(callback: (node: Node<{}>, value: A) => any): void;
  }
  
  export function node<A>(name?: string): Node<A>;
  
  export function supernode<A>(name?: string): Supernode<A>;
  
  export namespace has {
    function all(...items: Group[]): Node<{}>[];
    function all(items: Group[]): Node<{}>[];
    function any(...items: Group[]): Node<{}>[];
    function any(items: Group[]): Node<{}>[];
    function andNot(yes: Group, no: Group): Node<{}>[];
  }
  
  export namespace lazy {
    function all(...items: Group[]): Group;
    function all(items: Group[]): Group;
    function any(...items: Group[]): Group;
    function any(items: Group[]): Group;
    function andNot(yes: Group, no: Group): Group;
  }
  
  export namespace eager {
    function all(...items: Family[]): Family;
    function all(items: Family[]): Family;
    function any(...items: Family[]): Family;
    function any(items: Family[]): Family;
    function andNot(yes: Family, no: Family): Family;
  }
  
}
