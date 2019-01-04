import { VDomElement, VNode, container } from '../../molecule-jsx';
import { removeNode, createNode, setAccessor } from '../dom/index';
import { Patch, PrimitivePatch, PatchType, PropPatch } from './patch';

interface KeyedElement {
  vNode: VDomElement;
  dom: Node;
}

export let diffLevel = 0;

export function diff(
  vnode: VDomElement,
  parent: container,
  oldVNode?: VDomElement,
  dom?: Node,
) {
  const diffed = idiff(vnode, parent, oldVNode, dom);

  if (parent && diffed && diffed.parentNode !== parent) {
    parent.appendChild(diffed);
  }

  return diffed;
}

export function idiff(
  vNode: VDomElement,
  parent: container,
  oldVNode?: VDomElement,
  dom?: Node,
): Node {
  if (!dom) {
    return patch({
      vNode,
      parent,
      type: PatchType.PATCH_TYPE_COMPLETE,
    });
  }

  // Both are primitive
  if (isPrimitive(vNode) && isPrimitive(oldVNode)) {
    if (vNode !== vNode) {
      const p: PrimitivePatch = {
        vNode,
        parent,
        type: PatchType.PATCH_TYPE_PRIMITIVE,
        oldValue: oldVNode,
      };
      return patch(p);
    }
    return dom;
  }

  // Only one is primitive
  if (isPrimitive(vNode) || isPrimitive(oldVNode)) {
    return patch({ vNode, parent, dom, type: PatchType.PATCH_TYPE_COMPLETE });
  }

  // Both aren't primitive
  vNode = vNode as VNode;
  oldVNode = oldVNode as VNode;

  // Different tag
  if (vNode.nodeName !== oldVNode.nodeName) {
    return patch({ vNode, parent, dom, type: PatchType.PATCH_TYPE_COMPLETE });
  }

  // Check props
  const oldProps = oldVNode.props;
  const props = vNode.props;

  for (const name in oldProps) {
    if (!(props && props[name] != null) && oldProps[name] != null) {
      const p: PropPatch = {
        vNode,
        parent,
        name,
        dom,
        oldValue: oldProps[name],
        value: undefined,
        type: PatchType.PATCH_TYPE_PROP,
      };
      patch(p);
    }
  }

  for (const name in props) {
    if (
      !(name in oldProps) ||
      props[name] !==
        (name === 'value' || name === 'checked'
          ? (dom as any)[name]
          : oldProps[name])
    ) {
      const p: PropPatch = {
        vNode,
        parent,
        name,
        dom,
        oldValue: oldProps[name],
        value: props[name],
        type: PatchType.PATCH_TYPE_PROP,
      };
      patch(p);
    }
  }

  // Check children
  innerDiffNode(
    vNode.children.filter(shouldRender),
    oldVNode.children.filter(shouldRender),
    dom.childNodes,
    dom as container,
  );

  return dom;
}

export function innerDiffNode(
  vChildren: VDomElement[],
  oldVChildren: VDomElement[],
  domChildren: NodeListOf<ChildNode>,
  parent: container,
) {
  const len = vChildren.length;
  const oldLen = oldVChildren.length;
  let domLen = domChildren.length;

  const children: VDomElement[] = [];

  let keyedLen = 0;
  const keyed: { [key: string]: KeyedElement } = {};

  let min = 0;

  for (let i = 0; i < oldLen; i++) {
    const child = oldVChildren[i];
    const domChild = domChildren[i];

    const props = child instanceof VNode ? child.props : undefined;
    const key = len && props ? props.key : null;

    if (key != null) {
      keyedLen++;
      keyed[key] = { vNode: child as VNode, dom: domChild };
    } else if (
      props ||
      ((domChild as any).splitText !== undefined
        ? domChild!.nodeValue!.trim()
        : true)
    ) {
      children.push(child);
    }
  }

  for (let i = 0; i < len; i++) {
    let vChild = vChildren[i];
    let child: VDomElement = null;
    let dom: Node | undefined = undefined;

    if (vChild == null || vChild === false) {
      vChild = '';
    }

    // attempt to find a node based on key matching
    const key = (vChild as VNode).key;
    if (key != null) {
      if (keyedLen && keyed[key] !== undefined) {
        child = keyed[key].vNode;
        dom = keyed[key].dom;
        delete keyed[key];
        keyedLen--;
      }
    } else if (min < children.length) {
      for (let j = min; j < children.length; j++) {
        let c: VDomElement;
        if (
          children[j] !== undefined &&
          isSameNodeType((c = children[j]), vChild)
        ) {
          child = c;
          dom = domChildren[j];
          children[j] = undefined;
          if (j === children.length - 1) children.length--;
          if (j === min) min++;
          break;
        }
      }
    }

    const newDom = idiff(vChild, parent, child, dom);

    const f = domChildren[i];
    if (newDom && newDom !== parent && newDom !== f) {
      if (f == null) {
        parent.appendChild(newDom);
      } else if (newDom === f.nextSibling) {
        removeNode(f);
      } else {
        parent.insertBefore(newDom, f);
      }
    }
  }

  if (keyedLen) {
    for (const i in keyed) {
      if (keyed[i].dom !== undefined) remove(keyed[i].dom);
    }
  }

  while (min <= domLen) {
    let child: Node;
    if ((child = domChildren[domLen--]) !== undefined) {
      remove(child);
    }
  }
}

export function patch(pat: Patch) {
  if (!shouldRender(pat.vNode)) {
    pat.vNode = '';
  }
  switch (pat.type) {
    case PatchType.PATCH_TYPE_PRIMITIVE:
      const p = pat as PrimitivePatch;
      (p.dom as Text).nodeValue = p.vNode as string;
      return p.dom!;

    case PatchType.PATCH_TYPE_COMPLETE:
      if (pat.dom) remove(pat.dom);

      if (isPrimitive(pat.vNode)) {
        pat.vNode = String(pat.vNode);
        const dom = document.createTextNode(pat.vNode as string);
        pat.parent.appendChild(dom);
        return dom;
      }
      const vNode = pat.vNode as VNode;
      const dom = createNode(vNode.nodeName);

      for (const prop in vNode.props) {
        if (prop != null) {
          const p: PropPatch = {
            vNode,
            parent: pat.parent,
            name: prop,
            dom,
            oldValue: undefined,
            value: vNode.props[prop],
            type: PatchType.PATCH_TYPE_PROP,
          };
          patch(p);
        }
      }

      for (const child of vNode.children) {
        patch({
          vNode: child,
          parent: dom,
          type: PatchType.PATCH_TYPE_COMPLETE,
        });
      }

      pat.parent.appendChild(dom);

      return dom;

    case PatchType.PATCH_TYPE_PROP:
      const propPatch = pat as PropPatch;
      setAccessor(
        propPatch.dom as HTMLElement,
        propPatch.name,
        propPatch.oldValue,
        propPatch.value,
      );
      return propPatch.dom!;

    default:
      throw new Error(`Unknown PatchType: ${pat.type}`);
  }
}

export function remove(node: Node) {
  removeChildren(node);
  removeNode(node);
}

export function removeChildren(node: Node) {
  node = node.lastChild as Node;
  while (node) {
    const next = node.previousSibling;
    remove(node);
    node = next as Node;
  }
}

function isPrimitive(val: any) {
  return (
    val === null || !(typeof val === 'object' || typeof val === 'function')
  );
}

function shouldRender(node: VDomElement) {
  return node != null && typeof node !== 'boolean';
}

export function isSameNodeType(vNode: VDomElement, oldVNode: VDomElement) {
  if (isPrimitive(vNode)) {
    return isPrimitive(oldVNode);
  }
  const name = (vNode as VNode).nodeName;
  const oldName = (oldVNode as VNode).nodeName;
  if (typeof name === 'string') {
    return (
      typeof oldName === 'string' &&
      name.toLowerCase() === oldName.toLowerCase()
    );
  }
  return name === oldName;
}
