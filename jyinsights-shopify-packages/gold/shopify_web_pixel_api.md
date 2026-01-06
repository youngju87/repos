<page>
---
title: advanced_dom_available
description: >-
  The `advanced_dom_available` event is published when the DOM has been loaded
  and is available for interaction.


  > Shopify Plus:

  > This event is limited on
  [checkout](https://help.shopify.com/manual/checkout-settings) to stores on the
  [Shopify Plus](https://www.shopify.com/plus) plan.
api_name: web-pixels
source_url:
  html: >-
    https://shopify.dev/docs/api/web-pixels-api/advanced-dom-events/advanced_dom_available
  md: >-
    https://shopify.dev/docs/api/web-pixels-api/advanced-dom-events/advanced_dom_available.md
---

# advanced\_​dom\_​available

Requires access to the **Advanced DOM Events in web pixel app extensions** scope. To request access, please use the form in the Partner Dashboard. This scope is only available for apps that have a heatmap and/or session recordings. The Advanced DOM Events cannot be used on custom apps.

The `advanced_dom_available` event is published when the DOM has been loaded and is available for interaction.

Shopify Plus

This event is limited on [checkout](https://help.shopify.com/manual/checkout-settings) to stores on the [Shopify Plus](https://www.shopify.com/plus) plan.

## Properties

* clientId

  string

  The client-side ID of the customer, provided by Shopify

* data

  PixelEventsAdvancedDomAvailableData

* id

  string

  The ID of the customer event

* name

  string

  The name of the customer event.

* seq

  number

  The sequence index number of the event.

* timestamp

  string

  The timestamp of when the customer event occurred, in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format

* type

  EventType.AdvancedDom

### PixelEventsAdvancedDomAvailableData

* root

  A fragment that contains the entire DOM tree, starting with the document node.

  ```ts
  DomFragment
  ```

```ts
export interface PixelEventsAdvancedDomAvailableData {
  /**
   * A fragment that contains the entire DOM tree, starting with the document
   * node.
   */
  root?: DomFragment;
}
```

### DomFragment

Representation of a sub-tree of the host document.

* children

  Array of \`DomFragment\` representing children of the parent \`DomFragment\`.

  ```ts
  DomFragment[]
  ```

* node

  The node object of the \`DomFragment\`.

  ```ts
  DomNode
  ```

* parentSerializationId

  The serialization ID of the parent node. -1 if there are no parents.

  ```ts
  number
  ```

* prevSiblingSerializationId

  The serialization ID of the previous sibling node. -1 if there are no previous siblings.

  ```ts
  number
  ```

```ts
export interface DomFragment {
  /**
   * Array of `DomFragment` representing children of the parent `DomFragment`.
   */
  children?: DomFragment[];

  /**
   * The node object of the `DomFragment`.
   */
  node?: DomNode;

  /**
   * The serialization ID of the parent node. -1 if there are no parents.
   */
  parentSerializationId?: number;

  /**
   * The serialization ID of the previous sibling node. -1 if there are no
   * previous siblings.
   */
  prevSiblingSerializationId?: number;
}
```

### DomNode

Representation of a node in the document.

* attributes

  A dictionary of attributes of an element. Only available on element nodes.

  ```ts
  { [key: string]: string; }
  ```

* checked

  The checked state of an element. Only available on input element nodes.

  ```ts
  boolean
  ```

* clientRect

  The coordinates of the element in the viewport. Only available on element nodes.

  ```ts
  ClientRect
  ```

* nodeType

  The type of node based on the native DOM API's \[\`nodeType\`]\(https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType) values. It distinguishes different kind of nodes from each other, such as elements, text and comments.

  ```ts
  number
  ```

* scroll

  The scroll coordinates of the element in the viewport. Only available on element nodes.

  ```ts
  ClientRect
  ```

* serializationId

  The serialization id of the node. This is a unique identifier for the node based on its stable reference in the host DOM tree.

  ```ts
  number
  ```

* tagName

  A string representation of the tag of a node. Only available on element nodes.

  ```ts
  string
  ```

* textContent

  The text content of an element. Only available on text nodes.

  ```ts
  string
  ```

```ts
export interface DomNode {
  /**
   * The type of node based on the native DOM API's
   * [`nodeType`](https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType) values. It distinguishes different kind of
   * nodes from each other, such as elements, text and comments.
   */
  nodeType?: number;

  /**
   * The serialization id of the node. This is a unique identifier for the node
   * based on its stable reference in the host DOM tree.
   */
  serializationId?: number;

  /**
   * A dictionary of attributes of an element. Only available on element nodes.
   */
  attributes?: {[key: string]: string};

  /**
   * The checked state of an element. Only available on input element nodes.
   */
  checked?: boolean;

  /**
   * The coordinates of the element in the viewport. Only available on element
   * nodes.
   */
  clientRect?: ClientRect;

  /**
   * The scroll coordinates of the element in the viewport. Only available on
   * element nodes.
   */
  scroll?: ClientRect;

  /**
   * A string representation of the tag of a node. Only available on element
   * nodes.
   */
  tagName?: string;

  /**
   * The text content of an element. Only available on text nodes.
   */
  textContent?: string;
}
```

### ClientRect

An object that contains data about an element coordinates in a viewport.

* height

  ```ts
  number
  ```

* width

  ```ts
  number
  ```

* x

  ```ts
  number
  ```

* y

  ```ts
  number
  ```

```ts
export interface ClientRect {
  height?: number;
  width?: number;
  x?: number;
  y?: number;
}
```

### EventType

* AdvancedDom

  ```ts
  advanced-dom
  ```

* Custom

  ```ts
  custom
  ```

* Dom

  ```ts
  dom
  ```

* Meta

  ```ts
  meta
  ```

* Standard

  ```ts
  standard
  ```

```ts
export enum EventType {
  AdvancedDom = 'advanced-dom',
  Custom = 'custom',
  Dom = 'dom',
  Meta = 'meta',
  Standard = 'standard',
}
```

Examples

### Examples

* #### Accessing Advanced DOM Events

  ##### App Pixel

  ```javascript
  import {register} from '@shopify/web-pixels-extension';

  const voidElements = new Set([
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr',
  ]);

  const domFragmentMap = new Map();

  function buildHtml(fragment) {
    const node = fragment.node;

    if (!domFragmentMap.has(node.serializationId)) {
      domFragmentMap.set(node.serializationId, fragment);
    }

    // Handle text nodes (nodeType === 3)
    if (node.nodeType === 3) {
      return node.textContent || '';
    }

    // Handle document node
    if (node.nodeType === 9) {
      return fragment.children.reduce(
        (html, childFragment) => `${html}${buildHtml(childFragment)}`,
        '',
      );
    }

    // Doctype node
    if (node.nodeType === 10) {
      const attrs = node.attributes;
      let html = '<!DOCTYPE';
      if (attrs.name) {
        html += ` ${attrs.name}`;
      }
      if (attrs.publicId) {
        html += ` PUBLIC "${attrs.publicId}"`;
      }
      if (attrs.systemId) {
        html += ` "${attrs.systemId}"`;
      }
      return `${html}>`;
    }

    if (!node.tagName) return '';

    // Handle element nodes
    const tagName = node.tagName.toLowerCase();
    const attributes = Object.keys(node.attributes)
      .filter((attr) => node.attributes[attr])
      .map((attr) => ` ${attr}="${node.attributes[attr]}"`)
      .join('');

    // Start tag
    let html = `<${tagName}${attributes}${voidElements.has(tagName) ? ' /' : ''}>`;

    // Add children recursively
    fragment.children.forEach((childFragment) => {
      html += buildHtml(childFragment);
    });

    // End tag
    if (!voidElements.has(tagName)) {
      html += `</${tagName}>`;
    }

    return html;
  }

  register(({analytics}) => {
    let root;
    analytics.subscribe('advanced_dom_available', (event) => {
      root = event.data.root;

      // E.g. rebuilds the HTML string of the whole document.
      buildHtml(root);
    });
  });
  ```

</page>

<page>
---
title: advanced_dom_changed
description: >-
  The `advanced_dom_changed` event is published when the DOM has been changed in
  any way, such as an element being added, removed, or modified.


  > Shopify Plus:

  > This event is limited on
  [checkout](https://help.shopify.com/manual/checkout-settings) to stores on the
  [Shopify Plus](https://www.shopify.com/plus) plan.
api_name: web-pixels
source_url:
  html: >-
    https://shopify.dev/docs/api/web-pixels-api/advanced-dom-events/advanced_dom_changed
  md: >-
    https://shopify.dev/docs/api/web-pixels-api/advanced-dom-events/advanced_dom_changed.md
---

# advanced\_​dom\_​changed

Requires access to the **Advanced DOM Events in web pixel app extensions** scope. To request access, please use the form in the Partner Dashboard. This scope is only available for apps that have a heatmap and/or session recordings. The Advanced DOM Events cannot be used on custom apps.

The `advanced_dom_changed` event is published when the DOM has been changed in any way, such as an element being added, removed, or modified.

Shopify Plus

This event is limited on [checkout](https://help.shopify.com/manual/checkout-settings) to stores on the [Shopify Plus](https://www.shopify.com/plus) plan.

## Properties

* clientId

  string

  The client-side ID of the customer, provided by Shopify

* data

  PixelEventsAdvancedDomChangedData

* id

  string

  The ID of the customer event

* name

  string

  The name of the customer event.

* seq

  number

  The sequence index number of the event.

* timestamp

  string

  The timestamp of when the customer event occurred, in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format

* type

  EventType.AdvancedDom

### PixelEventsAdvancedDomChangedData

* addedFragments

  Array of \`DomFragment\` added to the document. Each \`DomFragment\` represents a sub-tree of the document. Use the \`parentSerializationId\` and the \`prevSiblingSerializationId\` to reconstruct the document.

  ```ts
  DomFragment[]
  ```

* modifiedNodes

  Array of \`DomNode\` that have had their attributes changed. Use the \`serializationId\` of each to find it and update your own representation of the document.

  ```ts
  DomNode[]
  ```

* removedNodes

  Array of \`DomNode\` removed from the document. Use the \`serializationId\` of each to find it and remove it from your own representation of the document.

  ```ts
  DomNode[]
  ```

```ts
export interface PixelEventsAdvancedDomChangedData {
  /**
   * Array of `DomFragment` added to the document. Each `DomFragment` represents
   * a sub-tree of the document. Use the `parentSerializationId` and the
   * `prevSiblingSerializationId` to reconstruct the document.
   */
  addedFragments?: DomFragment[];

  /**
   * Array of `DomNode` that have had their attributes changed. Use the
   * `serializationId` of each to find it and update your own representation of
   * the document.
   */
  modifiedNodes?: DomNode[];

  /**
   * Array of `DomNode` removed from the document. Use the `serializationId` of
   * each to find it and remove it from your own representation of the document.
   */
  removedNodes?: DomNode[];
}
```

### DomFragment

Representation of a sub-tree of the host document.

* children

  Array of \`DomFragment\` representing children of the parent \`DomFragment\`.

  ```ts
  DomFragment[]
  ```

* node

  The node object of the \`DomFragment\`.

  ```ts
  DomNode
  ```

* parentSerializationId

  The serialization ID of the parent node. -1 if there are no parents.

  ```ts
  number
  ```

* prevSiblingSerializationId

  The serialization ID of the previous sibling node. -1 if there are no previous siblings.

  ```ts
  number
  ```

```ts
export interface DomFragment {
  /**
   * Array of `DomFragment` representing children of the parent `DomFragment`.
   */
  children?: DomFragment[];

  /**
   * The node object of the `DomFragment`.
   */
  node?: DomNode;

  /**
   * The serialization ID of the parent node. -1 if there are no parents.
   */
  parentSerializationId?: number;

  /**
   * The serialization ID of the previous sibling node. -1 if there are no
   * previous siblings.
   */
  prevSiblingSerializationId?: number;
}
```

### DomNode

Representation of a node in the document.

* attributes

  A dictionary of attributes of an element. Only available on element nodes.

  ```ts
  { [key: string]: string; }
  ```

* checked

  The checked state of an element. Only available on input element nodes.

  ```ts
  boolean
  ```

* clientRect

  The coordinates of the element in the viewport. Only available on element nodes.

  ```ts
  ClientRect
  ```

* nodeType

  The type of node based on the native DOM API's \[\`nodeType\`]\(https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType) values. It distinguishes different kind of nodes from each other, such as elements, text and comments.

  ```ts
  number
  ```

* scroll

  The scroll coordinates of the element in the viewport. Only available on element nodes.

  ```ts
  ClientRect
  ```

* serializationId

  The serialization id of the node. This is a unique identifier for the node based on its stable reference in the host DOM tree.

  ```ts
  number
  ```

* tagName

  A string representation of the tag of a node. Only available on element nodes.

  ```ts
  string
  ```

* textContent

  The text content of an element. Only available on text nodes.

  ```ts
  string
  ```

```ts
export interface DomNode {
  /**
   * The type of node based on the native DOM API's
   * [`nodeType`](https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType) values. It distinguishes different kind of
   * nodes from each other, such as elements, text and comments.
   */
  nodeType?: number;

  /**
   * The serialization id of the node. This is a unique identifier for the node
   * based on its stable reference in the host DOM tree.
   */
  serializationId?: number;

  /**
   * A dictionary of attributes of an element. Only available on element nodes.
   */
  attributes?: {[key: string]: string};

  /**
   * The checked state of an element. Only available on input element nodes.
   */
  checked?: boolean;

  /**
   * The coordinates of the element in the viewport. Only available on element
   * nodes.
   */
  clientRect?: ClientRect;

  /**
   * The scroll coordinates of the element in the viewport. Only available on
   * element nodes.
   */
  scroll?: ClientRect;

  /**
   * A string representation of the tag of a node. Only available on element
   * nodes.
   */
  tagName?: string;

  /**
   * The text content of an element. Only available on text nodes.
   */
  textContent?: string;
}
```

### ClientRect

An object that contains data about an element coordinates in a viewport.

* height

  ```ts
  number
  ```

* width

  ```ts
  number
  ```

* x

  ```ts
  number
  ```

* y

  ```ts
  number
  ```

```ts
export interface ClientRect {
  height?: number;
  width?: number;
  x?: number;
  y?: number;
}
```

### EventType

* AdvancedDom

  ```ts
  advanced-dom
  ```

* Custom

  ```ts
  custom
  ```

* Dom

  ```ts
  dom
  ```

* Meta

  ```ts
  meta
  ```

* Standard

  ```ts
  standard
  ```

```ts
export enum EventType {
  AdvancedDom = 'advanced-dom',
  Custom = 'custom',
  Dom = 'dom',
  Meta = 'meta',
  Standard = 'standard',
}
```

Examples

### Examples

* #### Accessing Advanced DOM Events

  ##### App Pixel

  ```javascript
  import {register} from '@shopify/web-pixels-extension';

  const domFragmentMap = new Map();

  register(({analytics}) => {
    let root;

    // Get the root node when it becomes available.
    analytics.subscribe('advanced_dom_available', (event) => {
      root = event.data.root;
    });

    // Keep the domFragmentMap up to date for reference with other events.
    analytics.subscribe('advanced_dom_changed', (event) => {
      // Handle added fragments
      event.data.addedFragments.forEach((addedFragment) => {
        const parentFragment = domFragmentMap.get(
          addedFragment.parentSerializationId,
        );
        if (parentFragment) {
          // Find the correct insertion index based on prevSiblingSerializationId
          // Default to end if no prev sibling found
          let insertIndex = parentFragment.children.length;
          if (addedFragment.prevSiblingSerializationId !== -1) {
            const prevSiblingIndex = parentFragment.children.findIndex(
              (childFragment) =>
                childFragment.node.serializationId ===
                addedFragment.prevSiblingSerializationId,
            );
            // Insert after the previous sibling
            insertIndex = prevSiblingIndex + 1;
          }
          // Insert at the calculated index
          parentFragment.children.splice(insertIndex, 0, addedFragment);
          domFragmentMap.set(addedFragment.node.serializationId, addedFragment);
        }
      });

      // Handle removed nodes
      event.data.removedNodes.forEach((removedNode) => {
        const removedFragment = domFragmentMap.get(removedNode.serializationId);
        const parentFragment = domFragmentMap.get(
          removedFragment.parentSerializationId,
        );
        if (parentFragment) {
          parentFragment.children = parentFragment.children.filter(
            (childFragment) =>
              childFragment.node.serializationId !== removedNode.serializationId,
          );
          domFragmentMap.delete(removedNode.serializationId);
        }
      });

      // Handle modified nodes
      event.data.modifiedNodes.forEach((modifiedNode) => {
        const fragment = domFragmentMap.get(modifiedNode.serializationId);
        if (fragment) {
          fragment.node = modifiedNode;
        }
      });
    });
  });
  ```

</page>

<page>
---
title: advanced_dom_clicked
description: >-
  The `advanced_dom_clicked` event is published when a customer clicks on a page
  element.


  > Shopify Plus:

  > This event is limited on
  [checkout](https://help.shopify.com/manual/checkout-settings) to stores on the
  [Shopify Plus](https://www.shopify.com/plus) plan.
api_name: web-pixels
source_url:
  html: >-
    https://shopify.dev/docs/api/web-pixels-api/advanced-dom-events/advanced_dom_clicked
  md: >-
    https://shopify.dev/docs/api/web-pixels-api/advanced-dom-events/advanced_dom_clicked.md
---

# advanced\_​dom\_​clicked

Requires access to the **Advanced DOM Events in web pixel app extensions** scope. To request access, please use the form in the Partner Dashboard. This scope is only available for apps that have a heatmap and/or session recordings. The Advanced DOM Events cannot be used on custom apps.

The `advanced_dom_clicked` event is published when a customer clicks on a page element.

Shopify Plus

This event is limited on [checkout](https://help.shopify.com/manual/checkout-settings) to stores on the [Shopify Plus](https://www.shopify.com/plus) plan.

## Properties

* clientId

  string

  The client-side ID of the customer, provided by Shopify

* data

  AdvancedMouseEventData

* id

  string

  The ID of the customer event

* name

  string

  The name of the customer event

* seq

  number

  The sequence index number of the event.

* timestamp

  string

  The timestamp of when the customer event occurred, in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format

* type

  EventType.AdvancedDom

### AdvancedMouseEventData

An object that contains data about a mouse event.

* clientX

  ```ts
  number
  ```

* clientY

  ```ts
  number
  ```

* movementX

  ```ts
  number
  ```

* movementY

  ```ts
  number
  ```

* node

  The node object for the event target.

  ```ts
  DomNode
  ```

* offsetX

  ```ts
  number
  ```

* offsetY

  ```ts
  number
  ```

* pageX

  ```ts
  number
  ```

* pageY

  ```ts
  number
  ```

* screenX

  ```ts
  number
  ```

* screenY

  ```ts
  number
  ```

```ts
export interface AdvancedMouseEventData {
  clientX?: number;
  clientY?: number;
  movementX?: number;
  movementY?: number;

  /**
   * The node object for the event target.
   */
  node?: DomNode;
  offsetX?: number;
  offsetY?: number;
  pageX?: number;
  pageY?: number;
  screenX?: number;
  screenY?: number;
}
```

### DomNode

Representation of a node in the document.

* attributes

  A dictionary of attributes of an element. Only available on element nodes.

  ```ts
  { [key: string]: string; }
  ```

* checked

  The checked state of an element. Only available on input element nodes.

  ```ts
  boolean
  ```

* clientRect

  The coordinates of the element in the viewport. Only available on element nodes.

  ```ts
  ClientRect
  ```

* nodeType

  The type of node based on the native DOM API's \[\`nodeType\`]\(https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType) values. It distinguishes different kind of nodes from each other, such as elements, text and comments.

  ```ts
  number
  ```

* scroll

  The scroll coordinates of the element in the viewport. Only available on element nodes.

  ```ts
  ClientRect
  ```

* serializationId

  The serialization id of the node. This is a unique identifier for the node based on its stable reference in the host DOM tree.

  ```ts
  number
  ```

* tagName

  A string representation of the tag of a node. Only available on element nodes.

  ```ts
  string
  ```

* textContent

  The text content of an element. Only available on text nodes.

  ```ts
  string
  ```

```ts
export interface DomNode {
  /**
   * The type of node based on the native DOM API's
   * [`nodeType`](https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType) values. It distinguishes different kind of
   * nodes from each other, such as elements, text and comments.
   */
  nodeType?: number;

  /**
   * The serialization id of the node. This is a unique identifier for the node
   * based on its stable reference in the host DOM tree.
   */
  serializationId?: number;

  /**
   * A dictionary of attributes of an element. Only available on element nodes.
   */
  attributes?: {[key: string]: string};

  /**
   * The checked state of an element. Only available on input element nodes.
   */
  checked?: boolean;

  /**
   * The coordinates of the element in the viewport. Only available on element
   * nodes.
   */
  clientRect?: ClientRect;

  /**
   * The scroll coordinates of the element in the viewport. Only available on
   * element nodes.
   */
  scroll?: ClientRect;

  /**
   * A string representation of the tag of a node. Only available on element
   * nodes.
   */
  tagName?: string;

  /**
   * The text content of an element. Only available on text nodes.
   */
  textContent?: string;
}
```

### ClientRect

An object that contains data about an element coordinates in a viewport.

* height

  ```ts
  number
  ```

* width

  ```ts
  number
  ```

* x

  ```ts
  number
  ```

* y

  ```ts
  number
  ```

```ts
export interface ClientRect {
  height?: number;
  width?: number;
  x?: number;
  y?: number;
}
```

### EventType

* AdvancedDom

  ```ts
  advanced-dom
  ```

* Custom

  ```ts
  custom
  ```

* Dom

  ```ts
  dom
  ```

* Meta

  ```ts
  meta
  ```

* Standard

  ```ts
  standard
  ```

```ts
export enum EventType {
  AdvancedDom = 'advanced-dom',
  Custom = 'custom',
  Dom = 'dom',
  Meta = 'meta',
  Standard = 'standard',
}
```

Examples

### Examples

* #### Accessing Advanced DOM Events

  ##### App Pixel

  ```javascript
  import {register} from '@shopify/web-pixels-extension';

  register(({analytics}) => {
    analytics.subscribe('advanced_dom_clicked', (event) => {
      // Accessing event payload
      const node = event.data.node;

      if (node?.nodeType !== Node.ELEMENT_NODE) return;

      const payload = {
        event_name: event.name,
        event_data: {
          id: node.serializationId,
          url: node.attributes?.href,
        },
      };

      // E.g. sending event to third party servers
      fetch('https://example.com/pixel', {
        method: 'POST',
        body: JSON.stringify(payload),
        keepalive: true,
      });
    });
  });
  ```

</page>

<page>
---
title: advanced_dom_clipboard
description: >-
  The `advanced_dom_clipboard` event is published when a customer has cut,
  copied or pasted text to or from the clipboard.


  > Shopify Plus:

  > This event is limited on
  [checkout](https://help.shopify.com/manual/checkout-settings) to stores on the
  [Shopify Plus](https://www.shopify.com/plus) plan.
api_name: web-pixels
source_url:
  html: >-
    https://shopify.dev/docs/api/web-pixels-api/advanced-dom-events/advanced_dom_clipboard
  md: >-
    https://shopify.dev/docs/api/web-pixels-api/advanced-dom-events/advanced_dom_clipboard.md
---

# advanced\_​dom\_​clipboard

Requires access to the **Advanced DOM Events in web pixel app extensions** scope. To request access, please use the form in the Partner Dashboard. This scope is only available for apps that have a heatmap and/or session recordings. The Advanced DOM Events cannot be used on custom apps.

The `advanced_dom_clipboard` event is published when a customer has cut, copied or pasted text to or from the clipboard.

Shopify Plus

This event is limited on [checkout](https://help.shopify.com/manual/checkout-settings) to stores on the [Shopify Plus](https://www.shopify.com/plus) plan.

## Properties

* clientId

  string

  The client-side ID of the customer, provided by Shopify

* data

  PixelEventsAdvancedDomClipboardData

* id

  string

  The ID of the customer event

* name

  string

  The name of the customer event.

* seq

  number

  The sequence index number of the event.

* timestamp

  string

  The timestamp of when the customer event occurred, in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format

* type

  EventType.AdvancedDom

### PixelEventsAdvancedDomClipboardData

* action

  The action that was taken with the clipboard.

  ```ts
  PixelEventsAdvancedDomClipboardDataAction
  ```

* node

  The node object for the event target.

  ```ts
  DomNode
  ```

```ts
export interface PixelEventsAdvancedDomClipboardData {
  /**
   * The action that was taken with the clipboard.
   */
  action?: PixelEventsAdvancedDomClipboardDataAction;

  /**
   * The node object for the event target.
   */
  node?: DomNode;
}
```

### PixelEventsAdvancedDomClipboardDataAction

* Copy

  ```ts
  copy
  ```

* Cut

  ```ts
  cut
  ```

* Paste

  ```ts
  paste
  ```

```ts
export enum PixelEventsAdvancedDomClipboardDataAction {
  Copy = 'copy',
  Cut = 'cut',
  Paste = 'paste',
}
```

### DomNode

Representation of a node in the document.

* attributes

  A dictionary of attributes of an element. Only available on element nodes.

  ```ts
  { [key: string]: string; }
  ```

* checked

  The checked state of an element. Only available on input element nodes.

  ```ts
  boolean
  ```

* clientRect

  The coordinates of the element in the viewport. Only available on element nodes.

  ```ts
  ClientRect
  ```

* nodeType

  The type of node based on the native DOM API's \[\`nodeType\`]\(https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType) values. It distinguishes different kind of nodes from each other, such as elements, text and comments.

  ```ts
  number
  ```

* scroll

  The scroll coordinates of the element in the viewport. Only available on element nodes.

  ```ts
  ClientRect
  ```

* serializationId

  The serialization id of the node. This is a unique identifier for the node based on its stable reference in the host DOM tree.

  ```ts
  number
  ```

* tagName

  A string representation of the tag of a node. Only available on element nodes.

  ```ts
  string
  ```

* textContent

  The text content of an element. Only available on text nodes.

  ```ts
  string
  ```

```ts
export interface DomNode {
  /**
   * The type of node based on the native DOM API's
   * [`nodeType`](https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType) values. It distinguishes different kind of
   * nodes from each other, such as elements, text and comments.
   */
  nodeType?: number;

  /**
   * The serialization id of the node. This is a unique identifier for the node
   * based on its stable reference in the host DOM tree.
   */
  serializationId?: number;

  /**
   * A dictionary of attributes of an element. Only available on element nodes.
   */
  attributes?: {[key: string]: string};

  /**
   * The checked state of an element. Only available on input element nodes.
   */
  checked?: boolean;

  /**
   * The coordinates of the element in the viewport. Only available on element
   * nodes.
   */
  clientRect?: ClientRect;

  /**
   * The scroll coordinates of the element in the viewport. Only available on
   * element nodes.
   */
  scroll?: ClientRect;

  /**
   * A string representation of the tag of a node. Only available on element
   * nodes.
   */
  tagName?: string;

  /**
   * The text content of an element. Only available on text nodes.
   */
  textContent?: string;
}
```

### ClientRect

An object that contains data about an element coordinates in a viewport.

* height

  ```ts
  number
  ```

* width

  ```ts
  number
  ```

* x

  ```ts
  number
  ```

* y

  ```ts
  number
  ```

```ts
export interface ClientRect {
  height?: number;
  width?: number;
  x?: number;
  y?: number;
}
```

### EventType

* AdvancedDom

  ```ts
  advanced-dom
  ```

* Custom

  ```ts
  custom
  ```

* Dom

  ```ts
  dom
  ```

* Meta

  ```ts
  meta
  ```

* Standard

  ```ts
  standard
  ```

```ts
export enum EventType {
  AdvancedDom = 'advanced-dom',
  Custom = 'custom',
  Dom = 'dom',
  Meta = 'meta',
  Standard = 'standard',
}
```

Examples

### Examples

* #### Accessing Advanced DOM Events

  ##### App Pixel

  ```javascript
  import {register} from '@shopify/web-pixels-extension';

  register(({analytics}) => {
    analytics.subscribe('advanced_dom_clipboard', (event) => {
      // Accessing event payload
      const node = event.data.node;

      if (node?.nodeType !== Node.ELEMENT_NODE) return;

      const payload = {
        event_name: event.name,
        event_data: {
          id: node.serializationId,
          value: node.attributes?.value,
        },
      };

      // E.g. sending event to third party servers
      fetch('https://example.com/pixel', {
        method: 'POST',
        body: JSON.stringify(payload),
        keepalive: true,
      });
    });
  });
  ```

</page>

<page>
---
title: advanced_dom_form_submitted
description: >-
  The `advanced_dom_form_submitted` event is published when a form on a page is
  submitted.


  > Shopify Plus:

  > This event is limited on
  [checkout](https://help.shopify.com/manual/checkout-settings) to stores on the
  [Shopify Plus](https://www.shopify.com/plus) plan.
api_name: web-pixels
source_url:
  html: >-
    https://shopify.dev/docs/api/web-pixels-api/advanced-dom-events/advanced_dom_form_submitted
  md: >-
    https://shopify.dev/docs/api/web-pixels-api/advanced-dom-events/advanced_dom_form_submitted.md
---

# advanced\_​dom\_​form\_​submitted

Requires access to the **Advanced DOM Events in web pixel app extensions** scope. To request access, please use the form in the Partner Dashboard. This scope is only available for apps that have a heatmap and/or session recordings. The Advanced DOM Events cannot be used on custom apps.

The `advanced_dom_form_submitted` event is published when a form on a page is submitted.

Shopify Plus

This event is limited on [checkout](https://help.shopify.com/manual/checkout-settings) to stores on the [Shopify Plus](https://www.shopify.com/plus) plan.

## Properties

* clientId

  string

  The client-side ID of the customer, provided by Shopify

* data

  PixelEventsAdvancedDomFormSubmittedData

* id

  string

  The ID of the customer event

* name

  string

  The name of the customer event

* seq

  number

  The sequence index number of the event.

* timestamp

  string

  The timestamp of when the customer event occurred, in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format

* type

  EventType.AdvancedDom

### PixelEventsAdvancedDomFormSubmittedData

* node

  The node object for the event target. In this case, it is the form element that was submitted.

  ```ts
  DomNode
  ```

```ts
export interface PixelEventsAdvancedDomFormSubmittedData {
  /**
   * The node object for the event target. In this case, it is the form element
   * that was submitted.
   */
  node?: DomNode;
}
```

### DomNode

Representation of a node in the document.

* attributes

  A dictionary of attributes of an element. Only available on element nodes.

  ```ts
  { [key: string]: string; }
  ```

* checked

  The checked state of an element. Only available on input element nodes.

  ```ts
  boolean
  ```

* clientRect

  The coordinates of the element in the viewport. Only available on element nodes.

  ```ts
  ClientRect
  ```

* nodeType

  The type of node based on the native DOM API's \[\`nodeType\`]\(https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType) values. It distinguishes different kind of nodes from each other, such as elements, text and comments.

  ```ts
  number
  ```

* scroll

  The scroll coordinates of the element in the viewport. Only available on element nodes.

  ```ts
  ClientRect
  ```

* serializationId

  The serialization id of the node. This is a unique identifier for the node based on its stable reference in the host DOM tree.

  ```ts
  number
  ```

* tagName

  A string representation of the tag of a node. Only available on element nodes.

  ```ts
  string
  ```

* textContent

  The text content of an element. Only available on text nodes.

  ```ts
  string
  ```

```ts
export interface DomNode {
  /**
   * The type of node based on the native DOM API's
   * [`nodeType`](https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType) values. It distinguishes different kind of
   * nodes from each other, such as elements, text and comments.
   */
  nodeType?: number;

  /**
   * The serialization id of the node. This is a unique identifier for the node
   * based on its stable reference in the host DOM tree.
   */
  serializationId?: number;

  /**
   * A dictionary of attributes of an element. Only available on element nodes.
   */
  attributes?: {[key: string]: string};

  /**
   * The checked state of an element. Only available on input element nodes.
   */
  checked?: boolean;

  /**
   * The coordinates of the element in the viewport. Only available on element
   * nodes.
   */
  clientRect?: ClientRect;

  /**
   * The scroll coordinates of the element in the viewport. Only available on
   * element nodes.
   */
  scroll?: ClientRect;

  /**
   * A string representation of the tag of a node. Only available on element
   * nodes.
   */
  tagName?: string;

  /**
   * The text content of an element. Only available on text nodes.
   */
  textContent?: string;
}
```

### ClientRect

An object that contains data about an element coordinates in a viewport.

* height

  ```ts
  number
  ```

* width

  ```ts
  number
  ```

* x

  ```ts
  number
  ```

* y

  ```ts
  number
  ```

```ts
export interface ClientRect {
  height?: number;
  width?: number;
  x?: number;
  y?: number;
}
```

### EventType

* AdvancedDom

  ```ts
  advanced-dom
  ```

* Custom

  ```ts
  custom
  ```

* Dom

  ```ts
  dom
  ```

* Meta

  ```ts
  meta
  ```

* Standard

  ```ts
  standard
  ```

```ts
export enum EventType {
  AdvancedDom = 'advanced-dom',
  Custom = 'custom',
  Dom = 'dom',
  Meta = 'meta',
  Standard = 'standard',
}
```

Examples

### Examples

* #### Accessing Advanced DOM Events

  ##### App Pixel

  ```javascript
  import {register} from '@shopify/web-pixels-extension';

  register(({analytics}) => {
    analytics.subscribe('advanced_dom_form_submitted', (event) => {
      // Accessing event payload
      const node = event.data.node;

      if (node?.nodeType !== Node.ELEMENT_NODE) return;

      const payload = {
        event_name: event.name,
        event_data: {
          id: node.serializationId,
          action: node.attributes?.action,
          method: node.attributes?.method,
        },
      };

      // E.g. sending event to third party servers
      fetch('https://example.com/pixel', {
        method: 'POST',
        body: JSON.stringify(payload),
        keepalive: true,
      });
    });
  });
  ```

</page>

<page>
---
title: advanced_dom_input_blurred
description: >-
  The `advanced_dom_input_blurred` event is published when an input on a page
  loses focus.


  > Shopify Plus:

  > This event is limited on
  [checkout](https://help.shopify.com/manual/checkout-settings) to stores on the
  [Shopify Plus](https://www.shopify.com/plus) plan.
api_name: web-pixels
source_url:
  html: >-
    https://shopify.dev/docs/api/web-pixels-api/advanced-dom-events/advanced_dom_input_blurred
  md: >-
    https://shopify.dev/docs/api/web-pixels-api/advanced-dom-events/advanced_dom_input_blurred.md
---

# advanced\_​dom\_​input\_​blurred

Requires access to the **Advanced DOM Events in web pixel app extensions** scope. To request access, please use the form in the Partner Dashboard. This scope is only available for apps that have a heatmap and/or session recordings. The Advanced DOM Events cannot be used on custom apps.

The `advanced_dom_input_blurred` event is published when an input on a page loses focus.

Shopify Plus

This event is limited on [checkout](https://help.shopify.com/manual/checkout-settings) to stores on the [Shopify Plus](https://www.shopify.com/plus) plan.

## Properties

* clientId

  string

  The client-side ID of the customer, provided by Shopify

* data

  PixelEventsAdvancedDomInputBlurredData

* id

  string

  The ID of the customer event

* name

  string

  The name of the customer event

* seq

  number

  The sequence index number of the event.

* timestamp

  string

  The timestamp of when the customer event occurred, in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format

* type

  EventType.AdvancedDom

### PixelEventsAdvancedDomInputBlurredData

* node

  The node object for the event target.

  ```ts
  DomNode
  ```

```ts
export interface PixelEventsAdvancedDomInputBlurredData {
  /**
   * The node object for the event target.
   */
  node?: DomNode;
}
```

### DomNode

Representation of a node in the document.

* attributes

  A dictionary of attributes of an element. Only available on element nodes.

  ```ts
  { [key: string]: string; }
  ```

* checked

  The checked state of an element. Only available on input element nodes.

  ```ts
  boolean
  ```

* clientRect

  The coordinates of the element in the viewport. Only available on element nodes.

  ```ts
  ClientRect
  ```

* nodeType

  The type of node based on the native DOM API's \[\`nodeType\`]\(https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType) values. It distinguishes different kind of nodes from each other, such as elements, text and comments.

  ```ts
  number
  ```

* scroll

  The scroll coordinates of the element in the viewport. Only available on element nodes.

  ```ts
  ClientRect
  ```

* serializationId

  The serialization id of the node. This is a unique identifier for the node based on its stable reference in the host DOM tree.

  ```ts
  number
  ```

* tagName

  A string representation of the tag of a node. Only available on element nodes.

  ```ts
  string
  ```

* textContent

  The text content of an element. Only available on text nodes.

  ```ts
  string
  ```

```ts
export interface DomNode {
  /**
   * The type of node based on the native DOM API's
   * [`nodeType`](https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType) values. It distinguishes different kind of
   * nodes from each other, such as elements, text and comments.
   */
  nodeType?: number;

  /**
   * The serialization id of the node. This is a unique identifier for the node
   * based on its stable reference in the host DOM tree.
   */
  serializationId?: number;

  /**
   * A dictionary of attributes of an element. Only available on element nodes.
   */
  attributes?: {[key: string]: string};

  /**
   * The checked state of an element. Only available on input element nodes.
   */
  checked?: boolean;

  /**
   * The coordinates of the element in the viewport. Only available on element
   * nodes.
   */
  clientRect?: ClientRect;

  /**
   * The scroll coordinates of the element in the viewport. Only available on
   * element nodes.
   */
  scroll?: ClientRect;

  /**
   * A string representation of the tag of a node. Only available on element
   * nodes.
   */
  tagName?: string;

  /**
   * The text content of an element. Only available on text nodes.
   */
  textContent?: string;
}
```

### ClientRect

An object that contains data about an element coordinates in a viewport.

* height

  ```ts
  number
  ```

* width

  ```ts
  number
  ```

* x

  ```ts
  number
  ```

* y

  ```ts
  number
  ```

```ts
export interface ClientRect {
  height?: number;
  width?: number;
  x?: number;
  y?: number;
}
```

### EventType

* AdvancedDom

  ```ts
  advanced-dom
  ```

* Custom

  ```ts
  custom
  ```

* Dom

  ```ts
  dom
  ```

* Meta

  ```ts
  meta
  ```

* Standard

  ```ts
  standard
  ```

```ts
export enum EventType {
  AdvancedDom = 'advanced-dom',
  Custom = 'custom',
  Dom = 'dom',
  Meta = 'meta',
  Standard = 'standard',
}
```

Examples

### Examples

* #### Accessing Advanced DOM Events

  ##### App Pixel

  ```javascript
  import {register} from '@shopify/web-pixels-extension';

  register(({analytics}) => {
    analytics.subscribe('advanced_dom_input_blurred', (event) => {
      // Accessing event payload
      const node = event.data.node;

      if (node?.nodeType !== Node.ELEMENT_NODE) return;

      const payload = {
        event_name: event.name,
        event_data: {
          id: node.serializationId,
          value: node.attributes?.value,
        },
      };

      // E.g. sending event to third party servers
      fetch('https://example.com/pixel', {
        method: 'POST',
        body: JSON.stringify(payload),
        keepalive: true,
      });
    });
  });
  ```

</page>

<page>
---
title: advanced_dom_input_changed
description: >-
  The `advanced_dom_input_changed` event is published when an input value
  changes.


  > Shopify Plus:

  > This event is limited on
  [checkout](https://help.shopify.com/manual/checkout-settings) to stores on the
  [Shopify Plus](https://www.shopify.com/plus) plan.
api_name: web-pixels
source_url:
  html: >-
    https://shopify.dev/docs/api/web-pixels-api/advanced-dom-events/advanced_dom_input_changed
  md: >-
    https://shopify.dev/docs/api/web-pixels-api/advanced-dom-events/advanced_dom_input_changed.md
---

# advanced\_​dom\_​input\_​changed

Requires access to the **Advanced DOM Events in web pixel app extensions** scope. To request access, please use the form in the Partner Dashboard. This scope is only available for apps that have a heatmap and/or session recordings. The Advanced DOM Events cannot be used on custom apps.

The `advanced_dom_input_changed` event is published when an input value changes.

Shopify Plus

This event is limited on [checkout](https://help.shopify.com/manual/checkout-settings) to stores on the [Shopify Plus](https://www.shopify.com/plus) plan.

## Properties

* clientId

  string

  The client-side ID of the customer, provided by Shopify

* data

  PixelEventsAdvancedDomInputChangedData

* id

  string

  The ID of the customer event

* name

  string

  The name of the customer event

* seq

  number

  The sequence index number of the event.

* timestamp

  string

  The timestamp of when the customer event occurred, in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format

* type

  EventType.AdvancedDom

### PixelEventsAdvancedDomInputChangedData

* node

  The node object for the event target.

  ```ts
  DomNode
  ```

```ts
export interface PixelEventsAdvancedDomInputChangedData {
  /**
   * The node object for the event target.
   */
  node?: DomNode;
}
```

### DomNode

Representation of a node in the document.

* attributes

  A dictionary of attributes of an element. Only available on element nodes.

  ```ts
  { [key: string]: string; }
  ```

* checked

  The checked state of an element. Only available on input element nodes.

  ```ts
  boolean
  ```

* clientRect

  The coordinates of the element in the viewport. Only available on element nodes.

  ```ts
  ClientRect
  ```

* nodeType

  The type of node based on the native DOM API's \[\`nodeType\`]\(https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType) values. It distinguishes different kind of nodes from each other, such as elements, text and comments.

  ```ts
  number
  ```

* scroll

  The scroll coordinates of the element in the viewport. Only available on element nodes.

  ```ts
  ClientRect
  ```

* serializationId

  The serialization id of the node. This is a unique identifier for the node based on its stable reference in the host DOM tree.

  ```ts
  number
  ```

* tagName

  A string representation of the tag of a node. Only available on element nodes.

  ```ts
  string
  ```

* textContent

  The text content of an element. Only available on text nodes.

  ```ts
  string
  ```

```ts
export interface DomNode {
  /**
   * The type of node based on the native DOM API's
   * [`nodeType`](https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType) values. It distinguishes different kind of
   * nodes from each other, such as elements, text and comments.
   */
  nodeType?: number;

  /**
   * The serialization id of the node. This is a unique identifier for the node
   * based on its stable reference in the host DOM tree.
   */
  serializationId?: number;

  /**
   * A dictionary of attributes of an element. Only available on element nodes.
   */
  attributes?: {[key: string]: string};

  /**
   * The checked state of an element. Only available on input element nodes.
   */
  checked?: boolean;

  /**
   * The coordinates of the element in the viewport. Only available on element
   * nodes.
   */
  clientRect?: ClientRect;

  /**
   * The scroll coordinates of the element in the viewport. Only available on
   * element nodes.
   */
  scroll?: ClientRect;

  /**
   * A string representation of the tag of a node. Only available on element
   * nodes.
   */
  tagName?: string;

  /**
   * The text content of an element. Only available on text nodes.
   */
  textContent?: string;
}
```

### ClientRect

An object that contains data about an element coordinates in a viewport.

* height

  ```ts
  number
  ```

* width

  ```ts
  number
  ```

* x

  ```ts
  number
  ```

* y

  ```ts
  number
  ```

```ts
export interface ClientRect {
  height?: number;
  width?: number;
  x?: number;
  y?: number;
}
```

### EventType

* AdvancedDom

  ```ts
  advanced-dom
  ```

* Custom

  ```ts
  custom
  ```

* Dom

  ```ts
  dom
  ```

* Meta

  ```ts
  meta
  ```

* Standard

  ```ts
  standard
  ```

```ts
export enum EventType {
  AdvancedDom = 'advanced-dom',
  Custom = 'custom',
  Dom = 'dom',
  Meta = 'meta',
  Standard = 'standard',
}
```

Examples

### Examples

* #### Accessing Advanced DOM Events

  ##### App Pixel

  ```javascript
  import {register} from '@shopify/web-pixels-extension';

  register(({analytics}) => {
    analytics.subscribe('advanced_dom_input_changed', (event) => {
      // Accessing event payload
      const node = event.data.node;

      if (node?.nodeType !== Node.ELEMENT_NODE) return;

      const payload = {
        event_name: event.name,
        event_data: {
          id: node.serializationId,
          value: node.attributes?.value,
        },
      };

      // E.g. sending event to third party servers
      fetch('https://example.com/pixel', {
        method: 'POST',
        body: JSON.stringify(payload),
        keepalive: true,
      });
    });
  });
  ```

</page>

<page>
---
title: advanced_dom_input_focused
description: >-
  The `advanced_dom_input_focused` event is published when an input on a page
  gains focus.


  > Shopify Plus:

  > This event is limited on
  [checkout](https://help.shopify.com/manual/checkout-settings) to stores on the
  [Shopify Plus](https://www.shopify.com/plus) plan.
api_name: web-pixels
source_url:
  html: >-
    https://shopify.dev/docs/api/web-pixels-api/advanced-dom-events/advanced_dom_input_focused
  md: >-
    https://shopify.dev/docs/api/web-pixels-api/advanced-dom-events/advanced_dom_input_focused.md
---

# advanced\_​dom\_​input\_​focused

Requires access to the **Advanced DOM Events in web pixel app extensions** scope. To request access, please use the form in the Partner Dashboard. This scope is only available for apps that have a heatmap and/or session recordings. The Advanced DOM Events cannot be used on custom apps.

The `advanced_dom_input_focused` event is published when an input on a page gains focus.

Shopify Plus

This event is limited on [checkout](https://help.shopify.com/manual/checkout-settings) to stores on the [Shopify Plus](https://www.shopify.com/plus) plan.

## Properties

* clientId

  string

  The client-side ID of the customer, provided by Shopify

* data

  PixelEventsAdvancedDomInputFocusedData

* id

  string

  The ID of the customer event

* name

  string

  The name of the customer event

* seq

  number

  The sequence index number of the event.

* timestamp

  string

  The timestamp of when the customer event occurred, in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format

* type

  EventType.AdvancedDom

### PixelEventsAdvancedDomInputFocusedData

* node

  The node object for the event target.

  ```ts
  DomNode
  ```

```ts
export interface PixelEventsAdvancedDomInputFocusedData {
  /**
   * The node object for the event target.
   */
  node?: DomNode;
}
```

### DomNode

Representation of a node in the document.

* attributes

  A dictionary of attributes of an element. Only available on element nodes.

  ```ts
  { [key: string]: string; }
  ```

* checked

  The checked state of an element. Only available on input element nodes.

  ```ts
  boolean
  ```

* clientRect

  The coordinates of the element in the viewport. Only available on element nodes.

  ```ts
  ClientRect
  ```

* nodeType

  The type of node based on the native DOM API's \[\`nodeType\`]\(https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType) values. It distinguishes different kind of nodes from each other, such as elements, text and comments.

  ```ts
  number
  ```

* scroll

  The scroll coordinates of the element in the viewport. Only available on element nodes.

  ```ts
  ClientRect
  ```

* serializationId

  The serialization id of the node. This is a unique identifier for the node based on its stable reference in the host DOM tree.

  ```ts
  number
  ```

* tagName

  A string representation of the tag of a node. Only available on element nodes.

  ```ts
  string
  ```

* textContent

  The text content of an element. Only available on text nodes.

  ```ts
  string
  ```

```ts
export interface DomNode {
  /**
   * The type of node based on the native DOM API's
   * [`nodeType`](https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType) values. It distinguishes different kind of
   * nodes from each other, such as elements, text and comments.
   */
  nodeType?: number;

  /**
   * The serialization id of the node. This is a unique identifier for the node
   * based on its stable reference in the host DOM tree.
   */
  serializationId?: number;

  /**
   * A dictionary of attributes of an element. Only available on element nodes.
   */
  attributes?: {[key: string]: string};

  /**
   * The checked state of an element. Only available on input element nodes.
   */
  checked?: boolean;

  /**
   * The coordinates of the element in the viewport. Only available on element
   * nodes.
   */
  clientRect?: ClientRect;

  /**
   * The scroll coordinates of the element in the viewport. Only available on
   * element nodes.
   */
  scroll?: ClientRect;

  /**
   * A string representation of the tag of a node. Only available on element
   * nodes.
   */
  tagName?: string;

  /**
   * The text content of an element. Only available on text nodes.
   */
  textContent?: string;
}
```

### ClientRect

An object that contains data about an element coordinates in a viewport.

* height

  ```ts
  number
  ```

* width

  ```ts
  number
  ```

* x

  ```ts
  number
  ```

* y

  ```ts
  number
  ```

```ts
export interface ClientRect {
  height?: number;
  width?: number;
  x?: number;
  y?: number;
}
```

### EventType

* AdvancedDom

  ```ts
  advanced-dom
  ```

* Custom

  ```ts
  custom
  ```

* Dom

  ```ts
  dom
  ```

* Meta

  ```ts
  meta
  ```

* Standard

  ```ts
  standard
  ```

```ts
export enum EventType {
  AdvancedDom = 'advanced-dom',
  Custom = 'custom',
  Dom = 'dom',
  Meta = 'meta',
  Standard = 'standard',
}
```

Examples

### Examples

* #### Accessing Advanced DOM Events

  ##### App Pixel

  ```javascript
  import {register} from '@shopify/web-pixels-extension';

  register(({analytics}) => {
    analytics.subscribe('advanced_dom_input_focused', (event) => {
      // Accessing event payload
      const node = event.data.node;

      if (node?.nodeType !== Node.ELEMENT_NODE) return;

      const payload = {
        event_name: event.name,
        event_data: {
          id: node.serializationId,
          value: node.attributes?.value,
        },
      };

      // E.g. sending event to third party servers
      fetch('https://example.com/pixel', {
        method: 'POST',
        body: JSON.stringify(payload),
        keepalive: true,
      });
    });
  });
  ```

</page>

<page>
---
title: advanced_dom_mouse_moved
description: >-
  The `advanced_dom_mouse_moved` event is published when a customer moves their
  cursor over the page.


  > Shopify Plus:

  > This event is limited on
  [checkout](https://help.shopify.com/manual/checkout-settings) to stores on the
  [Shopify Plus](https://www.shopify.com/plus) plan.
api_name: web-pixels
source_url:
  html: >-
    https://shopify.dev/docs/api/web-pixels-api/advanced-dom-events/advanced_dom_mouse_moved
  md: >-
    https://shopify.dev/docs/api/web-pixels-api/advanced-dom-events/advanced_dom_mouse_moved.md
---

# advanced\_​dom\_​mouse\_​moved

Requires access to the **Advanced DOM Events in web pixel app extensions** scope. To request access, please use the form in the Partner Dashboard. This scope is only available for apps that have a heatmap and/or session recordings. The Advanced DOM Events cannot be used on custom apps.

The `advanced_dom_mouse_moved` event is published when a customer moves their cursor over the page.

Shopify Plus

This event is limited on [checkout](https://help.shopify.com/manual/checkout-settings) to stores on the [Shopify Plus](https://www.shopify.com/plus) plan.

## Properties

* clientId

  string

  The client-side ID of the customer, provided by Shopify

* data

  AdvancedMouseEventData

* id

  string

  The ID of the customer event

* name

  string

  The name of the customer event

* seq

  number

  The sequence index number of the event.

* timestamp

  string

  The timestamp of when the customer event occurred, in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format

* type

  EventType.AdvancedDom

### AdvancedMouseEventData

An object that contains data about a mouse event.

* clientX

  ```ts
  number
  ```

* clientY

  ```ts
  number
  ```

* movementX

  ```ts
  number
  ```

* movementY

  ```ts
  number
  ```

* node

  The node object for the event target.

  ```ts
  DomNode
  ```

* offsetX

  ```ts
  number
  ```

* offsetY

  ```ts
  number
  ```

* pageX

  ```ts
  number
  ```

* pageY

  ```ts
  number
  ```

* screenX

  ```ts
  number
  ```

* screenY

  ```ts
  number
  ```

```ts
export interface AdvancedMouseEventData {
  clientX?: number;
  clientY?: number;
  movementX?: number;
  movementY?: number;

  /**
   * The node object for the event target.
   */
  node?: DomNode;
  offsetX?: number;
  offsetY?: number;
  pageX?: number;
  pageY?: number;
  screenX?: number;
  screenY?: number;
}
```

### DomNode

Representation of a node in the document.

* attributes

  A dictionary of attributes of an element. Only available on element nodes.

  ```ts
  { [key: string]: string; }
  ```

* checked

  The checked state of an element. Only available on input element nodes.

  ```ts
  boolean
  ```

* clientRect

  The coordinates of the element in the viewport. Only available on element nodes.

  ```ts
  ClientRect
  ```

* nodeType

  The type of node based on the native DOM API's \[\`nodeType\`]\(https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType) values. It distinguishes different kind of nodes from each other, such as elements, text and comments.

  ```ts
  number
  ```

* scroll

  The scroll coordinates of the element in the viewport. Only available on element nodes.

  ```ts
  ClientRect
  ```

* serializationId

  The serialization id of the node. This is a unique identifier for the node based on its stable reference in the host DOM tree.

  ```ts
  number
  ```

* tagName

  A string representation of the tag of a node. Only available on element nodes.

  ```ts
  string
  ```

* textContent

  The text content of an element. Only available on text nodes.

  ```ts
  string
  ```

```ts
export interface DomNode {
  /**
   * The type of node based on the native DOM API's
   * [`nodeType`](https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType) values. It distinguishes different kind of
   * nodes from each other, such as elements, text and comments.
   */
  nodeType?: number;

  /**
   * The serialization id of the node. This is a unique identifier for the node
   * based on its stable reference in the host DOM tree.
   */
  serializationId?: number;

  /**
   * A dictionary of attributes of an element. Only available on element nodes.
   */
  attributes?: {[key: string]: string};

  /**
   * The checked state of an element. Only available on input element nodes.
   */
  checked?: boolean;

  /**
   * The coordinates of the element in the viewport. Only available on element
   * nodes.
   */
  clientRect?: ClientRect;

  /**
   * The scroll coordinates of the element in the viewport. Only available on
   * element nodes.
   */
  scroll?: ClientRect;

  /**
   * A string representation of the tag of a node. Only available on element
   * nodes.
   */
  tagName?: string;

  /**
   * The text content of an element. Only available on text nodes.
   */
  textContent?: string;
}
```

### ClientRect

An object that contains data about an element coordinates in a viewport.

* height

  ```ts
  number
  ```

* width

  ```ts
  number
  ```

* x

  ```ts
  number
  ```

* y

  ```ts
  number
  ```

```ts
export interface ClientRect {
  height?: number;
  width?: number;
  x?: number;
  y?: number;
}
```

### EventType

* AdvancedDom

  ```ts
  advanced-dom
  ```

* Custom

  ```ts
  custom
  ```

* Dom

  ```ts
  dom
  ```

* Meta

  ```ts
  meta
  ```

* Standard

  ```ts
  standard
  ```

```ts
export enum EventType {
  AdvancedDom = 'advanced-dom',
  Custom = 'custom',
  Dom = 'dom',
  Meta = 'meta',
  Standard = 'standard',
}
```

Examples

### Examples

* #### Accessing Advanced DOM Events

  ##### App Pixel

  ```javascript
  import {register} from '@shopify/web-pixels-extension';

  register(({analytics}) => {
    analytics.subscribe('advanced_dom_mouse_moved', (event) => {
      // Accessing event payload
      const node = event.data.node;

      if (node?.nodeType !== Node.ELEMENT_NODE) return;

      const payload = {
        event_name: event.name,
        event_data: {
          id: node.serializationId,
          clientX: event.data.clientX,
          clientY: event.data.clientY,
          movementX: event.data.movementX,
          movementY: event.data.movementY,
        },
      };

      // E.g. sending event to third party servers
      fetch('https://example.com/pixel', {
        method: 'POST',
        body: JSON.stringify(payload),
        keepalive: true,
      });
    });
  });
  ```

</page>

<page>
---
title: advanced_dom_scrolled
description: >-
  The `advanced_dom_scrolled` event is published when a customer scrolls on a
  page or in a scrollable element.


  > Shopify Plus:

  > This event is limited on
  [checkout](https://help.shopify.com/manual/checkout-settings) to stores on the
  [Shopify Plus](https://www.shopify.com/plus) plan.
api_name: web-pixels
source_url:
  html: >-
    https://shopify.dev/docs/api/web-pixels-api/advanced-dom-events/advanced_dom_scrolled
  md: >-
    https://shopify.dev/docs/api/web-pixels-api/advanced-dom-events/advanced_dom_scrolled.md
---

# advanced\_​dom\_​scrolled

Requires access to the **Advanced DOM Events in web pixel app extensions** scope. To request access, please use the form in the Partner Dashboard. This scope is only available for apps that have a heatmap and/or session recordings. The Advanced DOM Events cannot be used on custom apps.

The `advanced_dom_scrolled` event is published when a customer scrolls on a page or in a scrollable element.

Shopify Plus

This event is limited on [checkout](https://help.shopify.com/manual/checkout-settings) to stores on the [Shopify Plus](https://www.shopify.com/plus) plan.

## Properties

* clientId

  string

  The client-side ID of the customer, provided by Shopify

* data

  PixelEventsAdvancedDomScrolledData

* id

  string

  The ID of the customer event

* name

  string

  The name of the customer event.

* seq

  number

  The sequence index number of the event.

* timestamp

  string

  The timestamp of when the customer event occurred, in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format

* type

  EventType.AdvancedDom

### PixelEventsAdvancedDomScrolledData

* node

  The element that is currently being scrolled. Can be either the document or an element on the page.

  ```ts
  DomNode
  ```

```ts
export interface PixelEventsAdvancedDomScrolledData {
  /**
   * The element that is currently being scrolled. Can be either the document or
   * an element on the page.
   */
  node?: DomNode;
}
```

### DomNode

Representation of a node in the document.

* attributes

  A dictionary of attributes of an element. Only available on element nodes.

  ```ts
  { [key: string]: string; }
  ```

* checked

  The checked state of an element. Only available on input element nodes.

  ```ts
  boolean
  ```

* clientRect

  The coordinates of the element in the viewport. Only available on element nodes.

  ```ts
  ClientRect
  ```

* nodeType

  The type of node based on the native DOM API's \[\`nodeType\`]\(https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType) values. It distinguishes different kind of nodes from each other, such as elements, text and comments.

  ```ts
  number
  ```

* scroll

  The scroll coordinates of the element in the viewport. Only available on element nodes.

  ```ts
  ClientRect
  ```

* serializationId

  The serialization id of the node. This is a unique identifier for the node based on its stable reference in the host DOM tree.

  ```ts
  number
  ```

* tagName

  A string representation of the tag of a node. Only available on element nodes.

  ```ts
  string
  ```

* textContent

  The text content of an element. Only available on text nodes.

  ```ts
  string
  ```

```ts
export interface DomNode {
  /**
   * The type of node based on the native DOM API's
   * [`nodeType`](https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType) values. It distinguishes different kind of
   * nodes from each other, such as elements, text and comments.
   */
  nodeType?: number;

  /**
   * The serialization id of the node. This is a unique identifier for the node
   * based on its stable reference in the host DOM tree.
   */
  serializationId?: number;

  /**
   * A dictionary of attributes of an element. Only available on element nodes.
   */
  attributes?: {[key: string]: string};

  /**
   * The checked state of an element. Only available on input element nodes.
   */
  checked?: boolean;

  /**
   * The coordinates of the element in the viewport. Only available on element
   * nodes.
   */
  clientRect?: ClientRect;

  /**
   * The scroll coordinates of the element in the viewport. Only available on
   * element nodes.
   */
  scroll?: ClientRect;

  /**
   * A string representation of the tag of a node. Only available on element
   * nodes.
   */
  tagName?: string;

  /**
   * The text content of an element. Only available on text nodes.
   */
  textContent?: string;
}
```

### ClientRect

An object that contains data about an element coordinates in a viewport.

* height

  ```ts
  number
  ```

* width

  ```ts
  number
  ```

* x

  ```ts
  number
  ```

* y

  ```ts
  number
  ```

```ts
export interface ClientRect {
  height?: number;
  width?: number;
  x?: number;
  y?: number;
}
```

### EventType

* AdvancedDom

  ```ts
  advanced-dom
  ```

* Custom

  ```ts
  custom
  ```

* Dom

  ```ts
  dom
  ```

* Meta

  ```ts
  meta
  ```

* Standard

  ```ts
  standard
  ```

```ts
export enum EventType {
  AdvancedDom = 'advanced-dom',
  Custom = 'custom',
  Dom = 'dom',
  Meta = 'meta',
  Standard = 'standard',
}
```

Examples

### Examples

* #### Accessing Advanced DOM Events

  ##### App Pixel

  ```javascript
  import {register} from '@shopify/web-pixels-extension';

  register(({analytics}) => {
    analytics.subscribe('advanced_dom_scrolled', (event) => {
      // Accessing event payload
      const node = event.data.node;

      if (node?.nodeType !== Node.ELEMENT_NODE) return;

      const payload = {
        event_name: event.name,
        event_data: {
          id: node.serializationId,
          x: node.scroll.x,
          y: node.scroll.y,
          width: node.scroll.width,
          height: node.scroll.height,
        },
      };

      // E.g. sending event to third party servers
      fetch('https://example.com/pixel', {
        method: 'POST',
        body: JSON.stringify(payload),
        keepalive: true,
      });
    });
  });
  ```

</page>

<page>
---
title: advanced_dom_selection_changed
description: >-
  The `advanced_dom_selection_changed` event is published when a customer uses
  text selection on a page.


  > Shopify Plus:

  > This event is limited on
  [checkout](https://help.shopify.com/manual/checkout-settings) to stores on the
  [Shopify Plus](https://www.shopify.com/plus) plan.
api_name: web-pixels
source_url:
  html: >-
    https://shopify.dev/docs/api/web-pixels-api/advanced-dom-events/advanced_dom_selection_changed
  md: >-
    https://shopify.dev/docs/api/web-pixels-api/advanced-dom-events/advanced_dom_selection_changed.md
---

# advanced\_​dom\_​selection\_​changed

Requires access to the **Advanced DOM Events in web pixel app extensions** scope. To request access, please use the form in the Partner Dashboard. This scope is only available for apps that have a heatmap and/or session recordings. The Advanced DOM Events cannot be used on custom apps.

The `advanced_dom_selection_changed` event is published when a customer uses text selection on a page.

Shopify Plus

This event is limited on [checkout](https://help.shopify.com/manual/checkout-settings) to stores on the [Shopify Plus](https://www.shopify.com/plus) plan.

## Properties

* clientId

  string

  The client-side ID of the customer, provided by Shopify

* data

  PixelEventsAdvancedDomSelectionChangedData

* id

  string

  The ID of the customer event

* name

  string

  The name of the customer event.

* seq

  number

  The sequence index number of the event.

* timestamp

  string

  The timestamp of when the customer event occurred, in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format

* type

  EventType.AdvancedDom

### PixelEventsAdvancedDomSelectionChangedData

* node

  The node object for the event target.

  ```ts
  DomNode
  ```

```ts
export interface PixelEventsAdvancedDomSelectionChangedData {
  /**
   * The node object for the event target.
   */
  node?: DomNode;
}
```

### DomNode

Representation of a node in the document.

* attributes

  A dictionary of attributes of an element. Only available on element nodes.

  ```ts
  { [key: string]: string; }
  ```

* checked

  The checked state of an element. Only available on input element nodes.

  ```ts
  boolean
  ```

* clientRect

  The coordinates of the element in the viewport. Only available on element nodes.

  ```ts
  ClientRect
  ```

* nodeType

  The type of node based on the native DOM API's \[\`nodeType\`]\(https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType) values. It distinguishes different kind of nodes from each other, such as elements, text and comments.

  ```ts
  number
  ```

* scroll

  The scroll coordinates of the element in the viewport. Only available on element nodes.

  ```ts
  ClientRect
  ```

* serializationId

  The serialization id of the node. This is a unique identifier for the node based on its stable reference in the host DOM tree.

  ```ts
  number
  ```

* tagName

  A string representation of the tag of a node. Only available on element nodes.

  ```ts
  string
  ```

* textContent

  The text content of an element. Only available on text nodes.

  ```ts
  string
  ```

```ts
export interface DomNode {
  /**
   * The type of node based on the native DOM API's
   * [`nodeType`](https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType) values. It distinguishes different kind of
   * nodes from each other, such as elements, text and comments.
   */
  nodeType?: number;

  /**
   * The serialization id of the node. This is a unique identifier for the node
   * based on its stable reference in the host DOM tree.
   */
  serializationId?: number;

  /**
   * A dictionary of attributes of an element. Only available on element nodes.
   */
  attributes?: {[key: string]: string};

  /**
   * The checked state of an element. Only available on input element nodes.
   */
  checked?: boolean;

  /**
   * The coordinates of the element in the viewport. Only available on element
   * nodes.
   */
  clientRect?: ClientRect;

  /**
   * The scroll coordinates of the element in the viewport. Only available on
   * element nodes.
   */
  scroll?: ClientRect;

  /**
   * A string representation of the tag of a node. Only available on element
   * nodes.
   */
  tagName?: string;

  /**
   * The text content of an element. Only available on text nodes.
   */
  textContent?: string;
}
```

### ClientRect

An object that contains data about an element coordinates in a viewport.

* height

  ```ts
  number
  ```

* width

  ```ts
  number
  ```

* x

  ```ts
  number
  ```

* y

  ```ts
  number
  ```

```ts
export interface ClientRect {
  height?: number;
  width?: number;
  x?: number;
  y?: number;
}
```

### EventType

* AdvancedDom

  ```ts
  advanced-dom
  ```

* Custom

  ```ts
  custom
  ```

* Dom

  ```ts
  dom
  ```

* Meta

  ```ts
  meta
  ```

* Standard

  ```ts
  standard
  ```

```ts
export enum EventType {
  AdvancedDom = 'advanced-dom',
  Custom = 'custom',
  Dom = 'dom',
  Meta = 'meta',
  Standard = 'standard',
}
```

Examples

### Examples

* #### Accessing Advanced DOM Events

  ##### App Pixel

  ```javascript
  import {register} from '@shopify/web-pixels-extension';

  register(({analytics}) => {
    analytics.subscribe('advanced_dom_selection_changed', (event) => {
      // Accessing event payload
      const node = event.data.node;

      if (node?.nodeType !== Node.ELEMENT_NODE) return;

      const payload = {
        event_name: event.name,
        event_data: {
          id: node.serializationId,
          value: node.attributes?.value,
        },
      };

      // E.g. sending event to third party servers
      fetch('https://example.com/pixel', {
        method: 'POST',
        body: JSON.stringify(payload),
        keepalive: true,
      });
    });
  });
  ```

</page>

<page>
---
title: advanced_dom_window_resized
description: >-
  The `advanced_dom_window_resized` event is published when a customer resizes
  their browser window.


  > Shopify Plus:

  > This event is limited on
  [checkout](https://help.shopify.com/manual/checkout-settings) to stores on the
  [Shopify Plus](https://www.shopify.com/plus) plan.
api_name: web-pixels
source_url:
  html: >-
    https://shopify.dev/docs/api/web-pixels-api/advanced-dom-events/advanced_dom_window_resized
  md: >-
    https://shopify.dev/docs/api/web-pixels-api/advanced-dom-events/advanced_dom_window_resized.md
---

# advanced\_​dom\_​window\_​resized

Requires access to the **Advanced DOM Events in web pixel app extensions** scope. To request access, please use the form in the Partner Dashboard. This scope is only available for apps that have a heatmap and/or session recordings. The Advanced DOM Events cannot be used on custom apps.

The `advanced_dom_window_resized` event is published when a customer resizes their browser window.

Shopify Plus

This event is limited on [checkout](https://help.shopify.com/manual/checkout-settings) to stores on the [Shopify Plus](https://www.shopify.com/plus) plan.

## Properties

* clientId

  string

  The client-side ID of the customer, provided by Shopify

* data

  PixelEventsAdvancedDomWindowResizedData

  No additional data is provided by design. Use the event context to get the latest window size.

* id

  string

  The ID of the customer event

* name

  string

  The name of the customer event.

* seq

  number

  The sequence index number of the event.

* timestamp

  string

  The timestamp of when the customer event occurred, in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format

* type

  EventType.AdvancedDom

### PixelEventsAdvancedDomWindowResizedData

No additional data is provided by design. Use the event context to get the latest window size.



```ts
export interface PixelEventsAdvancedDomWindowResizedData {}
```

### EventType

* AdvancedDom

  ```ts
  advanced-dom
  ```

* Custom

  ```ts
  custom
  ```

* Dom

  ```ts
  dom
  ```

* Meta

  ```ts
  meta
  ```

* Standard

  ```ts
  standard
  ```

```ts
export enum EventType {
  AdvancedDom = 'advanced-dom',
  Custom = 'custom',
  Dom = 'dom',
  Meta = 'meta',
  Standard = 'standard',
}
```

Examples

### Examples

* #### Accessing Advanced DOM Events

  ##### App Pixel

  ```javascript
  import {register} from '@shopify/web-pixels-extension';

  register(({analytics}) => {
    analytics.subscribe('advanced_dom_window_resized', (event) => {
      // Accessing event payload
      const payload = {
        event_name: event.name,
        event_data: {
          width: event.context.window.innerWidth,
          height: event.context.window.innerHeight,
        },
      };

      // E.g. sending event to third party servers
      fetch('https://example.com/pixel', {
        method: 'POST',
        body: JSON.stringify(payload),
        keepalive: true,
      });
    });
  });
  ```

</page>

<page>
---
title: clicked
description: >-
  The `clicked` event logs an instance where a customer clicks on a page
  element.
api_name: web-pixels
source_url:
  html: 'https://shopify.dev/docs/api/web-pixels-api/dom-events/clicked'
  md: 'https://shopify.dev/docs/api/web-pixels-api/dom-events/clicked.md'
---

# clicked

The `clicked` event logs an instance where a customer clicks on a page element.

## Properties

* clientId

  string

  The client-side ID of the customer, provided by Shopify

* data

  MouseEventData

* id

  string

  The ID of the customer event

* name

  string

  The name of the customer event

* seq

  number

  The sequence index number of the event.

* timestamp

  string

  The timestamp of when the customer event occurred, in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format

* type

  EventType.Dom

### MouseEventData

An object that contains data about a mouse event

* clientX

  ```ts
  number
  ```

* clientY

  ```ts
  number
  ```

* element

  ```ts
  GenericElement
  ```

* movementX

  ```ts
  number
  ```

* movementY

  ```ts
  number
  ```

* offsetX

  ```ts
  number
  ```

* offsetY

  ```ts
  number
  ```

* pageX

  ```ts
  number
  ```

* pageY

  ```ts
  number
  ```

* screenX

  ```ts
  number
  ```

* screenY

  ```ts
  number
  ```

```ts
export interface MouseEventData {
  clientX?: number;
  clientY?: number;
  element?: GenericElement;
  movementX?: number;
  movementY?: number;
  offsetX?: number;
  offsetY?: number;
  pageX?: number;
  pageY?: number;
  screenX?: number;
  screenY?: number;
}
```

### GenericElement

An object that contains data about a generic element type

* href

  The href attribute of an element

  ```ts
  string | null
  ```

* id

  The id attribute of an element

  ```ts
  string | null
  ```

* name

  The name attribute of an element

  ```ts
  string | null
  ```

* tagName

  A string representation of the tag of an element

  ```ts
  string | null
  ```

* type

  The type attribute of an element. Often relevant for an input or button element.

  ```ts
  string | null
  ```

* value

  The value attribute of an element. Often relevant for an input element.

  ```ts
  string | null
  ```

```ts
export interface GenericElement {
  /**
   * The href attribute of an element
   */
  href?: string | null;

  /**
   * The id attribute of an element
   */
  id?: string | null;

  /**
   * The name attribute of an element
   */
  name?: string | null;

  /**
   * A string representation of the tag of an element
   */
  tagName?: string | null;

  /**
   * The type attribute of an element. Often relevant for an input or button
   * element.
   */
  type?: string | null;

  /**
   * The value attribute of an element. Often relevant for an input element.
   */
  value?: string | null;
}
```

### EventType

* AdvancedDom

  ```ts
  advanced-dom
  ```

* Custom

  ```ts
  custom
  ```

* Dom

  ```ts
  dom
  ```

* Meta

  ```ts
  meta
  ```

* Standard

  ```ts
  standard
  ```

```ts
export enum EventType {
  AdvancedDom = 'advanced-dom',
  Custom = 'custom',
  Dom = 'dom',
  Meta = 'meta',
  Standard = 'standard',
}
```

Examples

### Examples

* #### Accessing DOM Events

  ##### App Pixel

  ```javascript
  import {register} from '@shopify/web-pixels-extension';

  register(({analytics}) => {
    analytics.subscribe('clicked', (event) => {
      // Example for accessing event data
      const element = event.data.element;

      const elementId = element.id;
      const elementValue = element.value;
      const elementHref = element.href;

      const payload = {
        event_name: event.name,
        event_data: {
          id: elementId,
          value: elementValue,
          url: elementHref,
        },
      };

      // Example for sending event to third party servers
      fetch('https://example.com/pixel', {
        method: 'POST',
        body: JSON.stringify(payload),
        keepalive: true,
      });
    });
  });
  ```

  ##### Custom Pixel

  ```javascript
  analytics.subscribe('clicked', (event) => {
    // Example for accessing event data
    const element = event.data.element;

    const elementId = element.id;
    const elementValue = element.value;
    const elementHref = element.href;

    const payload = {
      event_name: event.name,
      event_data: {
        id: elementId,
        value: elementValue,
        url: elementHref,
      },
    };

    // Example for sending event to third party servers
    fetch('https://example.com/pixel', {
      method: 'POST',
      body: JSON.stringify(payload),
      keepalive: true,
    });
  });
  ```

</page>

<page>
---
title: form_submitted
description: >-
  The `form_submitted` event logs an instance where a form on a page is
  submitted.
api_name: web-pixels
source_url:
  html: 'https://shopify.dev/docs/api/web-pixels-api/dom-events/form_submitted'
  md: 'https://shopify.dev/docs/api/web-pixels-api/dom-events/form_submitted.md'
---

# form\_​submitted

The `form_submitted` event logs an instance where a form on a page is submitted.

## Properties

* clientId

  string

  The client-side ID of the customer, provided by Shopify

* data

  PixelEventsFormSubmittedData

* id

  string

  The ID of the customer event

* name

  string

  The name of the customer event

* seq

  number

  The sequence index number of the event.

* timestamp

  string

  The timestamp of when the customer event occurred, in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format

* type

  EventType.Dom

### PixelEventsFormSubmittedData

* element

  ```ts
  FormElement
  ```

```ts
export interface PixelEventsFormSubmittedData {
  element?: FormElement;
}
```

### FormElement

An object that contains data about a form element type

* action

  The action attribute of a form element

  ```ts
  string | null
  ```

* elements

  ```ts
  InputElement[]
  ```

* id

  The id attribute of an element

  ```ts
  string | null
  ```

```ts
export interface FormElement {
  /**
   * The action attribute of a form element
   */
  action?: string | null;
  elements?: InputElement[];

  /**
   * The id attribute of an element
   */
  id?: string | null;
}
```

### InputElement

An object that contains data about an input element type

* id

  The id attribute of an element

  ```ts
  string | null
  ```

* name

  The name attribute of an element

  ```ts
  string | null
  ```

* tagName

  A string representation of the tag of an element

  ```ts
  string | null
  ```

* type

  The type attribute of an element. Often relevant for an input or button element.

  ```ts
  string | null
  ```

* value

  The value attribute of an element. Often relevant for an input element.

  ```ts
  string | null
  ```

```ts
export interface InputElement {
  /**
   * The id attribute of an element
   */
  id?: string | null;

  /**
   * The name attribute of an element
   */
  name?: string | null;

  /**
   * A string representation of the tag of an element
   */
  tagName?: string | null;

  /**
   * The type attribute of an element. Often relevant for an input or button
   * element.
   */
  type?: string | null;

  /**
   * The value attribute of an element. Often relevant for an input element.
   */
  value?: string | null;
}
```

### EventType

* AdvancedDom

  ```ts
  advanced-dom
  ```

* Custom

  ```ts
  custom
  ```

* Dom

  ```ts
  dom
  ```

* Meta

  ```ts
  meta
  ```

* Standard

  ```ts
  standard
  ```

```ts
export enum EventType {
  AdvancedDom = 'advanced-dom',
  Custom = 'custom',
  Dom = 'dom',
  Meta = 'meta',
  Standard = 'standard',
}
```

Examples

### Examples

* #### Accessing DOM Events

  ##### App Pixel

  ```javascript
  import {register} from '@shopify/web-pixels-extension';

  register(({analytics}) => {
    analytics.subscribe('form_submitted', (event) => {
      // Example for accessing event data
      const element = event.data.element;

      const elementId = element.id;
      const formAction = element.action;
      const emailRegex = /email/i;
      const [email] = element.elements
        .filter((item) => emailRegex.test(item.id) || emailRegex.test(item.name))
        .map((item) => item.value);
      const formDetails = element.elements.map((item) => {
        return {
          id: item.id,
          name: item.name,
          value: item.value,
        };
      });

      const payload = {
        event_name: event.name,
        event_data: {
          id: elementId,
          url: formAction,
          email: email,
          formDetails: formDetails,
        },
      };

      // Example for sending event to third party servers
      fetch('https://example.com/pixel', {
        method: 'POST',
        body: JSON.stringify(payload),
        keepalive: true,
      });
    });
  });
  ```

  ##### Custom Pixel

  ```javascript
  analytics.subscribe('form_submitted', (event) => {
    // Example for accessing event data
    const element = event.data.element;

    const elementId = element.id;
    const formAction = element.action;
    const emailRegex = /email/i;
    const [email] = element.elements
      .filter((item) => emailRegex.test(item.id) || emailRegex.test(item.name))
      .map((item) => item.value);
    const formDetails = element.elements.map((item) => {
      return {
        id: item.id,
        name: item.name,
        value: item.value,
      };
    });

    const payload = {
      event_name: event.name,
      event_data: {
        id: elementId,
        url: formAction,
        email: email,
        formDetails: formDetails,
      },
    };

    // Example for sending event to third party servers
    fetch('https://example.com/pixel', {
      method: 'POST',
      body: JSON.stringify(payload),
      keepalive: true,
    });
  });
  ```

</page>

<page>
---
title: input_blurred
description: >-
  The `input_blurred` event logs an instance where an input on a page loses
  focus.
api_name: web-pixels
source_url:
  html: 'https://shopify.dev/docs/api/web-pixels-api/dom-events/input_blurred'
  md: 'https://shopify.dev/docs/api/web-pixels-api/dom-events/input_blurred.md'
---

# input\_​blurred

The `input_blurred` event logs an instance where an input on a page loses focus.

## Properties

* clientId

  string

  The client-side ID of the customer, provided by Shopify

* data

  PixelEventsInputBlurredData

* id

  string

  The ID of the customer event

* name

  string

  The name of the customer event

* seq

  number

  The sequence index number of the event.

* timestamp

  string

  The timestamp of when the customer event occurred, in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format

* type

  EventType.Dom

### PixelEventsInputBlurredData

* element

  ```ts
  InputElement
  ```

```ts
export interface PixelEventsInputBlurredData {
  element?: InputElement;
}
```

### InputElement

An object that contains data about an input element type

* id

  The id attribute of an element

  ```ts
  string | null
  ```

* name

  The name attribute of an element

  ```ts
  string | null
  ```

* tagName

  A string representation of the tag of an element

  ```ts
  string | null
  ```

* type

  The type attribute of an element. Often relevant for an input or button element.

  ```ts
  string | null
  ```

* value

  The value attribute of an element. Often relevant for an input element.

  ```ts
  string | null
  ```

```ts
export interface InputElement {
  /**
   * The id attribute of an element
   */
  id?: string | null;

  /**
   * The name attribute of an element
   */
  name?: string | null;

  /**
   * A string representation of the tag of an element
   */
  tagName?: string | null;

  /**
   * The type attribute of an element. Often relevant for an input or button
   * element.
   */
  type?: string | null;

  /**
   * The value attribute of an element. Often relevant for an input element.
   */
  value?: string | null;
}
```

### EventType

* AdvancedDom

  ```ts
  advanced-dom
  ```

* Custom

  ```ts
  custom
  ```

* Dom

  ```ts
  dom
  ```

* Meta

  ```ts
  meta
  ```

* Standard

  ```ts
  standard
  ```

```ts
export enum EventType {
  AdvancedDom = 'advanced-dom',
  Custom = 'custom',
  Dom = 'dom',
  Meta = 'meta',
  Standard = 'standard',
}
```

Examples

### Examples

* #### Accessing DOM Events

  ##### App Pixel

  ```javascript
  import {register} from '@shopify/web-pixels-extension';

  register(({analytics}) => {
    analytics.subscribe('input_blurred', (event) => {
      // Example for accessing event data
      const element = event.data.element;

      const elementId = element.id;
      const elementValue = element.value;

      const payload = {
        event_name: event.name,
        event_data: {
          id: elementId,
          value: elementValue,
        },
      };

      // Example for sending event to third party servers
      fetch('https://example.com/pixel', {
        method: 'POST',
        body: JSON.stringify(payload),
        keepalive: true,
      });
    });
  });
  ```

  ##### Custom Pixel

  ```javascript
  analytics.subscribe('input_blurred', (event) => {
    // Example for accessing event data
    const element = event.data.element;

    const elementId = element.id;
    const elementValue = element.value;

    const payload = {
      event_name: event.name,
      event_data: {
        id: elementId,
        value: elementValue,
      },
    };

    // Example for sending event to third party servers
    fetch('https://example.com/pixel', {
      method: 'POST',
      body: JSON.stringify(payload),
      keepalive: true,
    });
  });
  ```

</page>

<page>
---
title: input_changed
description: The `input_changed` event logs an instance where an input value changes.
api_name: web-pixels
source_url:
  html: 'https://shopify.dev/docs/api/web-pixels-api/dom-events/input_changed'
  md: 'https://shopify.dev/docs/api/web-pixels-api/dom-events/input_changed.md'
---

# input\_​changed

The `input_changed` event logs an instance where an input value changes.

## Properties

* clientId

  string

  The client-side ID of the customer, provided by Shopify

* data

  PixelEventsInputChangedData

* id

  string

  The ID of the customer event

* name

  string

  The name of the customer event

* seq

  number

  The sequence index number of the event.

* timestamp

  string

  The timestamp of when the customer event occurred, in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format

* type

  EventType.Dom

### PixelEventsInputChangedData

* element

  ```ts
  InputElement
  ```

```ts
export interface PixelEventsInputChangedData {
  element?: InputElement;
}
```

### InputElement

An object that contains data about an input element type

* id

  The id attribute of an element

  ```ts
  string | null
  ```

* name

  The name attribute of an element

  ```ts
  string | null
  ```

* tagName

  A string representation of the tag of an element

  ```ts
  string | null
  ```

* type

  The type attribute of an element. Often relevant for an input or button element.

  ```ts
  string | null
  ```

* value

  The value attribute of an element. Often relevant for an input element.

  ```ts
  string | null
  ```

```ts
export interface InputElement {
  /**
   * The id attribute of an element
   */
  id?: string | null;

  /**
   * The name attribute of an element
   */
  name?: string | null;

  /**
   * A string representation of the tag of an element
   */
  tagName?: string | null;

  /**
   * The type attribute of an element. Often relevant for an input or button
   * element.
   */
  type?: string | null;

  /**
   * The value attribute of an element. Often relevant for an input element.
   */
  value?: string | null;
}
```

### EventType

* AdvancedDom

  ```ts
  advanced-dom
  ```

* Custom

  ```ts
  custom
  ```

* Dom

  ```ts
  dom
  ```

* Meta

  ```ts
  meta
  ```

* Standard

  ```ts
  standard
  ```

```ts
export enum EventType {
  AdvancedDom = 'advanced-dom',
  Custom = 'custom',
  Dom = 'dom',
  Meta = 'meta',
  Standard = 'standard',
}
```

Examples

### Examples

* #### Accessing DOM Events

  ##### App Pixel

  ```javascript
  import {register} from '@shopify/web-pixels-extension';

  register(({analytics}) => {
    analytics.subscribe('input_changed', (event) => {
      // Example for accessing event data
      const element = event.data.element;

      const elementId = element.id;
      const elementValue = element.value;

      const payload = {
        event_name: event.name,
        event_data: {
          id: elementId,
          value: elementValue,
        },
      };

      // Example for sending event to third party servers
      fetch('https://example.com/pixel', {
        method: 'POST',
        body: JSON.stringify(payload),
        keepalive: true,
      });
    });
  });
  ```

  ##### Custom Pixel

  ```javascript
  analytics.subscribe('input_changed', (event) => {
    // Example for accessing event data
    const element = event.data.element;

    const elementId = element.id;
    const elementValue = element.value;

    const payload = {
      event_name: event.name,
      event_data: {
        id: elementId,
        value: elementValue,
      },
    };

    // Example for sending event to third party servers
    fetch('https://example.com/pixel', {
      method: 'POST',
      body: JSON.stringify(payload),
      keepalive: true,
    });
  });
  ```

</page>

<page>
---
title: input_focused
description: >-
  The `input_focused` event logs an instance where an input on a page gains
  focus.
api_name: web-pixels
source_url:
  html: 'https://shopify.dev/docs/api/web-pixels-api/dom-events/input_focused'
  md: 'https://shopify.dev/docs/api/web-pixels-api/dom-events/input_focused.md'
---

# input\_​focused

The `input_focused` event logs an instance where an input on a page gains focus.

## Properties

* clientId

  string

  The client-side ID of the customer, provided by Shopify

* data

  PixelEventsInputFocusedData

* id

  string

  The ID of the customer event

* name

  string

  The name of the customer event

* seq

  number

  The sequence index number of the event.

* timestamp

  string

  The timestamp of when the customer event occurred, in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format

* type

  EventType.Dom

### PixelEventsInputFocusedData

* element

  ```ts
  InputElement
  ```

```ts
export interface PixelEventsInputFocusedData {
  element?: InputElement;
}
```

### InputElement

An object that contains data about an input element type

* id

  The id attribute of an element

  ```ts
  string | null
  ```

* name

  The name attribute of an element

  ```ts
  string | null
  ```

* tagName

  A string representation of the tag of an element

  ```ts
  string | null
  ```

* type

  The type attribute of an element. Often relevant for an input or button element.

  ```ts
  string | null
  ```

* value

  The value attribute of an element. Often relevant for an input element.

  ```ts
  string | null
  ```

```ts
export interface InputElement {
  /**
   * The id attribute of an element
   */
  id?: string | null;

  /**
   * The name attribute of an element
   */
  name?: string | null;

  /**
   * A string representation of the tag of an element
   */
  tagName?: string | null;

  /**
   * The type attribute of an element. Often relevant for an input or button
   * element.
   */
  type?: string | null;

  /**
   * The value attribute of an element. Often relevant for an input element.
   */
  value?: string | null;
}
```

### EventType

* AdvancedDom

  ```ts
  advanced-dom
  ```

* Custom

  ```ts
  custom
  ```

* Dom

  ```ts
  dom
  ```

* Meta

  ```ts
  meta
  ```

* Standard

  ```ts
  standard
  ```

```ts
export enum EventType {
  AdvancedDom = 'advanced-dom',
  Custom = 'custom',
  Dom = 'dom',
  Meta = 'meta',
  Standard = 'standard',
}
```

Examples

### Examples

* #### Accessing DOM Events

  ##### App Pixel

  ```javascript
  import {register} from '@shopify/web-pixels-extension';

  register(({analytics}) => {
    analytics.subscribe('input_focused', (event) => {
      // Example for accessing event data
      const element = event.data.element;

      const elementId = element.id;
      const elementValue = element.value;

      const payload = {
        event_name: event.name,
        event_data: {
          id: elementId,
          value: elementValue,
        },
      };

      // Example for sending event to third party servers
      fetch('https://example.com/pixel', {
        method: 'POST',
        body: JSON.stringify(payload),
        keepalive: true,
      });
    });
  });
  ```

  ##### Custom Pixel

  ```javascript
  analytics.subscribe('input_focused', (event) => {
    // Example for accessing event data
    const element = event.data.element;

    const elementId = element.id;
    const elementValue = element.value;

    const payload = {
      event_name: event.name,
      event_data: {
        id: elementId,
        value: elementValue,
      },
    };

    // Example for sending event to third party servers
    fetch('https://example.com/pixel', {
      method: 'POST',
      body: JSON.stringify(payload),
      keepalive: true,
    });
  });
  ```

</page>

<page>
---
title: Emitting Data
description: >
  App users and app developers can publish custom customer events from online
  store theme liquid files, [theme app
  extensions](/docs/apps/online-store/theme-app-extensions), [checkout UI
  extensions](/docs/api/checkout-ui-extensions/latest/extension-points-overview)
  and [customer account UI
  extensions](/docs/api/customer-account-ui-extensions/latest/targets). When
  custom customer events are published they can be accessed by all custom pixels
  and app pixels.
api_name: web-pixels
source_url:
  html: 'https://shopify.dev/docs/api/web-pixels-api/emitting-data'
  md: 'https://shopify.dev/docs/api/web-pixels-api/emitting-data.md'
---

# Emitting Data

App users and app developers can publish custom customer events from online store theme liquid files, [theme app extensions](https://shopify.dev/docs/apps/online-store/theme-app-extensions), [checkout UI extensions](https://shopify.dev/docs/api/checkout-ui-extensions/latest/extension-points-overview) and [customer account UI extensions](https://shopify.dev/docs/api/customer-account-ui-extensions/latest/targets). When custom customer events are published they can be accessed by all custom pixels and app pixels.

***

## Publishing custom events

The `analytics.publish` method is available in different contexts for publishing custom events. The `analytics.publish` method takes an `event_name` and some `event_data` as parameters. The object passed into the `event_data` field is shared with subscribers to the event using the `customData` field. If you haven't set up a way for users to define custom transformation of payloads, then your app pixels might not be able to parse these custom fields. Custom pixels, though, can be changed by the users to translate custom fields to a service’s required format.

UI Extensions

In Checkout and Customer Accounts, you can publish custom events from your UI extensions. For more information, refer to the [analytics checkout extension point on the StandardApi](https://shopify.dev/docs/api/checkout-ui-extensions/latest/apis).

Important

To ensure the quality of standard events, partners and merchants cannot publish standard events. `Shopify.analytics.publish` only exposes the method to publish custom events.

To avoid collision with standard events, custom events should be prefixed with the app name or a unique identifier. For example, `my_app:event_name`.

## Publishing Custom Events

##### Online Store

```js
/**
 * In the online store you can access the `analytics.publish` method on the Shopify object.
 * Inside theme app extensions or within the `<script>` tag of theme.liquid files, you can
 * insert the following code to publish your custom pixels.
 */

/**
 * event_data
 * type: Object
 * description: An object that contains metadata about the event.
 */
const event_data = {sample_event_data: 1};

/**
 * @param: event_name
 * @param: event_data
 *
 */
Shopify.analytics.publish('my_store:event_name', event_data);
```

##### UI Extension

```javascript
// In UI extensions, you can publish custom events from the
// standard UI extension API.

/**
 * event_data
 * type: Object
 * description: An object that contains metadata about the event.
 */
const event_data = {sample_event_data: 1};

/**
 * @param: event_name
 * @param: event_data
 */
analytics.publish('my_app:event_name', event_data);
```

***

## Subscribing to custom events

You can subscribe to custom events like you would standard events. Anything published to the custom event is passed to the `customData` field.

Caution

Custom events can be published by users, other developers and even visitors from their browser console. Be mindful when processing any custom events.

## Subscribing to Custom Events

##### Subscribe

```javascript
// Subscribe from web pixel app extension
import {register} from '@shopify/web-pixels-extension';

register(({analytics}) => {
  analytics.subscribe('my_app:my_custom_event', (event) => {
    /*
      event = {
        id: "123",
        clientId: "2cabc5d8-e728-4359-9173-4b31265cbac0",
        name: "my_custom_event",
        timestamp: "2011-10-05T14:48:00.000Z",
        context: { ... },
        customData: {
          foo: { bar: '123' },
          abc: { def: 'geh' }
        }
      }
    */
  });
});
```

##### Publish

```javascript
// Publishing from a UI Extension
analytics.publish('my_app:my_custom_event', {
  foo: {
    bar: '123',
  },
  abc: {
    def: 'geh',
  },
});
```

![Subscribing to custom events](https://shopify.dev/assets/assets/images/api/web-pixels-api/checkout-ui-B60ruC42.png)

***

## Visitor API

The `analytics.visitor` method helps merchants to identify visitors to their store. The method is primarily intended for use cases involving visitor-provided information to aid Shopify, and app features that use the data to enhance the customer experience.

For example, if a visitor submits their email address to receive a 30% off coupon, then the email can be relayed to a Partner app using Server Pixels to power loyalty features. The storefront experience can be personalized based on existing information that the merchant already has about the customer. It's important to ensure that, when utilizing this API, all necessary notices and consent in the visitor's region are provided.

Important

After integrating successfully, you’ll need to inform Partner Support for the data to be processed. Failure to do so will mean that the data is not utilized by the merchant’s shop.

App Id

App developers should provide an `appId` to identify themselves when they call the visitor API on the online store. Calling the visitor API without providing an `appId` can degrade data quality, which makes it difficult for merchants to manage their data. To find your `appId`, you can use the [GraphQL Admin API](https://shopify.dev/docs/api/admin-graphql/latest/queries/app). In UI Extensions, you don't need to provide an `appId` because these are managed automatically.

## Visitor API

##### Online Store

```js
/**
 * In the online store, you can access the `analytics.visitor` method on the Shopify object.
 * Inside theme app extensions or within the `<script>` tag of liquid files, you can
 * insert the following code to publish your custom pixels.
 */

/**
 * @param {Object} visitorInfo - The parameters for the visitor information.
 * @param {string} [visitorInfo.phone] - The phone number.
 * @param {string} [visitorInfo.email] - The email address.
 * @param {Object} [options] - Additional settings and context for calls to visitor.
 * @param {string} [options.appId] - The App Id of the calling app.
 * @returns {boolean} - Returns `true` if the visitor method was successful, and returns `false` if the payload was rejected. This method will raise an error if there is an issue with the payload.
 */

// Usage:
Shopify.analytics.visitor(
  {
    email: 'someEmail@example.com',
    phone: '+1 555 555 5555',
  },
  {
    appId: '1234',
  },
);
```

##### UI Extension

```javascript
// In UI Extension, you can emit visitor information from
// your extensions using the analytics API within
// the StandardAPI.

/**
 * @param {Object} visitorInfo - The parameters for the visitor information.
 * @param {string} [visitorInfo.phone] - The phone number.
 * @param {string} [visitorInfo.email] - The email address.
 * @returns {Promise<VisitorResult>} - Returns a VisitorResult object.
 * @see https://shopify.dev/docs/api/checkout-ui-extensions/unstable/apis/standardapi#properties-propertydetail-analytics
 */
analytics
  .visitor({
    email: 'someEmail@example.com',
    phone: '+1 555 555 5555',
  })
  .then((result) => {
    if (result.type === 'success') {
      console.log(`Success`);
    } else {
      console.log(`Error`, result.error);
    }
  });
```

***

</page>

<page>
---
title: Pixel Privacy
description: >
  In order to comply with international privacy regulations, Shopify provides a
  way for merchants to manage their pixels and the data they collect. This guide
  will help you understand how to set up customer privacy settings for App and
  Custom pixels, and how to use the customerPrivacy API to manually handle pixel
  privacy behavior.
api_name: web-pixels
source_url:
  html: 'https://shopify.dev/docs/api/web-pixels-api/pixel-privacy'
  md: 'https://shopify.dev/docs/api/web-pixels-api/pixel-privacy.md'
---

# Pixel Privacy

In order to comply with international privacy regulations, Shopify provides a way for merchants to manage their pixels and the data they collect. This guide will help you understand how to set up customer privacy settings for App and Custom pixels, and how to use the customerPrivacy API to manually handle pixel privacy behavior.

***

## App Pixels Privacy Settings

When creating app pixels, you can define the customer privacy settings that your pixel requires within your `shopify.extension.toml` file. Shopify's pixel manager will only load your pixel if there is visitor permission for all of the settings that your pixels declares as required. For more information, visit the [App Pixel Tutorial](https://shopify.dev/docs/apps/marketing/pixels/getting-started) documentation.

[API Reference - App Pixel Tutorial](https://shopify.dev/docs/apps/marketing/pixels/getting-started)

## App Pixels Privacy Settings

## Shopify.extension.toml

```toml
type = "web_pixel_extension"
name = "web pixel"


runtime_context = "strict"


# This pixel will only load when there is permission for analytics, marketing and sale of data
[customer_privacy]
analytics = true
marketing = true
preferences = false
sale_of_data = "enabled"


[settings]
type = "object"


[settings.fields.pixelID]
name = "Pixel ID"
description = "Pixel ID"
type = "single_line_text_field"
validations =  [
  { name = "min", value = "1" }
]
```

***

## Custom Pixels Privacy Settings

When creating custom pixels, you can define the customer privacy settings that your pixel requires directly within the user interface. For more information please visit the [Custom Pixel](https://help.shopify.com/en/manual/promoting-marketing/pixels/custom-pixels/manage) documentation.

![Custom Pixels Privacy Settings](https://shopify.dev/assets/assets/images/api/web-pixels-api/CustomPixelPrivacyAdmin-lj_nKbAc.png)

***

## Customer Privacy API

Shopify provides Standard APIs to allow pixels to query the initial customer privacy permissions on a page and listen to any subsequent updates to consent. To query the initial customer privacy permissions, use the `init.customerPrivacy` API. You may assign this value to a variable to keep track of it throughout the lifecycle of your pixel. If consent changes without a page refresh (i.e. customer provides consent through a banner), you can adjust this value using the `customerPrivacy` Standard API. This API allows you to subscribe to the `visitorConsentCollected` event and apply any changes when consent is given. Using these APIs, you can manually handle any privacy related behavior inside a pixel sandbox.

Available Customer Privacy Events

Presently, the only event available for the `customerPrivacy.subscribe()` API is `visitorConsentCollected`. This is the only string that will be accepted for now.

## Customer Privacy API

##### App Pixels

```js
import {register} from '@shopify/web-pixels-extension';

register(({analytics, init, customerPrivacy}) => {
  // Use the init.customerPrivacy object to get the initial customer privacy status
  let customerPrivacyStatus = init.customerPrivacy;

  // Use the customerPrivacy Standard API to subscribe to consent collected events and update the status
  customerPrivacy.subscribe('visitorConsentCollected', (event) => {
    customerPrivacyStatus = event.customerPrivacy;
    /**
     * {
     *   "analyticsProcessingAllowed": boolean,
     *   "marketingAllowed": boolean,
     *   "preferencesProcessingAllowed": boolean,
     *   "saleOfDataAllowed": boolean,
     * }
     */
  })

  // Every product added to cart event will have the most up to date customer privacy status
  analytics.subscribe("product_added_to_cart", event => { 
    const payload = {
      eventName: event.name,
      customerPrivacyStatus: customerPrivacyStatus,
    };

    fetch('https://example.com/pixel', {
      method: 'POST',
      body: JSON.stringify(payload),
      keepalive: true,
    });
  });
});
```

##### Custom Pixels

```js
let customerPrivacyStatus = init.customerPrivacy;

// Use the customerPrivacy Standard API to subscribe to consent collected events and update the status
api.customerPrivacy.subscribe('visitorConsentCollected', (event) => {
  customerPrivacyStatus = event.customerPrivacy;
  /**
   * {
   *   "analyticsProcessingAllowed": boolean,
   *   "marketingAllowed": boolean,
   *   "preferencesProcessingAllowed": boolean,
   *   "saleOfDataAllowed": boolean,
   * }
   */
})

// Every product added to cart event will have the most up to date customer privacy status
analytics.subscribe("product_added_to_cart", event => { 
  const payload = {
    eventName: event.name,
    customerPrivacyStatus: customerPrivacyStatus,
  };

  fetch('https://example.com/pixel', {
    method: 'POST',
    body: JSON.stringify(payload),
    keepalive: true,
  });
});
```

***

</page>

<page>
---
title: analytics
description: >-
  Provides access to Shopify's [customer event
  API](/docs/api/web-pixels-api/standard-events)
api_name: web-pixels
source_url:
  html: 'https://shopify.dev/docs/api/web-pixels-api/standard-api/analytics'
  md: 'https://shopify.dev/docs/api/web-pixels-api/standard-api/analytics.md'
---

# analytics

Provides access to Shopify's [customer event API](https://shopify.dev/docs/api/web-pixels-api/standard-events)

## Properties

* subscribe

  (eventName: string, event\_callback: Function) => Promise\<undefined>

Examples

### Examples

* #### Accessing Standard Api

  ##### App Pixel

  ```javascript
  import {register} from '@shopify/web-pixels-extension';

  register(({analytics, browser, settings, init}) => {
    analytics.subscribe('page_viewed', (event) => {
      // subscribe to page_viewed events
    });

    analytics.subscribe('all_events', (event) => {
      // subscribe to all events
    });

    analytics.subscribe('all_standard_events', (event) => {
      // subscribe to all standard events
    });

    analytics.subscribe('all_custom_events', (event) => {
      // subscribe to all custom events
    });
  });
  ```

  ##### Custom Pixel

  ```javascript
  analytics.subscribe('page_viewed', (event) => {
    // subscribe to page_viewed events
  });

  analytics.subscribe('all_events', (event) => {
    // subscribe to all events
  });

  analytics.subscribe('all_standard_events', (event) => {
    // subscribe to all standard events
  });

  analytics.subscribe('all_custom_events', (event) => {
    // subscribe to all custom events
  });
  ```

</page>

<page>
---
title: browser
description: >-
  Provides access to specific browser methods that asynchronously execute in the
  top frame (`cookie`, `localStorage`, `sessionStorage`)
api_name: web-pixels
source_url:
  html: 'https://shopify.dev/docs/api/web-pixels-api/standard-api/browser'
  md: 'https://shopify.dev/docs/api/web-pixels-api/standard-api/browser.md'
---

# browser

Provides access to specific browser methods that asynchronously execute in the top frame (`cookie`, `localStorage`, `sessionStorage`)

## Properties

* cookie

  BrowserCookie

  This object replaces the native document.cookie API and provides a setter/getter to set cookies on the top frame.

* localStorage

  BrowserLocalStorage

* sessionStorage

  BrowserSessionStorage

* sendBeacon

  (url: string, body?: string) => Promise\<boolean>

  deprecated

  Deprecated

  The navigator.sendBeacon() method asynchronously sends an HTTP POST request containing a small amount of data to a web server. Please use the standard web `fetch` api with the option `keepalive: true` to achieve this functionality.

### BrowserCookie

This object replaces the native document.cookie API and provides a setter/getter to set cookies on the top frame.

* get

  An asynchronous method to get a specific cookie by name. Takes a cookie name of type \`string\` and returns the cookie value as a \`string\`

  ```ts
  (name?: string) => Promise<string>
  ```

* set

  An asynchronous method to set a cookie by name. It takes two arguments, a string of form \`key=value\` as \[described here]\(https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie#write\_a\_new\_cookie) or the name of the cookie as the first argument and the value as the second argument.

  ```ts
  (cookieOrName: string, value?: string) => Promise<string>
  ```

```ts
export interface BrowserCookie {
  /**
   * An asynchronous method to get a specific cookie by name. Takes a cookie
   * name of type `string` and returns the cookie value as a `string`
   */
  get?: (name?: string) => Promise<string>;

  /**
   * An asynchronous method to set a cookie by name. It takes two arguments, a string of form `key=value` as [described here](https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie#write_a_new_cookie) or the name of the cookie as the first argument and the value as the second argument.
   */
  set?: (cookieOrName: string, value?: string) => Promise<string>;
}
```

### BrowserLocalStorage

* clear

  When invoked, will empty all keys out of the storage.

  ```ts
  () => Promise<void>
  ```

* getItem

  When passed a key name, will return that key's value.

  ```ts
  (key: string) => Promise<string>
  ```

* key

  When passed a number n, this method will return the name of the nth key in the storage.

  ```ts
  (index: number) => Promise<string>
  ```

* length

  Returns an integer representing the number of data items stored in the Storage object.

  ```ts
  () => Promise<number>
  ```

* removeItem

  When passed a key name, will remove that key from the storage.

  ```ts
  (key: string) => Promise<void>
  ```

* setItem

  When passed a key name and value, will add that key to the storage, or update that key's value if it already exists.

  ```ts
  (key: string, value: any) => Promise<void>
  ```

```ts
export interface BrowserLocalStorage {
  /**
   * When invoked, will empty all keys out of the storage.
   */
  clear?: () => Promise<ReturnType<WindowLocalStorage['localStorage']['clear']>>;

  /**
   * When passed a key name, will return that key's value.
   */
  getItem?: (
    key: string,
  ) => Promise<ReturnType<WindowLocalStorage['localStorage']['getItem']>>;

  /**
   * When passed a number n, this method will return the name of the nth key in
   * the storage.
   */
  key?: (
    index: number,
  ) => Promise<ReturnType<WindowLocalStorage['localStorage']['key']>>;

  /**
   * Returns an integer representing the number of data items stored in the
   * Storage object.
   */
  length?: () => Promise<WindowLocalStorage['localStorage']['length']>;

  /**
   * When passed a key name, will remove that key from the storage.
   */
  removeItem?: (
    key: string,
  ) => Promise<ReturnType<WindowLocalStorage['localStorage']['removeItem']>>;

  /**
   * When passed a key name and value, will add that key to the storage, or
   * update that key's value if it already exists.
   */
  setItem?: (
    key: string,
    value: any,
  ) => Promise<ReturnType<WindowLocalStorage['localStorage']['setItem']>>;
}
```

### BrowserSessionStorage

* clear

  When invoked, will empty all keys out of the storage.

  ```ts
  () => Promise<void>
  ```

* getItem

  When passed a key name, will return that key's value.

  ```ts
  (key: string) => Promise<string>
  ```

* key

  When passed a number n, this method will return the name of the nth key in the storage.

  ```ts
  (index: number) => Promise<string>
  ```

* length

  Returns an integer representing the number of data items stored in the Storage object.

  ```ts
  () => Promise<number>
  ```

* removeItem

  When passed a key name, will remove that key from the storage.

  ```ts
  (key: string) => Promise<void>
  ```

* setItem

  When passed a key name and value, will add that key to the storage, or update that key's value if it already exists.

  ```ts
  (key: string, value: any) => Promise<void>
  ```

```ts
export interface BrowserSessionStorage {
  /**
   * When invoked, will empty all keys out of the storage.
   */
  clear?: () => Promise<
    ReturnType<WindowSessionStorage['sessionStorage']['clear']>
  >;

  /**
   * When passed a key name, will return that key's value.
   */
  getItem?: (
    key: string,
  ) => Promise<ReturnType<WindowSessionStorage['sessionStorage']['getItem']>>;

  /**
   * When passed a number n, this method will return the name of the nth key in
   * the storage.
   */
  key?: (
    index: number,
  ) => Promise<ReturnType<WindowSessionStorage['sessionStorage']['key']>>;

  /**
   * Returns an integer representing the number of data items stored in the
   * Storage object.
   */
  length?: () => Promise<WindowSessionStorage['sessionStorage']['length']>;

  /**
   * When passed a key name, will remove that key from the storage.
   */
  removeItem?: (
    key: string,
  ) => Promise<
    ReturnType<WindowSessionStorage['sessionStorage']['removeItem']>
  >;

  /**
   * When passed a key name and value, will add that key to the storage, or
   * update that key's value if it already exists.
   */
  setItem?: (
    key: string,
    value: any,
  ) => Promise<ReturnType<WindowSessionStorage['sessionStorage']['setItem']>>;
}
```

Examples

### Examples

* #### Accessing Standard Api

  ##### Cookie

  ```javascript
  /**
   * browser.cookie.get(name)
   *
   * @param {name} - String representing the name of the cookie
   * @return {Promise} - Promise of type string
   */

  const user_id = await browser.cookie.get('my_user_id');

  /**
   * browser.cookie.set(name)
   *
   * @param {name} - String representing the name of the cookie
   * @param {value} - String representing the value of the cookie
   * @return {Promise} - Promise of type string
   */

  browser.cookie.set('my_user_id', 'ABCX123');
  browser.cookie.set('my_user_id=ABCX123; expires=Thu, 18 Dec 2013 12:00:00');
  ```

  ##### LocalStorage

  ```javascript
  /**
   * browser.localStorage.getItem(url, data)
   *
   * @param {keyName} - String containing the name of the key you want to retrieve the value of.
   * @return {Promise} - Promise of type string.
   */
  browser.localStorage.getItem('foo');

  /**
   * browser.localStorage.setItem(url, data)
   *
   * @param {keyName} - A string containing the name of the key you want to retrieve the value of.
   * @param {keyValue} - A string containing the value you want to give the key you are creating or updating.
   * @return {Promise} - Promise of type string.
   */
  browser.localStorage.setItem('foo', 'bar');

  /**
   * browser.localStorage.removeItem(keyName)
   *
   * @param {keyName} - A string containing the name of the key you want to remove.
   * @return {Promise} - Promise of undefined.
   */
  browser.localStorage.removeItem('foo');

  /**
   * browser.localStorage.key(index)
   *
   * @param {index} - An integer representing the number of the key you want to get the name of. This is a zero-based index.
   * @return {Promise} - Promise of type string.
   */
  browser.localStorage.key(2);

  /**
   * browser.localStorage.length()
   *
   * @return {Promise} - Promise of type integer.
   */
  browser.localStorage.length();

  /**
   * browser.localStorage.clear()
   *
   * @return {Promise} - Promise of undefined.
   */
  browser.localStorage.clear();
  ```

  ##### SessionStorage

  ```javascript
  /**
   * browser.sessionStorage.getItem(url, data)
   *
   * @param {keyName} - A string containing the name of the key you want to retrieve the value of.
   * @return {Promise} - Promise of type string.
   */
  browser.sessionStorage.getItem('foo');

  /**
   * browser.sessionStorage.setItem(url, data)
   *
   * @param {keyName} - A string containing the name of the key you want to retrieve the value of.
   * @param {keyValue} - A string containing the value you want to give the key you are creating or updating.
   * @return {Promise} - Promise of type string.
   */
  browser.sessionStorage.setItem('foo', 'bar');

  /**
   * browser.sessionStorage.removeItem(keyName)
   *
   * @param {keyName} - A string containing the name of the key you want to remove.
   * @return {Promise} - Promise of undefined.
   */
  browser.sessionStorage.removeItem('foo');

  /**
   * browser.sessionStorage.key(index)
   *
   * @param {index} - An integer representing the number of the key you want to get the name of. This is a zero-based index.
   * @return {Promise} - Promise of type string.
   */
  browser.sessionStorage.key(2);

  /**
   * browser.sessionStorage.length()
   *
   * @return {Promise} - Promise of type integer.
   */
  browser.sessionStorage.length();

  /**
   * browser.sessionStorage.clear()
   *
   * @return {Promise} - Promise of undefined.
   */
  browser.sessionStorage.clear();
  ```

</page>

<page>
---
title: customerPrivacy
description: >-
  Provides access to the [customerPrivacy
  API](/api/web-pixels-api/pixel-privacy#customer-privacy-api) to track whether
  or not customers have given consent.
api_name: web-pixels
source_url:
  html: 'https://shopify.dev/docs/api/web-pixels-api/standard-api/customerprivacy'
  md: 'https://shopify.dev/docs/api/web-pixels-api/standard-api/customerprivacy.md'
---

# customer​Privacy

Provides access to the [customerPrivacy API](https://shopify.dev/api/web-pixels-api/pixel-privacy#customer-privacy-api) to track whether or not customers have given consent.

## Properties

* subscribe

  (eventName: string, event\_callback: Function) => Promise\<undefined>

Examples

### Examples

* #### Accessing Standard Api

  ##### App Pixels

  ```js
  import {register} from '@shopify/web-pixels-extension';

  register(({analytics, init, customerPrivacy}) => {
    // Use the init.customerPrivacy object to get the initial customer privacy status
    let customerPrivacyStatus = init.customerPrivacy;

    // Use the customerPrivacy Standard API to subscribe to consent collected events and update the status
    customerPrivacy.subscribe('visitorConsentCollected', (event) => {
      customerPrivacyStatus = event.customerPrivacy;
      /**
       * {
       *   "analyticsProcessingAllowed": boolean,
       *   "marketingAllowed": boolean,
       *   "preferencesProcessingAllowed": boolean,
       *   "saleOfDataAllowed": boolean,
       * }
       */
    })

    // Every product added to cart event will have the most up to date customer privacy status
    analytics.subscribe("product_added_to_cart", event => { 
      const payload = {
        eventName: event.name,
        customerPrivacyStatus: customerPrivacyStatus,
      };

      fetch('https://example.com/pixel', {
        method: 'POST',
        body: JSON.stringify(payload),
        keepalive: true,
      });
    });
  });
  ```

  ##### Custom Pixels

  ```js
  let customerPrivacyStatus = init.customerPrivacy;

  // Use the customerPrivacy Standard API to subscribe to consent collected events and update the status
  api.customerPrivacy.subscribe('visitorConsentCollected', (event) => {
    customerPrivacyStatus = event.customerPrivacy;
    /**
     * {
     *   "analyticsProcessingAllowed": boolean,
     *   "marketingAllowed": boolean,
     *   "preferencesProcessingAllowed": boolean,
     *   "saleOfDataAllowed": boolean,
     * }
     */
  })

  // Every product added to cart event will have the most up to date customer privacy status
  analytics.subscribe("product_added_to_cart", event => { 
    const payload = {
      eventName: event.name,
      customerPrivacyStatus: customerPrivacyStatus,
    };

    fetch('https://example.com/pixel', {
      method: 'POST',
      body: JSON.stringify(payload),
      keepalive: true,
    });
  });
  ```

</page>

<page>
---
title: init
description: >-
  A JSON object containing a snapshot of the page at time of page render. It
  will always have the present `Context` of the page, as well as the `Data`
  field, which provides access to the `Cart` and `Customer` objects.
api_name: web-pixels
source_url:
  html: 'https://shopify.dev/docs/api/web-pixels-api/standard-api/init'
  md: 'https://shopify.dev/docs/api/web-pixels-api/standard-api/init.md'
---

# init

A JSON object containing a snapshot of the page at time of page render. It will always have the present `Context` of the page, as well as the `Data` field, which provides access to the `Cart` and `Customer` objects.

## Properties

* context

  Context

* customerPrivacy

  CustomerPrivacyData

* data

  RegisterInitData

### Context

A snapshot of various read-only properties of the browser at the time of event

* document

  Snapshot of a subset of properties of the \`document\` object in the top frame of the browser

  ```ts
  WebPixelsDocument
  ```

* navigator

  Snapshot of a subset of properties of the \`navigator\` object in the top frame of the browser

  ```ts
  WebPixelsNavigator
  ```

* window

  Snapshot of a subset of properties of the \`window\` object in the top frame of the browser

  ```ts
  WebPixelsWindow
  ```

```ts
export interface Context {
  /**
   * Snapshot of a subset of properties of the `document` object in the top
   * frame of the browser
   */
  document?: WebPixelsDocument;

  /**
   * Snapshot of a subset of properties of the `navigator` object in the top
   * frame of the browser
   */
  navigator?: WebPixelsNavigator;

  /**
   * Snapshot of a subset of properties of the `window` object in the top frame
   * of the browser
   */
  window?: WebPixelsWindow;
}
```

### WebPixelsDocument

A snapshot of a subset of properties of the \`document\` object in the top frame of the browser

* characterSet

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the character set being used by the document

  ```ts
  string
  ```

* location

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the URI of the current document

  ```ts
  Location
  ```

* referrer

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the URI of the page that linked to this page

  ```ts
  string
  ```

* title

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the title of the current document

  ```ts
  string
  ```

```ts
export interface WebPixelsDocument {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the character set being used by the document
   */
  characterSet?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the URI of the current document
   */
  location?: Location;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the URI of the page that linked to this page
   */
  referrer?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the title of the current document
   */
  title?: string;
}
```

### Location

A snapshot of a subset of properties of the \`location\` object in the top frame of the browser

* hash

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing a \`'#'\` followed by the fragment identifier of the URL

  ```ts
  string
  ```

* host

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the host, that is the hostname, a \`':'\`, and the port of the URL

  ```ts
  string
  ```

* hostname

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the domain of the URL

  ```ts
  string
  ```

* href

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the entire URL

  ```ts
  string
  ```

* origin

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the canonical form of the origin of the specific location

  ```ts
  string
  ```

* pathname

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing an initial \`'/'\` followed by the path of the URL, not including the query string or fragment

  ```ts
  string
  ```

* port

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the port number of the URL

  ```ts
  string
  ```

* protocol

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the protocol scheme of the URL, including the final \`':'\`

  ```ts
  string
  ```

* search

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing a \`'?'\` followed by the parameters or "querystring" of the URL

  ```ts
  string
  ```

```ts
export interface Location {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing a `'#'` followed by the fragment identifier of the URL
   */
  hash?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the host, that is the hostname, a `':'`, and the port of
   * the URL
   */
  host?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the domain of the URL
   */
  hostname?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the entire URL
   */
  href?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the canonical form of the origin of the specific location
   */
  origin?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing an initial `'/'` followed by the path of the URL, not
   * including the query string or fragment
   */
  pathname?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the port number of the URL
   */
  port?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the protocol scheme of the URL, including the final `':'`
   */
  protocol?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing a `'?'` followed by the parameters or "querystring" of
   * the URL
   */
  search?: string;
}
```

### WebPixelsNavigator

A snapshot of a subset of properties of the \`navigator\` object in the top frame of the browser

* cookieEnabled

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns \`false\` if setting a cookie will be ignored and true otherwise

  ```ts
  boolean
  ```

* language

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns a string representing the preferred language of the user, usually the language of the browser UI. The \`null\` value is returned when this is unknown

  ```ts
  string
  ```

* languages

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns an array of strings representing the languages known to the user, by order of preference

  ```ts
  ReadonlyArray<string>
  ```

* userAgent

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns the user agent string for the current browser

  ```ts
  string
  ```

```ts
export interface WebPixelsNavigator {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns `false` if setting a cookie will be ignored and true otherwise
   */
  cookieEnabled?: boolean;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns a string representing the preferred language of the user, usually
   * the language of the browser UI. The `null` value is returned when this
   * is unknown
   */
  language?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns an array of strings representing the languages known to the user,
   * by order of preference
   */
  languages?: ReadonlyArray<string>;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns the user agent string for the current browser
   */
  userAgent?: string;
}
```

### WebPixelsWindow

A snapshot of a subset of properties of the \`window\` object in the top frame of the browser

* innerHeight

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the height of the content area of the browser window including, if rendered, the horizontal scrollbar

  ```ts
  number
  ```

* innerWidth

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the width of the content area of the browser window including, if rendered, the vertical scrollbar

  ```ts
  number
  ```

* location

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the location, or current URL, of the window object

  ```ts
  Location
  ```

* origin

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the global object's origin, serialized as a string

  ```ts
  string
  ```

* outerHeight

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the height of the outside of the browser window

  ```ts
  number
  ```

* outerWidth

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the width of the outside of the browser window

  ```ts
  number
  ```

* pageXOffset

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), an alias for window\.scrollX

  ```ts
  number
  ```

* pageYOffset

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), an alias for window\.scrollY

  ```ts
  number
  ```

* screen

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Screen), the interface representing a screen, usually the one on which the current window is being rendered

  ```ts
  Screen
  ```

* screenX

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the horizontal distance from the left border of the user's browser viewport to the left side of the screen

  ```ts
  number
  ```

* screenY

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the vertical distance from the top border of the user's browser viewport to the top side of the screen

  ```ts
  number
  ```

* scrollX

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the number of pixels that the document has already been scrolled horizontally

  ```ts
  number
  ```

* scrollY

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the number of pixels that the document has already been scrolled vertically

  ```ts
  number
  ```

```ts
export interface WebPixelsWindow {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window),
   * gets the height of the content area of the browser window including, if
   * rendered, the horizontal scrollbar
   */
  innerHeight?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), gets
   * the width of the content area of the browser window including, if rendered,
   * the vertical scrollbar
   */
  innerWidth?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * location, or current URL, of the window object
   */
  location?: Location;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * global object's origin, serialized as a string
   */
  origin?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), gets
   * the height of the outside of the browser window
   */
  outerHeight?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), gets
   * the width of the outside of the browser window
   */
  outerWidth?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), an
   * alias for window.scrollX
   */
  pageXOffset?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), an
   * alias for window.scrollY
   */
  pageYOffset?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen), the
   * interface representing a screen, usually the one on which the current
   * window is being rendered
   */
  screen?: Screen;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * horizontal distance from the left border of the user's browser viewport to
   * the left side of the screen
   */
  screenX?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * vertical distance from the top border of the user's browser viewport to the
   * top side of the screen
   */
  screenY?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * number of pixels that the document has already been scrolled horizontally
   */
  scrollX?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * number of pixels that the document has already been scrolled vertically
   */
  scrollY?: number;
}
```

### Screen

The interface representing a screen, usually the one on which the current window is being rendered

* height

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Screen/height), the height of the screen

  ```ts
  number
  ```

* width

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Screen/width), the width of the screen

  ```ts
  number
  ```

```ts
export interface Screen {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen/height),
   * the height of the screen
   */
  height?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen/width),
   * the width of the screen
   */
  width?: number;
}
```

### CustomerPrivacyData

* analyticsProcessingAllowed

  This flag indicates whether the customer has allowed the processing of their data for analytics purposes on the initial page load. If a customer submits consent, you can use the \[customer privacy API]\(/api/web-pixels-api/pixel-privacy#customer-privacy-api) to track whether or not the privacy permissions have changed.

  ```ts
  boolean
  ```

* marketingAllowed

  This flag indicates whether the customer has allowed the processing of their data for marketing purposes on the initial page load. If a customer submits consent, you can use the \[customer privacy API]\(/api/web-pixels-api/pixel-privacy#customer-privacy-api) to track whether or not the privacy permissions have changed.

  ```ts
  boolean
  ```

* preferencesProcessingAllowed

  This flag indicates whether the customer has allowed the processing of their data for preferences purposes on the initial page load. If a customer submits consent, you can use the \[customer privacy API]\(/api/web-pixels-api/pixel-privacy#customer-privacy-api) to track whether or not the privacy permissions have changed.

  ```ts
  boolean
  ```

* saleOfDataAllowed

  This flag indicates whether the customer has allowed the sale of their data on the initial page load. If a customer submits consent, you can use the \[customer privacy API]\(/api/web-pixels-api/pixel-privacy#customer-privacy-api) to track whether or not the privacy permissions have changed.

  ```ts
  boolean
  ```

```ts
interface CustomerPrivacyData {
  /**
   * This flag indicates whether the customer has allowed the processing of their data for analytics purposes on the initial page load. 
   * If a customer submits consent, you can use the [customer privacy API](/api/web-pixels-api/pixel-privacy#customer-privacy-api) to track whether or not the privacy permissions have changed.
   */
  analyticsProcessingAllowed?: boolean;

  /**
   * This flag indicates whether the customer has allowed the processing of their data for marketing purposes on the initial page load.
   * If a customer submits consent, you can use the [customer privacy API](/api/web-pixels-api/pixel-privacy#customer-privacy-api) to track whether or not the privacy permissions have changed.
   */
  marketingAllowed?: boolean;

  /**
   * This flag indicates whether the customer has allowed the processing of their data for preferences purposes on the initial page load.
   * If a customer submits consent, you can use the [customer privacy API](/api/web-pixels-api/pixel-privacy#customer-privacy-api) to track whether or not the privacy permissions have changed.
   */
  preferencesProcessingAllowed?: boolean;

  /**
   * This flag indicates whether the customer has allowed the sale of their data on the initial page load.
   * If a customer submits consent, you can use the [customer privacy API](/api/web-pixels-api/pixel-privacy#customer-privacy-api) to track whether or not the privacy permissions have changed.
   */
  saleOfDataAllowed?: boolean;
}
```

### RegisterInitData

* cart

  A cart represents the merchandise that a customer intends to purchase, and the estimated cost associated with the cart.

  ```ts
  Cart | null
  ```

* customer

  A customer represents a customer account with the shop. Customer accounts store contact information for the customer, saving logged-in customers the trouble of having to provide it at every checkout.

  ```ts
  Customer | null
  ```

* purchasingCompany

  Provides details of the company and the company location that the business customer is purchasing on behalf of. This includes information that can be used to identify the company and the company location that the business customer belongs to.

  ```ts
  PurchasingCompany | null
  ```

* shop

  The shop represents information about the store, such as the store name and currency.

  ```ts
  Shop
  ```

```ts
interface RegisterInitData {
  /**
   * A customer represents a customer account with the shop. Customer accounts
   * store contact information for the customer, saving logged-in customers the
   * trouble of having to provide it at every checkout.
   */
  customer?: Customer | null;

  /**
   * A cart represents the merchandise that a customer intends to purchase, and
   * the estimated cost associated with the cart.
   */
  cart?: Cart | null;

  /**
   * The shop represents information about the store, such as the store name and
   * currency.
   */
  shop?: Shop;

  /**
   * Provides details of the company and the company location that the business customer is
   * purchasing on behalf of. This includes information that can be used to identify the company
   * and the company location that the business customer belongs to.
   */
  purchasingCompany?: PurchasingCompany | null;
}
```

### Cart

A cart represents the merchandise that a customer intends to purchase, and the estimated cost associated with the cart.

* attributes

  The attributes associated with the cart. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  Attribute[]
  ```

* cost

  The estimated costs that the customer will pay at checkout.

  ```ts
  CartCost
  ```

* id

  A globally unique identifier.

  ```ts
  string | null
  ```

* lines

  A list of lines containing information about the items the customer intends to purchase.

  ```ts
  CartLine[]
  ```

* totalQuantity

  The total number of items in the cart.

  ```ts
  number
  ```

```ts
export interface Cart {
  /**
   * The attributes associated with the cart. This property
   * is only available if the shop has [upgraded to Checkout
   * Extensibility](https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  attributes?: Attribute[];

  /**
   * The estimated costs that the customer will pay at checkout.
   */
  cost?: CartCost;

  /**
   * A globally unique identifier.
   */
  id?: string | null;

  /**
   * A list of lines containing information about the items the customer intends
   * to purchase.
   */
  lines?: CartLine[];

  /**
   * The total number of items in the cart.
   */
  totalQuantity?: number;
}
```

### Attribute

Custom attributes associated with the cart or checkout.

* key

  The key for the attribute.

  ```ts
  string
  ```

* value

  The value for the attribute.

  ```ts
  string
  ```

```ts
export interface Attribute {
  /**
   * The key for the attribute.
   */
  key?: string;

  /**
   * The value for the attribute.
   */
  value?: string;
}
```

### CartCost

The costs that the customer will pay at checkout. It uses \[\`CartBuyerIdentity\`]\(https://shopify.dev/api/storefront/reference/cart/cartbuyeridentity) to determine \[international pricing]\(https://shopify.dev/custom-storefronts/internationalization/international-pricing#create-a-cart).

* totalAmount

  The total amount for the customer to pay.

  ```ts
  MoneyV2
  ```

```ts
export interface CartCost {
  /**
   * The total amount for the customer to pay.
   */
  totalAmount?: MoneyV2;
}
```

### MoneyV2

A monetary value with currency.

* amount

  The decimal money amount.

  ```ts
  number
  ```

* currencyCode

  The three-letter code that represents the currency, for example, USD. Supported codes include standard ISO 4217 codes, legacy codes, and non- standard codes.

  ```ts
  string
  ```

```ts
export interface MoneyV2 {
  /**
   * The decimal money amount.
   */
  amount?: number;

  /**
   * The three-letter code that represents the currency, for example, USD.
   * Supported codes include standard ISO 4217 codes, legacy codes, and non-
   * standard codes.
   */
  currencyCode?: string;
}
```

### CartLine

Information about the merchandise in the cart.

* cost

  The cost of the merchandise that the customer will pay for at checkout. The costs are subject to change and changes will be reflected at checkout.

  ```ts
  CartLineCost
  ```

* merchandise

  The merchandise that the buyer intends to purchase.

  ```ts
  ProductVariant
  ```

* quantity

  The quantity of the merchandise that the customer intends to purchase.

  ```ts
  number
  ```

```ts
export interface CartLine {
  /**
   * The cost of the merchandise that the customer will pay for at checkout. The
   * costs are subject to change and changes will be reflected at checkout.
   */
  cost?: CartLineCost;

  /**
   * The merchandise that the buyer intends to purchase.
   */
  merchandise?: ProductVariant;

  /**
   * The quantity of the merchandise that the customer intends to purchase.
   */
  quantity?: number;
}
```

### CartLineCost

The cost of the merchandise line that the customer will pay at checkout.

* totalAmount

  The total cost of the merchandise line.

  ```ts
  MoneyV2
  ```

```ts
export interface CartLineCost {
  /**
   * The total cost of the merchandise line.
   */
  totalAmount?: MoneyV2;
}
```

### ProductVariant

A product variant represents a different version of a product, such as differing sizes or differing colors.

* id

  A globally unique identifier.

  ```ts
  string | null
  ```

* image

  Image associated with the product variant. This field falls back to the product image if no image is available.

  ```ts
  Image | null
  ```

* price

  The product variant’s price.

  ```ts
  MoneyV2
  ```

* product

  The product object that the product variant belongs to.

  ```ts
  Product
  ```

* sku

  The SKU (stock keeping unit) associated with the variant.

  ```ts
  string | null
  ```

* title

  The product variant’s title.

  ```ts
  string | null
  ```

* untranslatedTitle

  The product variant’s untranslated title.

  ```ts
  string | null
  ```

```ts
export interface ProductVariant {
  /**
   * A globally unique identifier.
   */
  id?: string | null;

  /**
   * Image associated with the product variant. This field falls back to the
   * product image if no image is available.
   */
  image?: Image | null;

  /**
   * The product variant’s price.
   */
  price?: MoneyV2;

  /**
   * The product object that the product variant belongs to.
   */
  product?: Product;

  /**
   * The SKU (stock keeping unit) associated with the variant.
   */
  sku?: string | null;

  /**
   * The product variant’s title.
   */
  title?: string | null;

  /**
   * The product variant’s untranslated title.
   */
  untranslatedTitle?: string | null;
}
```

### Image

An image resource.

* src

  The location of the image as a URL.

  ```ts
  string | null
  ```

```ts
export interface Image {
  /**
   * The location of the image as a URL.
   */
  src?: string | null;
}
```

### Product

A product is an individual item for sale in a Shopify store.

* id

  The ID of the product.

  ```ts
  string | null
  ```

* title

  The product’s title.

  ```ts
  string
  ```

* type

  The \[product type]\(https://help.shopify.com/en/manual/products/details/product-type) specified by the merchant.

  ```ts
  string | null
  ```

* untranslatedTitle

  The product’s untranslated title.

  ```ts
  string | null
  ```

* url

  The relative URL of the product.

  ```ts
  string | null
  ```

* vendor

  The product’s vendor name.

  ```ts
  string
  ```

```ts
export interface Product {
  /**
   * The ID of the product.
   */
  id?: string | null;

  /**
   * The product’s title.
   */
  title?: string;

  /**
   * The [product
   * type](https://help.shopify.com/en/manual/products/details/product-type)
   * specified by the merchant.
   */
  type?: string | null;

  /**
   * The product’s untranslated title.
   */
  untranslatedTitle?: string | null;

  /**
   * The relative URL of the product.
   */
  url?: string | null;

  /**
   * The product’s vendor name.
   */
  vendor?: string;
}
```

### Customer

A customer represents a customer account with the shop. Customer accounts store contact information for the customer, saving logged-in customers the trouble of having to provide it at every checkout.

* email

  The customer’s email address.

  ```ts
  string | null
  ```

* firstName

  The customer’s first name.

  ```ts
  string | null
  ```

* id

  The ID of the customer.

  ```ts
  string
  ```

* lastName

  The customer’s last name.

  ```ts
  string | null
  ```

* ordersCount

  The total number of orders that the customer has placed.

  ```ts
  number | null
  ```

* phone

  The customer’s phone number.

  ```ts
  string | null
  ```

```ts
export interface Customer {
  /**
   * The customer’s email address.
   */
  email?: string | null;

  /**
   * The customer’s first name.
   */
  firstName?: string | null;

  /**
   * The ID of the customer.
   */
  id?: string;

  /**
   * The customer’s last name.
   */
  lastName?: string | null;

  /**
   * The total number of orders that the customer has placed.
   */
  ordersCount?: number | null;

  /**
   * The customer’s phone number.
   */
  phone?: string | null;
}
```

### PurchasingCompany

Provides details of the company and the company location that the business customer is purchasing on behalf of.

* company

  Includes information of the company that the business customer is purchasing on behalf of.

  ```ts
  PurchasingCompanyCompany
  ```

* location

  Includes information of the company location that the business customer is purchasing on behalf of.

  ```ts
  PurchasingCompanyLocation
  ```

```ts
export interface PurchasingCompany {
  /**
   * Includes information of the company that the business customer is
   * purchasing on behalf of.
   */
  company?: PurchasingCompanyCompany;

  /**
   * Includes information of the company location that the business customer is
   * purchasing on behalf of.
   */
  location?: PurchasingCompanyLocation;
}
```

### PurchasingCompanyCompany

Includes information of the company that the business customer is purchasing on behalf of.

* externalId

  The external ID of the company that can be set by the merchant.

  ```ts
  string | null
  ```

* id

  The company ID.

  ```ts
  string
  ```

* name

  The name of the company.

  ```ts
  string
  ```

```ts
export interface PurchasingCompanyCompany {
  /**
   * The external ID of the company that can be set by the merchant.
   */
  externalId?: string | null;

  /**
   * The company ID.
   */
  id?: string;

  /**
   * The name of the company.
   */
  name?: string;
}
```

### PurchasingCompanyLocation

Includes information of the company location that the business customer is purchasing on behalf of.

* externalId

  The external ID of the company location that can be set by the merchant.

  ```ts
  string | null
  ```

* id

  The company location ID.

  ```ts
  string
  ```

* name

  The name of the company location.

  ```ts
  string
  ```

```ts
export interface PurchasingCompanyLocation {
  /**
   * The external ID of the company location that can be set by the merchant.
   */
  externalId?: string | null;

  /**
   * The company location ID.
   */
  id?: string;

  /**
   * The name of the company location.
   */
  name?: string;
}
```

### Shop

The shop represents information about the store, such as the store name and currency.

* countryCode

  The shop’s country code.

  ```ts
  string
  ```

* myshopifyDomain

  The shop’s myshopify.com domain.

  ```ts
  string
  ```

* name

  The shop’s name.

  ```ts
  string
  ```

* paymentSettings

  Settings related to payments.

  ```ts
  ShopPaymentSettings
  ```

* storefrontUrl

  The shop’s primary storefront URL.

  ```ts
  string | null
  ```

```ts
export interface Shop {
  /**
   * The shop’s country code.
   */
  countryCode?: string;

  /**
   * The shop’s myshopify.com domain.
   */
  myshopifyDomain?: string;

  /**
   * The shop’s name.
   */
  name?: string;

  /**
   * Settings related to payments.
   */
  paymentSettings?: ShopPaymentSettings;

  /**
   * The shop’s primary storefront URL.
   */
  storefrontUrl?: string | null;
}
```

### ShopPaymentSettings

Settings related to payments.

* currencyCode

  The three-letter code for the shop’s primary currency.

  ```ts
  string
  ```

```ts
export interface ShopPaymentSettings {
  /**
   * The three-letter code for the shop’s primary currency.
   */
  currencyCode?: string;
}
```

Examples

### Examples

* #### Accessing Standard Api

  ##### App Pixel

  ```javascript
  import {register} from '@shopify/web-pixels-extension';

  register(({analytics, init}) => {
    analytics.subscribe('page_viewed', (event) => {
      // On every page view, get the current state of the cart

      const customer = init.data.customer;
      const cart = init.data.cart;
      const shop = init.data.shop;
      const purchasingCompany = init.data.purchasingCompany;

      console.log(`Customer Name: ${customer.firstName}`);
      // Customer Name: Bogus

      console.log(`Total Number of Items in Cart: ${cart.totalQuantity}`);
      // Total Number of Items in Cart: 3

      console.log(`Total Cost of Cart: ${cart.cost.totalAmount.amount}`);
      // Total Cost of Cart: 50.82

      console.log(`Shop name: ${shop.name}`);
      // Shop name: Shop 123

      console.log(`Shop currency code: ${shop.paymentSettings.currencyCode}`);
      // Shop currency code: CAD

      console.log(`Purchasing company name: ${purchasingCompany.company.name}`);
      // Purchasing company name: Acme Corporation

      console.log(
        `Purchasing company location name: ${purchasingCompany.location.name}`,
      );
      // Purchasing company location name: Toronto fulfillment center
    });
  });
  ```

  ##### Custom Pixel

  ```javascript
  analytics.subscribe('page_viewed', (event) => {
    // On every page view, get the current state of the cart

    const customer = init.data.customer;
    const cart = init.data.cart;
    const shop = init.data.shop;
    const purchasingCompany = init.data.purchasingCompany;

    console.log(`Customer Name: ${customer.firstName}`);
    // Customer Name: Bogus

    console.log(`Total Number of Items in Cart: ${cart.totalQuantity}`);
    // Total Number of Items in Cart: 3

    console.log(`Total Cost of Cart: ${cart.cost.totalAmount.amount}`);
    // Total Cost of Cart: 50.82

    console.log(`Shop name: ${shop.name}`);
    // Shop name: Shop 123

    console.log(`Shop currency code: ${shop.paymentSettings.currencyCode}`);
    // Shop currency code: CAD

    console.log(`Purchasing company name: ${purchasingCompany.company.name}`);
    // Purchasing company name: Acme Corporation

    console.log(
      `Purchasing company location name: ${purchasingCompany.location.name}`,
    );
    // Purchasing company location name: Toronto fulfillment center
  });
  ```

</page>

<page>
---
title: settings
description: >-
  Provides access to the settings JSON object as set by the [GraphQL Admin
  API](https://shopify.dev/docs/apps/marketing/pixels/getting-started#step-5-create-a-web-pixel-setting-for-the-store)
  **(Web pixel app extensions only)**. The structure of this object is a string
  keyed hash map: `Record<string, any>`.
api_name: web-pixels
source_url:
  html: 'https://shopify.dev/docs/api/web-pixels-api/standard-api/settings'
  md: 'https://shopify.dev/docs/api/web-pixels-api/standard-api/settings.md'
---

# settings

Provides access to the settings JSON object as set by the [GraphQL Admin API](https://shopify.dev/docs/apps/marketing/pixels/getting-started#step-5-create-a-web-pixel-setting-for-the-store) **(Web pixel app extensions only)**. The structure of this object is a string keyed hash map: `Record<string, any>`.

Examples

### Examples

* #### Accessing Standard Api

  ##### App Pixel

  ```javascript
  // ONLY AVAILABLE IN APP PIXELS

  import {register} from '@shopify/web-pixels-extension';

  register(({analytics, settings}) => {
    analytics.subscribe('page_viewed', (event) => {
      console.log(settings);
      /**
       * {
       *   "accountID": 234
       * }
       */
    });
  });
  ```

</page>

<page>
---
title: alert_displayed
description: >-
  The `alert_displayed` event records instances when a user encounters an alert
  message, whether it's an inline validation message on an input field or a
  warning banner.


  > Note: This event is only available on checkout.
api_name: web-pixels
source_url:
  html: 'https://shopify.dev/docs/api/web-pixels-api/standard-events/alert_displayed'
  md: >-
    https://shopify.dev/docs/api/web-pixels-api/standard-events/alert_displayed.md
---

# alert\_​displayed

The `alert_displayed` event records instances when a user encounters an alert message, whether it's an inline validation message on an input field or a warning banner.

Note

This event is only available on checkout.

## Properties

* clientId

  string

  The client-side ID of the customer, provided by Shopify

* context

  Context

* data

  PixelEventsAlertDisplayedData

* id

  string

  The ID of the customer event

* name

  string

  The name of the customer event

* seq

  number

  The sequence index number of the event.

* timestamp

  string

  The timestamp of when the customer event occurred, in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format

* type

  EventType.Standard

### Context

A snapshot of various read-only properties of the browser at the time of event

* document

  Snapshot of a subset of properties of the \`document\` object in the top frame of the browser

  ```ts
  WebPixelsDocument
  ```

* navigator

  Snapshot of a subset of properties of the \`navigator\` object in the top frame of the browser

  ```ts
  WebPixelsNavigator
  ```

* window

  Snapshot of a subset of properties of the \`window\` object in the top frame of the browser

  ```ts
  WebPixelsWindow
  ```

```ts
export interface Context {
  /**
   * Snapshot of a subset of properties of the `document` object in the top
   * frame of the browser
   */
  document?: WebPixelsDocument;

  /**
   * Snapshot of a subset of properties of the `navigator` object in the top
   * frame of the browser
   */
  navigator?: WebPixelsNavigator;

  /**
   * Snapshot of a subset of properties of the `window` object in the top frame
   * of the browser
   */
  window?: WebPixelsWindow;
}
```

### WebPixelsDocument

A snapshot of a subset of properties of the \`document\` object in the top frame of the browser

* characterSet

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the character set being used by the document

  ```ts
  string
  ```

* location

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the URI of the current document

  ```ts
  Location
  ```

* referrer

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the URI of the page that linked to this page

  ```ts
  string
  ```

* title

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the title of the current document

  ```ts
  string
  ```

```ts
export interface WebPixelsDocument {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the character set being used by the document
   */
  characterSet?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the URI of the current document
   */
  location?: Location;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the URI of the page that linked to this page
   */
  referrer?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the title of the current document
   */
  title?: string;
}
```

### Location

A snapshot of a subset of properties of the \`location\` object in the top frame of the browser

* hash

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing a \`'#'\` followed by the fragment identifier of the URL

  ```ts
  string
  ```

* host

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the host, that is the hostname, a \`':'\`, and the port of the URL

  ```ts
  string
  ```

* hostname

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the domain of the URL

  ```ts
  string
  ```

* href

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the entire URL

  ```ts
  string
  ```

* origin

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the canonical form of the origin of the specific location

  ```ts
  string
  ```

* pathname

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing an initial \`'/'\` followed by the path of the URL, not including the query string or fragment

  ```ts
  string
  ```

* port

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the port number of the URL

  ```ts
  string
  ```

* protocol

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the protocol scheme of the URL, including the final \`':'\`

  ```ts
  string
  ```

* search

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing a \`'?'\` followed by the parameters or "querystring" of the URL

  ```ts
  string
  ```

```ts
export interface Location {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing a `'#'` followed by the fragment identifier of the URL
   */
  hash?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the host, that is the hostname, a `':'`, and the port of
   * the URL
   */
  host?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the domain of the URL
   */
  hostname?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the entire URL
   */
  href?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the canonical form of the origin of the specific location
   */
  origin?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing an initial `'/'` followed by the path of the URL, not
   * including the query string or fragment
   */
  pathname?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the port number of the URL
   */
  port?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the protocol scheme of the URL, including the final `':'`
   */
  protocol?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing a `'?'` followed by the parameters or "querystring" of
   * the URL
   */
  search?: string;
}
```

### WebPixelsNavigator

A snapshot of a subset of properties of the \`navigator\` object in the top frame of the browser

* cookieEnabled

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns \`false\` if setting a cookie will be ignored and true otherwise

  ```ts
  boolean
  ```

* language

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns a string representing the preferred language of the user, usually the language of the browser UI. The \`null\` value is returned when this is unknown

  ```ts
  string
  ```

* languages

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns an array of strings representing the languages known to the user, by order of preference

  ```ts
  ReadonlyArray<string>
  ```

* userAgent

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns the user agent string for the current browser

  ```ts
  string
  ```

```ts
export interface WebPixelsNavigator {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns `false` if setting a cookie will be ignored and true otherwise
   */
  cookieEnabled?: boolean;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns a string representing the preferred language of the user, usually
   * the language of the browser UI. The `null` value is returned when this
   * is unknown
   */
  language?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns an array of strings representing the languages known to the user,
   * by order of preference
   */
  languages?: ReadonlyArray<string>;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns the user agent string for the current browser
   */
  userAgent?: string;
}
```

### WebPixelsWindow

A snapshot of a subset of properties of the \`window\` object in the top frame of the browser

* innerHeight

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the height of the content area of the browser window including, if rendered, the horizontal scrollbar

  ```ts
  number
  ```

* innerWidth

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the width of the content area of the browser window including, if rendered, the vertical scrollbar

  ```ts
  number
  ```

* location

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the location, or current URL, of the window object

  ```ts
  Location
  ```

* origin

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the global object's origin, serialized as a string

  ```ts
  string
  ```

* outerHeight

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the height of the outside of the browser window

  ```ts
  number
  ```

* outerWidth

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the width of the outside of the browser window

  ```ts
  number
  ```

* pageXOffset

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), an alias for window\.scrollX

  ```ts
  number
  ```

* pageYOffset

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), an alias for window\.scrollY

  ```ts
  number
  ```

* screen

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Screen), the interface representing a screen, usually the one on which the current window is being rendered

  ```ts
  Screen
  ```

* screenX

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the horizontal distance from the left border of the user's browser viewport to the left side of the screen

  ```ts
  number
  ```

* screenY

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the vertical distance from the top border of the user's browser viewport to the top side of the screen

  ```ts
  number
  ```

* scrollX

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the number of pixels that the document has already been scrolled horizontally

  ```ts
  number
  ```

* scrollY

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the number of pixels that the document has already been scrolled vertically

  ```ts
  number
  ```

```ts
export interface WebPixelsWindow {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window),
   * gets the height of the content area of the browser window including, if
   * rendered, the horizontal scrollbar
   */
  innerHeight?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), gets
   * the width of the content area of the browser window including, if rendered,
   * the vertical scrollbar
   */
  innerWidth?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * location, or current URL, of the window object
   */
  location?: Location;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * global object's origin, serialized as a string
   */
  origin?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), gets
   * the height of the outside of the browser window
   */
  outerHeight?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), gets
   * the width of the outside of the browser window
   */
  outerWidth?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), an
   * alias for window.scrollX
   */
  pageXOffset?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), an
   * alias for window.scrollY
   */
  pageYOffset?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen), the
   * interface representing a screen, usually the one on which the current
   * window is being rendered
   */
  screen?: Screen;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * horizontal distance from the left border of the user's browser viewport to
   * the left side of the screen
   */
  screenX?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * vertical distance from the top border of the user's browser viewport to the
   * top side of the screen
   */
  screenY?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * number of pixels that the document has already been scrolled horizontally
   */
  scrollX?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * number of pixels that the document has already been scrolled vertically
   */
  scrollY?: number;
}
```

### Screen

The interface representing a screen, usually the one on which the current window is being rendered

* height

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Screen/height), the height of the screen

  ```ts
  number
  ```

* width

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Screen/width), the width of the screen

  ```ts
  number
  ```

```ts
export interface Screen {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen/height),
   * the height of the screen
   */
  height?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen/width),
   * the width of the screen
   */
  width?: number;
}
```

### PixelEventsAlertDisplayedData

* alert

  ```ts
  AlertDisplayed
  ```

```ts
export interface PixelEventsAlertDisplayedData {
  alert?: AlertDisplayed;
}
```

### AlertDisplayed

An object that contains information about an alert that was displayed to a buyer.

* message

  The message that was displayed to the user.

  ```ts
  string
  ```

* target

  The part of the page the alert relates to. Follows the \[Shopify Functions target format]\(https://shopify.dev/docs/api/functions/reference/cart-checkout-validation/graphql#supported-checkout-field-targets), for example \`cart.deliveryGroups\[0].deliveryAddress.address1\`.

  ```ts
  string
  ```

* type

  The type of alert that was displayed.

  ```ts
  AlertDisplayedType
  ```

* value

  The value of the field at the time the alert was displayed or null if the alert did not relate to an individual field.

  ```ts
  string | null
  ```

```ts
export interface AlertDisplayed {
  /**
   * The message that was displayed to the user.
   */
  message?: string;

  /**
   * The part of the page the alert relates to.
   * Follows the [Shopify Functions target
   * format](https://shopify.dev/docs/api/functions/reference/cart-checkout-validation/graphql#supported-checkout-field-targets), for example
   * `cart.deliveryGroups[0].deliveryAddress.address1`.
   */
  target?: string;

  /**
   * The type of alert that was displayed.
   */
  type?: AlertDisplayedType;

  /**
   * The value of the field at the time the alert was displayed or null if the
   * alert did not relate to an individual field.
   */
  value?: string | null;
}
```

### AlertDisplayedType

* CheckoutError

  ```ts
  CHECKOUT_ERROR
  ```

* ContactError

  ```ts
  CONTACT_ERROR
  ```

* DeliveryError

  ```ts
  DELIVERY_ERROR
  ```

* DiscountError

  ```ts
  DISCOUNT_ERROR
  ```

* InputInvalid

  ```ts
  INPUT_INVALID
  ```

* InputRequired

  ```ts
  INPUT_REQUIRED
  ```

* InventoryError

  ```ts
  INVENTORY_ERROR
  ```

* MerchandiseError

  ```ts
  MERCHANDISE_ERROR
  ```

* PaymentError

  ```ts
  PAYMENT_ERROR
  ```

```ts
export enum AlertDisplayedType {
  /**
   * An alert related to general checkout issue was displayed.
   */
  CheckoutError = 'CHECKOUT_ERROR',

  /**
   * An alert related to a contact information issue was displayed.
   */
  ContactError = 'CONTACT_ERROR',

  /**
   * An alert related to a delivery issue was displayed.
   */
  DeliveryError = 'DELIVERY_ERROR',

  /**
   * An alert related to a discount code or gift card issue was displayed.
   */
  DiscountError = 'DISCOUNT_ERROR',

  /**
   * The input provided is incorrect or improperly formatted.
   */
  InputInvalid = 'INPUT_INVALID',

  /**
   * A required field is empty.
   */
  InputRequired = 'INPUT_REQUIRED',

  /**
   * An alert related to an inventory issue was displayed.
   */
  InventoryError = 'INVENTORY_ERROR',

  /**
   * An alert related to a merchandise issue was displayed.
   */
  MerchandiseError = 'MERCHANDISE_ERROR',

  /**
   * An alert related to a payment issue was displayed.
   */
  PaymentError = 'PAYMENT_ERROR',
}
```

### EventType

* AdvancedDom

  ```ts
  advanced-dom
  ```

* Custom

  ```ts
  custom
  ```

* Dom

  ```ts
  dom
  ```

* Meta

  ```ts
  meta
  ```

* Standard

  ```ts
  standard
  ```

```ts
export enum EventType {
  AdvancedDom = 'advanced-dom',
  Custom = 'custom',
  Dom = 'dom',
  Meta = 'meta',
  Standard = 'standard',
}
```

Examples

### Examples

* #### Accessing Standard Events

  ##### App Pixel

  ```javascript
  import {register} from '@shopify/web-pixels-extension';

  register(({analytics}) => {
    analytics.subscribe('alert_displayed', (event) => {
      // Example for accessing event data
      const {target, type, message} = event.data.alert;

      const payload = {
        event_name: event.name,
        event_data: {
          target,
          type,
          message,
        },
      };

      // Example for sending event data to third party servers
      fetch('https://example.com/pixel', {
        method: 'POST',
        body: JSON.stringify(payload),
        keepalive: true,
      });
    });
  });
  ```

  ##### Custom Pixel

  ```javascript
  analytics.subscribe('alert_displayed', (event) => {
    // Example for accessing event data
    const {target, type, message} = event.data.alert;

    const payload = {
      event_name: event.name,
      event_data: {
        target,
        type,
        message,
      },
    };

    // Example for sending event to third party servers
    fetch('https://example.com/pixel', {
      method: 'POST',
      body: JSON.stringify(payload),
      keepalive: true,
    });
  });
  ```

</page>

<page>
---
title: cart_viewed
description: >-
  The `cart_viewed` event logs an instance where a customer visited the cart
  page.
api_name: web-pixels
source_url:
  html: 'https://shopify.dev/docs/api/web-pixels-api/standard-events/cart_viewed'
  md: 'https://shopify.dev/docs/api/web-pixels-api/standard-events/cart_viewed.md'
---

# cart\_​viewed

The `cart_viewed` event logs an instance where a customer visited the cart page.

## Properties

* clientId

  string

  The client-side ID of the customer, provided by Shopify

* context

  Context

* data

  PixelEventsCartViewedData

* id

  string

  The ID of the customer event

* name

  string

  The name of the customer event

* seq

  number

  The sequence index number of the event.

* timestamp

  string

  The timestamp of when the customer event occurred, in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format

* type

  EventType.Standard

### Context

A snapshot of various read-only properties of the browser at the time of event

* document

  Snapshot of a subset of properties of the \`document\` object in the top frame of the browser

  ```ts
  WebPixelsDocument
  ```

* navigator

  Snapshot of a subset of properties of the \`navigator\` object in the top frame of the browser

  ```ts
  WebPixelsNavigator
  ```

* window

  Snapshot of a subset of properties of the \`window\` object in the top frame of the browser

  ```ts
  WebPixelsWindow
  ```

```ts
export interface Context {
  /**
   * Snapshot of a subset of properties of the `document` object in the top
   * frame of the browser
   */
  document?: WebPixelsDocument;

  /**
   * Snapshot of a subset of properties of the `navigator` object in the top
   * frame of the browser
   */
  navigator?: WebPixelsNavigator;

  /**
   * Snapshot of a subset of properties of the `window` object in the top frame
   * of the browser
   */
  window?: WebPixelsWindow;
}
```

### WebPixelsDocument

A snapshot of a subset of properties of the \`document\` object in the top frame of the browser

* characterSet

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the character set being used by the document

  ```ts
  string
  ```

* location

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the URI of the current document

  ```ts
  Location
  ```

* referrer

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the URI of the page that linked to this page

  ```ts
  string
  ```

* title

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the title of the current document

  ```ts
  string
  ```

```ts
export interface WebPixelsDocument {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the character set being used by the document
   */
  characterSet?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the URI of the current document
   */
  location?: Location;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the URI of the page that linked to this page
   */
  referrer?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the title of the current document
   */
  title?: string;
}
```

### Location

A snapshot of a subset of properties of the \`location\` object in the top frame of the browser

* hash

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing a \`'#'\` followed by the fragment identifier of the URL

  ```ts
  string
  ```

* host

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the host, that is the hostname, a \`':'\`, and the port of the URL

  ```ts
  string
  ```

* hostname

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the domain of the URL

  ```ts
  string
  ```

* href

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the entire URL

  ```ts
  string
  ```

* origin

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the canonical form of the origin of the specific location

  ```ts
  string
  ```

* pathname

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing an initial \`'/'\` followed by the path of the URL, not including the query string or fragment

  ```ts
  string
  ```

* port

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the port number of the URL

  ```ts
  string
  ```

* protocol

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the protocol scheme of the URL, including the final \`':'\`

  ```ts
  string
  ```

* search

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing a \`'?'\` followed by the parameters or "querystring" of the URL

  ```ts
  string
  ```

```ts
export interface Location {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing a `'#'` followed by the fragment identifier of the URL
   */
  hash?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the host, that is the hostname, a `':'`, and the port of
   * the URL
   */
  host?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the domain of the URL
   */
  hostname?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the entire URL
   */
  href?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the canonical form of the origin of the specific location
   */
  origin?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing an initial `'/'` followed by the path of the URL, not
   * including the query string or fragment
   */
  pathname?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the port number of the URL
   */
  port?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the protocol scheme of the URL, including the final `':'`
   */
  protocol?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing a `'?'` followed by the parameters or "querystring" of
   * the URL
   */
  search?: string;
}
```

### WebPixelsNavigator

A snapshot of a subset of properties of the \`navigator\` object in the top frame of the browser

* cookieEnabled

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns \`false\` if setting a cookie will be ignored and true otherwise

  ```ts
  boolean
  ```

* language

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns a string representing the preferred language of the user, usually the language of the browser UI. The \`null\` value is returned when this is unknown

  ```ts
  string
  ```

* languages

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns an array of strings representing the languages known to the user, by order of preference

  ```ts
  ReadonlyArray<string>
  ```

* userAgent

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns the user agent string for the current browser

  ```ts
  string
  ```

```ts
export interface WebPixelsNavigator {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns `false` if setting a cookie will be ignored and true otherwise
   */
  cookieEnabled?: boolean;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns a string representing the preferred language of the user, usually
   * the language of the browser UI. The `null` value is returned when this
   * is unknown
   */
  language?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns an array of strings representing the languages known to the user,
   * by order of preference
   */
  languages?: ReadonlyArray<string>;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns the user agent string for the current browser
   */
  userAgent?: string;
}
```

### WebPixelsWindow

A snapshot of a subset of properties of the \`window\` object in the top frame of the browser

* innerHeight

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the height of the content area of the browser window including, if rendered, the horizontal scrollbar

  ```ts
  number
  ```

* innerWidth

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the width of the content area of the browser window including, if rendered, the vertical scrollbar

  ```ts
  number
  ```

* location

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the location, or current URL, of the window object

  ```ts
  Location
  ```

* origin

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the global object's origin, serialized as a string

  ```ts
  string
  ```

* outerHeight

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the height of the outside of the browser window

  ```ts
  number
  ```

* outerWidth

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the width of the outside of the browser window

  ```ts
  number
  ```

* pageXOffset

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), an alias for window\.scrollX

  ```ts
  number
  ```

* pageYOffset

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), an alias for window\.scrollY

  ```ts
  number
  ```

* screen

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Screen), the interface representing a screen, usually the one on which the current window is being rendered

  ```ts
  Screen
  ```

* screenX

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the horizontal distance from the left border of the user's browser viewport to the left side of the screen

  ```ts
  number
  ```

* screenY

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the vertical distance from the top border of the user's browser viewport to the top side of the screen

  ```ts
  number
  ```

* scrollX

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the number of pixels that the document has already been scrolled horizontally

  ```ts
  number
  ```

* scrollY

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the number of pixels that the document has already been scrolled vertically

  ```ts
  number
  ```

```ts
export interface WebPixelsWindow {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window),
   * gets the height of the content area of the browser window including, if
   * rendered, the horizontal scrollbar
   */
  innerHeight?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), gets
   * the width of the content area of the browser window including, if rendered,
   * the vertical scrollbar
   */
  innerWidth?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * location, or current URL, of the window object
   */
  location?: Location;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * global object's origin, serialized as a string
   */
  origin?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), gets
   * the height of the outside of the browser window
   */
  outerHeight?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), gets
   * the width of the outside of the browser window
   */
  outerWidth?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), an
   * alias for window.scrollX
   */
  pageXOffset?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), an
   * alias for window.scrollY
   */
  pageYOffset?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen), the
   * interface representing a screen, usually the one on which the current
   * window is being rendered
   */
  screen?: Screen;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * horizontal distance from the left border of the user's browser viewport to
   * the left side of the screen
   */
  screenX?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * vertical distance from the top border of the user's browser viewport to the
   * top side of the screen
   */
  screenY?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * number of pixels that the document has already been scrolled horizontally
   */
  scrollX?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * number of pixels that the document has already been scrolled vertically
   */
  scrollY?: number;
}
```

### Screen

The interface representing a screen, usually the one on which the current window is being rendered

* height

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Screen/height), the height of the screen

  ```ts
  number
  ```

* width

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Screen/width), the width of the screen

  ```ts
  number
  ```

```ts
export interface Screen {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen/height),
   * the height of the screen
   */
  height?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen/width),
   * the width of the screen
   */
  width?: number;
}
```

### PixelEventsCartViewedData

* cart

  ```ts
  Cart | null
  ```

```ts
export interface PixelEventsCartViewedData {
  cart?: Cart | null;
}
```

### Cart

A cart represents the merchandise that a customer intends to purchase, and the estimated cost associated with the cart.

* attributes

  The attributes associated with the cart. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  Attribute[]
  ```

* cost

  The estimated costs that the customer will pay at checkout.

  ```ts
  CartCost
  ```

* id

  A globally unique identifier.

  ```ts
  string | null
  ```

* lines

  A list of lines containing information about the items the customer intends to purchase.

  ```ts
  CartLine[]
  ```

* totalQuantity

  The total number of items in the cart.

  ```ts
  number
  ```

```ts
export interface Cart {
  /**
   * The attributes associated with the cart. This property
   * is only available if the shop has [upgraded to Checkout
   * Extensibility](https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  attributes?: Attribute[];

  /**
   * The estimated costs that the customer will pay at checkout.
   */
  cost?: CartCost;

  /**
   * A globally unique identifier.
   */
  id?: string | null;

  /**
   * A list of lines containing information about the items the customer intends
   * to purchase.
   */
  lines?: CartLine[];

  /**
   * The total number of items in the cart.
   */
  totalQuantity?: number;
}
```

### Attribute

Custom attributes associated with the cart or checkout.

* key

  The key for the attribute.

  ```ts
  string
  ```

* value

  The value for the attribute.

  ```ts
  string
  ```

```ts
export interface Attribute {
  /**
   * The key for the attribute.
   */
  key?: string;

  /**
   * The value for the attribute.
   */
  value?: string;
}
```

### CartCost

The costs that the customer will pay at checkout. It uses \[\`CartBuyerIdentity\`]\(https://shopify.dev/api/storefront/reference/cart/cartbuyeridentity) to determine \[international pricing]\(https://shopify.dev/custom-storefronts/internationalization/international-pricing#create-a-cart).

* totalAmount

  The total amount for the customer to pay.

  ```ts
  MoneyV2
  ```

```ts
export interface CartCost {
  /**
   * The total amount for the customer to pay.
   */
  totalAmount?: MoneyV2;
}
```

### MoneyV2

A monetary value with currency.

* amount

  The decimal money amount.

  ```ts
  number
  ```

* currencyCode

  The three-letter code that represents the currency, for example, USD. Supported codes include standard ISO 4217 codes, legacy codes, and non- standard codes.

  ```ts
  string
  ```

```ts
export interface MoneyV2 {
  /**
   * The decimal money amount.
   */
  amount?: number;

  /**
   * The three-letter code that represents the currency, for example, USD.
   * Supported codes include standard ISO 4217 codes, legacy codes, and non-
   * standard codes.
   */
  currencyCode?: string;
}
```

### CartLine

Information about the merchandise in the cart.

* cost

  The cost of the merchandise that the customer will pay for at checkout. The costs are subject to change and changes will be reflected at checkout.

  ```ts
  CartLineCost
  ```

* merchandise

  The merchandise that the buyer intends to purchase.

  ```ts
  ProductVariant
  ```

* quantity

  The quantity of the merchandise that the customer intends to purchase.

  ```ts
  number
  ```

```ts
export interface CartLine {
  /**
   * The cost of the merchandise that the customer will pay for at checkout. The
   * costs are subject to change and changes will be reflected at checkout.
   */
  cost?: CartLineCost;

  /**
   * The merchandise that the buyer intends to purchase.
   */
  merchandise?: ProductVariant;

  /**
   * The quantity of the merchandise that the customer intends to purchase.
   */
  quantity?: number;
}
```

### CartLineCost

The cost of the merchandise line that the customer will pay at checkout.

* totalAmount

  The total cost of the merchandise line.

  ```ts
  MoneyV2
  ```

```ts
export interface CartLineCost {
  /**
   * The total cost of the merchandise line.
   */
  totalAmount?: MoneyV2;
}
```

### ProductVariant

A product variant represents a different version of a product, such as differing sizes or differing colors.

* id

  A globally unique identifier.

  ```ts
  string | null
  ```

* image

  Image associated with the product variant. This field falls back to the product image if no image is available.

  ```ts
  Image | null
  ```

* price

  The product variant’s price.

  ```ts
  MoneyV2
  ```

* product

  The product object that the product variant belongs to.

  ```ts
  Product
  ```

* sku

  The SKU (stock keeping unit) associated with the variant.

  ```ts
  string | null
  ```

* title

  The product variant’s title.

  ```ts
  string | null
  ```

* untranslatedTitle

  The product variant’s untranslated title.

  ```ts
  string | null
  ```

```ts
export interface ProductVariant {
  /**
   * A globally unique identifier.
   */
  id?: string | null;

  /**
   * Image associated with the product variant. This field falls back to the
   * product image if no image is available.
   */
  image?: Image | null;

  /**
   * The product variant’s price.
   */
  price?: MoneyV2;

  /**
   * The product object that the product variant belongs to.
   */
  product?: Product;

  /**
   * The SKU (stock keeping unit) associated with the variant.
   */
  sku?: string | null;

  /**
   * The product variant’s title.
   */
  title?: string | null;

  /**
   * The product variant’s untranslated title.
   */
  untranslatedTitle?: string | null;
}
```

### Image

An image resource.

* src

  The location of the image as a URL.

  ```ts
  string | null
  ```

```ts
export interface Image {
  /**
   * The location of the image as a URL.
   */
  src?: string | null;
}
```

### Product

A product is an individual item for sale in a Shopify store.

* id

  The ID of the product.

  ```ts
  string | null
  ```

* title

  The product’s title.

  ```ts
  string
  ```

* type

  The \[product type]\(https://help.shopify.com/en/manual/products/details/product-type) specified by the merchant.

  ```ts
  string | null
  ```

* untranslatedTitle

  The product’s untranslated title.

  ```ts
  string | null
  ```

* url

  The relative URL of the product.

  ```ts
  string | null
  ```

* vendor

  The product’s vendor name.

  ```ts
  string
  ```

```ts
export interface Product {
  /**
   * The ID of the product.
   */
  id?: string | null;

  /**
   * The product’s title.
   */
  title?: string;

  /**
   * The [product
   * type](https://help.shopify.com/en/manual/products/details/product-type)
   * specified by the merchant.
   */
  type?: string | null;

  /**
   * The product’s untranslated title.
   */
  untranslatedTitle?: string | null;

  /**
   * The relative URL of the product.
   */
  url?: string | null;

  /**
   * The product’s vendor name.
   */
  vendor?: string;
}
```

### EventType

* AdvancedDom

  ```ts
  advanced-dom
  ```

* Custom

  ```ts
  custom
  ```

* Dom

  ```ts
  dom
  ```

* Meta

  ```ts
  meta
  ```

* Standard

  ```ts
  standard
  ```

```ts
export enum EventType {
  AdvancedDom = 'advanced-dom',
  Custom = 'custom',
  Dom = 'dom',
  Meta = 'meta',
  Standard = 'standard',
}
```

Examples

### Examples

* #### Accessing Standard Events

  ##### App Pixel

  ```javascript
  import {register} from '@shopify/web-pixels-extension';

  register(({analytics}) => {
    analytics.subscribe('cart_viewed', (event) => {
      // Example for accessing event data
      const totalCartCost = event.data.cart.cost.totalAmount.amount;

      const firstCartLineItemName =
        event.data.cart.lines[0]?.merchandise.product.title;

      const payload = {
        event_name: event.name,
        event_data: {
          cartCost: totalCartCost,
          firstCartItemName: firstCartLineItemName,
        },
      };

      // Example for sending event data to third party servers
      fetch('https://example.com/pixel', {
        method: 'POST',
        body: JSON.stringify(payload),
        keepalive: true,
      });
    });
  });
  ```

  ##### Custom Pixel

  ```javascript
  analytics.subscribe('cart_viewed', (event) => {
    // Example for accessing event data
    const totalCartCost = event.data.cart.cost.totalAmount.amount;

    const firstCartLineItemName =
      event.data.cart.lines[0]?.merchandise.product.title;

    const payload = {
      event_name: event.name,
      event_data: {
        cartCost: totalCartCost,
        firstCartItemName: firstCartLineItemName,
      },
    };

    // Example for sending event to third party servers
    fetch('https://example.com/pixel', {
      method: 'POST',
      body: JSON.stringify(payload),
      keepalive: true,
    });
  });
  ```

</page>

<page>
---
title: checkout_address_info_submitted
description: >-
  The `checkout_address_info_submitted` event logs an instance of a customer
  submitting their mailing address. This event is only available in checkouts
  where Checkout Extensibility for customizations is enabled
api_name: web-pixels
source_url:
  html: >-
    https://shopify.dev/docs/api/web-pixels-api/standard-events/checkout_address_info_submitted
  md: >-
    https://shopify.dev/docs/api/web-pixels-api/standard-events/checkout_address_info_submitted.md
---

# checkout\_​address\_​info\_​submitted

The `checkout_address_info_submitted` event logs an instance of a customer submitting their mailing address. This event is only available in checkouts where Checkout Extensibility for customizations is enabled

## Properties

* clientId

  string

  The client-side ID of the customer, provided by Shopify

* context

  Context

* data

  PixelEventsCheckoutAddressInfoSubmittedData

* id

  string

  The ID of the customer event

* name

  string

  The name of the customer event

* seq

  number

  The sequence index number of the event.

* timestamp

  string

  The timestamp of when the customer event occurred, in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format

* type

  EventType.Standard

### Context

A snapshot of various read-only properties of the browser at the time of event

* document

  Snapshot of a subset of properties of the \`document\` object in the top frame of the browser

  ```ts
  WebPixelsDocument
  ```

* navigator

  Snapshot of a subset of properties of the \`navigator\` object in the top frame of the browser

  ```ts
  WebPixelsNavigator
  ```

* window

  Snapshot of a subset of properties of the \`window\` object in the top frame of the browser

  ```ts
  WebPixelsWindow
  ```

```ts
export interface Context {
  /**
   * Snapshot of a subset of properties of the `document` object in the top
   * frame of the browser
   */
  document?: WebPixelsDocument;

  /**
   * Snapshot of a subset of properties of the `navigator` object in the top
   * frame of the browser
   */
  navigator?: WebPixelsNavigator;

  /**
   * Snapshot of a subset of properties of the `window` object in the top frame
   * of the browser
   */
  window?: WebPixelsWindow;
}
```

### WebPixelsDocument

A snapshot of a subset of properties of the \`document\` object in the top frame of the browser

* characterSet

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the character set being used by the document

  ```ts
  string
  ```

* location

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the URI of the current document

  ```ts
  Location
  ```

* referrer

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the URI of the page that linked to this page

  ```ts
  string
  ```

* title

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the title of the current document

  ```ts
  string
  ```

```ts
export interface WebPixelsDocument {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the character set being used by the document
   */
  characterSet?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the URI of the current document
   */
  location?: Location;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the URI of the page that linked to this page
   */
  referrer?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the title of the current document
   */
  title?: string;
}
```

### Location

A snapshot of a subset of properties of the \`location\` object in the top frame of the browser

* hash

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing a \`'#'\` followed by the fragment identifier of the URL

  ```ts
  string
  ```

* host

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the host, that is the hostname, a \`':'\`, and the port of the URL

  ```ts
  string
  ```

* hostname

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the domain of the URL

  ```ts
  string
  ```

* href

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the entire URL

  ```ts
  string
  ```

* origin

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the canonical form of the origin of the specific location

  ```ts
  string
  ```

* pathname

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing an initial \`'/'\` followed by the path of the URL, not including the query string or fragment

  ```ts
  string
  ```

* port

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the port number of the URL

  ```ts
  string
  ```

* protocol

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the protocol scheme of the URL, including the final \`':'\`

  ```ts
  string
  ```

* search

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing a \`'?'\` followed by the parameters or "querystring" of the URL

  ```ts
  string
  ```

```ts
export interface Location {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing a `'#'` followed by the fragment identifier of the URL
   */
  hash?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the host, that is the hostname, a `':'`, and the port of
   * the URL
   */
  host?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the domain of the URL
   */
  hostname?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the entire URL
   */
  href?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the canonical form of the origin of the specific location
   */
  origin?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing an initial `'/'` followed by the path of the URL, not
   * including the query string or fragment
   */
  pathname?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the port number of the URL
   */
  port?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the protocol scheme of the URL, including the final `':'`
   */
  protocol?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing a `'?'` followed by the parameters or "querystring" of
   * the URL
   */
  search?: string;
}
```

### WebPixelsNavigator

A snapshot of a subset of properties of the \`navigator\` object in the top frame of the browser

* cookieEnabled

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns \`false\` if setting a cookie will be ignored and true otherwise

  ```ts
  boolean
  ```

* language

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns a string representing the preferred language of the user, usually the language of the browser UI. The \`null\` value is returned when this is unknown

  ```ts
  string
  ```

* languages

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns an array of strings representing the languages known to the user, by order of preference

  ```ts
  ReadonlyArray<string>
  ```

* userAgent

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns the user agent string for the current browser

  ```ts
  string
  ```

```ts
export interface WebPixelsNavigator {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns `false` if setting a cookie will be ignored and true otherwise
   */
  cookieEnabled?: boolean;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns a string representing the preferred language of the user, usually
   * the language of the browser UI. The `null` value is returned when this
   * is unknown
   */
  language?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns an array of strings representing the languages known to the user,
   * by order of preference
   */
  languages?: ReadonlyArray<string>;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns the user agent string for the current browser
   */
  userAgent?: string;
}
```

### WebPixelsWindow

A snapshot of a subset of properties of the \`window\` object in the top frame of the browser

* innerHeight

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the height of the content area of the browser window including, if rendered, the horizontal scrollbar

  ```ts
  number
  ```

* innerWidth

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the width of the content area of the browser window including, if rendered, the vertical scrollbar

  ```ts
  number
  ```

* location

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the location, or current URL, of the window object

  ```ts
  Location
  ```

* origin

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the global object's origin, serialized as a string

  ```ts
  string
  ```

* outerHeight

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the height of the outside of the browser window

  ```ts
  number
  ```

* outerWidth

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the width of the outside of the browser window

  ```ts
  number
  ```

* pageXOffset

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), an alias for window\.scrollX

  ```ts
  number
  ```

* pageYOffset

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), an alias for window\.scrollY

  ```ts
  number
  ```

* screen

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Screen), the interface representing a screen, usually the one on which the current window is being rendered

  ```ts
  Screen
  ```

* screenX

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the horizontal distance from the left border of the user's browser viewport to the left side of the screen

  ```ts
  number
  ```

* screenY

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the vertical distance from the top border of the user's browser viewport to the top side of the screen

  ```ts
  number
  ```

* scrollX

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the number of pixels that the document has already been scrolled horizontally

  ```ts
  number
  ```

* scrollY

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the number of pixels that the document has already been scrolled vertically

  ```ts
  number
  ```

```ts
export interface WebPixelsWindow {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window),
   * gets the height of the content area of the browser window including, if
   * rendered, the horizontal scrollbar
   */
  innerHeight?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), gets
   * the width of the content area of the browser window including, if rendered,
   * the vertical scrollbar
   */
  innerWidth?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * location, or current URL, of the window object
   */
  location?: Location;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * global object's origin, serialized as a string
   */
  origin?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), gets
   * the height of the outside of the browser window
   */
  outerHeight?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), gets
   * the width of the outside of the browser window
   */
  outerWidth?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), an
   * alias for window.scrollX
   */
  pageXOffset?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), an
   * alias for window.scrollY
   */
  pageYOffset?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen), the
   * interface representing a screen, usually the one on which the current
   * window is being rendered
   */
  screen?: Screen;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * horizontal distance from the left border of the user's browser viewport to
   * the left side of the screen
   */
  screenX?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * vertical distance from the top border of the user's browser viewport to the
   * top side of the screen
   */
  screenY?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * number of pixels that the document has already been scrolled horizontally
   */
  scrollX?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * number of pixels that the document has already been scrolled vertically
   */
  scrollY?: number;
}
```

### Screen

The interface representing a screen, usually the one on which the current window is being rendered

* height

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Screen/height), the height of the screen

  ```ts
  number
  ```

* width

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Screen/width), the width of the screen

  ```ts
  number
  ```

```ts
export interface Screen {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen/height),
   * the height of the screen
   */
  height?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen/width),
   * the width of the screen
   */
  width?: number;
}
```

### PixelEventsCheckoutAddressInfoSubmittedData

* checkout

  ```ts
  Checkout
  ```

```ts
export interface PixelEventsCheckoutAddressInfoSubmittedData {
  checkout?: Checkout;
}
```

### Checkout

A container for all the information required to add items to checkout and pay.

* attributes

  A list of attributes accumulated throughout the checkout process.

  ```ts
  Attribute[]
  ```

* billingAddress

  The billing address to where the order will be charged.

  ```ts
  MailingAddress | null
  ```

* buyerAcceptsEmailMarketing

  Indicates whether the customer has consented to be sent marketing material via email. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  boolean
  ```

* buyerAcceptsSmsMarketing

  Indicates whether the customer has consented to be sent marketing material via SMS. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  boolean
  ```

* currencyCode

  The three-letter code that represents the currency, for example, USD. Supported codes include standard ISO 4217 codes, legacy codes, and non- standard codes.

  ```ts
  string | null
  ```

* delivery

  Represents the selected delivery options for a checkout. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  Delivery | null
  ```

* discountApplications

  A list of discount applications.

  ```ts
  DiscountApplication[]
  ```

* discountsAmount

  The total amount of the discounts applied to the price of the checkout. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  MoneyV2 | null
  ```

* email

  The email attached to this checkout.

  ```ts
  string | null
  ```

* lineItems

  A list of line item objects, each one containing information about an item in the checkout.

  ```ts
  CheckoutLineItem[]
  ```

* localization

  Information about the active localized experience. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  Localization
  ```

* order

  The resulting order from a paid checkout.

  ```ts
  Order | null
  ```

* phone

  A unique phone number for the customer. Formatted using E.164 standard. For example, \*+16135551111\*.

  ```ts
  string | null
  ```

* shippingAddress

  The shipping address to where the line items will be shipped.

  ```ts
  MailingAddress | null
  ```

* shippingLine

  Once a shipping rate is selected by the customer it is transitioned to a \`shipping\_line\` object.

  ```ts
  ShippingRate | null
  ```

* smsMarketingPhone

  The phone number provided by the buyer after opting in to SMS marketing. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  string | null
  ```

* subtotalPrice

  The price at checkout before duties, shipping, and taxes.

  ```ts
  MoneyV2 | null
  ```

* token

  A unique identifier for a particular checkout.

  ```ts
  string | null
  ```

* totalPrice

  The sum of all the prices of all the items in the checkout, including duties, taxes, and discounts.

  ```ts
  MoneyV2 | null
  ```

* totalTax

  The sum of all the taxes applied to the line items and shipping lines in the checkout.

  ```ts
  MoneyV2
  ```

* transactions

  A list of transactions associated with a checkout or order. Certain transactions, such as credit card transactions, may only be present in the checkout\_completed event.

  ```ts
  Transaction[]
  ```

```ts
export interface Checkout {
  /**
   * A list of attributes accumulated throughout the checkout process.
   */
  attributes?: Attribute[];

  /**
   * The billing address to where the order will be charged.
   */
  billingAddress?: MailingAddress | null;

  /**
   * Indicates whether the customer has consented to be sent marketing material
   * via email. This property is only available if the shop has [upgraded
   * to Checkout Extensibility](https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  buyerAcceptsEmailMarketing?: boolean;

  /**
   * Indicates whether the customer has consented to be sent marketing material
   * via SMS. This property is only available if the shop has [upgraded to
   * Checkout Extensibility](https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  buyerAcceptsSmsMarketing?: boolean;

  /**
   * The three-letter code that represents the currency, for example, USD.
   * Supported codes include standard ISO 4217 codes, legacy codes, and non-
   * standard codes.
   */
  currencyCode?: string | null;

  /**
   * Represents the selected delivery options for a checkout. This
   * property is only available if the shop has [upgraded to Checkout
   * Extensibility](https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  delivery?: Delivery | null;

  /**
   * A list of discount applications.
   */
  discountApplications?: DiscountApplication[];

  /**
   * The total amount of the discounts applied to the price of the checkout.
   * This property is only available if the shop has [upgraded to Checkout
   * Extensibility](https://help.shopify.com/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  discountsAmount?: MoneyV2 | null;

  /**
   * The email attached to this checkout.
   */
  email?: string | null;

  /**
   * A list of line item objects, each one containing information about an item
   * in the checkout.
   */
  lineItems?: CheckoutLineItem[];

  /**
   * Information about the active localized experience. This
   * property is only available if the shop has [upgraded to Checkout
   * Extensibility](https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  localization?: Localization;

  /**
   * The resulting order from a paid checkout.
   */
  order?: Order | null;

  /**
   * A unique phone number for the customer. Formatted using E.164 standard. For
   * example, *+16135551111*.
   */
  phone?: string | null;

  /**
   * The shipping address to where the line items will be shipped.
   */
  shippingAddress?: MailingAddress | null;

  /**
   * Once a shipping rate is selected by the customer it is transitioned to a
   * `shipping_line` object.
   */
  shippingLine?: ShippingRate | null;

  /**
   * The phone number provided by the buyer after opting in to SMS
   * marketing. This property is only available if the shop has [upgraded
   * to Checkout Extensibility](https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  smsMarketingPhone?: string | null;

  /**
   * The price at checkout before duties, shipping, and taxes.
   */
  subtotalPrice?: MoneyV2 | null;

  /**
   * A unique identifier for a particular checkout.
   */
  token?: string | null;

  /**
   * The sum of all the prices of all the items in the checkout, including
   * duties, taxes, and discounts.
   */
  totalPrice?: MoneyV2 | null;

  /**
   * The sum of all the taxes applied to the line items and shipping lines in
   * the checkout.
   */
  totalTax?: MoneyV2;

  /**
   * A list of transactions associated with a checkout or order. Certain
   * transactions, such as credit card transactions, may only be present in the
   * checkout_completed event.
   */
  transactions?: Transaction[];
}
```

### Attribute

Custom attributes associated with the cart or checkout.

* key

  The key for the attribute.

  ```ts
  string
  ```

* value

  The value for the attribute.

  ```ts
  string
  ```

```ts
export interface Attribute {
  /**
   * The key for the attribute.
   */
  key?: string;

  /**
   * The value for the attribute.
   */
  value?: string;
}
```

### MailingAddress

A mailing address for customers and shipping.

* address1

  The first line of the address. This is usually the street address or a P.O. Box number.

  ```ts
  string | null
  ```

* address2

  The second line of the address. This is usually an apartment, suite, or unit number.

  ```ts
  string | null
  ```

* city

  The name of the city, district, village, or town.

  ```ts
  string | null
  ```

* country

  The name of the country.

  ```ts
  string | null
  ```

* countryCode

  The two-letter code that represents the country, for example, US. The country codes generally follows ISO 3166-1 alpha-2 guidelines.

  ```ts
  string | null
  ```

* firstName

  The customer’s first name.

  ```ts
  string | null
  ```

* lastName

  The customer’s last name.

  ```ts
  string | null
  ```

* phone

  The phone number for this mailing address as entered by the customer.

  ```ts
  string | null
  ```

* province

  The region of the address, such as the province, state, or district.

  ```ts
  string | null
  ```

* provinceCode

  The two-letter code for the region. For example, ON.

  ```ts
  string | null
  ```

* zip

  The ZIP or postal code of the address.

  ```ts
  string | null
  ```

```ts
export interface MailingAddress {
  /**
   * The first line of the address. This is usually the street address or a P.O.
   * Box number.
   */
  address1?: string | null;

  /**
   * The second line of the address. This is usually an apartment, suite, or
   * unit number.
   */
  address2?: string | null;

  /**
   * The name of the city, district, village, or town.
   */
  city?: string | null;

  /**
   * The name of the country.
   */
  country?: string | null;

  /**
   * The two-letter code that represents the country, for example, US.
   * The country codes generally follows ISO 3166-1 alpha-2 guidelines.
   */
  countryCode?: string | null;

  /**
   * The customer’s first name.
   */
  firstName?: string | null;

  /**
   * The customer’s last name.
   */
  lastName?: string | null;

  /**
   * The phone number for this mailing address as entered by the customer.
   */
  phone?: string | null;

  /**
   * The region of the address, such as the province, state, or district.
   */
  province?: string | null;

  /**
   * The two-letter code for the region.
   * For example, ON.
   */
  provinceCode?: string | null;

  /**
   * The ZIP or postal code of the address.
   */
  zip?: string | null;
}
```

### Delivery

The delivery information for the event.

* selectedDeliveryOptions

  The selected delivery options for the event.

  ```ts
  DeliveryOption[]
  ```

```ts
export interface Delivery {
  /**
   * The selected delivery options for the event.
   */
  selectedDeliveryOptions?: DeliveryOption[];
}
```

### DeliveryOption

Represents a delivery option that the customer can choose from.

* cost

  The cost of the delivery option.

  ```ts
  MoneyV2 | null
  ```

* costAfterDiscounts

  The cost of the delivery option after discounts have been applied.

  ```ts
  MoneyV2 | null
  ```

* description

  The description of the delivery option.

  ```ts
  string | null
  ```

* handle

  The unique identifier of the delivery option.

  ```ts
  string
  ```

* title

  The title of the delivery option.

  ```ts
  string | null
  ```

* type

  The type of delivery option. - \`pickup\` - \`pickupPoint\` - \`shipping\` - \`local\`

  ```ts
  string
  ```

```ts
export interface DeliveryOption {
  /**
   * The cost of the delivery option.
   */
  cost?: MoneyV2 | null;

  /**
   * The cost of the delivery option after discounts have been applied.
   */
  costAfterDiscounts?: MoneyV2 | null;

  /**
   * The description of the delivery option.
   */
  description?: string | null;

  /**
   * The unique identifier of the delivery option.
   */
  handle?: string;

  /**
   * The title of the delivery option.
   */
  title?: string | null;

  /**
   * The type of delivery option.
   *
   * - `pickup`
   * - `pickupPoint`
   * - `shipping`
   * - `local`
   */
  type?: string;
}
```

### MoneyV2

A monetary value with currency.

* amount

  The decimal money amount.

  ```ts
  number
  ```

* currencyCode

  The three-letter code that represents the currency, for example, USD. Supported codes include standard ISO 4217 codes, legacy codes, and non- standard codes.

  ```ts
  string
  ```

```ts
export interface MoneyV2 {
  /**
   * The decimal money amount.
   */
  amount?: number;

  /**
   * The three-letter code that represents the currency, for example, USD.
   * Supported codes include standard ISO 4217 codes, legacy codes, and non-
   * standard codes.
   */
  currencyCode?: string;
}
```

### DiscountApplication

The information about the intent of the discount.

* allocationMethod

  The method by which the discount's value is applied to its entitled items. - \`ACROSS\`: The value is spread across all entitled lines. - \`EACH\`: The value is applied onto every entitled line.

  ```ts
  string
  ```

* targetSelection

  How the discount amount is distributed on the discounted lines. - \`ALL\`: The discount is allocated onto all the lines. - \`ENTITLED\`: The discount is allocated onto only the lines that it's entitled for. - \`EXPLICIT\`: The discount is allocated onto explicitly chosen lines.

  ```ts
  string
  ```

* targetType

  The type of line (i.e. line item or shipping line) on an order that the discount is applicable towards. - \`LINE\_ITEM\`: The discount applies onto line items. - \`SHIPPING\_LINE\`: The discount applies onto shipping lines.

  ```ts
  string
  ```

* title

  The customer-facing name of the discount. If the type of discount is a \`DISCOUNT\_CODE\`, this \`title\` attribute represents the code of the discount.

  ```ts
  string
  ```

* type

  The type of the discount. - \`AUTOMATIC\`: A discount automatically at checkout or in the cart without the need for a code. - \`DISCOUNT\_CODE\`: A discount applied onto checkouts through the use of a code. - \`MANUAL\`: A discount that is applied to an order by a merchant or store owner manually, rather than being automatically applied by the system or through a script. - \`SCRIPT\`: A discount applied to a customer's order using a script

  ```ts
  string
  ```

* value

  The value of the discount. Fixed discounts return a \`Money\` Object, while Percentage discounts return a \`PricingPercentageValue\` object.

  ```ts
  MoneyV2 | PricingPercentageValue
  ```

```ts
export interface DiscountApplication {
  /**
   * The method by which the discount's value is applied to its entitled items.
   *
   * - `ACROSS`: The value is spread across all entitled lines.
   * - `EACH`: The value is applied onto every entitled line.
   */
  allocationMethod?: string;

  /**
   * How the discount amount is distributed on the discounted lines.
   *
   * - `ALL`: The discount is allocated onto all the lines.
   * - `ENTITLED`: The discount is allocated onto only the lines that it's
   * entitled for.
   * - `EXPLICIT`: The discount is allocated onto explicitly chosen lines.
   */
  targetSelection?: string;

  /**
   * The type of line (i.e. line item or shipping line) on an order that the
   * discount is applicable towards.
   *
   * - `LINE_ITEM`: The discount applies onto line items.
   * - `SHIPPING_LINE`: The discount applies onto shipping lines.
   */
  targetType?: string;

  /**
   * The customer-facing name of the discount. If the type of discount is
   * a `DISCOUNT_CODE`, this `title` attribute represents the code of the
   * discount.
   */
  title?: string;

  /**
   * The type of the discount.
   *
   * - `AUTOMATIC`: A discount automatically at checkout or in the cart without
   * the need for a code.
   * - `DISCOUNT_CODE`: A discount applied onto checkouts through the use of
   * a code.
   * - `MANUAL`: A discount that is applied to an order by a merchant or store
   * owner manually, rather than being automatically applied by the system or
   * through a script.
   * - `SCRIPT`: A discount applied to a customer's order using a script
   */
  type?: string;

  /**
   * The value of the discount. Fixed discounts return a `Money` Object, while
   * Percentage discounts return a `PricingPercentageValue` object.
   */
  value?: MoneyV2 | PricingPercentageValue;
}
```

### PricingPercentageValue

A value given to a customer when a discount is applied to an order. The application of a discount with this value gives the customer the specified percentage off a specified item.

* percentage

  The percentage value of the object.

  ```ts
  number
  ```

```ts
export interface PricingPercentageValue {
  /**
   * The percentage value of the object.
   */
  percentage?: number;
}
```

### CheckoutLineItem

A single line item in the checkout, grouped by variant and attributes.

* discountAllocations

  The discounts that have been applied to the checkout line item by a discount application.

  ```ts
  DiscountAllocation[]
  ```

* finalLinePrice

  The combined price of all of the items in the line item after line-level discounts have been applied. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  MoneyV2
  ```

* id

  A globally unique identifier.

  ```ts
  string | null
  ```

* properties

  The properties of the line item. A shop may add, or enable customers to add custom information to a line item. Line item properties consist of a key and value pair. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  Property[]
  ```

* quantity

  The quantity of the line item.

  ```ts
  number
  ```

* sellingPlanAllocation

  The selling plan associated with the line item and the effect that each selling plan has on variants when they're purchased. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  SellingPlanAllocation | null
  ```

* title

  The title of the line item. Defaults to the product's title.

  ```ts
  string | null
  ```

* variant

  Product variant of the line item.

  ```ts
  ProductVariant | null
  ```

```ts
export interface CheckoutLineItem {
  /**
   * The discounts that have been applied to the checkout line item by a
   * discount application.
   */
  discountAllocations?: DiscountAllocation[];

  /**
   * The combined price of all of the items in the line item
   * after line-level discounts have been applied. This property
   * is only available if the shop has [upgraded to Checkout
   * Extensibility](https://help.shopify.com/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  finalLinePrice?: MoneyV2;

  /**
   * A globally unique identifier.
   */
  id?: string | null;

  /**
   * The properties of the line item. A shop may add, or enable customers to add
   * custom information to a line item. Line item properties consist of a key
   * and value pair. This property is only available if the shop has [upgraded
   * to Checkout Extensibility](https://help.shopify.com/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  properties?: Property[];

  /**
   * The quantity of the line item.
   */
  quantity?: number;

  /**
   * The selling plan associated with the line item and the effect that
   * each selling plan has on variants when they're purchased. This
   * property is only available if the shop has [upgraded to Checkout
   * Extensibility](https://help.shopify.com/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  sellingPlanAllocation?: SellingPlanAllocation | null;

  /**
   * The title of the line item. Defaults to the product's title.
   */
  title?: string | null;

  /**
   * Product variant of the line item.
   */
  variant?: ProductVariant | null;
}
```

### DiscountAllocation

The discount that has been applied to the checkout line item.

* amount

  The monetary value with currency allocated to the discount.

  ```ts
  MoneyV2
  ```

* discountApplication

  The information about the intent of the discount.

  ```ts
  DiscountApplication
  ```

```ts
export interface DiscountAllocation {
  /**
   * The monetary value with currency allocated to the discount.
   */
  amount?: MoneyV2;

  /**
   * The information about the intent of the discount.
   */
  discountApplication?: DiscountApplication;
}
```

### Property

The line item additional custom properties.

* key

  The key for the property.

  ```ts
  string
  ```

* value

  The value for the property.

  ```ts
  string
  ```

```ts
export interface Property {
  /**
   * The key for the property.
   */
  key?: string;

  /**
   * The value for the property.
   */
  value?: string;
}
```

### SellingPlanAllocation

Represents an association between a variant and a selling plan.

* sellingPlan

  A representation of how products and variants can be sold and purchased. For example, an individual selling plan could be '6 weeks of prepaid granola, delivered weekly'.

  ```ts
  SellingPlan
  ```

```ts
export interface SellingPlanAllocation {
  /**
   * A representation of how products and variants can be sold and purchased.
   * For example, an individual selling plan could be '6 weeks of prepaid
   * granola, delivered weekly'.
   */
  sellingPlan?: SellingPlan;
}
```

### SellingPlan

Represents how products and variants can be sold and purchased.

* id

  A globally unique identifier.

  ```ts
  string
  ```

* name

  The name of the selling plan. For example, '6 weeks of prepaid granola, delivered weekly'.

  ```ts
  string
  ```

```ts
export interface SellingPlan {
  /**
   * A globally unique identifier.
   */
  id?: string;

  /**
   * The name of the selling plan. For example, '6 weeks of prepaid granola,
   * delivered weekly'.
   */
  name?: string;
}
```

### ProductVariant

A product variant represents a different version of a product, such as differing sizes or differing colors.

* id

  A globally unique identifier.

  ```ts
  string | null
  ```

* image

  Image associated with the product variant. This field falls back to the product image if no image is available.

  ```ts
  Image | null
  ```

* price

  The product variant’s price.

  ```ts
  MoneyV2
  ```

* product

  The product object that the product variant belongs to.

  ```ts
  Product
  ```

* sku

  The SKU (stock keeping unit) associated with the variant.

  ```ts
  string | null
  ```

* title

  The product variant’s title.

  ```ts
  string | null
  ```

* untranslatedTitle

  The product variant’s untranslated title.

  ```ts
  string | null
  ```

```ts
export interface ProductVariant {
  /**
   * A globally unique identifier.
   */
  id?: string | null;

  /**
   * Image associated with the product variant. This field falls back to the
   * product image if no image is available.
   */
  image?: Image | null;

  /**
   * The product variant’s price.
   */
  price?: MoneyV2;

  /**
   * The product object that the product variant belongs to.
   */
  product?: Product;

  /**
   * The SKU (stock keeping unit) associated with the variant.
   */
  sku?: string | null;

  /**
   * The product variant’s title.
   */
  title?: string | null;

  /**
   * The product variant’s untranslated title.
   */
  untranslatedTitle?: string | null;
}
```

### Image

An image resource.

* src

  The location of the image as a URL.

  ```ts
  string | null
  ```

```ts
export interface Image {
  /**
   * The location of the image as a URL.
   */
  src?: string | null;
}
```

### Product

A product is an individual item for sale in a Shopify store.

* id

  The ID of the product.

  ```ts
  string | null
  ```

* title

  The product’s title.

  ```ts
  string
  ```

* type

  The \[product type]\(https://help.shopify.com/en/manual/products/details/product-type) specified by the merchant.

  ```ts
  string | null
  ```

* untranslatedTitle

  The product’s untranslated title.

  ```ts
  string | null
  ```

* url

  The relative URL of the product.

  ```ts
  string | null
  ```

* vendor

  The product’s vendor name.

  ```ts
  string
  ```

```ts
export interface Product {
  /**
   * The ID of the product.
   */
  id?: string | null;

  /**
   * The product’s title.
   */
  title?: string;

  /**
   * The [product
   * type](https://help.shopify.com/en/manual/products/details/product-type)
   * specified by the merchant.
   */
  type?: string | null;

  /**
   * The product’s untranslated title.
   */
  untranslatedTitle?: string | null;

  /**
   * The relative URL of the product.
   */
  url?: string | null;

  /**
   * The product’s vendor name.
   */
  vendor?: string;
}
```

### Localization

Information about the active localized experience.

* country

  The country of the active localized experience.

  ```ts
  Country
  ```

* language

  The language of the active localized experience.

  ```ts
  Language
  ```

* market

  The market including the country of the active localized experience.

  ```ts
  Market
  ```

```ts
export interface Localization {
  /**
   * The country of the active localized experience.
   */
  country?: Country;

  /**
   * The language of the active localized experience.
   */
  language?: Language;

  /**
   * The market including the country of the active localized experience.
   */
  market?: Market;
}
```

### Country

A country.

* isoCode

  The ISO-3166-1 code for this country, for example, "US".

  ```ts
  string | null
  ```

```ts
export interface Country {
  /**
   * The ISO-3166-1 code for this country, for example, "US".
   */
  isoCode?: string | null;
}
```

### Language

A language.

* isoCode

  The BCP-47 language tag. It may contain a dash followed by an ISO 3166-1 alpha-2 region code, for example, "en-US".

  ```ts
  string
  ```

```ts
export interface Language {
  /**
   * The BCP-47 language tag. It may contain a dash followed by an ISO 3166-1
   * alpha-2 region code, for example, "en-US".
   */
  isoCode?: string;
}
```

### Market

A group of one or more regions of the world that a merchant is targeting for sales. To learn more about markets, refer to \[this]\(https://shopify.dev/docs/apps/markets) conceptual overview.

* handle

  A human-readable, shop-scoped identifier.

  ```ts
  string | null
  ```

* id

  A globally unique identifier.

  ```ts
  string | null
  ```

```ts
export interface Market {
  /**
   * A human-readable, shop-scoped identifier.
   */
  handle?: string | null;

  /**
   * A globally unique identifier.
   */
  id?: string | null;
}
```

### Order

An order is a customer’s completed request to purchase one or more products from a shop. An order is created when a customer completes the checkout process.

* customer

  The customer that placed the order.

  ```ts
  OrderCustomer | null
  ```

* id

  The ID of the order. ID will be null for all events except checkout\_completed.

  ```ts
  string | null
  ```

```ts
export interface Order {
  /**
   * The customer that placed the order.
   */
  customer?: OrderCustomer | null;

  /**
   * The ID of the order. ID will be null for all events except
   * checkout_completed.
   */
  id?: string | null;
}
```

### OrderCustomer

The customer that placed the order.

* id

  The ID of the customer.

  ```ts
  string | null
  ```

* isFirstOrder

  Indicates if the order is the customer’s first order. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  boolean | null
  ```

```ts
export interface OrderCustomer {
  /**
   * The ID of the customer.
   */
  id?: string | null;

  /**
   * Indicates if the order is the customer’s first order. This
   * property is only available if the shop has [upgraded to Checkout
   * Extensibility](https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  isFirstOrder?: boolean | null;
}
```

### ShippingRate

A shipping rate to be applied to a checkout.

* price

  Price of this shipping rate.

  ```ts
  MoneyV2
  ```

```ts
export interface ShippingRate {
  /**
   * Price of this shipping rate.
   */
  price?: MoneyV2;
}
```

### Transaction

A transaction associated with a checkout or order.

* amount

  The monetary value with currency allocated to the transaction method.

  ```ts
  MoneyV2
  ```

* gateway

  The name of the payment provider used for the transaction.

  ```ts
  string
  ```

* paymentMethod

  The payment method used for the transaction. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  TransactionPaymentMethod
  ```

```ts
export interface Transaction {
  /**
   * The monetary value with currency allocated to the transaction method.
   */
  amount?: MoneyV2;

  /**
   * The name of the payment provider used for the transaction.
   */
  gateway?: string;

  /**
   * The payment method used for the transaction. This property
   * is only available if the shop has [upgraded to Checkout
   * Extensibility](https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  paymentMethod?: TransactionPaymentMethod;
}
```

### TransactionPaymentMethod

The payment method used for the transaction. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

* name

  The name of the payment method used for the transaction. This may further specify the payment method used.

  ```ts
  string
  ```

* type

  The type of payment method used for the transaction. - \`creditCard\`: A vaulted or manually entered credit card. - \`redeemable\`: A redeemable payment method, such as a gift card or store credit. - \`deferred\`: A \[deferred payment]\(https://help.shopify.com/en/manual/orders/deferred-payments), such as invoicing the buyer and collecting payment later. - \`local\`: A \[local payment method]\(https://help.shopify.com/en/manual/payments/shopify-payments/local-payment-methods) specific to the current region or market. - \`manualPayment\`: A manual payment method, such as an in-person retail transaction. - \`paymentOnDelivery\`: A payment that will be collected on delivery. - \`wallet\`: An integrated wallet, such as PayPal, Google Pay, Apple Pay, etc. - \`offsite\`: A payment processed outside of Shopify's checkout, excluding integrated wallets. - \`customOnSite\`: A custom payment method that is processed through a checkout extension with a payments app. - \`other\`: Another type of payment not defined here.

  ```ts
  string
  ```

```ts
export interface TransactionPaymentMethod {
  /**
   * The name of the payment method used for the transaction. This may further
   * specify the payment method used.
   */
  name?: string;

  /**
   * The type of payment method used for the transaction.
   *
   * - `creditCard`: A vaulted or manually entered credit card.
   * - `redeemable`: A redeemable payment method, such as a gift card or store
   * credit.
   * - `deferred`: A [deferred
   * payment](https://help.shopify.com/en/manual/orders/deferred-payments), such
   * as invoicing the buyer and collecting payment later.
   * - `local`: A [local payment
   * method](https://help.shopify.com/en/manual/payments/shopify-payments/local-payment-methods) specific to the current region or market.
   * - `manualPayment`: A manual payment method, such as an in-person retail
   * transaction.
   * - `paymentOnDelivery`: A payment that will be collected on delivery.
   * - `wallet`: An integrated wallet, such as PayPal, Google Pay, Apple Pay,
   * etc.
   * - `offsite`: A payment processed outside of Shopify's checkout, excluding
   * integrated wallets.
   * - `customOnSite`: A custom payment method that is processed through a
   * checkout extension with a payments app.
   * - `other`: Another type of payment not defined here.
   */
  type?: string;
}
```

### EventType

* AdvancedDom

  ```ts
  advanced-dom
  ```

* Custom

  ```ts
  custom
  ```

* Dom

  ```ts
  dom
  ```

* Meta

  ```ts
  meta
  ```

* Standard

  ```ts
  standard
  ```

```ts
export enum EventType {
  AdvancedDom = 'advanced-dom',
  Custom = 'custom',
  Dom = 'dom',
  Meta = 'meta',
  Standard = 'standard',
}
```

Examples

### Examples

* #### Accessing Standard Events

  ##### App Pixel

  ```javascript
  import {register} from '@shopify/web-pixels-extension';

  register(({analytics}) => {
    analytics.subscribe('checkout_address_info_submitted', (event) => {
      // Example for accessing event data
      const checkout = event.data.checkout;

      const payload = {
        event_name: event.name,
        event_data: {
          addressLine1: checkout.shippingAddress?.address1,
          addressLine2: checkout.shippingAddress?.address2,
          city: checkout.shippingAddress?.city,
          country: checkout.shippingAddress?.country,
        },
      };

      // Example for sending event to third party servers
      fetch('https://example.com/pixel', {
        method: 'POST',
        body: JSON.stringify(payload),
        keepalive: true,
      });
    });
  });
  ```

  ##### Custom Pixel

  ```javascript
  analytics.subscribe('checkout_address_info_submitted', (event) => {
    // Example for accessing event data
    const checkout = event.data.checkout;

    const payload = {
      event_name: event.name,
      event_data: {
        addressLine1: checkout.shippingAddress?.address1,
        addressLine2: checkout.shippingAddress?.address2,
        city: checkout.shippingAddress?.city,
        country: checkout.shippingAddress?.country,
      },
    };

    // Example for sending event to third party servers
    fetch('https://example.com/pixel', {
      method: 'POST',
      event_data: JSON.stringify(payload),
      keepalive: true,
    });
  });
  ```

</page>

<page>
---
title: checkout_completed
description: >-
  The `checkout_completed` event logs when a visitor completes a purchase. It's
  triggered once for each checkout, typically on the **Thank you** page.
  However, for upsells and post purchases, the `checkout_completed` event is
  triggered on the first upsell offer page instead. The event isn't triggered
  again on the **Thank you** page. If the page where the event is supposed to be
  triggered fails to load, then the `checkout_completed` event isn't triggered
  at all.
api_name: web-pixels
source_url:
  html: >-
    https://shopify.dev/docs/api/web-pixels-api/standard-events/checkout_completed
  md: >-
    https://shopify.dev/docs/api/web-pixels-api/standard-events/checkout_completed.md
---

# checkout\_​completed

The `checkout_completed` event logs when a visitor completes a purchase. It's triggered once for each checkout, typically on the **Thank you** page. However, for upsells and post purchases, the `checkout_completed` event is triggered on the first upsell offer page instead. The event isn't triggered again on the **Thank you** page. If the page where the event is supposed to be triggered fails to load, then the `checkout_completed` event isn't triggered at all.

## Properties

* clientId

  string

  The client-side ID of the customer, provided by Shopify

* context

  Context

* data

  PixelEventsCheckoutCompletedData

* id

  string

  The ID of the customer event

* name

  string

  The name of the customer event

* seq

  number

  The sequence index number of the event.

* timestamp

  string

  The timestamp of when the customer event occurred, in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format

* type

  EventType.Standard

### Context

A snapshot of various read-only properties of the browser at the time of event

* document

  Snapshot of a subset of properties of the \`document\` object in the top frame of the browser

  ```ts
  WebPixelsDocument
  ```

* navigator

  Snapshot of a subset of properties of the \`navigator\` object in the top frame of the browser

  ```ts
  WebPixelsNavigator
  ```

* window

  Snapshot of a subset of properties of the \`window\` object in the top frame of the browser

  ```ts
  WebPixelsWindow
  ```

```ts
export interface Context {
  /**
   * Snapshot of a subset of properties of the `document` object in the top
   * frame of the browser
   */
  document?: WebPixelsDocument;

  /**
   * Snapshot of a subset of properties of the `navigator` object in the top
   * frame of the browser
   */
  navigator?: WebPixelsNavigator;

  /**
   * Snapshot of a subset of properties of the `window` object in the top frame
   * of the browser
   */
  window?: WebPixelsWindow;
}
```

### WebPixelsDocument

A snapshot of a subset of properties of the \`document\` object in the top frame of the browser

* characterSet

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the character set being used by the document

  ```ts
  string
  ```

* location

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the URI of the current document

  ```ts
  Location
  ```

* referrer

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the URI of the page that linked to this page

  ```ts
  string
  ```

* title

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the title of the current document

  ```ts
  string
  ```

```ts
export interface WebPixelsDocument {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the character set being used by the document
   */
  characterSet?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the URI of the current document
   */
  location?: Location;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the URI of the page that linked to this page
   */
  referrer?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the title of the current document
   */
  title?: string;
}
```

### Location

A snapshot of a subset of properties of the \`location\` object in the top frame of the browser

* hash

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing a \`'#'\` followed by the fragment identifier of the URL

  ```ts
  string
  ```

* host

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the host, that is the hostname, a \`':'\`, and the port of the URL

  ```ts
  string
  ```

* hostname

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the domain of the URL

  ```ts
  string
  ```

* href

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the entire URL

  ```ts
  string
  ```

* origin

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the canonical form of the origin of the specific location

  ```ts
  string
  ```

* pathname

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing an initial \`'/'\` followed by the path of the URL, not including the query string or fragment

  ```ts
  string
  ```

* port

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the port number of the URL

  ```ts
  string
  ```

* protocol

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the protocol scheme of the URL, including the final \`':'\`

  ```ts
  string
  ```

* search

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing a \`'?'\` followed by the parameters or "querystring" of the URL

  ```ts
  string
  ```

```ts
export interface Location {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing a `'#'` followed by the fragment identifier of the URL
   */
  hash?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the host, that is the hostname, a `':'`, and the port of
   * the URL
   */
  host?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the domain of the URL
   */
  hostname?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the entire URL
   */
  href?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the canonical form of the origin of the specific location
   */
  origin?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing an initial `'/'` followed by the path of the URL, not
   * including the query string or fragment
   */
  pathname?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the port number of the URL
   */
  port?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the protocol scheme of the URL, including the final `':'`
   */
  protocol?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing a `'?'` followed by the parameters or "querystring" of
   * the URL
   */
  search?: string;
}
```

### WebPixelsNavigator

A snapshot of a subset of properties of the \`navigator\` object in the top frame of the browser

* cookieEnabled

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns \`false\` if setting a cookie will be ignored and true otherwise

  ```ts
  boolean
  ```

* language

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns a string representing the preferred language of the user, usually the language of the browser UI. The \`null\` value is returned when this is unknown

  ```ts
  string
  ```

* languages

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns an array of strings representing the languages known to the user, by order of preference

  ```ts
  ReadonlyArray<string>
  ```

* userAgent

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns the user agent string for the current browser

  ```ts
  string
  ```

```ts
export interface WebPixelsNavigator {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns `false` if setting a cookie will be ignored and true otherwise
   */
  cookieEnabled?: boolean;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns a string representing the preferred language of the user, usually
   * the language of the browser UI. The `null` value is returned when this
   * is unknown
   */
  language?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns an array of strings representing the languages known to the user,
   * by order of preference
   */
  languages?: ReadonlyArray<string>;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns the user agent string for the current browser
   */
  userAgent?: string;
}
```

### WebPixelsWindow

A snapshot of a subset of properties of the \`window\` object in the top frame of the browser

* innerHeight

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the height of the content area of the browser window including, if rendered, the horizontal scrollbar

  ```ts
  number
  ```

* innerWidth

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the width of the content area of the browser window including, if rendered, the vertical scrollbar

  ```ts
  number
  ```

* location

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the location, or current URL, of the window object

  ```ts
  Location
  ```

* origin

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the global object's origin, serialized as a string

  ```ts
  string
  ```

* outerHeight

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the height of the outside of the browser window

  ```ts
  number
  ```

* outerWidth

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the width of the outside of the browser window

  ```ts
  number
  ```

* pageXOffset

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), an alias for window\.scrollX

  ```ts
  number
  ```

* pageYOffset

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), an alias for window\.scrollY

  ```ts
  number
  ```

* screen

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Screen), the interface representing a screen, usually the one on which the current window is being rendered

  ```ts
  Screen
  ```

* screenX

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the horizontal distance from the left border of the user's browser viewport to the left side of the screen

  ```ts
  number
  ```

* screenY

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the vertical distance from the top border of the user's browser viewport to the top side of the screen

  ```ts
  number
  ```

* scrollX

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the number of pixels that the document has already been scrolled horizontally

  ```ts
  number
  ```

* scrollY

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the number of pixels that the document has already been scrolled vertically

  ```ts
  number
  ```

```ts
export interface WebPixelsWindow {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window),
   * gets the height of the content area of the browser window including, if
   * rendered, the horizontal scrollbar
   */
  innerHeight?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), gets
   * the width of the content area of the browser window including, if rendered,
   * the vertical scrollbar
   */
  innerWidth?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * location, or current URL, of the window object
   */
  location?: Location;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * global object's origin, serialized as a string
   */
  origin?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), gets
   * the height of the outside of the browser window
   */
  outerHeight?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), gets
   * the width of the outside of the browser window
   */
  outerWidth?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), an
   * alias for window.scrollX
   */
  pageXOffset?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), an
   * alias for window.scrollY
   */
  pageYOffset?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen), the
   * interface representing a screen, usually the one on which the current
   * window is being rendered
   */
  screen?: Screen;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * horizontal distance from the left border of the user's browser viewport to
   * the left side of the screen
   */
  screenX?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * vertical distance from the top border of the user's browser viewport to the
   * top side of the screen
   */
  screenY?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * number of pixels that the document has already been scrolled horizontally
   */
  scrollX?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * number of pixels that the document has already been scrolled vertically
   */
  scrollY?: number;
}
```

### Screen

The interface representing a screen, usually the one on which the current window is being rendered

* height

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Screen/height), the height of the screen

  ```ts
  number
  ```

* width

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Screen/width), the width of the screen

  ```ts
  number
  ```

```ts
export interface Screen {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen/height),
   * the height of the screen
   */
  height?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen/width),
   * the width of the screen
   */
  width?: number;
}
```

### PixelEventsCheckoutCompletedData

* checkout

  ```ts
  Checkout
  ```

```ts
export interface PixelEventsCheckoutCompletedData {
  checkout?: Checkout;
}
```

### Checkout

A container for all the information required to add items to checkout and pay.

* attributes

  A list of attributes accumulated throughout the checkout process.

  ```ts
  Attribute[]
  ```

* billingAddress

  The billing address to where the order will be charged.

  ```ts
  MailingAddress | null
  ```

* buyerAcceptsEmailMarketing

  Indicates whether the customer has consented to be sent marketing material via email. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  boolean
  ```

* buyerAcceptsSmsMarketing

  Indicates whether the customer has consented to be sent marketing material via SMS. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  boolean
  ```

* currencyCode

  The three-letter code that represents the currency, for example, USD. Supported codes include standard ISO 4217 codes, legacy codes, and non- standard codes.

  ```ts
  string | null
  ```

* delivery

  Represents the selected delivery options for a checkout. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  Delivery | null
  ```

* discountApplications

  A list of discount applications.

  ```ts
  DiscountApplication[]
  ```

* discountsAmount

  The total amount of the discounts applied to the price of the checkout. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  MoneyV2 | null
  ```

* email

  The email attached to this checkout.

  ```ts
  string | null
  ```

* lineItems

  A list of line item objects, each one containing information about an item in the checkout.

  ```ts
  CheckoutLineItem[]
  ```

* localization

  Information about the active localized experience. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  Localization
  ```

* order

  The resulting order from a paid checkout.

  ```ts
  Order | null
  ```

* phone

  A unique phone number for the customer. Formatted using E.164 standard. For example, \*+16135551111\*.

  ```ts
  string | null
  ```

* shippingAddress

  The shipping address to where the line items will be shipped.

  ```ts
  MailingAddress | null
  ```

* shippingLine

  Once a shipping rate is selected by the customer it is transitioned to a \`shipping\_line\` object.

  ```ts
  ShippingRate | null
  ```

* smsMarketingPhone

  The phone number provided by the buyer after opting in to SMS marketing. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  string | null
  ```

* subtotalPrice

  The price at checkout before duties, shipping, and taxes.

  ```ts
  MoneyV2 | null
  ```

* token

  A unique identifier for a particular checkout.

  ```ts
  string | null
  ```

* totalPrice

  The sum of all the prices of all the items in the checkout, including duties, taxes, and discounts.

  ```ts
  MoneyV2 | null
  ```

* totalTax

  The sum of all the taxes applied to the line items and shipping lines in the checkout.

  ```ts
  MoneyV2
  ```

* transactions

  A list of transactions associated with a checkout or order. Certain transactions, such as credit card transactions, may only be present in the checkout\_completed event.

  ```ts
  Transaction[]
  ```

```ts
export interface Checkout {
  /**
   * A list of attributes accumulated throughout the checkout process.
   */
  attributes?: Attribute[];

  /**
   * The billing address to where the order will be charged.
   */
  billingAddress?: MailingAddress | null;

  /**
   * Indicates whether the customer has consented to be sent marketing material
   * via email. This property is only available if the shop has [upgraded
   * to Checkout Extensibility](https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  buyerAcceptsEmailMarketing?: boolean;

  /**
   * Indicates whether the customer has consented to be sent marketing material
   * via SMS. This property is only available if the shop has [upgraded to
   * Checkout Extensibility](https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  buyerAcceptsSmsMarketing?: boolean;

  /**
   * The three-letter code that represents the currency, for example, USD.
   * Supported codes include standard ISO 4217 codes, legacy codes, and non-
   * standard codes.
   */
  currencyCode?: string | null;

  /**
   * Represents the selected delivery options for a checkout. This
   * property is only available if the shop has [upgraded to Checkout
   * Extensibility](https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  delivery?: Delivery | null;

  /**
   * A list of discount applications.
   */
  discountApplications?: DiscountApplication[];

  /**
   * The total amount of the discounts applied to the price of the checkout.
   * This property is only available if the shop has [upgraded to Checkout
   * Extensibility](https://help.shopify.com/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  discountsAmount?: MoneyV2 | null;

  /**
   * The email attached to this checkout.
   */
  email?: string | null;

  /**
   * A list of line item objects, each one containing information about an item
   * in the checkout.
   */
  lineItems?: CheckoutLineItem[];

  /**
   * Information about the active localized experience. This
   * property is only available if the shop has [upgraded to Checkout
   * Extensibility](https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  localization?: Localization;

  /**
   * The resulting order from a paid checkout.
   */
  order?: Order | null;

  /**
   * A unique phone number for the customer. Formatted using E.164 standard. For
   * example, *+16135551111*.
   */
  phone?: string | null;

  /**
   * The shipping address to where the line items will be shipped.
   */
  shippingAddress?: MailingAddress | null;

  /**
   * Once a shipping rate is selected by the customer it is transitioned to a
   * `shipping_line` object.
   */
  shippingLine?: ShippingRate | null;

  /**
   * The phone number provided by the buyer after opting in to SMS
   * marketing. This property is only available if the shop has [upgraded
   * to Checkout Extensibility](https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  smsMarketingPhone?: string | null;

  /**
   * The price at checkout before duties, shipping, and taxes.
   */
  subtotalPrice?: MoneyV2 | null;

  /**
   * A unique identifier for a particular checkout.
   */
  token?: string | null;

  /**
   * The sum of all the prices of all the items in the checkout, including
   * duties, taxes, and discounts.
   */
  totalPrice?: MoneyV2 | null;

  /**
   * The sum of all the taxes applied to the line items and shipping lines in
   * the checkout.
   */
  totalTax?: MoneyV2;

  /**
   * A list of transactions associated with a checkout or order. Certain
   * transactions, such as credit card transactions, may only be present in the
   * checkout_completed event.
   */
  transactions?: Transaction[];
}
```

### Attribute

Custom attributes associated with the cart or checkout.

* key

  The key for the attribute.

  ```ts
  string
  ```

* value

  The value for the attribute.

  ```ts
  string
  ```

```ts
export interface Attribute {
  /**
   * The key for the attribute.
   */
  key?: string;

  /**
   * The value for the attribute.
   */
  value?: string;
}
```

### MailingAddress

A mailing address for customers and shipping.

* address1

  The first line of the address. This is usually the street address or a P.O. Box number.

  ```ts
  string | null
  ```

* address2

  The second line of the address. This is usually an apartment, suite, or unit number.

  ```ts
  string | null
  ```

* city

  The name of the city, district, village, or town.

  ```ts
  string | null
  ```

* country

  The name of the country.

  ```ts
  string | null
  ```

* countryCode

  The two-letter code that represents the country, for example, US. The country codes generally follows ISO 3166-1 alpha-2 guidelines.

  ```ts
  string | null
  ```

* firstName

  The customer’s first name.

  ```ts
  string | null
  ```

* lastName

  The customer’s last name.

  ```ts
  string | null
  ```

* phone

  The phone number for this mailing address as entered by the customer.

  ```ts
  string | null
  ```

* province

  The region of the address, such as the province, state, or district.

  ```ts
  string | null
  ```

* provinceCode

  The two-letter code for the region. For example, ON.

  ```ts
  string | null
  ```

* zip

  The ZIP or postal code of the address.

  ```ts
  string | null
  ```

```ts
export interface MailingAddress {
  /**
   * The first line of the address. This is usually the street address or a P.O.
   * Box number.
   */
  address1?: string | null;

  /**
   * The second line of the address. This is usually an apartment, suite, or
   * unit number.
   */
  address2?: string | null;

  /**
   * The name of the city, district, village, or town.
   */
  city?: string | null;

  /**
   * The name of the country.
   */
  country?: string | null;

  /**
   * The two-letter code that represents the country, for example, US.
   * The country codes generally follows ISO 3166-1 alpha-2 guidelines.
   */
  countryCode?: string | null;

  /**
   * The customer’s first name.
   */
  firstName?: string | null;

  /**
   * The customer’s last name.
   */
  lastName?: string | null;

  /**
   * The phone number for this mailing address as entered by the customer.
   */
  phone?: string | null;

  /**
   * The region of the address, such as the province, state, or district.
   */
  province?: string | null;

  /**
   * The two-letter code for the region.
   * For example, ON.
   */
  provinceCode?: string | null;

  /**
   * The ZIP or postal code of the address.
   */
  zip?: string | null;
}
```

### Delivery

The delivery information for the event.

* selectedDeliveryOptions

  The selected delivery options for the event.

  ```ts
  DeliveryOption[]
  ```

```ts
export interface Delivery {
  /**
   * The selected delivery options for the event.
   */
  selectedDeliveryOptions?: DeliveryOption[];
}
```

### DeliveryOption

Represents a delivery option that the customer can choose from.

* cost

  The cost of the delivery option.

  ```ts
  MoneyV2 | null
  ```

* costAfterDiscounts

  The cost of the delivery option after discounts have been applied.

  ```ts
  MoneyV2 | null
  ```

* description

  The description of the delivery option.

  ```ts
  string | null
  ```

* handle

  The unique identifier of the delivery option.

  ```ts
  string
  ```

* title

  The title of the delivery option.

  ```ts
  string | null
  ```

* type

  The type of delivery option. - \`pickup\` - \`pickupPoint\` - \`shipping\` - \`local\`

  ```ts
  string
  ```

```ts
export interface DeliveryOption {
  /**
   * The cost of the delivery option.
   */
  cost?: MoneyV2 | null;

  /**
   * The cost of the delivery option after discounts have been applied.
   */
  costAfterDiscounts?: MoneyV2 | null;

  /**
   * The description of the delivery option.
   */
  description?: string | null;

  /**
   * The unique identifier of the delivery option.
   */
  handle?: string;

  /**
   * The title of the delivery option.
   */
  title?: string | null;

  /**
   * The type of delivery option.
   *
   * - `pickup`
   * - `pickupPoint`
   * - `shipping`
   * - `local`
   */
  type?: string;
}
```

### MoneyV2

A monetary value with currency.

* amount

  The decimal money amount.

  ```ts
  number
  ```

* currencyCode

  The three-letter code that represents the currency, for example, USD. Supported codes include standard ISO 4217 codes, legacy codes, and non- standard codes.

  ```ts
  string
  ```

```ts
export interface MoneyV2 {
  /**
   * The decimal money amount.
   */
  amount?: number;

  /**
   * The three-letter code that represents the currency, for example, USD.
   * Supported codes include standard ISO 4217 codes, legacy codes, and non-
   * standard codes.
   */
  currencyCode?: string;
}
```

### DiscountApplication

The information about the intent of the discount.

* allocationMethod

  The method by which the discount's value is applied to its entitled items. - \`ACROSS\`: The value is spread across all entitled lines. - \`EACH\`: The value is applied onto every entitled line.

  ```ts
  string
  ```

* targetSelection

  How the discount amount is distributed on the discounted lines. - \`ALL\`: The discount is allocated onto all the lines. - \`ENTITLED\`: The discount is allocated onto only the lines that it's entitled for. - \`EXPLICIT\`: The discount is allocated onto explicitly chosen lines.

  ```ts
  string
  ```

* targetType

  The type of line (i.e. line item or shipping line) on an order that the discount is applicable towards. - \`LINE\_ITEM\`: The discount applies onto line items. - \`SHIPPING\_LINE\`: The discount applies onto shipping lines.

  ```ts
  string
  ```

* title

  The customer-facing name of the discount. If the type of discount is a \`DISCOUNT\_CODE\`, this \`title\` attribute represents the code of the discount.

  ```ts
  string
  ```

* type

  The type of the discount. - \`AUTOMATIC\`: A discount automatically at checkout or in the cart without the need for a code. - \`DISCOUNT\_CODE\`: A discount applied onto checkouts through the use of a code. - \`MANUAL\`: A discount that is applied to an order by a merchant or store owner manually, rather than being automatically applied by the system or through a script. - \`SCRIPT\`: A discount applied to a customer's order using a script

  ```ts
  string
  ```

* value

  The value of the discount. Fixed discounts return a \`Money\` Object, while Percentage discounts return a \`PricingPercentageValue\` object.

  ```ts
  MoneyV2 | PricingPercentageValue
  ```

```ts
export interface DiscountApplication {
  /**
   * The method by which the discount's value is applied to its entitled items.
   *
   * - `ACROSS`: The value is spread across all entitled lines.
   * - `EACH`: The value is applied onto every entitled line.
   */
  allocationMethod?: string;

  /**
   * How the discount amount is distributed on the discounted lines.
   *
   * - `ALL`: The discount is allocated onto all the lines.
   * - `ENTITLED`: The discount is allocated onto only the lines that it's
   * entitled for.
   * - `EXPLICIT`: The discount is allocated onto explicitly chosen lines.
   */
  targetSelection?: string;

  /**
   * The type of line (i.e. line item or shipping line) on an order that the
   * discount is applicable towards.
   *
   * - `LINE_ITEM`: The discount applies onto line items.
   * - `SHIPPING_LINE`: The discount applies onto shipping lines.
   */
  targetType?: string;

  /**
   * The customer-facing name of the discount. If the type of discount is
   * a `DISCOUNT_CODE`, this `title` attribute represents the code of the
   * discount.
   */
  title?: string;

  /**
   * The type of the discount.
   *
   * - `AUTOMATIC`: A discount automatically at checkout or in the cart without
   * the need for a code.
   * - `DISCOUNT_CODE`: A discount applied onto checkouts through the use of
   * a code.
   * - `MANUAL`: A discount that is applied to an order by a merchant or store
   * owner manually, rather than being automatically applied by the system or
   * through a script.
   * - `SCRIPT`: A discount applied to a customer's order using a script
   */
  type?: string;

  /**
   * The value of the discount. Fixed discounts return a `Money` Object, while
   * Percentage discounts return a `PricingPercentageValue` object.
   */
  value?: MoneyV2 | PricingPercentageValue;
}
```

### PricingPercentageValue

A value given to a customer when a discount is applied to an order. The application of a discount with this value gives the customer the specified percentage off a specified item.

* percentage

  The percentage value of the object.

  ```ts
  number
  ```

```ts
export interface PricingPercentageValue {
  /**
   * The percentage value of the object.
   */
  percentage?: number;
}
```

### CheckoutLineItem

A single line item in the checkout, grouped by variant and attributes.

* discountAllocations

  The discounts that have been applied to the checkout line item by a discount application.

  ```ts
  DiscountAllocation[]
  ```

* finalLinePrice

  The combined price of all of the items in the line item after line-level discounts have been applied. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  MoneyV2
  ```

* id

  A globally unique identifier.

  ```ts
  string | null
  ```

* properties

  The properties of the line item. A shop may add, or enable customers to add custom information to a line item. Line item properties consist of a key and value pair. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  Property[]
  ```

* quantity

  The quantity of the line item.

  ```ts
  number
  ```

* sellingPlanAllocation

  The selling plan associated with the line item and the effect that each selling plan has on variants when they're purchased. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  SellingPlanAllocation | null
  ```

* title

  The title of the line item. Defaults to the product's title.

  ```ts
  string | null
  ```

* variant

  Product variant of the line item.

  ```ts
  ProductVariant | null
  ```

```ts
export interface CheckoutLineItem {
  /**
   * The discounts that have been applied to the checkout line item by a
   * discount application.
   */
  discountAllocations?: DiscountAllocation[];

  /**
   * The combined price of all of the items in the line item
   * after line-level discounts have been applied. This property
   * is only available if the shop has [upgraded to Checkout
   * Extensibility](https://help.shopify.com/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  finalLinePrice?: MoneyV2;

  /**
   * A globally unique identifier.
   */
  id?: string | null;

  /**
   * The properties of the line item. A shop may add, or enable customers to add
   * custom information to a line item. Line item properties consist of a key
   * and value pair. This property is only available if the shop has [upgraded
   * to Checkout Extensibility](https://help.shopify.com/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  properties?: Property[];

  /**
   * The quantity of the line item.
   */
  quantity?: number;

  /**
   * The selling plan associated with the line item and the effect that
   * each selling plan has on variants when they're purchased. This
   * property is only available if the shop has [upgraded to Checkout
   * Extensibility](https://help.shopify.com/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  sellingPlanAllocation?: SellingPlanAllocation | null;

  /**
   * The title of the line item. Defaults to the product's title.
   */
  title?: string | null;

  /**
   * Product variant of the line item.
   */
  variant?: ProductVariant | null;
}
```

### DiscountAllocation

The discount that has been applied to the checkout line item.

* amount

  The monetary value with currency allocated to the discount.

  ```ts
  MoneyV2
  ```

* discountApplication

  The information about the intent of the discount.

  ```ts
  DiscountApplication
  ```

```ts
export interface DiscountAllocation {
  /**
   * The monetary value with currency allocated to the discount.
   */
  amount?: MoneyV2;

  /**
   * The information about the intent of the discount.
   */
  discountApplication?: DiscountApplication;
}
```

### Property

The line item additional custom properties.

* key

  The key for the property.

  ```ts
  string
  ```

* value

  The value for the property.

  ```ts
  string
  ```

```ts
export interface Property {
  /**
   * The key for the property.
   */
  key?: string;

  /**
   * The value for the property.
   */
  value?: string;
}
```

### SellingPlanAllocation

Represents an association between a variant and a selling plan.

* sellingPlan

  A representation of how products and variants can be sold and purchased. For example, an individual selling plan could be '6 weeks of prepaid granola, delivered weekly'.

  ```ts
  SellingPlan
  ```

```ts
export interface SellingPlanAllocation {
  /**
   * A representation of how products and variants can be sold and purchased.
   * For example, an individual selling plan could be '6 weeks of prepaid
   * granola, delivered weekly'.
   */
  sellingPlan?: SellingPlan;
}
```

### SellingPlan

Represents how products and variants can be sold and purchased.

* id

  A globally unique identifier.

  ```ts
  string
  ```

* name

  The name of the selling plan. For example, '6 weeks of prepaid granola, delivered weekly'.

  ```ts
  string
  ```

```ts
export interface SellingPlan {
  /**
   * A globally unique identifier.
   */
  id?: string;

  /**
   * The name of the selling plan. For example, '6 weeks of prepaid granola,
   * delivered weekly'.
   */
  name?: string;
}
```

### ProductVariant

A product variant represents a different version of a product, such as differing sizes or differing colors.

* id

  A globally unique identifier.

  ```ts
  string | null
  ```

* image

  Image associated with the product variant. This field falls back to the product image if no image is available.

  ```ts
  Image | null
  ```

* price

  The product variant’s price.

  ```ts
  MoneyV2
  ```

* product

  The product object that the product variant belongs to.

  ```ts
  Product
  ```

* sku

  The SKU (stock keeping unit) associated with the variant.

  ```ts
  string | null
  ```

* title

  The product variant’s title.

  ```ts
  string | null
  ```

* untranslatedTitle

  The product variant’s untranslated title.

  ```ts
  string | null
  ```

```ts
export interface ProductVariant {
  /**
   * A globally unique identifier.
   */
  id?: string | null;

  /**
   * Image associated with the product variant. This field falls back to the
   * product image if no image is available.
   */
  image?: Image | null;

  /**
   * The product variant’s price.
   */
  price?: MoneyV2;

  /**
   * The product object that the product variant belongs to.
   */
  product?: Product;

  /**
   * The SKU (stock keeping unit) associated with the variant.
   */
  sku?: string | null;

  /**
   * The product variant’s title.
   */
  title?: string | null;

  /**
   * The product variant’s untranslated title.
   */
  untranslatedTitle?: string | null;
}
```

### Image

An image resource.

* src

  The location of the image as a URL.

  ```ts
  string | null
  ```

```ts
export interface Image {
  /**
   * The location of the image as a URL.
   */
  src?: string | null;
}
```

### Product

A product is an individual item for sale in a Shopify store.

* id

  The ID of the product.

  ```ts
  string | null
  ```

* title

  The product’s title.

  ```ts
  string
  ```

* type

  The \[product type]\(https://help.shopify.com/en/manual/products/details/product-type) specified by the merchant.

  ```ts
  string | null
  ```

* untranslatedTitle

  The product’s untranslated title.

  ```ts
  string | null
  ```

* url

  The relative URL of the product.

  ```ts
  string | null
  ```

* vendor

  The product’s vendor name.

  ```ts
  string
  ```

```ts
export interface Product {
  /**
   * The ID of the product.
   */
  id?: string | null;

  /**
   * The product’s title.
   */
  title?: string;

  /**
   * The [product
   * type](https://help.shopify.com/en/manual/products/details/product-type)
   * specified by the merchant.
   */
  type?: string | null;

  /**
   * The product’s untranslated title.
   */
  untranslatedTitle?: string | null;

  /**
   * The relative URL of the product.
   */
  url?: string | null;

  /**
   * The product’s vendor name.
   */
  vendor?: string;
}
```

### Localization

Information about the active localized experience.

* country

  The country of the active localized experience.

  ```ts
  Country
  ```

* language

  The language of the active localized experience.

  ```ts
  Language
  ```

* market

  The market including the country of the active localized experience.

  ```ts
  Market
  ```

```ts
export interface Localization {
  /**
   * The country of the active localized experience.
   */
  country?: Country;

  /**
   * The language of the active localized experience.
   */
  language?: Language;

  /**
   * The market including the country of the active localized experience.
   */
  market?: Market;
}
```

### Country

A country.

* isoCode

  The ISO-3166-1 code for this country, for example, "US".

  ```ts
  string | null
  ```

```ts
export interface Country {
  /**
   * The ISO-3166-1 code for this country, for example, "US".
   */
  isoCode?: string | null;
}
```

### Language

A language.

* isoCode

  The BCP-47 language tag. It may contain a dash followed by an ISO 3166-1 alpha-2 region code, for example, "en-US".

  ```ts
  string
  ```

```ts
export interface Language {
  /**
   * The BCP-47 language tag. It may contain a dash followed by an ISO 3166-1
   * alpha-2 region code, for example, "en-US".
   */
  isoCode?: string;
}
```

### Market

A group of one or more regions of the world that a merchant is targeting for sales. To learn more about markets, refer to \[this]\(https://shopify.dev/docs/apps/markets) conceptual overview.

* handle

  A human-readable, shop-scoped identifier.

  ```ts
  string | null
  ```

* id

  A globally unique identifier.

  ```ts
  string | null
  ```

```ts
export interface Market {
  /**
   * A human-readable, shop-scoped identifier.
   */
  handle?: string | null;

  /**
   * A globally unique identifier.
   */
  id?: string | null;
}
```

### Order

An order is a customer’s completed request to purchase one or more products from a shop. An order is created when a customer completes the checkout process.

* customer

  The customer that placed the order.

  ```ts
  OrderCustomer | null
  ```

* id

  The ID of the order. ID will be null for all events except checkout\_completed.

  ```ts
  string | null
  ```

```ts
export interface Order {
  /**
   * The customer that placed the order.
   */
  customer?: OrderCustomer | null;

  /**
   * The ID of the order. ID will be null for all events except
   * checkout_completed.
   */
  id?: string | null;
}
```

### OrderCustomer

The customer that placed the order.

* id

  The ID of the customer.

  ```ts
  string | null
  ```

* isFirstOrder

  Indicates if the order is the customer’s first order. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  boolean | null
  ```

```ts
export interface OrderCustomer {
  /**
   * The ID of the customer.
   */
  id?: string | null;

  /**
   * Indicates if the order is the customer’s first order. This
   * property is only available if the shop has [upgraded to Checkout
   * Extensibility](https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  isFirstOrder?: boolean | null;
}
```

### ShippingRate

A shipping rate to be applied to a checkout.

* price

  Price of this shipping rate.

  ```ts
  MoneyV2
  ```

```ts
export interface ShippingRate {
  /**
   * Price of this shipping rate.
   */
  price?: MoneyV2;
}
```

### Transaction

A transaction associated with a checkout or order.

* amount

  The monetary value with currency allocated to the transaction method.

  ```ts
  MoneyV2
  ```

* gateway

  The name of the payment provider used for the transaction.

  ```ts
  string
  ```

* paymentMethod

  The payment method used for the transaction. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  TransactionPaymentMethod
  ```

```ts
export interface Transaction {
  /**
   * The monetary value with currency allocated to the transaction method.
   */
  amount?: MoneyV2;

  /**
   * The name of the payment provider used for the transaction.
   */
  gateway?: string;

  /**
   * The payment method used for the transaction. This property
   * is only available if the shop has [upgraded to Checkout
   * Extensibility](https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  paymentMethod?: TransactionPaymentMethod;
}
```

### TransactionPaymentMethod

The payment method used for the transaction. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

* name

  The name of the payment method used for the transaction. This may further specify the payment method used.

  ```ts
  string
  ```

* type

  The type of payment method used for the transaction. - \`creditCard\`: A vaulted or manually entered credit card. - \`redeemable\`: A redeemable payment method, such as a gift card or store credit. - \`deferred\`: A \[deferred payment]\(https://help.shopify.com/en/manual/orders/deferred-payments), such as invoicing the buyer and collecting payment later. - \`local\`: A \[local payment method]\(https://help.shopify.com/en/manual/payments/shopify-payments/local-payment-methods) specific to the current region or market. - \`manualPayment\`: A manual payment method, such as an in-person retail transaction. - \`paymentOnDelivery\`: A payment that will be collected on delivery. - \`wallet\`: An integrated wallet, such as PayPal, Google Pay, Apple Pay, etc. - \`offsite\`: A payment processed outside of Shopify's checkout, excluding integrated wallets. - \`customOnSite\`: A custom payment method that is processed through a checkout extension with a payments app. - \`other\`: Another type of payment not defined here.

  ```ts
  string
  ```

```ts
export interface TransactionPaymentMethod {
  /**
   * The name of the payment method used for the transaction. This may further
   * specify the payment method used.
   */
  name?: string;

  /**
   * The type of payment method used for the transaction.
   *
   * - `creditCard`: A vaulted or manually entered credit card.
   * - `redeemable`: A redeemable payment method, such as a gift card or store
   * credit.
   * - `deferred`: A [deferred
   * payment](https://help.shopify.com/en/manual/orders/deferred-payments), such
   * as invoicing the buyer and collecting payment later.
   * - `local`: A [local payment
   * method](https://help.shopify.com/en/manual/payments/shopify-payments/local-payment-methods) specific to the current region or market.
   * - `manualPayment`: A manual payment method, such as an in-person retail
   * transaction.
   * - `paymentOnDelivery`: A payment that will be collected on delivery.
   * - `wallet`: An integrated wallet, such as PayPal, Google Pay, Apple Pay,
   * etc.
   * - `offsite`: A payment processed outside of Shopify's checkout, excluding
   * integrated wallets.
   * - `customOnSite`: A custom payment method that is processed through a
   * checkout extension with a payments app.
   * - `other`: Another type of payment not defined here.
   */
  type?: string;
}
```

### EventType

* AdvancedDom

  ```ts
  advanced-dom
  ```

* Custom

  ```ts
  custom
  ```

* Dom

  ```ts
  dom
  ```

* Meta

  ```ts
  meta
  ```

* Standard

  ```ts
  standard
  ```

```ts
export enum EventType {
  AdvancedDom = 'advanced-dom',
  Custom = 'custom',
  Dom = 'dom',
  Meta = 'meta',
  Standard = 'standard',
}
```

Examples

### Examples

* #### Accessing Standard Events

  ##### App Pixel

  ```javascript
  import {register} from '@shopify/web-pixels-extension';

  register(({analytics}) => {
    analytics.subscribe('checkout_completed', (event) => {
      // Example for accessing event data
      const checkout = event.data.checkout;

      const checkoutTotalPrice = checkout.totalPrice?.amount;

      const allDiscountCodes = checkout.discountApplications.map((discount) => {
        if (discount.type === 'DISCOUNT_CODE') {
          return discount.title;
        }
      });

      const firstItem = checkout.lineItems[0];

      const firstItemDiscountedValue = firstItem.discountAllocations[0]?.amount;

      const customItemPayload = {
        quantity: firstItem.quantity,
        title: firstItem.title,
        discount: firstItemDiscountedValue,
      };

      const paymentTransactions = event.data.checkout.transactions.map((transaction) => {
        return {
            paymentGateway: transaction.gateway,
            amount: transaction.amount,
          };
      });

      const payload = {
        event_name: event.name,
        event_data: {
          totalPrice: checkoutTotalPrice,
          discountCodesUsed: allDiscountCodes,
          firstItem: customItemPayload,
          paymentTransactions: paymentTransactions,
        },
      };

      // Example for sending event data to third party servers
      fetch('https://example.com/pixel', {
        method: 'POST',
        body: JSON.stringify(payload),
        keepalive: true,
      });
    });
  });
  ```

  ##### Custom Pixel

  ```javascript
  analytics.subscribe('checkout_completed', (event) => {
    // Example for accessing event data
    const checkout = event.data.checkout;

    const checkoutTotalPrice = checkout.totalPrice?.amount;

    const allDiscountCodes = checkout.discountApplications.map((discount) => {
      if (discount.type === 'DISCOUNT_CODE') {
        return discount.title;
      }
    });

    const firstItem = checkout.lineItems[0];

    const firstItemDiscountedValue = firstItem.discountAllocations[0]?.amount;

    const customItemPayload = {
      quantity: firstItem.quantity,
      title: firstItem.title,
      discount: firstItemDiscountedValue,
    };

    const paymentTransactions = event.data.checkout.transactions.map((transaction) => {
      return {
          paymentGateway: transaction.gateway,
          amount: transaction.amount,
        };
    });

    const payload = {
      event_name: event.name,
      event_data: {
        totalPrice: checkoutTotalPrice,
        discountCodesUsed: allDiscountCodes,
        firstItem: customItemPayload,
        paymentTransactions: paymentTransactions,
      },
    };

    // Example for sending event data to third party servers
    fetch('https://example.com/pixel', {
      method: 'POST',
      body: JSON.stringify(payload),
      keepalive: true,
    });
  });
  ```

</page>

<page>
---
title: checkout_contact_info_submitted
description: >-
  The `checkout_contact_info_submitted` event logs an instance where a customer
  submits a checkout form. This event is only available in checkouts where
  Checkout Extensibility for customizations is enabled
api_name: web-pixels
source_url:
  html: >-
    https://shopify.dev/docs/api/web-pixels-api/standard-events/checkout_contact_info_submitted
  md: >-
    https://shopify.dev/docs/api/web-pixels-api/standard-events/checkout_contact_info_submitted.md
---

# checkout\_​contact\_​info\_​submitted

The `checkout_contact_info_submitted` event logs an instance where a customer submits a checkout form. This event is only available in checkouts where Checkout Extensibility for customizations is enabled

## Properties

* clientId

  string

  The client-side ID of the customer, provided by Shopify

* context

  Context

* data

  PixelEventsCheckoutContactInfoSubmittedData

* id

  string

  The ID of the customer event

* name

  string

  The name of the customer event

* seq

  number

  The sequence index number of the event.

* timestamp

  string

  The timestamp of when the customer event occurred, in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format

* type

  EventType.Standard

### Context

A snapshot of various read-only properties of the browser at the time of event

* document

  Snapshot of a subset of properties of the \`document\` object in the top frame of the browser

  ```ts
  WebPixelsDocument
  ```

* navigator

  Snapshot of a subset of properties of the \`navigator\` object in the top frame of the browser

  ```ts
  WebPixelsNavigator
  ```

* window

  Snapshot of a subset of properties of the \`window\` object in the top frame of the browser

  ```ts
  WebPixelsWindow
  ```

```ts
export interface Context {
  /**
   * Snapshot of a subset of properties of the `document` object in the top
   * frame of the browser
   */
  document?: WebPixelsDocument;

  /**
   * Snapshot of a subset of properties of the `navigator` object in the top
   * frame of the browser
   */
  navigator?: WebPixelsNavigator;

  /**
   * Snapshot of a subset of properties of the `window` object in the top frame
   * of the browser
   */
  window?: WebPixelsWindow;
}
```

### WebPixelsDocument

A snapshot of a subset of properties of the \`document\` object in the top frame of the browser

* characterSet

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the character set being used by the document

  ```ts
  string
  ```

* location

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the URI of the current document

  ```ts
  Location
  ```

* referrer

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the URI of the page that linked to this page

  ```ts
  string
  ```

* title

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the title of the current document

  ```ts
  string
  ```

```ts
export interface WebPixelsDocument {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the character set being used by the document
   */
  characterSet?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the URI of the current document
   */
  location?: Location;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the URI of the page that linked to this page
   */
  referrer?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the title of the current document
   */
  title?: string;
}
```

### Location

A snapshot of a subset of properties of the \`location\` object in the top frame of the browser

* hash

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing a \`'#'\` followed by the fragment identifier of the URL

  ```ts
  string
  ```

* host

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the host, that is the hostname, a \`':'\`, and the port of the URL

  ```ts
  string
  ```

* hostname

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the domain of the URL

  ```ts
  string
  ```

* href

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the entire URL

  ```ts
  string
  ```

* origin

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the canonical form of the origin of the specific location

  ```ts
  string
  ```

* pathname

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing an initial \`'/'\` followed by the path of the URL, not including the query string or fragment

  ```ts
  string
  ```

* port

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the port number of the URL

  ```ts
  string
  ```

* protocol

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the protocol scheme of the URL, including the final \`':'\`

  ```ts
  string
  ```

* search

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing a \`'?'\` followed by the parameters or "querystring" of the URL

  ```ts
  string
  ```

```ts
export interface Location {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing a `'#'` followed by the fragment identifier of the URL
   */
  hash?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the host, that is the hostname, a `':'`, and the port of
   * the URL
   */
  host?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the domain of the URL
   */
  hostname?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the entire URL
   */
  href?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the canonical form of the origin of the specific location
   */
  origin?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing an initial `'/'` followed by the path of the URL, not
   * including the query string or fragment
   */
  pathname?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the port number of the URL
   */
  port?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the protocol scheme of the URL, including the final `':'`
   */
  protocol?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing a `'?'` followed by the parameters or "querystring" of
   * the URL
   */
  search?: string;
}
```

### WebPixelsNavigator

A snapshot of a subset of properties of the \`navigator\` object in the top frame of the browser

* cookieEnabled

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns \`false\` if setting a cookie will be ignored and true otherwise

  ```ts
  boolean
  ```

* language

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns a string representing the preferred language of the user, usually the language of the browser UI. The \`null\` value is returned when this is unknown

  ```ts
  string
  ```

* languages

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns an array of strings representing the languages known to the user, by order of preference

  ```ts
  ReadonlyArray<string>
  ```

* userAgent

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns the user agent string for the current browser

  ```ts
  string
  ```

```ts
export interface WebPixelsNavigator {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns `false` if setting a cookie will be ignored and true otherwise
   */
  cookieEnabled?: boolean;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns a string representing the preferred language of the user, usually
   * the language of the browser UI. The `null` value is returned when this
   * is unknown
   */
  language?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns an array of strings representing the languages known to the user,
   * by order of preference
   */
  languages?: ReadonlyArray<string>;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns the user agent string for the current browser
   */
  userAgent?: string;
}
```

### WebPixelsWindow

A snapshot of a subset of properties of the \`window\` object in the top frame of the browser

* innerHeight

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the height of the content area of the browser window including, if rendered, the horizontal scrollbar

  ```ts
  number
  ```

* innerWidth

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the width of the content area of the browser window including, if rendered, the vertical scrollbar

  ```ts
  number
  ```

* location

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the location, or current URL, of the window object

  ```ts
  Location
  ```

* origin

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the global object's origin, serialized as a string

  ```ts
  string
  ```

* outerHeight

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the height of the outside of the browser window

  ```ts
  number
  ```

* outerWidth

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the width of the outside of the browser window

  ```ts
  number
  ```

* pageXOffset

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), an alias for window\.scrollX

  ```ts
  number
  ```

* pageYOffset

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), an alias for window\.scrollY

  ```ts
  number
  ```

* screen

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Screen), the interface representing a screen, usually the one on which the current window is being rendered

  ```ts
  Screen
  ```

* screenX

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the horizontal distance from the left border of the user's browser viewport to the left side of the screen

  ```ts
  number
  ```

* screenY

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the vertical distance from the top border of the user's browser viewport to the top side of the screen

  ```ts
  number
  ```

* scrollX

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the number of pixels that the document has already been scrolled horizontally

  ```ts
  number
  ```

* scrollY

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the number of pixels that the document has already been scrolled vertically

  ```ts
  number
  ```

```ts
export interface WebPixelsWindow {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window),
   * gets the height of the content area of the browser window including, if
   * rendered, the horizontal scrollbar
   */
  innerHeight?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), gets
   * the width of the content area of the browser window including, if rendered,
   * the vertical scrollbar
   */
  innerWidth?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * location, or current URL, of the window object
   */
  location?: Location;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * global object's origin, serialized as a string
   */
  origin?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), gets
   * the height of the outside of the browser window
   */
  outerHeight?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), gets
   * the width of the outside of the browser window
   */
  outerWidth?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), an
   * alias for window.scrollX
   */
  pageXOffset?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), an
   * alias for window.scrollY
   */
  pageYOffset?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen), the
   * interface representing a screen, usually the one on which the current
   * window is being rendered
   */
  screen?: Screen;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * horizontal distance from the left border of the user's browser viewport to
   * the left side of the screen
   */
  screenX?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * vertical distance from the top border of the user's browser viewport to the
   * top side of the screen
   */
  screenY?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * number of pixels that the document has already been scrolled horizontally
   */
  scrollX?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * number of pixels that the document has already been scrolled vertically
   */
  scrollY?: number;
}
```

### Screen

The interface representing a screen, usually the one on which the current window is being rendered

* height

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Screen/height), the height of the screen

  ```ts
  number
  ```

* width

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Screen/width), the width of the screen

  ```ts
  number
  ```

```ts
export interface Screen {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen/height),
   * the height of the screen
   */
  height?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen/width),
   * the width of the screen
   */
  width?: number;
}
```

### PixelEventsCheckoutContactInfoSubmittedData

* checkout

  ```ts
  Checkout
  ```

```ts
export interface PixelEventsCheckoutContactInfoSubmittedData {
  checkout?: Checkout;
}
```

### Checkout

A container for all the information required to add items to checkout and pay.

* attributes

  A list of attributes accumulated throughout the checkout process.

  ```ts
  Attribute[]
  ```

* billingAddress

  The billing address to where the order will be charged.

  ```ts
  MailingAddress | null
  ```

* buyerAcceptsEmailMarketing

  Indicates whether the customer has consented to be sent marketing material via email. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  boolean
  ```

* buyerAcceptsSmsMarketing

  Indicates whether the customer has consented to be sent marketing material via SMS. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  boolean
  ```

* currencyCode

  The three-letter code that represents the currency, for example, USD. Supported codes include standard ISO 4217 codes, legacy codes, and non- standard codes.

  ```ts
  string | null
  ```

* delivery

  Represents the selected delivery options for a checkout. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  Delivery | null
  ```

* discountApplications

  A list of discount applications.

  ```ts
  DiscountApplication[]
  ```

* discountsAmount

  The total amount of the discounts applied to the price of the checkout. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  MoneyV2 | null
  ```

* email

  The email attached to this checkout.

  ```ts
  string | null
  ```

* lineItems

  A list of line item objects, each one containing information about an item in the checkout.

  ```ts
  CheckoutLineItem[]
  ```

* localization

  Information about the active localized experience. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  Localization
  ```

* order

  The resulting order from a paid checkout.

  ```ts
  Order | null
  ```

* phone

  A unique phone number for the customer. Formatted using E.164 standard. For example, \*+16135551111\*.

  ```ts
  string | null
  ```

* shippingAddress

  The shipping address to where the line items will be shipped.

  ```ts
  MailingAddress | null
  ```

* shippingLine

  Once a shipping rate is selected by the customer it is transitioned to a \`shipping\_line\` object.

  ```ts
  ShippingRate | null
  ```

* smsMarketingPhone

  The phone number provided by the buyer after opting in to SMS marketing. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  string | null
  ```

* subtotalPrice

  The price at checkout before duties, shipping, and taxes.

  ```ts
  MoneyV2 | null
  ```

* token

  A unique identifier for a particular checkout.

  ```ts
  string | null
  ```

* totalPrice

  The sum of all the prices of all the items in the checkout, including duties, taxes, and discounts.

  ```ts
  MoneyV2 | null
  ```

* totalTax

  The sum of all the taxes applied to the line items and shipping lines in the checkout.

  ```ts
  MoneyV2
  ```

* transactions

  A list of transactions associated with a checkout or order. Certain transactions, such as credit card transactions, may only be present in the checkout\_completed event.

  ```ts
  Transaction[]
  ```

```ts
export interface Checkout {
  /**
   * A list of attributes accumulated throughout the checkout process.
   */
  attributes?: Attribute[];

  /**
   * The billing address to where the order will be charged.
   */
  billingAddress?: MailingAddress | null;

  /**
   * Indicates whether the customer has consented to be sent marketing material
   * via email. This property is only available if the shop has [upgraded
   * to Checkout Extensibility](https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  buyerAcceptsEmailMarketing?: boolean;

  /**
   * Indicates whether the customer has consented to be sent marketing material
   * via SMS. This property is only available if the shop has [upgraded to
   * Checkout Extensibility](https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  buyerAcceptsSmsMarketing?: boolean;

  /**
   * The three-letter code that represents the currency, for example, USD.
   * Supported codes include standard ISO 4217 codes, legacy codes, and non-
   * standard codes.
   */
  currencyCode?: string | null;

  /**
   * Represents the selected delivery options for a checkout. This
   * property is only available if the shop has [upgraded to Checkout
   * Extensibility](https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  delivery?: Delivery | null;

  /**
   * A list of discount applications.
   */
  discountApplications?: DiscountApplication[];

  /**
   * The total amount of the discounts applied to the price of the checkout.
   * This property is only available if the shop has [upgraded to Checkout
   * Extensibility](https://help.shopify.com/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  discountsAmount?: MoneyV2 | null;

  /**
   * The email attached to this checkout.
   */
  email?: string | null;

  /**
   * A list of line item objects, each one containing information about an item
   * in the checkout.
   */
  lineItems?: CheckoutLineItem[];

  /**
   * Information about the active localized experience. This
   * property is only available if the shop has [upgraded to Checkout
   * Extensibility](https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  localization?: Localization;

  /**
   * The resulting order from a paid checkout.
   */
  order?: Order | null;

  /**
   * A unique phone number for the customer. Formatted using E.164 standard. For
   * example, *+16135551111*.
   */
  phone?: string | null;

  /**
   * The shipping address to where the line items will be shipped.
   */
  shippingAddress?: MailingAddress | null;

  /**
   * Once a shipping rate is selected by the customer it is transitioned to a
   * `shipping_line` object.
   */
  shippingLine?: ShippingRate | null;

  /**
   * The phone number provided by the buyer after opting in to SMS
   * marketing. This property is only available if the shop has [upgraded
   * to Checkout Extensibility](https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  smsMarketingPhone?: string | null;

  /**
   * The price at checkout before duties, shipping, and taxes.
   */
  subtotalPrice?: MoneyV2 | null;

  /**
   * A unique identifier for a particular checkout.
   */
  token?: string | null;

  /**
   * The sum of all the prices of all the items in the checkout, including
   * duties, taxes, and discounts.
   */
  totalPrice?: MoneyV2 | null;

  /**
   * The sum of all the taxes applied to the line items and shipping lines in
   * the checkout.
   */
  totalTax?: MoneyV2;

  /**
   * A list of transactions associated with a checkout or order. Certain
   * transactions, such as credit card transactions, may only be present in the
   * checkout_completed event.
   */
  transactions?: Transaction[];
}
```

### Attribute

Custom attributes associated with the cart or checkout.

* key

  The key for the attribute.

  ```ts
  string
  ```

* value

  The value for the attribute.

  ```ts
  string
  ```

```ts
export interface Attribute {
  /**
   * The key for the attribute.
   */
  key?: string;

  /**
   * The value for the attribute.
   */
  value?: string;
}
```

### MailingAddress

A mailing address for customers and shipping.

* address1

  The first line of the address. This is usually the street address or a P.O. Box number.

  ```ts
  string | null
  ```

* address2

  The second line of the address. This is usually an apartment, suite, or unit number.

  ```ts
  string | null
  ```

* city

  The name of the city, district, village, or town.

  ```ts
  string | null
  ```

* country

  The name of the country.

  ```ts
  string | null
  ```

* countryCode

  The two-letter code that represents the country, for example, US. The country codes generally follows ISO 3166-1 alpha-2 guidelines.

  ```ts
  string | null
  ```

* firstName

  The customer’s first name.

  ```ts
  string | null
  ```

* lastName

  The customer’s last name.

  ```ts
  string | null
  ```

* phone

  The phone number for this mailing address as entered by the customer.

  ```ts
  string | null
  ```

* province

  The region of the address, such as the province, state, or district.

  ```ts
  string | null
  ```

* provinceCode

  The two-letter code for the region. For example, ON.

  ```ts
  string | null
  ```

* zip

  The ZIP or postal code of the address.

  ```ts
  string | null
  ```

```ts
export interface MailingAddress {
  /**
   * The first line of the address. This is usually the street address or a P.O.
   * Box number.
   */
  address1?: string | null;

  /**
   * The second line of the address. This is usually an apartment, suite, or
   * unit number.
   */
  address2?: string | null;

  /**
   * The name of the city, district, village, or town.
   */
  city?: string | null;

  /**
   * The name of the country.
   */
  country?: string | null;

  /**
   * The two-letter code that represents the country, for example, US.
   * The country codes generally follows ISO 3166-1 alpha-2 guidelines.
   */
  countryCode?: string | null;

  /**
   * The customer’s first name.
   */
  firstName?: string | null;

  /**
   * The customer’s last name.
   */
  lastName?: string | null;

  /**
   * The phone number for this mailing address as entered by the customer.
   */
  phone?: string | null;

  /**
   * The region of the address, such as the province, state, or district.
   */
  province?: string | null;

  /**
   * The two-letter code for the region.
   * For example, ON.
   */
  provinceCode?: string | null;

  /**
   * The ZIP or postal code of the address.
   */
  zip?: string | null;
}
```

### Delivery

The delivery information for the event.

* selectedDeliveryOptions

  The selected delivery options for the event.

  ```ts
  DeliveryOption[]
  ```

```ts
export interface Delivery {
  /**
   * The selected delivery options for the event.
   */
  selectedDeliveryOptions?: DeliveryOption[];
}
```

### DeliveryOption

Represents a delivery option that the customer can choose from.

* cost

  The cost of the delivery option.

  ```ts
  MoneyV2 | null
  ```

* costAfterDiscounts

  The cost of the delivery option after discounts have been applied.

  ```ts
  MoneyV2 | null
  ```

* description

  The description of the delivery option.

  ```ts
  string | null
  ```

* handle

  The unique identifier of the delivery option.

  ```ts
  string
  ```

* title

  The title of the delivery option.

  ```ts
  string | null
  ```

* type

  The type of delivery option. - \`pickup\` - \`pickupPoint\` - \`shipping\` - \`local\`

  ```ts
  string
  ```

```ts
export interface DeliveryOption {
  /**
   * The cost of the delivery option.
   */
  cost?: MoneyV2 | null;

  /**
   * The cost of the delivery option after discounts have been applied.
   */
  costAfterDiscounts?: MoneyV2 | null;

  /**
   * The description of the delivery option.
   */
  description?: string | null;

  /**
   * The unique identifier of the delivery option.
   */
  handle?: string;

  /**
   * The title of the delivery option.
   */
  title?: string | null;

  /**
   * The type of delivery option.
   *
   * - `pickup`
   * - `pickupPoint`
   * - `shipping`
   * - `local`
   */
  type?: string;
}
```

### MoneyV2

A monetary value with currency.

* amount

  The decimal money amount.

  ```ts
  number
  ```

* currencyCode

  The three-letter code that represents the currency, for example, USD. Supported codes include standard ISO 4217 codes, legacy codes, and non- standard codes.

  ```ts
  string
  ```

```ts
export interface MoneyV2 {
  /**
   * The decimal money amount.
   */
  amount?: number;

  /**
   * The three-letter code that represents the currency, for example, USD.
   * Supported codes include standard ISO 4217 codes, legacy codes, and non-
   * standard codes.
   */
  currencyCode?: string;
}
```

### DiscountApplication

The information about the intent of the discount.

* allocationMethod

  The method by which the discount's value is applied to its entitled items. - \`ACROSS\`: The value is spread across all entitled lines. - \`EACH\`: The value is applied onto every entitled line.

  ```ts
  string
  ```

* targetSelection

  How the discount amount is distributed on the discounted lines. - \`ALL\`: The discount is allocated onto all the lines. - \`ENTITLED\`: The discount is allocated onto only the lines that it's entitled for. - \`EXPLICIT\`: The discount is allocated onto explicitly chosen lines.

  ```ts
  string
  ```

* targetType

  The type of line (i.e. line item or shipping line) on an order that the discount is applicable towards. - \`LINE\_ITEM\`: The discount applies onto line items. - \`SHIPPING\_LINE\`: The discount applies onto shipping lines.

  ```ts
  string
  ```

* title

  The customer-facing name of the discount. If the type of discount is a \`DISCOUNT\_CODE\`, this \`title\` attribute represents the code of the discount.

  ```ts
  string
  ```

* type

  The type of the discount. - \`AUTOMATIC\`: A discount automatically at checkout or in the cart without the need for a code. - \`DISCOUNT\_CODE\`: A discount applied onto checkouts through the use of a code. - \`MANUAL\`: A discount that is applied to an order by a merchant or store owner manually, rather than being automatically applied by the system or through a script. - \`SCRIPT\`: A discount applied to a customer's order using a script

  ```ts
  string
  ```

* value

  The value of the discount. Fixed discounts return a \`Money\` Object, while Percentage discounts return a \`PricingPercentageValue\` object.

  ```ts
  MoneyV2 | PricingPercentageValue
  ```

```ts
export interface DiscountApplication {
  /**
   * The method by which the discount's value is applied to its entitled items.
   *
   * - `ACROSS`: The value is spread across all entitled lines.
   * - `EACH`: The value is applied onto every entitled line.
   */
  allocationMethod?: string;

  /**
   * How the discount amount is distributed on the discounted lines.
   *
   * - `ALL`: The discount is allocated onto all the lines.
   * - `ENTITLED`: The discount is allocated onto only the lines that it's
   * entitled for.
   * - `EXPLICIT`: The discount is allocated onto explicitly chosen lines.
   */
  targetSelection?: string;

  /**
   * The type of line (i.e. line item or shipping line) on an order that the
   * discount is applicable towards.
   *
   * - `LINE_ITEM`: The discount applies onto line items.
   * - `SHIPPING_LINE`: The discount applies onto shipping lines.
   */
  targetType?: string;

  /**
   * The customer-facing name of the discount. If the type of discount is
   * a `DISCOUNT_CODE`, this `title` attribute represents the code of the
   * discount.
   */
  title?: string;

  /**
   * The type of the discount.
   *
   * - `AUTOMATIC`: A discount automatically at checkout or in the cart without
   * the need for a code.
   * - `DISCOUNT_CODE`: A discount applied onto checkouts through the use of
   * a code.
   * - `MANUAL`: A discount that is applied to an order by a merchant or store
   * owner manually, rather than being automatically applied by the system or
   * through a script.
   * - `SCRIPT`: A discount applied to a customer's order using a script
   */
  type?: string;

  /**
   * The value of the discount. Fixed discounts return a `Money` Object, while
   * Percentage discounts return a `PricingPercentageValue` object.
   */
  value?: MoneyV2 | PricingPercentageValue;
}
```

### PricingPercentageValue

A value given to a customer when a discount is applied to an order. The application of a discount with this value gives the customer the specified percentage off a specified item.

* percentage

  The percentage value of the object.

  ```ts
  number
  ```

```ts
export interface PricingPercentageValue {
  /**
   * The percentage value of the object.
   */
  percentage?: number;
}
```

### CheckoutLineItem

A single line item in the checkout, grouped by variant and attributes.

* discountAllocations

  The discounts that have been applied to the checkout line item by a discount application.

  ```ts
  DiscountAllocation[]
  ```

* finalLinePrice

  The combined price of all of the items in the line item after line-level discounts have been applied. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  MoneyV2
  ```

* id

  A globally unique identifier.

  ```ts
  string | null
  ```

* properties

  The properties of the line item. A shop may add, or enable customers to add custom information to a line item. Line item properties consist of a key and value pair. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  Property[]
  ```

* quantity

  The quantity of the line item.

  ```ts
  number
  ```

* sellingPlanAllocation

  The selling plan associated with the line item and the effect that each selling plan has on variants when they're purchased. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  SellingPlanAllocation | null
  ```

* title

  The title of the line item. Defaults to the product's title.

  ```ts
  string | null
  ```

* variant

  Product variant of the line item.

  ```ts
  ProductVariant | null
  ```

```ts
export interface CheckoutLineItem {
  /**
   * The discounts that have been applied to the checkout line item by a
   * discount application.
   */
  discountAllocations?: DiscountAllocation[];

  /**
   * The combined price of all of the items in the line item
   * after line-level discounts have been applied. This property
   * is only available if the shop has [upgraded to Checkout
   * Extensibility](https://help.shopify.com/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  finalLinePrice?: MoneyV2;

  /**
   * A globally unique identifier.
   */
  id?: string | null;

  /**
   * The properties of the line item. A shop may add, or enable customers to add
   * custom information to a line item. Line item properties consist of a key
   * and value pair. This property is only available if the shop has [upgraded
   * to Checkout Extensibility](https://help.shopify.com/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  properties?: Property[];

  /**
   * The quantity of the line item.
   */
  quantity?: number;

  /**
   * The selling plan associated with the line item and the effect that
   * each selling plan has on variants when they're purchased. This
   * property is only available if the shop has [upgraded to Checkout
   * Extensibility](https://help.shopify.com/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  sellingPlanAllocation?: SellingPlanAllocation | null;

  /**
   * The title of the line item. Defaults to the product's title.
   */
  title?: string | null;

  /**
   * Product variant of the line item.
   */
  variant?: ProductVariant | null;
}
```

### DiscountAllocation

The discount that has been applied to the checkout line item.

* amount

  The monetary value with currency allocated to the discount.

  ```ts
  MoneyV2
  ```

* discountApplication

  The information about the intent of the discount.

  ```ts
  DiscountApplication
  ```

```ts
export interface DiscountAllocation {
  /**
   * The monetary value with currency allocated to the discount.
   */
  amount?: MoneyV2;

  /**
   * The information about the intent of the discount.
   */
  discountApplication?: DiscountApplication;
}
```

### Property

The line item additional custom properties.

* key

  The key for the property.

  ```ts
  string
  ```

* value

  The value for the property.

  ```ts
  string
  ```

```ts
export interface Property {
  /**
   * The key for the property.
   */
  key?: string;

  /**
   * The value for the property.
   */
  value?: string;
}
```

### SellingPlanAllocation

Represents an association between a variant and a selling plan.

* sellingPlan

  A representation of how products and variants can be sold and purchased. For example, an individual selling plan could be '6 weeks of prepaid granola, delivered weekly'.

  ```ts
  SellingPlan
  ```

```ts
export interface SellingPlanAllocation {
  /**
   * A representation of how products and variants can be sold and purchased.
   * For example, an individual selling plan could be '6 weeks of prepaid
   * granola, delivered weekly'.
   */
  sellingPlan?: SellingPlan;
}
```

### SellingPlan

Represents how products and variants can be sold and purchased.

* id

  A globally unique identifier.

  ```ts
  string
  ```

* name

  The name of the selling plan. For example, '6 weeks of prepaid granola, delivered weekly'.

  ```ts
  string
  ```

```ts
export interface SellingPlan {
  /**
   * A globally unique identifier.
   */
  id?: string;

  /**
   * The name of the selling plan. For example, '6 weeks of prepaid granola,
   * delivered weekly'.
   */
  name?: string;
}
```

### ProductVariant

A product variant represents a different version of a product, such as differing sizes or differing colors.

* id

  A globally unique identifier.

  ```ts
  string | null
  ```

* image

  Image associated with the product variant. This field falls back to the product image if no image is available.

  ```ts
  Image | null
  ```

* price

  The product variant’s price.

  ```ts
  MoneyV2
  ```

* product

  The product object that the product variant belongs to.

  ```ts
  Product
  ```

* sku

  The SKU (stock keeping unit) associated with the variant.

  ```ts
  string | null
  ```

* title

  The product variant’s title.

  ```ts
  string | null
  ```

* untranslatedTitle

  The product variant’s untranslated title.

  ```ts
  string | null
  ```

```ts
export interface ProductVariant {
  /**
   * A globally unique identifier.
   */
  id?: string | null;

  /**
   * Image associated with the product variant. This field falls back to the
   * product image if no image is available.
   */
  image?: Image | null;

  /**
   * The product variant’s price.
   */
  price?: MoneyV2;

  /**
   * The product object that the product variant belongs to.
   */
  product?: Product;

  /**
   * The SKU (stock keeping unit) associated with the variant.
   */
  sku?: string | null;

  /**
   * The product variant’s title.
   */
  title?: string | null;

  /**
   * The product variant’s untranslated title.
   */
  untranslatedTitle?: string | null;
}
```

### Image

An image resource.

* src

  The location of the image as a URL.

  ```ts
  string | null
  ```

```ts
export interface Image {
  /**
   * The location of the image as a URL.
   */
  src?: string | null;
}
```

### Product

A product is an individual item for sale in a Shopify store.

* id

  The ID of the product.

  ```ts
  string | null
  ```

* title

  The product’s title.

  ```ts
  string
  ```

* type

  The \[product type]\(https://help.shopify.com/en/manual/products/details/product-type) specified by the merchant.

  ```ts
  string | null
  ```

* untranslatedTitle

  The product’s untranslated title.

  ```ts
  string | null
  ```

* url

  The relative URL of the product.

  ```ts
  string | null
  ```

* vendor

  The product’s vendor name.

  ```ts
  string
  ```

```ts
export interface Product {
  /**
   * The ID of the product.
   */
  id?: string | null;

  /**
   * The product’s title.
   */
  title?: string;

  /**
   * The [product
   * type](https://help.shopify.com/en/manual/products/details/product-type)
   * specified by the merchant.
   */
  type?: string | null;

  /**
   * The product’s untranslated title.
   */
  untranslatedTitle?: string | null;

  /**
   * The relative URL of the product.
   */
  url?: string | null;

  /**
   * The product’s vendor name.
   */
  vendor?: string;
}
```

### Localization

Information about the active localized experience.

* country

  The country of the active localized experience.

  ```ts
  Country
  ```

* language

  The language of the active localized experience.

  ```ts
  Language
  ```

* market

  The market including the country of the active localized experience.

  ```ts
  Market
  ```

```ts
export interface Localization {
  /**
   * The country of the active localized experience.
   */
  country?: Country;

  /**
   * The language of the active localized experience.
   */
  language?: Language;

  /**
   * The market including the country of the active localized experience.
   */
  market?: Market;
}
```

### Country

A country.

* isoCode

  The ISO-3166-1 code for this country, for example, "US".

  ```ts
  string | null
  ```

```ts
export interface Country {
  /**
   * The ISO-3166-1 code for this country, for example, "US".
   */
  isoCode?: string | null;
}
```

### Language

A language.

* isoCode

  The BCP-47 language tag. It may contain a dash followed by an ISO 3166-1 alpha-2 region code, for example, "en-US".

  ```ts
  string
  ```

```ts
export interface Language {
  /**
   * The BCP-47 language tag. It may contain a dash followed by an ISO 3166-1
   * alpha-2 region code, for example, "en-US".
   */
  isoCode?: string;
}
```

### Market

A group of one or more regions of the world that a merchant is targeting for sales. To learn more about markets, refer to \[this]\(https://shopify.dev/docs/apps/markets) conceptual overview.

* handle

  A human-readable, shop-scoped identifier.

  ```ts
  string | null
  ```

* id

  A globally unique identifier.

  ```ts
  string | null
  ```

```ts
export interface Market {
  /**
   * A human-readable, shop-scoped identifier.
   */
  handle?: string | null;

  /**
   * A globally unique identifier.
   */
  id?: string | null;
}
```

### Order

An order is a customer’s completed request to purchase one or more products from a shop. An order is created when a customer completes the checkout process.

* customer

  The customer that placed the order.

  ```ts
  OrderCustomer | null
  ```

* id

  The ID of the order. ID will be null for all events except checkout\_completed.

  ```ts
  string | null
  ```

```ts
export interface Order {
  /**
   * The customer that placed the order.
   */
  customer?: OrderCustomer | null;

  /**
   * The ID of the order. ID will be null for all events except
   * checkout_completed.
   */
  id?: string | null;
}
```

### OrderCustomer

The customer that placed the order.

* id

  The ID of the customer.

  ```ts
  string | null
  ```

* isFirstOrder

  Indicates if the order is the customer’s first order. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  boolean | null
  ```

```ts
export interface OrderCustomer {
  /**
   * The ID of the customer.
   */
  id?: string | null;

  /**
   * Indicates if the order is the customer’s first order. This
   * property is only available if the shop has [upgraded to Checkout
   * Extensibility](https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  isFirstOrder?: boolean | null;
}
```

### ShippingRate

A shipping rate to be applied to a checkout.

* price

  Price of this shipping rate.

  ```ts
  MoneyV2
  ```

```ts
export interface ShippingRate {
  /**
   * Price of this shipping rate.
   */
  price?: MoneyV2;
}
```

### Transaction

A transaction associated with a checkout or order.

* amount

  The monetary value with currency allocated to the transaction method.

  ```ts
  MoneyV2
  ```

* gateway

  The name of the payment provider used for the transaction.

  ```ts
  string
  ```

* paymentMethod

  The payment method used for the transaction. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  TransactionPaymentMethod
  ```

```ts
export interface Transaction {
  /**
   * The monetary value with currency allocated to the transaction method.
   */
  amount?: MoneyV2;

  /**
   * The name of the payment provider used for the transaction.
   */
  gateway?: string;

  /**
   * The payment method used for the transaction. This property
   * is only available if the shop has [upgraded to Checkout
   * Extensibility](https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  paymentMethod?: TransactionPaymentMethod;
}
```

### TransactionPaymentMethod

The payment method used for the transaction. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

* name

  The name of the payment method used for the transaction. This may further specify the payment method used.

  ```ts
  string
  ```

* type

  The type of payment method used for the transaction. - \`creditCard\`: A vaulted or manually entered credit card. - \`redeemable\`: A redeemable payment method, such as a gift card or store credit. - \`deferred\`: A \[deferred payment]\(https://help.shopify.com/en/manual/orders/deferred-payments), such as invoicing the buyer and collecting payment later. - \`local\`: A \[local payment method]\(https://help.shopify.com/en/manual/payments/shopify-payments/local-payment-methods) specific to the current region or market. - \`manualPayment\`: A manual payment method, such as an in-person retail transaction. - \`paymentOnDelivery\`: A payment that will be collected on delivery. - \`wallet\`: An integrated wallet, such as PayPal, Google Pay, Apple Pay, etc. - \`offsite\`: A payment processed outside of Shopify's checkout, excluding integrated wallets. - \`customOnSite\`: A custom payment method that is processed through a checkout extension with a payments app. - \`other\`: Another type of payment not defined here.

  ```ts
  string
  ```

```ts
export interface TransactionPaymentMethod {
  /**
   * The name of the payment method used for the transaction. This may further
   * specify the payment method used.
   */
  name?: string;

  /**
   * The type of payment method used for the transaction.
   *
   * - `creditCard`: A vaulted or manually entered credit card.
   * - `redeemable`: A redeemable payment method, such as a gift card or store
   * credit.
   * - `deferred`: A [deferred
   * payment](https://help.shopify.com/en/manual/orders/deferred-payments), such
   * as invoicing the buyer and collecting payment later.
   * - `local`: A [local payment
   * method](https://help.shopify.com/en/manual/payments/shopify-payments/local-payment-methods) specific to the current region or market.
   * - `manualPayment`: A manual payment method, such as an in-person retail
   * transaction.
   * - `paymentOnDelivery`: A payment that will be collected on delivery.
   * - `wallet`: An integrated wallet, such as PayPal, Google Pay, Apple Pay,
   * etc.
   * - `offsite`: A payment processed outside of Shopify's checkout, excluding
   * integrated wallets.
   * - `customOnSite`: A custom payment method that is processed through a
   * checkout extension with a payments app.
   * - `other`: Another type of payment not defined here.
   */
  type?: string;
}
```

### EventType

* AdvancedDom

  ```ts
  advanced-dom
  ```

* Custom

  ```ts
  custom
  ```

* Dom

  ```ts
  dom
  ```

* Meta

  ```ts
  meta
  ```

* Standard

  ```ts
  standard
  ```

```ts
export enum EventType {
  AdvancedDom = 'advanced-dom',
  Custom = 'custom',
  Dom = 'dom',
  Meta = 'meta',
  Standard = 'standard',
}
```

Examples

### Examples

* #### Accessing Standard Events

  ##### App Pixel

  ```javascript
  import {register} from '@shopify/web-pixels-extension';

  register(({analytics}) => {
    analytics.subscribe('checkout_contact_info_submitted', (event) => {
      // Example for accessing event data
      const checkout = event.data.checkout;

      const email = checkout.email;
      const phone = checkout.phone;

      const payload = {
        event_name: event.name,
        event_data: {
          email: email,
          phone: phone,
        },
      };

      // Example for sending event data to third party servers
      fetch('https://example.com/pixel', {
        method: 'POST',
        body: JSON.stringify(payload),
        keepalive: true,
      });
    });
  });
  ```

  ##### Custom Pixel

  ```javascript
  analytics.subscribe('checkout_contact_info_submitted', (event) => {
    // Example for accessing event data
    const checkout = event.data.checkout;

    const email = checkout.email;
    const phone = checkout.phone;

    const payload = {
      event_name: event.name,
      event_data: {
        email: email,
        phone: phone,
      },
    };

    // Example for sending event data to third party servers
    fetch('https://example.com/pixel', {
      method: 'POST',
      body: JSON.stringify(payload),
      keepalive: true,
    });
  });
  ```

</page>

<page>
---
title: checkout_shipping_info_submitted
description: >-
  The `checkout_shipping_info_submitted` event logs an instance where the
  customer chooses a shipping rate. This event is only available in checkouts
  where Checkout Extensibility for customizations is enabled
api_name: web-pixels
source_url:
  html: >-
    https://shopify.dev/docs/api/web-pixels-api/standard-events/checkout_shipping_info_submitted
  md: >-
    https://shopify.dev/docs/api/web-pixels-api/standard-events/checkout_shipping_info_submitted.md
---

# checkout\_​shipping\_​info\_​submitted

The `checkout_shipping_info_submitted` event logs an instance where the customer chooses a shipping rate. This event is only available in checkouts where Checkout Extensibility for customizations is enabled

## Properties

* clientId

  string

  The client-side ID of the customer, provided by Shopify

* context

  Context

* data

  PixelEventsCheckoutShippingInfoSubmittedData

* id

  string

  The ID of the customer event

* name

  string

  The name of the customer event

* seq

  number

  The sequence index number of the event.

* timestamp

  string

  The timestamp of when the customer event occurred, in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format

* type

  EventType.Standard

### Context

A snapshot of various read-only properties of the browser at the time of event

* document

  Snapshot of a subset of properties of the \`document\` object in the top frame of the browser

  ```ts
  WebPixelsDocument
  ```

* navigator

  Snapshot of a subset of properties of the \`navigator\` object in the top frame of the browser

  ```ts
  WebPixelsNavigator
  ```

* window

  Snapshot of a subset of properties of the \`window\` object in the top frame of the browser

  ```ts
  WebPixelsWindow
  ```

```ts
export interface Context {
  /**
   * Snapshot of a subset of properties of the `document` object in the top
   * frame of the browser
   */
  document?: WebPixelsDocument;

  /**
   * Snapshot of a subset of properties of the `navigator` object in the top
   * frame of the browser
   */
  navigator?: WebPixelsNavigator;

  /**
   * Snapshot of a subset of properties of the `window` object in the top frame
   * of the browser
   */
  window?: WebPixelsWindow;
}
```

### WebPixelsDocument

A snapshot of a subset of properties of the \`document\` object in the top frame of the browser

* characterSet

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the character set being used by the document

  ```ts
  string
  ```

* location

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the URI of the current document

  ```ts
  Location
  ```

* referrer

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the URI of the page that linked to this page

  ```ts
  string
  ```

* title

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the title of the current document

  ```ts
  string
  ```

```ts
export interface WebPixelsDocument {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the character set being used by the document
   */
  characterSet?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the URI of the current document
   */
  location?: Location;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the URI of the page that linked to this page
   */
  referrer?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the title of the current document
   */
  title?: string;
}
```

### Location

A snapshot of a subset of properties of the \`location\` object in the top frame of the browser

* hash

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing a \`'#'\` followed by the fragment identifier of the URL

  ```ts
  string
  ```

* host

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the host, that is the hostname, a \`':'\`, and the port of the URL

  ```ts
  string
  ```

* hostname

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the domain of the URL

  ```ts
  string
  ```

* href

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the entire URL

  ```ts
  string
  ```

* origin

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the canonical form of the origin of the specific location

  ```ts
  string
  ```

* pathname

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing an initial \`'/'\` followed by the path of the URL, not including the query string or fragment

  ```ts
  string
  ```

* port

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the port number of the URL

  ```ts
  string
  ```

* protocol

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the protocol scheme of the URL, including the final \`':'\`

  ```ts
  string
  ```

* search

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing a \`'?'\` followed by the parameters or "querystring" of the URL

  ```ts
  string
  ```

```ts
export interface Location {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing a `'#'` followed by the fragment identifier of the URL
   */
  hash?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the host, that is the hostname, a `':'`, and the port of
   * the URL
   */
  host?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the domain of the URL
   */
  hostname?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the entire URL
   */
  href?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the canonical form of the origin of the specific location
   */
  origin?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing an initial `'/'` followed by the path of the URL, not
   * including the query string or fragment
   */
  pathname?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the port number of the URL
   */
  port?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the protocol scheme of the URL, including the final `':'`
   */
  protocol?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing a `'?'` followed by the parameters or "querystring" of
   * the URL
   */
  search?: string;
}
```

### WebPixelsNavigator

A snapshot of a subset of properties of the \`navigator\` object in the top frame of the browser

* cookieEnabled

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns \`false\` if setting a cookie will be ignored and true otherwise

  ```ts
  boolean
  ```

* language

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns a string representing the preferred language of the user, usually the language of the browser UI. The \`null\` value is returned when this is unknown

  ```ts
  string
  ```

* languages

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns an array of strings representing the languages known to the user, by order of preference

  ```ts
  ReadonlyArray<string>
  ```

* userAgent

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns the user agent string for the current browser

  ```ts
  string
  ```

```ts
export interface WebPixelsNavigator {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns `false` if setting a cookie will be ignored and true otherwise
   */
  cookieEnabled?: boolean;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns a string representing the preferred language of the user, usually
   * the language of the browser UI. The `null` value is returned when this
   * is unknown
   */
  language?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns an array of strings representing the languages known to the user,
   * by order of preference
   */
  languages?: ReadonlyArray<string>;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns the user agent string for the current browser
   */
  userAgent?: string;
}
```

### WebPixelsWindow

A snapshot of a subset of properties of the \`window\` object in the top frame of the browser

* innerHeight

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the height of the content area of the browser window including, if rendered, the horizontal scrollbar

  ```ts
  number
  ```

* innerWidth

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the width of the content area of the browser window including, if rendered, the vertical scrollbar

  ```ts
  number
  ```

* location

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the location, or current URL, of the window object

  ```ts
  Location
  ```

* origin

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the global object's origin, serialized as a string

  ```ts
  string
  ```

* outerHeight

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the height of the outside of the browser window

  ```ts
  number
  ```

* outerWidth

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the width of the outside of the browser window

  ```ts
  number
  ```

* pageXOffset

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), an alias for window\.scrollX

  ```ts
  number
  ```

* pageYOffset

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), an alias for window\.scrollY

  ```ts
  number
  ```

* screen

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Screen), the interface representing a screen, usually the one on which the current window is being rendered

  ```ts
  Screen
  ```

* screenX

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the horizontal distance from the left border of the user's browser viewport to the left side of the screen

  ```ts
  number
  ```

* screenY

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the vertical distance from the top border of the user's browser viewport to the top side of the screen

  ```ts
  number
  ```

* scrollX

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the number of pixels that the document has already been scrolled horizontally

  ```ts
  number
  ```

* scrollY

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the number of pixels that the document has already been scrolled vertically

  ```ts
  number
  ```

```ts
export interface WebPixelsWindow {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window),
   * gets the height of the content area of the browser window including, if
   * rendered, the horizontal scrollbar
   */
  innerHeight?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), gets
   * the width of the content area of the browser window including, if rendered,
   * the vertical scrollbar
   */
  innerWidth?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * location, or current URL, of the window object
   */
  location?: Location;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * global object's origin, serialized as a string
   */
  origin?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), gets
   * the height of the outside of the browser window
   */
  outerHeight?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), gets
   * the width of the outside of the browser window
   */
  outerWidth?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), an
   * alias for window.scrollX
   */
  pageXOffset?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), an
   * alias for window.scrollY
   */
  pageYOffset?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen), the
   * interface representing a screen, usually the one on which the current
   * window is being rendered
   */
  screen?: Screen;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * horizontal distance from the left border of the user's browser viewport to
   * the left side of the screen
   */
  screenX?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * vertical distance from the top border of the user's browser viewport to the
   * top side of the screen
   */
  screenY?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * number of pixels that the document has already been scrolled horizontally
   */
  scrollX?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * number of pixels that the document has already been scrolled vertically
   */
  scrollY?: number;
}
```

### Screen

The interface representing a screen, usually the one on which the current window is being rendered

* height

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Screen/height), the height of the screen

  ```ts
  number
  ```

* width

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Screen/width), the width of the screen

  ```ts
  number
  ```

```ts
export interface Screen {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen/height),
   * the height of the screen
   */
  height?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen/width),
   * the width of the screen
   */
  width?: number;
}
```

### PixelEventsCheckoutShippingInfoSubmittedData

* checkout

  ```ts
  Checkout
  ```

```ts
export interface PixelEventsCheckoutShippingInfoSubmittedData {
  checkout?: Checkout;
}
```

### Checkout

A container for all the information required to add items to checkout and pay.

* attributes

  A list of attributes accumulated throughout the checkout process.

  ```ts
  Attribute[]
  ```

* billingAddress

  The billing address to where the order will be charged.

  ```ts
  MailingAddress | null
  ```

* buyerAcceptsEmailMarketing

  Indicates whether the customer has consented to be sent marketing material via email. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  boolean
  ```

* buyerAcceptsSmsMarketing

  Indicates whether the customer has consented to be sent marketing material via SMS. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  boolean
  ```

* currencyCode

  The three-letter code that represents the currency, for example, USD. Supported codes include standard ISO 4217 codes, legacy codes, and non- standard codes.

  ```ts
  string | null
  ```

* delivery

  Represents the selected delivery options for a checkout. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  Delivery | null
  ```

* discountApplications

  A list of discount applications.

  ```ts
  DiscountApplication[]
  ```

* discountsAmount

  The total amount of the discounts applied to the price of the checkout. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  MoneyV2 | null
  ```

* email

  The email attached to this checkout.

  ```ts
  string | null
  ```

* lineItems

  A list of line item objects, each one containing information about an item in the checkout.

  ```ts
  CheckoutLineItem[]
  ```

* localization

  Information about the active localized experience. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  Localization
  ```

* order

  The resulting order from a paid checkout.

  ```ts
  Order | null
  ```

* phone

  A unique phone number for the customer. Formatted using E.164 standard. For example, \*+16135551111\*.

  ```ts
  string | null
  ```

* shippingAddress

  The shipping address to where the line items will be shipped.

  ```ts
  MailingAddress | null
  ```

* shippingLine

  Once a shipping rate is selected by the customer it is transitioned to a \`shipping\_line\` object.

  ```ts
  ShippingRate | null
  ```

* smsMarketingPhone

  The phone number provided by the buyer after opting in to SMS marketing. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  string | null
  ```

* subtotalPrice

  The price at checkout before duties, shipping, and taxes.

  ```ts
  MoneyV2 | null
  ```

* token

  A unique identifier for a particular checkout.

  ```ts
  string | null
  ```

* totalPrice

  The sum of all the prices of all the items in the checkout, including duties, taxes, and discounts.

  ```ts
  MoneyV2 | null
  ```

* totalTax

  The sum of all the taxes applied to the line items and shipping lines in the checkout.

  ```ts
  MoneyV2
  ```

* transactions

  A list of transactions associated with a checkout or order. Certain transactions, such as credit card transactions, may only be present in the checkout\_completed event.

  ```ts
  Transaction[]
  ```

```ts
export interface Checkout {
  /**
   * A list of attributes accumulated throughout the checkout process.
   */
  attributes?: Attribute[];

  /**
   * The billing address to where the order will be charged.
   */
  billingAddress?: MailingAddress | null;

  /**
   * Indicates whether the customer has consented to be sent marketing material
   * via email. This property is only available if the shop has [upgraded
   * to Checkout Extensibility](https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  buyerAcceptsEmailMarketing?: boolean;

  /**
   * Indicates whether the customer has consented to be sent marketing material
   * via SMS. This property is only available if the shop has [upgraded to
   * Checkout Extensibility](https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  buyerAcceptsSmsMarketing?: boolean;

  /**
   * The three-letter code that represents the currency, for example, USD.
   * Supported codes include standard ISO 4217 codes, legacy codes, and non-
   * standard codes.
   */
  currencyCode?: string | null;

  /**
   * Represents the selected delivery options for a checkout. This
   * property is only available if the shop has [upgraded to Checkout
   * Extensibility](https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  delivery?: Delivery | null;

  /**
   * A list of discount applications.
   */
  discountApplications?: DiscountApplication[];

  /**
   * The total amount of the discounts applied to the price of the checkout.
   * This property is only available if the shop has [upgraded to Checkout
   * Extensibility](https://help.shopify.com/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  discountsAmount?: MoneyV2 | null;

  /**
   * The email attached to this checkout.
   */
  email?: string | null;

  /**
   * A list of line item objects, each one containing information about an item
   * in the checkout.
   */
  lineItems?: CheckoutLineItem[];

  /**
   * Information about the active localized experience. This
   * property is only available if the shop has [upgraded to Checkout
   * Extensibility](https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  localization?: Localization;

  /**
   * The resulting order from a paid checkout.
   */
  order?: Order | null;

  /**
   * A unique phone number for the customer. Formatted using E.164 standard. For
   * example, *+16135551111*.
   */
  phone?: string | null;

  /**
   * The shipping address to where the line items will be shipped.
   */
  shippingAddress?: MailingAddress | null;

  /**
   * Once a shipping rate is selected by the customer it is transitioned to a
   * `shipping_line` object.
   */
  shippingLine?: ShippingRate | null;

  /**
   * The phone number provided by the buyer after opting in to SMS
   * marketing. This property is only available if the shop has [upgraded
   * to Checkout Extensibility](https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  smsMarketingPhone?: string | null;

  /**
   * The price at checkout before duties, shipping, and taxes.
   */
  subtotalPrice?: MoneyV2 | null;

  /**
   * A unique identifier for a particular checkout.
   */
  token?: string | null;

  /**
   * The sum of all the prices of all the items in the checkout, including
   * duties, taxes, and discounts.
   */
  totalPrice?: MoneyV2 | null;

  /**
   * The sum of all the taxes applied to the line items and shipping lines in
   * the checkout.
   */
  totalTax?: MoneyV2;

  /**
   * A list of transactions associated with a checkout or order. Certain
   * transactions, such as credit card transactions, may only be present in the
   * checkout_completed event.
   */
  transactions?: Transaction[];
}
```

### Attribute

Custom attributes associated with the cart or checkout.

* key

  The key for the attribute.

  ```ts
  string
  ```

* value

  The value for the attribute.

  ```ts
  string
  ```

```ts
export interface Attribute {
  /**
   * The key for the attribute.
   */
  key?: string;

  /**
   * The value for the attribute.
   */
  value?: string;
}
```

### MailingAddress

A mailing address for customers and shipping.

* address1

  The first line of the address. This is usually the street address or a P.O. Box number.

  ```ts
  string | null
  ```

* address2

  The second line of the address. This is usually an apartment, suite, or unit number.

  ```ts
  string | null
  ```

* city

  The name of the city, district, village, or town.

  ```ts
  string | null
  ```

* country

  The name of the country.

  ```ts
  string | null
  ```

* countryCode

  The two-letter code that represents the country, for example, US. The country codes generally follows ISO 3166-1 alpha-2 guidelines.

  ```ts
  string | null
  ```

* firstName

  The customer’s first name.

  ```ts
  string | null
  ```

* lastName

  The customer’s last name.

  ```ts
  string | null
  ```

* phone

  The phone number for this mailing address as entered by the customer.

  ```ts
  string | null
  ```

* province

  The region of the address, such as the province, state, or district.

  ```ts
  string | null
  ```

* provinceCode

  The two-letter code for the region. For example, ON.

  ```ts
  string | null
  ```

* zip

  The ZIP or postal code of the address.

  ```ts
  string | null
  ```

```ts
export interface MailingAddress {
  /**
   * The first line of the address. This is usually the street address or a P.O.
   * Box number.
   */
  address1?: string | null;

  /**
   * The second line of the address. This is usually an apartment, suite, or
   * unit number.
   */
  address2?: string | null;

  /**
   * The name of the city, district, village, or town.
   */
  city?: string | null;

  /**
   * The name of the country.
   */
  country?: string | null;

  /**
   * The two-letter code that represents the country, for example, US.
   * The country codes generally follows ISO 3166-1 alpha-2 guidelines.
   */
  countryCode?: string | null;

  /**
   * The customer’s first name.
   */
  firstName?: string | null;

  /**
   * The customer’s last name.
   */
  lastName?: string | null;

  /**
   * The phone number for this mailing address as entered by the customer.
   */
  phone?: string | null;

  /**
   * The region of the address, such as the province, state, or district.
   */
  province?: string | null;

  /**
   * The two-letter code for the region.
   * For example, ON.
   */
  provinceCode?: string | null;

  /**
   * The ZIP or postal code of the address.
   */
  zip?: string | null;
}
```

### Delivery

The delivery information for the event.

* selectedDeliveryOptions

  The selected delivery options for the event.

  ```ts
  DeliveryOption[]
  ```

```ts
export interface Delivery {
  /**
   * The selected delivery options for the event.
   */
  selectedDeliveryOptions?: DeliveryOption[];
}
```

### DeliveryOption

Represents a delivery option that the customer can choose from.

* cost

  The cost of the delivery option.

  ```ts
  MoneyV2 | null
  ```

* costAfterDiscounts

  The cost of the delivery option after discounts have been applied.

  ```ts
  MoneyV2 | null
  ```

* description

  The description of the delivery option.

  ```ts
  string | null
  ```

* handle

  The unique identifier of the delivery option.

  ```ts
  string
  ```

* title

  The title of the delivery option.

  ```ts
  string | null
  ```

* type

  The type of delivery option. - \`pickup\` - \`pickupPoint\` - \`shipping\` - \`local\`

  ```ts
  string
  ```

```ts
export interface DeliveryOption {
  /**
   * The cost of the delivery option.
   */
  cost?: MoneyV2 | null;

  /**
   * The cost of the delivery option after discounts have been applied.
   */
  costAfterDiscounts?: MoneyV2 | null;

  /**
   * The description of the delivery option.
   */
  description?: string | null;

  /**
   * The unique identifier of the delivery option.
   */
  handle?: string;

  /**
   * The title of the delivery option.
   */
  title?: string | null;

  /**
   * The type of delivery option.
   *
   * - `pickup`
   * - `pickupPoint`
   * - `shipping`
   * - `local`
   */
  type?: string;
}
```

### MoneyV2

A monetary value with currency.

* amount

  The decimal money amount.

  ```ts
  number
  ```

* currencyCode

  The three-letter code that represents the currency, for example, USD. Supported codes include standard ISO 4217 codes, legacy codes, and non- standard codes.

  ```ts
  string
  ```

```ts
export interface MoneyV2 {
  /**
   * The decimal money amount.
   */
  amount?: number;

  /**
   * The three-letter code that represents the currency, for example, USD.
   * Supported codes include standard ISO 4217 codes, legacy codes, and non-
   * standard codes.
   */
  currencyCode?: string;
}
```

### DiscountApplication

The information about the intent of the discount.

* allocationMethod

  The method by which the discount's value is applied to its entitled items. - \`ACROSS\`: The value is spread across all entitled lines. - \`EACH\`: The value is applied onto every entitled line.

  ```ts
  string
  ```

* targetSelection

  How the discount amount is distributed on the discounted lines. - \`ALL\`: The discount is allocated onto all the lines. - \`ENTITLED\`: The discount is allocated onto only the lines that it's entitled for. - \`EXPLICIT\`: The discount is allocated onto explicitly chosen lines.

  ```ts
  string
  ```

* targetType

  The type of line (i.e. line item or shipping line) on an order that the discount is applicable towards. - \`LINE\_ITEM\`: The discount applies onto line items. - \`SHIPPING\_LINE\`: The discount applies onto shipping lines.

  ```ts
  string
  ```

* title

  The customer-facing name of the discount. If the type of discount is a \`DISCOUNT\_CODE\`, this \`title\` attribute represents the code of the discount.

  ```ts
  string
  ```

* type

  The type of the discount. - \`AUTOMATIC\`: A discount automatically at checkout or in the cart without the need for a code. - \`DISCOUNT\_CODE\`: A discount applied onto checkouts through the use of a code. - \`MANUAL\`: A discount that is applied to an order by a merchant or store owner manually, rather than being automatically applied by the system or through a script. - \`SCRIPT\`: A discount applied to a customer's order using a script

  ```ts
  string
  ```

* value

  The value of the discount. Fixed discounts return a \`Money\` Object, while Percentage discounts return a \`PricingPercentageValue\` object.

  ```ts
  MoneyV2 | PricingPercentageValue
  ```

```ts
export interface DiscountApplication {
  /**
   * The method by which the discount's value is applied to its entitled items.
   *
   * - `ACROSS`: The value is spread across all entitled lines.
   * - `EACH`: The value is applied onto every entitled line.
   */
  allocationMethod?: string;

  /**
   * How the discount amount is distributed on the discounted lines.
   *
   * - `ALL`: The discount is allocated onto all the lines.
   * - `ENTITLED`: The discount is allocated onto only the lines that it's
   * entitled for.
   * - `EXPLICIT`: The discount is allocated onto explicitly chosen lines.
   */
  targetSelection?: string;

  /**
   * The type of line (i.e. line item or shipping line) on an order that the
   * discount is applicable towards.
   *
   * - `LINE_ITEM`: The discount applies onto line items.
   * - `SHIPPING_LINE`: The discount applies onto shipping lines.
   */
  targetType?: string;

  /**
   * The customer-facing name of the discount. If the type of discount is
   * a `DISCOUNT_CODE`, this `title` attribute represents the code of the
   * discount.
   */
  title?: string;

  /**
   * The type of the discount.
   *
   * - `AUTOMATIC`: A discount automatically at checkout or in the cart without
   * the need for a code.
   * - `DISCOUNT_CODE`: A discount applied onto checkouts through the use of
   * a code.
   * - `MANUAL`: A discount that is applied to an order by a merchant or store
   * owner manually, rather than being automatically applied by the system or
   * through a script.
   * - `SCRIPT`: A discount applied to a customer's order using a script
   */
  type?: string;

  /**
   * The value of the discount. Fixed discounts return a `Money` Object, while
   * Percentage discounts return a `PricingPercentageValue` object.
   */
  value?: MoneyV2 | PricingPercentageValue;
}
```

### PricingPercentageValue

A value given to a customer when a discount is applied to an order. The application of a discount with this value gives the customer the specified percentage off a specified item.

* percentage

  The percentage value of the object.

  ```ts
  number
  ```

```ts
export interface PricingPercentageValue {
  /**
   * The percentage value of the object.
   */
  percentage?: number;
}
```

### CheckoutLineItem

A single line item in the checkout, grouped by variant and attributes.

* discountAllocations

  The discounts that have been applied to the checkout line item by a discount application.

  ```ts
  DiscountAllocation[]
  ```

* finalLinePrice

  The combined price of all of the items in the line item after line-level discounts have been applied. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  MoneyV2
  ```

* id

  A globally unique identifier.

  ```ts
  string | null
  ```

* properties

  The properties of the line item. A shop may add, or enable customers to add custom information to a line item. Line item properties consist of a key and value pair. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  Property[]
  ```

* quantity

  The quantity of the line item.

  ```ts
  number
  ```

* sellingPlanAllocation

  The selling plan associated with the line item and the effect that each selling plan has on variants when they're purchased. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  SellingPlanAllocation | null
  ```

* title

  The title of the line item. Defaults to the product's title.

  ```ts
  string | null
  ```

* variant

  Product variant of the line item.

  ```ts
  ProductVariant | null
  ```

```ts
export interface CheckoutLineItem {
  /**
   * The discounts that have been applied to the checkout line item by a
   * discount application.
   */
  discountAllocations?: DiscountAllocation[];

  /**
   * The combined price of all of the items in the line item
   * after line-level discounts have been applied. This property
   * is only available if the shop has [upgraded to Checkout
   * Extensibility](https://help.shopify.com/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  finalLinePrice?: MoneyV2;

  /**
   * A globally unique identifier.
   */
  id?: string | null;

  /**
   * The properties of the line item. A shop may add, or enable customers to add
   * custom information to a line item. Line item properties consist of a key
   * and value pair. This property is only available if the shop has [upgraded
   * to Checkout Extensibility](https://help.shopify.com/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  properties?: Property[];

  /**
   * The quantity of the line item.
   */
  quantity?: number;

  /**
   * The selling plan associated with the line item and the effect that
   * each selling plan has on variants when they're purchased. This
   * property is only available if the shop has [upgraded to Checkout
   * Extensibility](https://help.shopify.com/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  sellingPlanAllocation?: SellingPlanAllocation | null;

  /**
   * The title of the line item. Defaults to the product's title.
   */
  title?: string | null;

  /**
   * Product variant of the line item.
   */
  variant?: ProductVariant | null;
}
```

### DiscountAllocation

The discount that has been applied to the checkout line item.

* amount

  The monetary value with currency allocated to the discount.

  ```ts
  MoneyV2
  ```

* discountApplication

  The information about the intent of the discount.

  ```ts
  DiscountApplication
  ```

```ts
export interface DiscountAllocation {
  /**
   * The monetary value with currency allocated to the discount.
   */
  amount?: MoneyV2;

  /**
   * The information about the intent of the discount.
   */
  discountApplication?: DiscountApplication;
}
```

### Property

The line item additional custom properties.

* key

  The key for the property.

  ```ts
  string
  ```

* value

  The value for the property.

  ```ts
  string
  ```

```ts
export interface Property {
  /**
   * The key for the property.
   */
  key?: string;

  /**
   * The value for the property.
   */
  value?: string;
}
```

### SellingPlanAllocation

Represents an association between a variant and a selling plan.

* sellingPlan

  A representation of how products and variants can be sold and purchased. For example, an individual selling plan could be '6 weeks of prepaid granola, delivered weekly'.

  ```ts
  SellingPlan
  ```

```ts
export interface SellingPlanAllocation {
  /**
   * A representation of how products and variants can be sold and purchased.
   * For example, an individual selling plan could be '6 weeks of prepaid
   * granola, delivered weekly'.
   */
  sellingPlan?: SellingPlan;
}
```

### SellingPlan

Represents how products and variants can be sold and purchased.

* id

  A globally unique identifier.

  ```ts
  string
  ```

* name

  The name of the selling plan. For example, '6 weeks of prepaid granola, delivered weekly'.

  ```ts
  string
  ```

```ts
export interface SellingPlan {
  /**
   * A globally unique identifier.
   */
  id?: string;

  /**
   * The name of the selling plan. For example, '6 weeks of prepaid granola,
   * delivered weekly'.
   */
  name?: string;
}
```

### ProductVariant

A product variant represents a different version of a product, such as differing sizes or differing colors.

* id

  A globally unique identifier.

  ```ts
  string | null
  ```

* image

  Image associated with the product variant. This field falls back to the product image if no image is available.

  ```ts
  Image | null
  ```

* price

  The product variant’s price.

  ```ts
  MoneyV2
  ```

* product

  The product object that the product variant belongs to.

  ```ts
  Product
  ```

* sku

  The SKU (stock keeping unit) associated with the variant.

  ```ts
  string | null
  ```

* title

  The product variant’s title.

  ```ts
  string | null
  ```

* untranslatedTitle

  The product variant’s untranslated title.

  ```ts
  string | null
  ```

```ts
export interface ProductVariant {
  /**
   * A globally unique identifier.
   */
  id?: string | null;

  /**
   * Image associated with the product variant. This field falls back to the
   * product image if no image is available.
   */
  image?: Image | null;

  /**
   * The product variant’s price.
   */
  price?: MoneyV2;

  /**
   * The product object that the product variant belongs to.
   */
  product?: Product;

  /**
   * The SKU (stock keeping unit) associated with the variant.
   */
  sku?: string | null;

  /**
   * The product variant’s title.
   */
  title?: string | null;

  /**
   * The product variant’s untranslated title.
   */
  untranslatedTitle?: string | null;
}
```

### Image

An image resource.

* src

  The location of the image as a URL.

  ```ts
  string | null
  ```

```ts
export interface Image {
  /**
   * The location of the image as a URL.
   */
  src?: string | null;
}
```

### Product

A product is an individual item for sale in a Shopify store.

* id

  The ID of the product.

  ```ts
  string | null
  ```

* title

  The product’s title.

  ```ts
  string
  ```

* type

  The \[product type]\(https://help.shopify.com/en/manual/products/details/product-type) specified by the merchant.

  ```ts
  string | null
  ```

* untranslatedTitle

  The product’s untranslated title.

  ```ts
  string | null
  ```

* url

  The relative URL of the product.

  ```ts
  string | null
  ```

* vendor

  The product’s vendor name.

  ```ts
  string
  ```

```ts
export interface Product {
  /**
   * The ID of the product.
   */
  id?: string | null;

  /**
   * The product’s title.
   */
  title?: string;

  /**
   * The [product
   * type](https://help.shopify.com/en/manual/products/details/product-type)
   * specified by the merchant.
   */
  type?: string | null;

  /**
   * The product’s untranslated title.
   */
  untranslatedTitle?: string | null;

  /**
   * The relative URL of the product.
   */
  url?: string | null;

  /**
   * The product’s vendor name.
   */
  vendor?: string;
}
```

### Localization

Information about the active localized experience.

* country

  The country of the active localized experience.

  ```ts
  Country
  ```

* language

  The language of the active localized experience.

  ```ts
  Language
  ```

* market

  The market including the country of the active localized experience.

  ```ts
  Market
  ```

```ts
export interface Localization {
  /**
   * The country of the active localized experience.
   */
  country?: Country;

  /**
   * The language of the active localized experience.
   */
  language?: Language;

  /**
   * The market including the country of the active localized experience.
   */
  market?: Market;
}
```

### Country

A country.

* isoCode

  The ISO-3166-1 code for this country, for example, "US".

  ```ts
  string | null
  ```

```ts
export interface Country {
  /**
   * The ISO-3166-1 code for this country, for example, "US".
   */
  isoCode?: string | null;
}
```

### Language

A language.

* isoCode

  The BCP-47 language tag. It may contain a dash followed by an ISO 3166-1 alpha-2 region code, for example, "en-US".

  ```ts
  string
  ```

```ts
export interface Language {
  /**
   * The BCP-47 language tag. It may contain a dash followed by an ISO 3166-1
   * alpha-2 region code, for example, "en-US".
   */
  isoCode?: string;
}
```

### Market

A group of one or more regions of the world that a merchant is targeting for sales. To learn more about markets, refer to \[this]\(https://shopify.dev/docs/apps/markets) conceptual overview.

* handle

  A human-readable, shop-scoped identifier.

  ```ts
  string | null
  ```

* id

  A globally unique identifier.

  ```ts
  string | null
  ```

```ts
export interface Market {
  /**
   * A human-readable, shop-scoped identifier.
   */
  handle?: string | null;

  /**
   * A globally unique identifier.
   */
  id?: string | null;
}
```

### Order

An order is a customer’s completed request to purchase one or more products from a shop. An order is created when a customer completes the checkout process.

* customer

  The customer that placed the order.

  ```ts
  OrderCustomer | null
  ```

* id

  The ID of the order. ID will be null for all events except checkout\_completed.

  ```ts
  string | null
  ```

```ts
export interface Order {
  /**
   * The customer that placed the order.
   */
  customer?: OrderCustomer | null;

  /**
   * The ID of the order. ID will be null for all events except
   * checkout_completed.
   */
  id?: string | null;
}
```

### OrderCustomer

The customer that placed the order.

* id

  The ID of the customer.

  ```ts
  string | null
  ```

* isFirstOrder

  Indicates if the order is the customer’s first order. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  boolean | null
  ```

```ts
export interface OrderCustomer {
  /**
   * The ID of the customer.
   */
  id?: string | null;

  /**
   * Indicates if the order is the customer’s first order. This
   * property is only available if the shop has [upgraded to Checkout
   * Extensibility](https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  isFirstOrder?: boolean | null;
}
```

### ShippingRate

A shipping rate to be applied to a checkout.

* price

  Price of this shipping rate.

  ```ts
  MoneyV2
  ```

```ts
export interface ShippingRate {
  /**
   * Price of this shipping rate.
   */
  price?: MoneyV2;
}
```

### Transaction

A transaction associated with a checkout or order.

* amount

  The monetary value with currency allocated to the transaction method.

  ```ts
  MoneyV2
  ```

* gateway

  The name of the payment provider used for the transaction.

  ```ts
  string
  ```

* paymentMethod

  The payment method used for the transaction. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  TransactionPaymentMethod
  ```

```ts
export interface Transaction {
  /**
   * The monetary value with currency allocated to the transaction method.
   */
  amount?: MoneyV2;

  /**
   * The name of the payment provider used for the transaction.
   */
  gateway?: string;

  /**
   * The payment method used for the transaction. This property
   * is only available if the shop has [upgraded to Checkout
   * Extensibility](https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  paymentMethod?: TransactionPaymentMethod;
}
```

### TransactionPaymentMethod

The payment method used for the transaction. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

* name

  The name of the payment method used for the transaction. This may further specify the payment method used.

  ```ts
  string
  ```

* type

  The type of payment method used for the transaction. - \`creditCard\`: A vaulted or manually entered credit card. - \`redeemable\`: A redeemable payment method, such as a gift card or store credit. - \`deferred\`: A \[deferred payment]\(https://help.shopify.com/en/manual/orders/deferred-payments), such as invoicing the buyer and collecting payment later. - \`local\`: A \[local payment method]\(https://help.shopify.com/en/manual/payments/shopify-payments/local-payment-methods) specific to the current region or market. - \`manualPayment\`: A manual payment method, such as an in-person retail transaction. - \`paymentOnDelivery\`: A payment that will be collected on delivery. - \`wallet\`: An integrated wallet, such as PayPal, Google Pay, Apple Pay, etc. - \`offsite\`: A payment processed outside of Shopify's checkout, excluding integrated wallets. - \`customOnSite\`: A custom payment method that is processed through a checkout extension with a payments app. - \`other\`: Another type of payment not defined here.

  ```ts
  string
  ```

```ts
export interface TransactionPaymentMethod {
  /**
   * The name of the payment method used for the transaction. This may further
   * specify the payment method used.
   */
  name?: string;

  /**
   * The type of payment method used for the transaction.
   *
   * - `creditCard`: A vaulted or manually entered credit card.
   * - `redeemable`: A redeemable payment method, such as a gift card or store
   * credit.
   * - `deferred`: A [deferred
   * payment](https://help.shopify.com/en/manual/orders/deferred-payments), such
   * as invoicing the buyer and collecting payment later.
   * - `local`: A [local payment
   * method](https://help.shopify.com/en/manual/payments/shopify-payments/local-payment-methods) specific to the current region or market.
   * - `manualPayment`: A manual payment method, such as an in-person retail
   * transaction.
   * - `paymentOnDelivery`: A payment that will be collected on delivery.
   * - `wallet`: An integrated wallet, such as PayPal, Google Pay, Apple Pay,
   * etc.
   * - `offsite`: A payment processed outside of Shopify's checkout, excluding
   * integrated wallets.
   * - `customOnSite`: A custom payment method that is processed through a
   * checkout extension with a payments app.
   * - `other`: Another type of payment not defined here.
   */
  type?: string;
}
```

### EventType

* AdvancedDom

  ```ts
  advanced-dom
  ```

* Custom

  ```ts
  custom
  ```

* Dom

  ```ts
  dom
  ```

* Meta

  ```ts
  meta
  ```

* Standard

  ```ts
  standard
  ```

```ts
export enum EventType {
  AdvancedDom = 'advanced-dom',
  Custom = 'custom',
  Dom = 'dom',
  Meta = 'meta',
  Standard = 'standard',
}
```

Examples

### Examples

* #### Accessing Standard Events

  ##### App Pixel

  ```javascript
  import {register} from '@shopify/web-pixels-extension';

  register(({analytics}) => {
    analytics.subscribe('checkout_shipping_info_submitted', (event) => {
      // Example for accessing event data
      const checkout = event.data.checkout;
      const shippingLine = checkout.shippingLine;

      const price = shippingLine.price.amount;
      const currency = shippingLine.price.currencyCode;

      const payload = {
        event_name: event.name,
        event_data: {
          price: price,
          currency: currency,
        },
      };

      // Example for sending event to third party servers
      fetch('https://example.com/pixel', {
        method: 'POST',
        body: JSON.stringify(payload),
        keepalive: true,
      });
    });
  });
  ```

  ##### Custom Pixel

  ```javascript
  analytics.subscribe('checkout_shipping_info_submitted', (event) => {
    // Example for accessing event data
    const checkout = event.data.checkout;
    const shippingLine = checkout.shippingLine;

    const price = shippingLine.price.amount;
    const currency = shippingLine.price.currencyCode;

    const payload = {
      event_name: event.name,
      event_data: {
        price: price,
        currency: currency,
      },
    };

    // Example for sending event to third party servers
    fetch('https://example.com/pixel', {
      method: 'POST',
      body: JSON.stringify(payload),
      keepalive: true,
    });
  });
  ```

</page>

<page>
---
title: checkout_started
description: >-
  The `checkout_started` event logs an instance of a customer starting the
  checkout process. This event is available on the checkout page. For Checkout
  Extensibility, this event is triggered every time a customer enters checkout.
  For non-checkout extensible shops, this event is only triggered the first time
  a customer enters checkout.
api_name: web-pixels
source_url:
  html: 'https://shopify.dev/docs/api/web-pixels-api/standard-events/checkout_started'
  md: >-
    https://shopify.dev/docs/api/web-pixels-api/standard-events/checkout_started.md
---

# checkout\_​started

The `checkout_started` event logs an instance of a customer starting the checkout process. This event is available on the checkout page. For Checkout Extensibility, this event is triggered every time a customer enters checkout. For non-checkout extensible shops, this event is only triggered the first time a customer enters checkout.

## Properties

* clientId

  string

  The client-side ID of the customer, provided by Shopify

* context

  Context

* data

  PixelEventsCheckoutStartedData

* id

  string

  The ID of the customer event

* name

  string

  The name of the customer event

* seq

  number

  The sequence index number of the event.

* timestamp

  string

  The timestamp of when the customer event occurred, in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format

* type

  EventType.Standard

### Context

A snapshot of various read-only properties of the browser at the time of event

* document

  Snapshot of a subset of properties of the \`document\` object in the top frame of the browser

  ```ts
  WebPixelsDocument
  ```

* navigator

  Snapshot of a subset of properties of the \`navigator\` object in the top frame of the browser

  ```ts
  WebPixelsNavigator
  ```

* window

  Snapshot of a subset of properties of the \`window\` object in the top frame of the browser

  ```ts
  WebPixelsWindow
  ```

```ts
export interface Context {
  /**
   * Snapshot of a subset of properties of the `document` object in the top
   * frame of the browser
   */
  document?: WebPixelsDocument;

  /**
   * Snapshot of a subset of properties of the `navigator` object in the top
   * frame of the browser
   */
  navigator?: WebPixelsNavigator;

  /**
   * Snapshot of a subset of properties of the `window` object in the top frame
   * of the browser
   */
  window?: WebPixelsWindow;
}
```

### WebPixelsDocument

A snapshot of a subset of properties of the \`document\` object in the top frame of the browser

* characterSet

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the character set being used by the document

  ```ts
  string
  ```

* location

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the URI of the current document

  ```ts
  Location
  ```

* referrer

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the URI of the page that linked to this page

  ```ts
  string
  ```

* title

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the title of the current document

  ```ts
  string
  ```

```ts
export interface WebPixelsDocument {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the character set being used by the document
   */
  characterSet?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the URI of the current document
   */
  location?: Location;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the URI of the page that linked to this page
   */
  referrer?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the title of the current document
   */
  title?: string;
}
```

### Location

A snapshot of a subset of properties of the \`location\` object in the top frame of the browser

* hash

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing a \`'#'\` followed by the fragment identifier of the URL

  ```ts
  string
  ```

* host

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the host, that is the hostname, a \`':'\`, and the port of the URL

  ```ts
  string
  ```

* hostname

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the domain of the URL

  ```ts
  string
  ```

* href

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the entire URL

  ```ts
  string
  ```

* origin

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the canonical form of the origin of the specific location

  ```ts
  string
  ```

* pathname

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing an initial \`'/'\` followed by the path of the URL, not including the query string or fragment

  ```ts
  string
  ```

* port

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the port number of the URL

  ```ts
  string
  ```

* protocol

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the protocol scheme of the URL, including the final \`':'\`

  ```ts
  string
  ```

* search

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing a \`'?'\` followed by the parameters or "querystring" of the URL

  ```ts
  string
  ```

```ts
export interface Location {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing a `'#'` followed by the fragment identifier of the URL
   */
  hash?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the host, that is the hostname, a `':'`, and the port of
   * the URL
   */
  host?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the domain of the URL
   */
  hostname?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the entire URL
   */
  href?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the canonical form of the origin of the specific location
   */
  origin?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing an initial `'/'` followed by the path of the URL, not
   * including the query string or fragment
   */
  pathname?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the port number of the URL
   */
  port?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the protocol scheme of the URL, including the final `':'`
   */
  protocol?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing a `'?'` followed by the parameters or "querystring" of
   * the URL
   */
  search?: string;
}
```

### WebPixelsNavigator

A snapshot of a subset of properties of the \`navigator\` object in the top frame of the browser

* cookieEnabled

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns \`false\` if setting a cookie will be ignored and true otherwise

  ```ts
  boolean
  ```

* language

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns a string representing the preferred language of the user, usually the language of the browser UI. The \`null\` value is returned when this is unknown

  ```ts
  string
  ```

* languages

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns an array of strings representing the languages known to the user, by order of preference

  ```ts
  ReadonlyArray<string>
  ```

* userAgent

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns the user agent string for the current browser

  ```ts
  string
  ```

```ts
export interface WebPixelsNavigator {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns `false` if setting a cookie will be ignored and true otherwise
   */
  cookieEnabled?: boolean;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns a string representing the preferred language of the user, usually
   * the language of the browser UI. The `null` value is returned when this
   * is unknown
   */
  language?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns an array of strings representing the languages known to the user,
   * by order of preference
   */
  languages?: ReadonlyArray<string>;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns the user agent string for the current browser
   */
  userAgent?: string;
}
```

### WebPixelsWindow

A snapshot of a subset of properties of the \`window\` object in the top frame of the browser

* innerHeight

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the height of the content area of the browser window including, if rendered, the horizontal scrollbar

  ```ts
  number
  ```

* innerWidth

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the width of the content area of the browser window including, if rendered, the vertical scrollbar

  ```ts
  number
  ```

* location

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the location, or current URL, of the window object

  ```ts
  Location
  ```

* origin

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the global object's origin, serialized as a string

  ```ts
  string
  ```

* outerHeight

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the height of the outside of the browser window

  ```ts
  number
  ```

* outerWidth

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the width of the outside of the browser window

  ```ts
  number
  ```

* pageXOffset

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), an alias for window\.scrollX

  ```ts
  number
  ```

* pageYOffset

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), an alias for window\.scrollY

  ```ts
  number
  ```

* screen

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Screen), the interface representing a screen, usually the one on which the current window is being rendered

  ```ts
  Screen
  ```

* screenX

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the horizontal distance from the left border of the user's browser viewport to the left side of the screen

  ```ts
  number
  ```

* screenY

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the vertical distance from the top border of the user's browser viewport to the top side of the screen

  ```ts
  number
  ```

* scrollX

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the number of pixels that the document has already been scrolled horizontally

  ```ts
  number
  ```

* scrollY

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the number of pixels that the document has already been scrolled vertically

  ```ts
  number
  ```

```ts
export interface WebPixelsWindow {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window),
   * gets the height of the content area of the browser window including, if
   * rendered, the horizontal scrollbar
   */
  innerHeight?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), gets
   * the width of the content area of the browser window including, if rendered,
   * the vertical scrollbar
   */
  innerWidth?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * location, or current URL, of the window object
   */
  location?: Location;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * global object's origin, serialized as a string
   */
  origin?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), gets
   * the height of the outside of the browser window
   */
  outerHeight?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), gets
   * the width of the outside of the browser window
   */
  outerWidth?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), an
   * alias for window.scrollX
   */
  pageXOffset?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), an
   * alias for window.scrollY
   */
  pageYOffset?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen), the
   * interface representing a screen, usually the one on which the current
   * window is being rendered
   */
  screen?: Screen;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * horizontal distance from the left border of the user's browser viewport to
   * the left side of the screen
   */
  screenX?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * vertical distance from the top border of the user's browser viewport to the
   * top side of the screen
   */
  screenY?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * number of pixels that the document has already been scrolled horizontally
   */
  scrollX?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * number of pixels that the document has already been scrolled vertically
   */
  scrollY?: number;
}
```

### Screen

The interface representing a screen, usually the one on which the current window is being rendered

* height

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Screen/height), the height of the screen

  ```ts
  number
  ```

* width

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Screen/width), the width of the screen

  ```ts
  number
  ```

```ts
export interface Screen {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen/height),
   * the height of the screen
   */
  height?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen/width),
   * the width of the screen
   */
  width?: number;
}
```

### PixelEventsCheckoutStartedData

* checkout

  ```ts
  Checkout
  ```

```ts
export interface PixelEventsCheckoutStartedData {
  checkout?: Checkout;
}
```

### Checkout

A container for all the information required to add items to checkout and pay.

* attributes

  A list of attributes accumulated throughout the checkout process.

  ```ts
  Attribute[]
  ```

* billingAddress

  The billing address to where the order will be charged.

  ```ts
  MailingAddress | null
  ```

* buyerAcceptsEmailMarketing

  Indicates whether the customer has consented to be sent marketing material via email. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  boolean
  ```

* buyerAcceptsSmsMarketing

  Indicates whether the customer has consented to be sent marketing material via SMS. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  boolean
  ```

* currencyCode

  The three-letter code that represents the currency, for example, USD. Supported codes include standard ISO 4217 codes, legacy codes, and non- standard codes.

  ```ts
  string | null
  ```

* delivery

  Represents the selected delivery options for a checkout. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  Delivery | null
  ```

* discountApplications

  A list of discount applications.

  ```ts
  DiscountApplication[]
  ```

* discountsAmount

  The total amount of the discounts applied to the price of the checkout. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  MoneyV2 | null
  ```

* email

  The email attached to this checkout.

  ```ts
  string | null
  ```

* lineItems

  A list of line item objects, each one containing information about an item in the checkout.

  ```ts
  CheckoutLineItem[]
  ```

* localization

  Information about the active localized experience. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  Localization
  ```

* order

  The resulting order from a paid checkout.

  ```ts
  Order | null
  ```

* phone

  A unique phone number for the customer. Formatted using E.164 standard. For example, \*+16135551111\*.

  ```ts
  string | null
  ```

* shippingAddress

  The shipping address to where the line items will be shipped.

  ```ts
  MailingAddress | null
  ```

* shippingLine

  Once a shipping rate is selected by the customer it is transitioned to a \`shipping\_line\` object.

  ```ts
  ShippingRate | null
  ```

* smsMarketingPhone

  The phone number provided by the buyer after opting in to SMS marketing. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  string | null
  ```

* subtotalPrice

  The price at checkout before duties, shipping, and taxes.

  ```ts
  MoneyV2 | null
  ```

* token

  A unique identifier for a particular checkout.

  ```ts
  string | null
  ```

* totalPrice

  The sum of all the prices of all the items in the checkout, including duties, taxes, and discounts.

  ```ts
  MoneyV2 | null
  ```

* totalTax

  The sum of all the taxes applied to the line items and shipping lines in the checkout.

  ```ts
  MoneyV2
  ```

* transactions

  A list of transactions associated with a checkout or order. Certain transactions, such as credit card transactions, may only be present in the checkout\_completed event.

  ```ts
  Transaction[]
  ```

```ts
export interface Checkout {
  /**
   * A list of attributes accumulated throughout the checkout process.
   */
  attributes?: Attribute[];

  /**
   * The billing address to where the order will be charged.
   */
  billingAddress?: MailingAddress | null;

  /**
   * Indicates whether the customer has consented to be sent marketing material
   * via email. This property is only available if the shop has [upgraded
   * to Checkout Extensibility](https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  buyerAcceptsEmailMarketing?: boolean;

  /**
   * Indicates whether the customer has consented to be sent marketing material
   * via SMS. This property is only available if the shop has [upgraded to
   * Checkout Extensibility](https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  buyerAcceptsSmsMarketing?: boolean;

  /**
   * The three-letter code that represents the currency, for example, USD.
   * Supported codes include standard ISO 4217 codes, legacy codes, and non-
   * standard codes.
   */
  currencyCode?: string | null;

  /**
   * Represents the selected delivery options for a checkout. This
   * property is only available if the shop has [upgraded to Checkout
   * Extensibility](https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  delivery?: Delivery | null;

  /**
   * A list of discount applications.
   */
  discountApplications?: DiscountApplication[];

  /**
   * The total amount of the discounts applied to the price of the checkout.
   * This property is only available if the shop has [upgraded to Checkout
   * Extensibility](https://help.shopify.com/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  discountsAmount?: MoneyV2 | null;

  /**
   * The email attached to this checkout.
   */
  email?: string | null;

  /**
   * A list of line item objects, each one containing information about an item
   * in the checkout.
   */
  lineItems?: CheckoutLineItem[];

  /**
   * Information about the active localized experience. This
   * property is only available if the shop has [upgraded to Checkout
   * Extensibility](https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  localization?: Localization;

  /**
   * The resulting order from a paid checkout.
   */
  order?: Order | null;

  /**
   * A unique phone number for the customer. Formatted using E.164 standard. For
   * example, *+16135551111*.
   */
  phone?: string | null;

  /**
   * The shipping address to where the line items will be shipped.
   */
  shippingAddress?: MailingAddress | null;

  /**
   * Once a shipping rate is selected by the customer it is transitioned to a
   * `shipping_line` object.
   */
  shippingLine?: ShippingRate | null;

  /**
   * The phone number provided by the buyer after opting in to SMS
   * marketing. This property is only available if the shop has [upgraded
   * to Checkout Extensibility](https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  smsMarketingPhone?: string | null;

  /**
   * The price at checkout before duties, shipping, and taxes.
   */
  subtotalPrice?: MoneyV2 | null;

  /**
   * A unique identifier for a particular checkout.
   */
  token?: string | null;

  /**
   * The sum of all the prices of all the items in the checkout, including
   * duties, taxes, and discounts.
   */
  totalPrice?: MoneyV2 | null;

  /**
   * The sum of all the taxes applied to the line items and shipping lines in
   * the checkout.
   */
  totalTax?: MoneyV2;

  /**
   * A list of transactions associated with a checkout or order. Certain
   * transactions, such as credit card transactions, may only be present in the
   * checkout_completed event.
   */
  transactions?: Transaction[];
}
```

### Attribute

Custom attributes associated with the cart or checkout.

* key

  The key for the attribute.

  ```ts
  string
  ```

* value

  The value for the attribute.

  ```ts
  string
  ```

```ts
export interface Attribute {
  /**
   * The key for the attribute.
   */
  key?: string;

  /**
   * The value for the attribute.
   */
  value?: string;
}
```

### MailingAddress

A mailing address for customers and shipping.

* address1

  The first line of the address. This is usually the street address or a P.O. Box number.

  ```ts
  string | null
  ```

* address2

  The second line of the address. This is usually an apartment, suite, or unit number.

  ```ts
  string | null
  ```

* city

  The name of the city, district, village, or town.

  ```ts
  string | null
  ```

* country

  The name of the country.

  ```ts
  string | null
  ```

* countryCode

  The two-letter code that represents the country, for example, US. The country codes generally follows ISO 3166-1 alpha-2 guidelines.

  ```ts
  string | null
  ```

* firstName

  The customer’s first name.

  ```ts
  string | null
  ```

* lastName

  The customer’s last name.

  ```ts
  string | null
  ```

* phone

  The phone number for this mailing address as entered by the customer.

  ```ts
  string | null
  ```

* province

  The region of the address, such as the province, state, or district.

  ```ts
  string | null
  ```

* provinceCode

  The two-letter code for the region. For example, ON.

  ```ts
  string | null
  ```

* zip

  The ZIP or postal code of the address.

  ```ts
  string | null
  ```

```ts
export interface MailingAddress {
  /**
   * The first line of the address. This is usually the street address or a P.O.
   * Box number.
   */
  address1?: string | null;

  /**
   * The second line of the address. This is usually an apartment, suite, or
   * unit number.
   */
  address2?: string | null;

  /**
   * The name of the city, district, village, or town.
   */
  city?: string | null;

  /**
   * The name of the country.
   */
  country?: string | null;

  /**
   * The two-letter code that represents the country, for example, US.
   * The country codes generally follows ISO 3166-1 alpha-2 guidelines.
   */
  countryCode?: string | null;

  /**
   * The customer’s first name.
   */
  firstName?: string | null;

  /**
   * The customer’s last name.
   */
  lastName?: string | null;

  /**
   * The phone number for this mailing address as entered by the customer.
   */
  phone?: string | null;

  /**
   * The region of the address, such as the province, state, or district.
   */
  province?: string | null;

  /**
   * The two-letter code for the region.
   * For example, ON.
   */
  provinceCode?: string | null;

  /**
   * The ZIP or postal code of the address.
   */
  zip?: string | null;
}
```

### Delivery

The delivery information for the event.

* selectedDeliveryOptions

  The selected delivery options for the event.

  ```ts
  DeliveryOption[]
  ```

```ts
export interface Delivery {
  /**
   * The selected delivery options for the event.
   */
  selectedDeliveryOptions?: DeliveryOption[];
}
```

### DeliveryOption

Represents a delivery option that the customer can choose from.

* cost

  The cost of the delivery option.

  ```ts
  MoneyV2 | null
  ```

* costAfterDiscounts

  The cost of the delivery option after discounts have been applied.

  ```ts
  MoneyV2 | null
  ```

* description

  The description of the delivery option.

  ```ts
  string | null
  ```

* handle

  The unique identifier of the delivery option.

  ```ts
  string
  ```

* title

  The title of the delivery option.

  ```ts
  string | null
  ```

* type

  The type of delivery option. - \`pickup\` - \`pickupPoint\` - \`shipping\` - \`local\`

  ```ts
  string
  ```

```ts
export interface DeliveryOption {
  /**
   * The cost of the delivery option.
   */
  cost?: MoneyV2 | null;

  /**
   * The cost of the delivery option after discounts have been applied.
   */
  costAfterDiscounts?: MoneyV2 | null;

  /**
   * The description of the delivery option.
   */
  description?: string | null;

  /**
   * The unique identifier of the delivery option.
   */
  handle?: string;

  /**
   * The title of the delivery option.
   */
  title?: string | null;

  /**
   * The type of delivery option.
   *
   * - `pickup`
   * - `pickupPoint`
   * - `shipping`
   * - `local`
   */
  type?: string;
}
```

### MoneyV2

A monetary value with currency.

* amount

  The decimal money amount.

  ```ts
  number
  ```

* currencyCode

  The three-letter code that represents the currency, for example, USD. Supported codes include standard ISO 4217 codes, legacy codes, and non- standard codes.

  ```ts
  string
  ```

```ts
export interface MoneyV2 {
  /**
   * The decimal money amount.
   */
  amount?: number;

  /**
   * The three-letter code that represents the currency, for example, USD.
   * Supported codes include standard ISO 4217 codes, legacy codes, and non-
   * standard codes.
   */
  currencyCode?: string;
}
```

### DiscountApplication

The information about the intent of the discount.

* allocationMethod

  The method by which the discount's value is applied to its entitled items. - \`ACROSS\`: The value is spread across all entitled lines. - \`EACH\`: The value is applied onto every entitled line.

  ```ts
  string
  ```

* targetSelection

  How the discount amount is distributed on the discounted lines. - \`ALL\`: The discount is allocated onto all the lines. - \`ENTITLED\`: The discount is allocated onto only the lines that it's entitled for. - \`EXPLICIT\`: The discount is allocated onto explicitly chosen lines.

  ```ts
  string
  ```

* targetType

  The type of line (i.e. line item or shipping line) on an order that the discount is applicable towards. - \`LINE\_ITEM\`: The discount applies onto line items. - \`SHIPPING\_LINE\`: The discount applies onto shipping lines.

  ```ts
  string
  ```

* title

  The customer-facing name of the discount. If the type of discount is a \`DISCOUNT\_CODE\`, this \`title\` attribute represents the code of the discount.

  ```ts
  string
  ```

* type

  The type of the discount. - \`AUTOMATIC\`: A discount automatically at checkout or in the cart without the need for a code. - \`DISCOUNT\_CODE\`: A discount applied onto checkouts through the use of a code. - \`MANUAL\`: A discount that is applied to an order by a merchant or store owner manually, rather than being automatically applied by the system or through a script. - \`SCRIPT\`: A discount applied to a customer's order using a script

  ```ts
  string
  ```

* value

  The value of the discount. Fixed discounts return a \`Money\` Object, while Percentage discounts return a \`PricingPercentageValue\` object.

  ```ts
  MoneyV2 | PricingPercentageValue
  ```

```ts
export interface DiscountApplication {
  /**
   * The method by which the discount's value is applied to its entitled items.
   *
   * - `ACROSS`: The value is spread across all entitled lines.
   * - `EACH`: The value is applied onto every entitled line.
   */
  allocationMethod?: string;

  /**
   * How the discount amount is distributed on the discounted lines.
   *
   * - `ALL`: The discount is allocated onto all the lines.
   * - `ENTITLED`: The discount is allocated onto only the lines that it's
   * entitled for.
   * - `EXPLICIT`: The discount is allocated onto explicitly chosen lines.
   */
  targetSelection?: string;

  /**
   * The type of line (i.e. line item or shipping line) on an order that the
   * discount is applicable towards.
   *
   * - `LINE_ITEM`: The discount applies onto line items.
   * - `SHIPPING_LINE`: The discount applies onto shipping lines.
   */
  targetType?: string;

  /**
   * The customer-facing name of the discount. If the type of discount is
   * a `DISCOUNT_CODE`, this `title` attribute represents the code of the
   * discount.
   */
  title?: string;

  /**
   * The type of the discount.
   *
   * - `AUTOMATIC`: A discount automatically at checkout or in the cart without
   * the need for a code.
   * - `DISCOUNT_CODE`: A discount applied onto checkouts through the use of
   * a code.
   * - `MANUAL`: A discount that is applied to an order by a merchant or store
   * owner manually, rather than being automatically applied by the system or
   * through a script.
   * - `SCRIPT`: A discount applied to a customer's order using a script
   */
  type?: string;

  /**
   * The value of the discount. Fixed discounts return a `Money` Object, while
   * Percentage discounts return a `PricingPercentageValue` object.
   */
  value?: MoneyV2 | PricingPercentageValue;
}
```

### PricingPercentageValue

A value given to a customer when a discount is applied to an order. The application of a discount with this value gives the customer the specified percentage off a specified item.

* percentage

  The percentage value of the object.

  ```ts
  number
  ```

```ts
export interface PricingPercentageValue {
  /**
   * The percentage value of the object.
   */
  percentage?: number;
}
```

### CheckoutLineItem

A single line item in the checkout, grouped by variant and attributes.

* discountAllocations

  The discounts that have been applied to the checkout line item by a discount application.

  ```ts
  DiscountAllocation[]
  ```

* finalLinePrice

  The combined price of all of the items in the line item after line-level discounts have been applied. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  MoneyV2
  ```

* id

  A globally unique identifier.

  ```ts
  string | null
  ```

* properties

  The properties of the line item. A shop may add, or enable customers to add custom information to a line item. Line item properties consist of a key and value pair. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  Property[]
  ```

* quantity

  The quantity of the line item.

  ```ts
  number
  ```

* sellingPlanAllocation

  The selling plan associated with the line item and the effect that each selling plan has on variants when they're purchased. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  SellingPlanAllocation | null
  ```

* title

  The title of the line item. Defaults to the product's title.

  ```ts
  string | null
  ```

* variant

  Product variant of the line item.

  ```ts
  ProductVariant | null
  ```

```ts
export interface CheckoutLineItem {
  /**
   * The discounts that have been applied to the checkout line item by a
   * discount application.
   */
  discountAllocations?: DiscountAllocation[];

  /**
   * The combined price of all of the items in the line item
   * after line-level discounts have been applied. This property
   * is only available if the shop has [upgraded to Checkout
   * Extensibility](https://help.shopify.com/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  finalLinePrice?: MoneyV2;

  /**
   * A globally unique identifier.
   */
  id?: string | null;

  /**
   * The properties of the line item. A shop may add, or enable customers to add
   * custom information to a line item. Line item properties consist of a key
   * and value pair. This property is only available if the shop has [upgraded
   * to Checkout Extensibility](https://help.shopify.com/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  properties?: Property[];

  /**
   * The quantity of the line item.
   */
  quantity?: number;

  /**
   * The selling plan associated with the line item and the effect that
   * each selling plan has on variants when they're purchased. This
   * property is only available if the shop has [upgraded to Checkout
   * Extensibility](https://help.shopify.com/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  sellingPlanAllocation?: SellingPlanAllocation | null;

  /**
   * The title of the line item. Defaults to the product's title.
   */
  title?: string | null;

  /**
   * Product variant of the line item.
   */
  variant?: ProductVariant | null;
}
```

### DiscountAllocation

The discount that has been applied to the checkout line item.

* amount

  The monetary value with currency allocated to the discount.

  ```ts
  MoneyV2
  ```

* discountApplication

  The information about the intent of the discount.

  ```ts
  DiscountApplication
  ```

```ts
export interface DiscountAllocation {
  /**
   * The monetary value with currency allocated to the discount.
   */
  amount?: MoneyV2;

  /**
   * The information about the intent of the discount.
   */
  discountApplication?: DiscountApplication;
}
```

### Property

The line item additional custom properties.

* key

  The key for the property.

  ```ts
  string
  ```

* value

  The value for the property.

  ```ts
  string
  ```

```ts
export interface Property {
  /**
   * The key for the property.
   */
  key?: string;

  /**
   * The value for the property.
   */
  value?: string;
}
```

### SellingPlanAllocation

Represents an association between a variant and a selling plan.

* sellingPlan

  A representation of how products and variants can be sold and purchased. For example, an individual selling plan could be '6 weeks of prepaid granola, delivered weekly'.

  ```ts
  SellingPlan
  ```

```ts
export interface SellingPlanAllocation {
  /**
   * A representation of how products and variants can be sold and purchased.
   * For example, an individual selling plan could be '6 weeks of prepaid
   * granola, delivered weekly'.
   */
  sellingPlan?: SellingPlan;
}
```

### SellingPlan

Represents how products and variants can be sold and purchased.

* id

  A globally unique identifier.

  ```ts
  string
  ```

* name

  The name of the selling plan. For example, '6 weeks of prepaid granola, delivered weekly'.

  ```ts
  string
  ```

```ts
export interface SellingPlan {
  /**
   * A globally unique identifier.
   */
  id?: string;

  /**
   * The name of the selling plan. For example, '6 weeks of prepaid granola,
   * delivered weekly'.
   */
  name?: string;
}
```

### ProductVariant

A product variant represents a different version of a product, such as differing sizes or differing colors.

* id

  A globally unique identifier.

  ```ts
  string | null
  ```

* image

  Image associated with the product variant. This field falls back to the product image if no image is available.

  ```ts
  Image | null
  ```

* price

  The product variant’s price.

  ```ts
  MoneyV2
  ```

* product

  The product object that the product variant belongs to.

  ```ts
  Product
  ```

* sku

  The SKU (stock keeping unit) associated with the variant.

  ```ts
  string | null
  ```

* title

  The product variant’s title.

  ```ts
  string | null
  ```

* untranslatedTitle

  The product variant’s untranslated title.

  ```ts
  string | null
  ```

```ts
export interface ProductVariant {
  /**
   * A globally unique identifier.
   */
  id?: string | null;

  /**
   * Image associated with the product variant. This field falls back to the
   * product image if no image is available.
   */
  image?: Image | null;

  /**
   * The product variant’s price.
   */
  price?: MoneyV2;

  /**
   * The product object that the product variant belongs to.
   */
  product?: Product;

  /**
   * The SKU (stock keeping unit) associated with the variant.
   */
  sku?: string | null;

  /**
   * The product variant’s title.
   */
  title?: string | null;

  /**
   * The product variant’s untranslated title.
   */
  untranslatedTitle?: string | null;
}
```

### Image

An image resource.

* src

  The location of the image as a URL.

  ```ts
  string | null
  ```

```ts
export interface Image {
  /**
   * The location of the image as a URL.
   */
  src?: string | null;
}
```

### Product

A product is an individual item for sale in a Shopify store.

* id

  The ID of the product.

  ```ts
  string | null
  ```

* title

  The product’s title.

  ```ts
  string
  ```

* type

  The \[product type]\(https://help.shopify.com/en/manual/products/details/product-type) specified by the merchant.

  ```ts
  string | null
  ```

* untranslatedTitle

  The product’s untranslated title.

  ```ts
  string | null
  ```

* url

  The relative URL of the product.

  ```ts
  string | null
  ```

* vendor

  The product’s vendor name.

  ```ts
  string
  ```

```ts
export interface Product {
  /**
   * The ID of the product.
   */
  id?: string | null;

  /**
   * The product’s title.
   */
  title?: string;

  /**
   * The [product
   * type](https://help.shopify.com/en/manual/products/details/product-type)
   * specified by the merchant.
   */
  type?: string | null;

  /**
   * The product’s untranslated title.
   */
  untranslatedTitle?: string | null;

  /**
   * The relative URL of the product.
   */
  url?: string | null;

  /**
   * The product’s vendor name.
   */
  vendor?: string;
}
```

### Localization

Information about the active localized experience.

* country

  The country of the active localized experience.

  ```ts
  Country
  ```

* language

  The language of the active localized experience.

  ```ts
  Language
  ```

* market

  The market including the country of the active localized experience.

  ```ts
  Market
  ```

```ts
export interface Localization {
  /**
   * The country of the active localized experience.
   */
  country?: Country;

  /**
   * The language of the active localized experience.
   */
  language?: Language;

  /**
   * The market including the country of the active localized experience.
   */
  market?: Market;
}
```

### Country

A country.

* isoCode

  The ISO-3166-1 code for this country, for example, "US".

  ```ts
  string | null
  ```

```ts
export interface Country {
  /**
   * The ISO-3166-1 code for this country, for example, "US".
   */
  isoCode?: string | null;
}
```

### Language

A language.

* isoCode

  The BCP-47 language tag. It may contain a dash followed by an ISO 3166-1 alpha-2 region code, for example, "en-US".

  ```ts
  string
  ```

```ts
export interface Language {
  /**
   * The BCP-47 language tag. It may contain a dash followed by an ISO 3166-1
   * alpha-2 region code, for example, "en-US".
   */
  isoCode?: string;
}
```

### Market

A group of one or more regions of the world that a merchant is targeting for sales. To learn more about markets, refer to \[this]\(https://shopify.dev/docs/apps/markets) conceptual overview.

* handle

  A human-readable, shop-scoped identifier.

  ```ts
  string | null
  ```

* id

  A globally unique identifier.

  ```ts
  string | null
  ```

```ts
export interface Market {
  /**
   * A human-readable, shop-scoped identifier.
   */
  handle?: string | null;

  /**
   * A globally unique identifier.
   */
  id?: string | null;
}
```

### Order

An order is a customer’s completed request to purchase one or more products from a shop. An order is created when a customer completes the checkout process.

* customer

  The customer that placed the order.

  ```ts
  OrderCustomer | null
  ```

* id

  The ID of the order. ID will be null for all events except checkout\_completed.

  ```ts
  string | null
  ```

```ts
export interface Order {
  /**
   * The customer that placed the order.
   */
  customer?: OrderCustomer | null;

  /**
   * The ID of the order. ID will be null for all events except
   * checkout_completed.
   */
  id?: string | null;
}
```

### OrderCustomer

The customer that placed the order.

* id

  The ID of the customer.

  ```ts
  string | null
  ```

* isFirstOrder

  Indicates if the order is the customer’s first order. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  boolean | null
  ```

```ts
export interface OrderCustomer {
  /**
   * The ID of the customer.
   */
  id?: string | null;

  /**
   * Indicates if the order is the customer’s first order. This
   * property is only available if the shop has [upgraded to Checkout
   * Extensibility](https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  isFirstOrder?: boolean | null;
}
```

### ShippingRate

A shipping rate to be applied to a checkout.

* price

  Price of this shipping rate.

  ```ts
  MoneyV2
  ```

```ts
export interface ShippingRate {
  /**
   * Price of this shipping rate.
   */
  price?: MoneyV2;
}
```

### Transaction

A transaction associated with a checkout or order.

* amount

  The monetary value with currency allocated to the transaction method.

  ```ts
  MoneyV2
  ```

* gateway

  The name of the payment provider used for the transaction.

  ```ts
  string
  ```

* paymentMethod

  The payment method used for the transaction. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  TransactionPaymentMethod
  ```

```ts
export interface Transaction {
  /**
   * The monetary value with currency allocated to the transaction method.
   */
  amount?: MoneyV2;

  /**
   * The name of the payment provider used for the transaction.
   */
  gateway?: string;

  /**
   * The payment method used for the transaction. This property
   * is only available if the shop has [upgraded to Checkout
   * Extensibility](https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  paymentMethod?: TransactionPaymentMethod;
}
```

### TransactionPaymentMethod

The payment method used for the transaction. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

* name

  The name of the payment method used for the transaction. This may further specify the payment method used.

  ```ts
  string
  ```

* type

  The type of payment method used for the transaction. - \`creditCard\`: A vaulted or manually entered credit card. - \`redeemable\`: A redeemable payment method, such as a gift card or store credit. - \`deferred\`: A \[deferred payment]\(https://help.shopify.com/en/manual/orders/deferred-payments), such as invoicing the buyer and collecting payment later. - \`local\`: A \[local payment method]\(https://help.shopify.com/en/manual/payments/shopify-payments/local-payment-methods) specific to the current region or market. - \`manualPayment\`: A manual payment method, such as an in-person retail transaction. - \`paymentOnDelivery\`: A payment that will be collected on delivery. - \`wallet\`: An integrated wallet, such as PayPal, Google Pay, Apple Pay, etc. - \`offsite\`: A payment processed outside of Shopify's checkout, excluding integrated wallets. - \`customOnSite\`: A custom payment method that is processed through a checkout extension with a payments app. - \`other\`: Another type of payment not defined here.

  ```ts
  string
  ```

```ts
export interface TransactionPaymentMethod {
  /**
   * The name of the payment method used for the transaction. This may further
   * specify the payment method used.
   */
  name?: string;

  /**
   * The type of payment method used for the transaction.
   *
   * - `creditCard`: A vaulted or manually entered credit card.
   * - `redeemable`: A redeemable payment method, such as a gift card or store
   * credit.
   * - `deferred`: A [deferred
   * payment](https://help.shopify.com/en/manual/orders/deferred-payments), such
   * as invoicing the buyer and collecting payment later.
   * - `local`: A [local payment
   * method](https://help.shopify.com/en/manual/payments/shopify-payments/local-payment-methods) specific to the current region or market.
   * - `manualPayment`: A manual payment method, such as an in-person retail
   * transaction.
   * - `paymentOnDelivery`: A payment that will be collected on delivery.
   * - `wallet`: An integrated wallet, such as PayPal, Google Pay, Apple Pay,
   * etc.
   * - `offsite`: A payment processed outside of Shopify's checkout, excluding
   * integrated wallets.
   * - `customOnSite`: A custom payment method that is processed through a
   * checkout extension with a payments app.
   * - `other`: Another type of payment not defined here.
   */
  type?: string;
}
```

### EventType

* AdvancedDom

  ```ts
  advanced-dom
  ```

* Custom

  ```ts
  custom
  ```

* Dom

  ```ts
  dom
  ```

* Meta

  ```ts
  meta
  ```

* Standard

  ```ts
  standard
  ```

```ts
export enum EventType {
  AdvancedDom = 'advanced-dom',
  Custom = 'custom',
  Dom = 'dom',
  Meta = 'meta',
  Standard = 'standard',
}
```

Examples

### Examples

* #### Accessing Standard Events

  ##### App Pixel

  ```javascript
  import {register} from '@shopify/web-pixels-extension';

  register(({analytics}) => {
    analytics.subscribe('checkout_started', (event) => {
      // Example for accessing event data
      const checkout = event.data.checkout;

      const checkoutTotalPrice = checkout.totalPrice?.amount;

      const allDiscountCodes = checkout.discountApplications.map((discount) => {
        if (discount.type === 'DISCOUNT_CODE') {
          return discount.title;
        }
      });

      const firstItem = checkout.lineItems[0];

      const firstItemDiscountedValue = firstItem.discountAllocations[0]?.amount;

      const customItemPayload = {
        quantity: firstItem.quantity,
        title: firstItem.title,
        discount: firstItemDiscountedValue,
      };

      const payload = {
        event_name: event.name,
        event_data: {
          totalPrice: checkoutTotalPrice,
          discountCodesUsed: allDiscountCodes,
          firstItem: customItemPayload,
        },
      };

      // Example for sending event data to third party servers
      fetch('https://example.com/pixel', {
        method: 'POST',
        body: JSON.stringify(payload),
        keepalive: true,
      });
    });
  });
  ```

  ##### Custom Pixel

  ```javascript
  analytics.subscribe('checkout_started', (event) => {
    // Example for accessing event data
    const checkout = event.data.checkout;

    const checkoutTotalPrice = checkout.totalPrice?.amount;

    const allDiscountCodes = checkout.discountApplications.map((discount) => {
      if (discount.type === 'DISCOUNT_CODE') {
        return discount.title;
      }
    });

    const firstItem = checkout.lineItems[0];

    const firstItemDiscountedValue = firstItem.discountAllocations[0]?.amount;

    const customItemPayload = {
      quantity: firstItem.quantity,
      title: firstItem.title,
      discount: firstItemDiscountedValue,
    };

    const payload = {
      event_name: event.name,
      event_data: {
        totalPrice: checkoutTotalPrice,
        discountCodesUsed: allDiscountCodes,
        firstItem: customItemPayload,
      },
    };

    // Example for sending event data to third party servers
    fetch('https://example.com/pixel', {
      method: 'POST',
      body: JSON.stringify(payload),
      keepalive: true,
    });
  });
  ```

</page>

<page>
---
title: collection_viewed
description: >-
  The `collection_viewed` event logs an instance where a customer visited a
  product collection index page. This event is available on the online store
  page.
api_name: web-pixels
source_url:
  html: >-
    https://shopify.dev/docs/api/web-pixels-api/standard-events/collection_viewed
  md: >-
    https://shopify.dev/docs/api/web-pixels-api/standard-events/collection_viewed.md
---

# collection\_​viewed

The `collection_viewed` event logs an instance where a customer visited a product collection index page. This event is available on the online store page.

## Properties

* clientId

  string

  The client-side ID of the customer, provided by Shopify

* context

  Context

* data

  PixelEventsCollectionViewedData

* id

  string

  The ID of the customer event

* name

  string

  The name of the customer event

* seq

  number

  The sequence index number of the event.

* timestamp

  string

  The timestamp of when the customer event occurred, in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format

* type

  EventType.Standard

### Context

A snapshot of various read-only properties of the browser at the time of event

* document

  Snapshot of a subset of properties of the \`document\` object in the top frame of the browser

  ```ts
  WebPixelsDocument
  ```

* navigator

  Snapshot of a subset of properties of the \`navigator\` object in the top frame of the browser

  ```ts
  WebPixelsNavigator
  ```

* window

  Snapshot of a subset of properties of the \`window\` object in the top frame of the browser

  ```ts
  WebPixelsWindow
  ```

```ts
export interface Context {
  /**
   * Snapshot of a subset of properties of the `document` object in the top
   * frame of the browser
   */
  document?: WebPixelsDocument;

  /**
   * Snapshot of a subset of properties of the `navigator` object in the top
   * frame of the browser
   */
  navigator?: WebPixelsNavigator;

  /**
   * Snapshot of a subset of properties of the `window` object in the top frame
   * of the browser
   */
  window?: WebPixelsWindow;
}
```

### WebPixelsDocument

A snapshot of a subset of properties of the \`document\` object in the top frame of the browser

* characterSet

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the character set being used by the document

  ```ts
  string
  ```

* location

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the URI of the current document

  ```ts
  Location
  ```

* referrer

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the URI of the page that linked to this page

  ```ts
  string
  ```

* title

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the title of the current document

  ```ts
  string
  ```

```ts
export interface WebPixelsDocument {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the character set being used by the document
   */
  characterSet?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the URI of the current document
   */
  location?: Location;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the URI of the page that linked to this page
   */
  referrer?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the title of the current document
   */
  title?: string;
}
```

### Location

A snapshot of a subset of properties of the \`location\` object in the top frame of the browser

* hash

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing a \`'#'\` followed by the fragment identifier of the URL

  ```ts
  string
  ```

* host

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the host, that is the hostname, a \`':'\`, and the port of the URL

  ```ts
  string
  ```

* hostname

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the domain of the URL

  ```ts
  string
  ```

* href

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the entire URL

  ```ts
  string
  ```

* origin

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the canonical form of the origin of the specific location

  ```ts
  string
  ```

* pathname

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing an initial \`'/'\` followed by the path of the URL, not including the query string or fragment

  ```ts
  string
  ```

* port

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the port number of the URL

  ```ts
  string
  ```

* protocol

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the protocol scheme of the URL, including the final \`':'\`

  ```ts
  string
  ```

* search

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing a \`'?'\` followed by the parameters or "querystring" of the URL

  ```ts
  string
  ```

```ts
export interface Location {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing a `'#'` followed by the fragment identifier of the URL
   */
  hash?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the host, that is the hostname, a `':'`, and the port of
   * the URL
   */
  host?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the domain of the URL
   */
  hostname?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the entire URL
   */
  href?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the canonical form of the origin of the specific location
   */
  origin?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing an initial `'/'` followed by the path of the URL, not
   * including the query string or fragment
   */
  pathname?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the port number of the URL
   */
  port?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the protocol scheme of the URL, including the final `':'`
   */
  protocol?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing a `'?'` followed by the parameters or "querystring" of
   * the URL
   */
  search?: string;
}
```

### WebPixelsNavigator

A snapshot of a subset of properties of the \`navigator\` object in the top frame of the browser

* cookieEnabled

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns \`false\` if setting a cookie will be ignored and true otherwise

  ```ts
  boolean
  ```

* language

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns a string representing the preferred language of the user, usually the language of the browser UI. The \`null\` value is returned when this is unknown

  ```ts
  string
  ```

* languages

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns an array of strings representing the languages known to the user, by order of preference

  ```ts
  ReadonlyArray<string>
  ```

* userAgent

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns the user agent string for the current browser

  ```ts
  string
  ```

```ts
export interface WebPixelsNavigator {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns `false` if setting a cookie will be ignored and true otherwise
   */
  cookieEnabled?: boolean;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns a string representing the preferred language of the user, usually
   * the language of the browser UI. The `null` value is returned when this
   * is unknown
   */
  language?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns an array of strings representing the languages known to the user,
   * by order of preference
   */
  languages?: ReadonlyArray<string>;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns the user agent string for the current browser
   */
  userAgent?: string;
}
```

### WebPixelsWindow

A snapshot of a subset of properties of the \`window\` object in the top frame of the browser

* innerHeight

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the height of the content area of the browser window including, if rendered, the horizontal scrollbar

  ```ts
  number
  ```

* innerWidth

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the width of the content area of the browser window including, if rendered, the vertical scrollbar

  ```ts
  number
  ```

* location

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the location, or current URL, of the window object

  ```ts
  Location
  ```

* origin

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the global object's origin, serialized as a string

  ```ts
  string
  ```

* outerHeight

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the height of the outside of the browser window

  ```ts
  number
  ```

* outerWidth

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the width of the outside of the browser window

  ```ts
  number
  ```

* pageXOffset

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), an alias for window\.scrollX

  ```ts
  number
  ```

* pageYOffset

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), an alias for window\.scrollY

  ```ts
  number
  ```

* screen

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Screen), the interface representing a screen, usually the one on which the current window is being rendered

  ```ts
  Screen
  ```

* screenX

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the horizontal distance from the left border of the user's browser viewport to the left side of the screen

  ```ts
  number
  ```

* screenY

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the vertical distance from the top border of the user's browser viewport to the top side of the screen

  ```ts
  number
  ```

* scrollX

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the number of pixels that the document has already been scrolled horizontally

  ```ts
  number
  ```

* scrollY

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the number of pixels that the document has already been scrolled vertically

  ```ts
  number
  ```

```ts
export interface WebPixelsWindow {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window),
   * gets the height of the content area of the browser window including, if
   * rendered, the horizontal scrollbar
   */
  innerHeight?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), gets
   * the width of the content area of the browser window including, if rendered,
   * the vertical scrollbar
   */
  innerWidth?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * location, or current URL, of the window object
   */
  location?: Location;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * global object's origin, serialized as a string
   */
  origin?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), gets
   * the height of the outside of the browser window
   */
  outerHeight?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), gets
   * the width of the outside of the browser window
   */
  outerWidth?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), an
   * alias for window.scrollX
   */
  pageXOffset?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), an
   * alias for window.scrollY
   */
  pageYOffset?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen), the
   * interface representing a screen, usually the one on which the current
   * window is being rendered
   */
  screen?: Screen;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * horizontal distance from the left border of the user's browser viewport to
   * the left side of the screen
   */
  screenX?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * vertical distance from the top border of the user's browser viewport to the
   * top side of the screen
   */
  screenY?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * number of pixels that the document has already been scrolled horizontally
   */
  scrollX?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * number of pixels that the document has already been scrolled vertically
   */
  scrollY?: number;
}
```

### Screen

The interface representing a screen, usually the one on which the current window is being rendered

* height

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Screen/height), the height of the screen

  ```ts
  number
  ```

* width

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Screen/width), the width of the screen

  ```ts
  number
  ```

```ts
export interface Screen {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen/height),
   * the height of the screen
   */
  height?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen/width),
   * the width of the screen
   */
  width?: number;
}
```

### PixelEventsCollectionViewedData

* collection

  ```ts
  Collection
  ```

```ts
export interface PixelEventsCollectionViewedData {
  collection?: Collection;
}
```

### Collection

A collection is a group of products that a shop owner can create to organize them or make their shops easier to browse.

* id

  A globally unique identifier.

  ```ts
  string
  ```

* productVariants

  ```ts
  ProductVariant[]
  ```

* title

  The collection’s name. Maximum length: 255 characters.

  ```ts
  string
  ```

```ts
export interface Collection {
  /**
   * A globally unique identifier.
   */
  id?: string;
  productVariants?: ProductVariant[];

  /**
   * The collection’s name. Maximum length: 255 characters.
   */
  title?: string;
}
```

### ProductVariant

A product variant represents a different version of a product, such as differing sizes or differing colors.

* id

  A globally unique identifier.

  ```ts
  string | null
  ```

* image

  Image associated with the product variant. This field falls back to the product image if no image is available.

  ```ts
  Image | null
  ```

* price

  The product variant’s price.

  ```ts
  MoneyV2
  ```

* product

  The product object that the product variant belongs to.

  ```ts
  Product
  ```

* sku

  The SKU (stock keeping unit) associated with the variant.

  ```ts
  string | null
  ```

* title

  The product variant’s title.

  ```ts
  string | null
  ```

* untranslatedTitle

  The product variant’s untranslated title.

  ```ts
  string | null
  ```

```ts
export interface ProductVariant {
  /**
   * A globally unique identifier.
   */
  id?: string | null;

  /**
   * Image associated with the product variant. This field falls back to the
   * product image if no image is available.
   */
  image?: Image | null;

  /**
   * The product variant’s price.
   */
  price?: MoneyV2;

  /**
   * The product object that the product variant belongs to.
   */
  product?: Product;

  /**
   * The SKU (stock keeping unit) associated with the variant.
   */
  sku?: string | null;

  /**
   * The product variant’s title.
   */
  title?: string | null;

  /**
   * The product variant’s untranslated title.
   */
  untranslatedTitle?: string | null;
}
```

### Image

An image resource.

* src

  The location of the image as a URL.

  ```ts
  string | null
  ```

```ts
export interface Image {
  /**
   * The location of the image as a URL.
   */
  src?: string | null;
}
```

### MoneyV2

A monetary value with currency.

* amount

  The decimal money amount.

  ```ts
  number
  ```

* currencyCode

  The three-letter code that represents the currency, for example, USD. Supported codes include standard ISO 4217 codes, legacy codes, and non- standard codes.

  ```ts
  string
  ```

```ts
export interface MoneyV2 {
  /**
   * The decimal money amount.
   */
  amount?: number;

  /**
   * The three-letter code that represents the currency, for example, USD.
   * Supported codes include standard ISO 4217 codes, legacy codes, and non-
   * standard codes.
   */
  currencyCode?: string;
}
```

### Product

A product is an individual item for sale in a Shopify store.

* id

  The ID of the product.

  ```ts
  string | null
  ```

* title

  The product’s title.

  ```ts
  string
  ```

* type

  The \[product type]\(https://help.shopify.com/en/manual/products/details/product-type) specified by the merchant.

  ```ts
  string | null
  ```

* untranslatedTitle

  The product’s untranslated title.

  ```ts
  string | null
  ```

* url

  The relative URL of the product.

  ```ts
  string | null
  ```

* vendor

  The product’s vendor name.

  ```ts
  string
  ```

```ts
export interface Product {
  /**
   * The ID of the product.
   */
  id?: string | null;

  /**
   * The product’s title.
   */
  title?: string;

  /**
   * The [product
   * type](https://help.shopify.com/en/manual/products/details/product-type)
   * specified by the merchant.
   */
  type?: string | null;

  /**
   * The product’s untranslated title.
   */
  untranslatedTitle?: string | null;

  /**
   * The relative URL of the product.
   */
  url?: string | null;

  /**
   * The product’s vendor name.
   */
  vendor?: string;
}
```

### EventType

* AdvancedDom

  ```ts
  advanced-dom
  ```

* Custom

  ```ts
  custom
  ```

* Dom

  ```ts
  dom
  ```

* Meta

  ```ts
  meta
  ```

* Standard

  ```ts
  standard
  ```

```ts
export enum EventType {
  AdvancedDom = 'advanced-dom',
  Custom = 'custom',
  Dom = 'dom',
  Meta = 'meta',
  Standard = 'standard',
}
```

Examples

### Examples

* #### Accessing Standard Events

  ##### App Pixel

  ```javascript
  import {register} from '@shopify/web-pixels-extension';

  register(({analytics}) => {
    analytics.subscribe('collection_viewed', (event) => {
      // Example for accessing event data
      const collection = event.data.collection;

      const collectionTitle = collection.title;

      const priceOfFirstProductInCollection =
        collection.productVariants[0]?.price.amount;

      const payload = {
        event_name: event.name,
        event_data: {
          collectionTitle: collectionTitle,
          priceFirstItem: priceOfFirstProductInCollection,
        },
      };

      // Example for sending event to third party servers
      fetch('https://example.com/pixel', {
        method: 'POST',
        body: JSON.stringify(payload),
        keepalive: true,
      });
    });
  });
  ```

  ##### Custom Pixel

  ```javascript
  analytics.subscribe('collection_viewed', (event) => {
    // Example for accessing event data
    const collection = event.data.collection;

    const collectionTitle = collection.title;

    const priceOfFirstProductInCollection =
      collection.productVariants[0]?.price.amount;

    const payload = {
      event_name: event.name,
      event_data: {
        collectionTitle: collectionTitle,
        priceFirstItem: priceOfFirstProductInCollection,
      },
    };

    // Example for sending event to third party servers
    fetch('https://example.com/pixel', {
      method: 'POST',
      body: JSON.stringify(payload),
      keepalive: true,
    });
  });
  ```

</page>

<page>
---
title: page_viewed
description: >-
  The `page_viewed` event logs an instance where a customer visited a page. This
  event is available on the online store, Checkout, **Order status** and
  Customer Account pages.


  > Note: Customer Accounts pages will only log the `page_viewed` event if a
  vanity domain is set up for the store.
api_name: web-pixels
source_url:
  html: 'https://shopify.dev/docs/api/web-pixels-api/standard-events/page_viewed'
  md: 'https://shopify.dev/docs/api/web-pixels-api/standard-events/page_viewed.md'
---

# page\_​viewed

The `page_viewed` event logs an instance where a customer visited a page. This event is available on the online store, Checkout, **Order status** and Customer Account pages.

Note

Customer Accounts pages will only log the `page_viewed` event if a vanity domain is set up for the store.

## Properties

* clientId

  string

  The client-side ID of the customer, provided by Shopify

* context

  Context

* data

  PixelEventsPageViewedData

  No additional data is provided by design. Use the event context to get the page metadata. E.g. `event.context.document.location.href`

* id

  string

  The ID of the customer event

* name

  string

  The name of the customer event

* seq

  number

  The sequence index number of the event.

* timestamp

  string

  The timestamp of when the customer event occurred, in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format

* type

  EventType.Standard

### Context

A snapshot of various read-only properties of the browser at the time of event

* document

  Snapshot of a subset of properties of the \`document\` object in the top frame of the browser

  ```ts
  WebPixelsDocument
  ```

* navigator

  Snapshot of a subset of properties of the \`navigator\` object in the top frame of the browser

  ```ts
  WebPixelsNavigator
  ```

* window

  Snapshot of a subset of properties of the \`window\` object in the top frame of the browser

  ```ts
  WebPixelsWindow
  ```

```ts
export interface Context {
  /**
   * Snapshot of a subset of properties of the `document` object in the top
   * frame of the browser
   */
  document?: WebPixelsDocument;

  /**
   * Snapshot of a subset of properties of the `navigator` object in the top
   * frame of the browser
   */
  navigator?: WebPixelsNavigator;

  /**
   * Snapshot of a subset of properties of the `window` object in the top frame
   * of the browser
   */
  window?: WebPixelsWindow;
}
```

### WebPixelsDocument

A snapshot of a subset of properties of the \`document\` object in the top frame of the browser

* characterSet

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the character set being used by the document

  ```ts
  string
  ```

* location

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the URI of the current document

  ```ts
  Location
  ```

* referrer

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the URI of the page that linked to this page

  ```ts
  string
  ```

* title

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the title of the current document

  ```ts
  string
  ```

```ts
export interface WebPixelsDocument {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the character set being used by the document
   */
  characterSet?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the URI of the current document
   */
  location?: Location;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the URI of the page that linked to this page
   */
  referrer?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the title of the current document
   */
  title?: string;
}
```

### Location

A snapshot of a subset of properties of the \`location\` object in the top frame of the browser

* hash

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing a \`'#'\` followed by the fragment identifier of the URL

  ```ts
  string
  ```

* host

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the host, that is the hostname, a \`':'\`, and the port of the URL

  ```ts
  string
  ```

* hostname

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the domain of the URL

  ```ts
  string
  ```

* href

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the entire URL

  ```ts
  string
  ```

* origin

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the canonical form of the origin of the specific location

  ```ts
  string
  ```

* pathname

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing an initial \`'/'\` followed by the path of the URL, not including the query string or fragment

  ```ts
  string
  ```

* port

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the port number of the URL

  ```ts
  string
  ```

* protocol

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the protocol scheme of the URL, including the final \`':'\`

  ```ts
  string
  ```

* search

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing a \`'?'\` followed by the parameters or "querystring" of the URL

  ```ts
  string
  ```

```ts
export interface Location {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing a `'#'` followed by the fragment identifier of the URL
   */
  hash?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the host, that is the hostname, a `':'`, and the port of
   * the URL
   */
  host?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the domain of the URL
   */
  hostname?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the entire URL
   */
  href?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the canonical form of the origin of the specific location
   */
  origin?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing an initial `'/'` followed by the path of the URL, not
   * including the query string or fragment
   */
  pathname?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the port number of the URL
   */
  port?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the protocol scheme of the URL, including the final `':'`
   */
  protocol?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing a `'?'` followed by the parameters or "querystring" of
   * the URL
   */
  search?: string;
}
```

### WebPixelsNavigator

A snapshot of a subset of properties of the \`navigator\` object in the top frame of the browser

* cookieEnabled

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns \`false\` if setting a cookie will be ignored and true otherwise

  ```ts
  boolean
  ```

* language

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns a string representing the preferred language of the user, usually the language of the browser UI. The \`null\` value is returned when this is unknown

  ```ts
  string
  ```

* languages

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns an array of strings representing the languages known to the user, by order of preference

  ```ts
  ReadonlyArray<string>
  ```

* userAgent

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns the user agent string for the current browser

  ```ts
  string
  ```

```ts
export interface WebPixelsNavigator {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns `false` if setting a cookie will be ignored and true otherwise
   */
  cookieEnabled?: boolean;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns a string representing the preferred language of the user, usually
   * the language of the browser UI. The `null` value is returned when this
   * is unknown
   */
  language?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns an array of strings representing the languages known to the user,
   * by order of preference
   */
  languages?: ReadonlyArray<string>;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns the user agent string for the current browser
   */
  userAgent?: string;
}
```

### WebPixelsWindow

A snapshot of a subset of properties of the \`window\` object in the top frame of the browser

* innerHeight

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the height of the content area of the browser window including, if rendered, the horizontal scrollbar

  ```ts
  number
  ```

* innerWidth

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the width of the content area of the browser window including, if rendered, the vertical scrollbar

  ```ts
  number
  ```

* location

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the location, or current URL, of the window object

  ```ts
  Location
  ```

* origin

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the global object's origin, serialized as a string

  ```ts
  string
  ```

* outerHeight

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the height of the outside of the browser window

  ```ts
  number
  ```

* outerWidth

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the width of the outside of the browser window

  ```ts
  number
  ```

* pageXOffset

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), an alias for window\.scrollX

  ```ts
  number
  ```

* pageYOffset

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), an alias for window\.scrollY

  ```ts
  number
  ```

* screen

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Screen), the interface representing a screen, usually the one on which the current window is being rendered

  ```ts
  Screen
  ```

* screenX

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the horizontal distance from the left border of the user's browser viewport to the left side of the screen

  ```ts
  number
  ```

* screenY

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the vertical distance from the top border of the user's browser viewport to the top side of the screen

  ```ts
  number
  ```

* scrollX

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the number of pixels that the document has already been scrolled horizontally

  ```ts
  number
  ```

* scrollY

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the number of pixels that the document has already been scrolled vertically

  ```ts
  number
  ```

```ts
export interface WebPixelsWindow {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window),
   * gets the height of the content area of the browser window including, if
   * rendered, the horizontal scrollbar
   */
  innerHeight?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), gets
   * the width of the content area of the browser window including, if rendered,
   * the vertical scrollbar
   */
  innerWidth?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * location, or current URL, of the window object
   */
  location?: Location;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * global object's origin, serialized as a string
   */
  origin?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), gets
   * the height of the outside of the browser window
   */
  outerHeight?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), gets
   * the width of the outside of the browser window
   */
  outerWidth?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), an
   * alias for window.scrollX
   */
  pageXOffset?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), an
   * alias for window.scrollY
   */
  pageYOffset?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen), the
   * interface representing a screen, usually the one on which the current
   * window is being rendered
   */
  screen?: Screen;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * horizontal distance from the left border of the user's browser viewport to
   * the left side of the screen
   */
  screenX?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * vertical distance from the top border of the user's browser viewport to the
   * top side of the screen
   */
  screenY?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * number of pixels that the document has already been scrolled horizontally
   */
  scrollX?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * number of pixels that the document has already been scrolled vertically
   */
  scrollY?: number;
}
```

### Screen

The interface representing a screen, usually the one on which the current window is being rendered

* height

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Screen/height), the height of the screen

  ```ts
  number
  ```

* width

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Screen/width), the width of the screen

  ```ts
  number
  ```

```ts
export interface Screen {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen/height),
   * the height of the screen
   */
  height?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen/width),
   * the width of the screen
   */
  width?: number;
}
```

### PixelEventsPageViewedData

No additional data is provided by design. Use the event context to get the page metadata. E.g. \`event.context.document.location.href\`



```ts
export interface PixelEventsPageViewedData {}
```

### EventType

* AdvancedDom

  ```ts
  advanced-dom
  ```

* Custom

  ```ts
  custom
  ```

* Dom

  ```ts
  dom
  ```

* Meta

  ```ts
  meta
  ```

* Standard

  ```ts
  standard
  ```

```ts
export enum EventType {
  AdvancedDom = 'advanced-dom',
  Custom = 'custom',
  Dom = 'dom',
  Meta = 'meta',
  Standard = 'standard',
}
```

Examples

### Examples

* #### Accessing Standard Events

  ##### App Pixel

  ```javascript
  import {register} from '@shopify/web-pixels-extension';

  register(({analytics}) => {
    analytics.subscribe('page_viewed', (event) => {
      // Example for accessing event data
      const timeStamp = event.timestamp;

      const pageEventId = event.id;

      const payload = {
        event_name: event.name,
        event_data: {
          pageEventId: pageEventId,
          timeStamp: timeStamp,
        },
      };

      // Example for sending event data to third party servers
      fetch('https://example.com/pixel', {
        method: 'POST',
        body: JSON.stringify(payload),
        keepalive: true,
      });
    });
  });
  ```

  ##### Custom Pixel

  ```javascript
  analytics.subscribe('page_viewed', (event) => {
    // Example for accessing event data
    const timeStamp = event.timestamp;

    const pageEventId = event.id;

    const payload = {
      event_name: event.name,
      event_data: {
        pageEventId: pageEventId,
        timeStamp: timeStamp,
      },
    };

    // Example for sending event data to third party servers
    fetch('https://example.com/pixel', {
      method: 'POST',
      body: JSON.stringify(payload),
      keepalive: true,
    });
  });
  ```

</page>

<page>
---
title: payment_info_submitted
description: >-
  The `payment_info_submitted` event logs an instance of a customer submitting
  their payment information. This event is available on the checkout page.
api_name: web-pixels
source_url:
  html: >-
    https://shopify.dev/docs/api/web-pixels-api/standard-events/payment_info_submitted
  md: >-
    https://shopify.dev/docs/api/web-pixels-api/standard-events/payment_info_submitted.md
---

# payment\_​info\_​submitted

The `payment_info_submitted` event logs an instance of a customer submitting their payment information. This event is available on the checkout page.

## Properties

* clientId

  string

  The client-side ID of the customer, provided by Shopify

* context

  Context

* data

  PixelEventsPaymentInfoSubmittedData

* id

  string

  The ID of the customer event

* name

  string

  The name of the customer event

* seq

  number

  The sequence index number of the event.

* timestamp

  string

  The timestamp of when the customer event occurred, in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format

* type

  EventType.Standard

### Context

A snapshot of various read-only properties of the browser at the time of event

* document

  Snapshot of a subset of properties of the \`document\` object in the top frame of the browser

  ```ts
  WebPixelsDocument
  ```

* navigator

  Snapshot of a subset of properties of the \`navigator\` object in the top frame of the browser

  ```ts
  WebPixelsNavigator
  ```

* window

  Snapshot of a subset of properties of the \`window\` object in the top frame of the browser

  ```ts
  WebPixelsWindow
  ```

```ts
export interface Context {
  /**
   * Snapshot of a subset of properties of the `document` object in the top
   * frame of the browser
   */
  document?: WebPixelsDocument;

  /**
   * Snapshot of a subset of properties of the `navigator` object in the top
   * frame of the browser
   */
  navigator?: WebPixelsNavigator;

  /**
   * Snapshot of a subset of properties of the `window` object in the top frame
   * of the browser
   */
  window?: WebPixelsWindow;
}
```

### WebPixelsDocument

A snapshot of a subset of properties of the \`document\` object in the top frame of the browser

* characterSet

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the character set being used by the document

  ```ts
  string
  ```

* location

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the URI of the current document

  ```ts
  Location
  ```

* referrer

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the URI of the page that linked to this page

  ```ts
  string
  ```

* title

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the title of the current document

  ```ts
  string
  ```

```ts
export interface WebPixelsDocument {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the character set being used by the document
   */
  characterSet?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the URI of the current document
   */
  location?: Location;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the URI of the page that linked to this page
   */
  referrer?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the title of the current document
   */
  title?: string;
}
```

### Location

A snapshot of a subset of properties of the \`location\` object in the top frame of the browser

* hash

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing a \`'#'\` followed by the fragment identifier of the URL

  ```ts
  string
  ```

* host

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the host, that is the hostname, a \`':'\`, and the port of the URL

  ```ts
  string
  ```

* hostname

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the domain of the URL

  ```ts
  string
  ```

* href

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the entire URL

  ```ts
  string
  ```

* origin

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the canonical form of the origin of the specific location

  ```ts
  string
  ```

* pathname

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing an initial \`'/'\` followed by the path of the URL, not including the query string or fragment

  ```ts
  string
  ```

* port

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the port number of the URL

  ```ts
  string
  ```

* protocol

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the protocol scheme of the URL, including the final \`':'\`

  ```ts
  string
  ```

* search

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing a \`'?'\` followed by the parameters or "querystring" of the URL

  ```ts
  string
  ```

```ts
export interface Location {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing a `'#'` followed by the fragment identifier of the URL
   */
  hash?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the host, that is the hostname, a `':'`, and the port of
   * the URL
   */
  host?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the domain of the URL
   */
  hostname?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the entire URL
   */
  href?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the canonical form of the origin of the specific location
   */
  origin?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing an initial `'/'` followed by the path of the URL, not
   * including the query string or fragment
   */
  pathname?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the port number of the URL
   */
  port?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the protocol scheme of the URL, including the final `':'`
   */
  protocol?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing a `'?'` followed by the parameters or "querystring" of
   * the URL
   */
  search?: string;
}
```

### WebPixelsNavigator

A snapshot of a subset of properties of the \`navigator\` object in the top frame of the browser

* cookieEnabled

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns \`false\` if setting a cookie will be ignored and true otherwise

  ```ts
  boolean
  ```

* language

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns a string representing the preferred language of the user, usually the language of the browser UI. The \`null\` value is returned when this is unknown

  ```ts
  string
  ```

* languages

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns an array of strings representing the languages known to the user, by order of preference

  ```ts
  ReadonlyArray<string>
  ```

* userAgent

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns the user agent string for the current browser

  ```ts
  string
  ```

```ts
export interface WebPixelsNavigator {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns `false` if setting a cookie will be ignored and true otherwise
   */
  cookieEnabled?: boolean;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns a string representing the preferred language of the user, usually
   * the language of the browser UI. The `null` value is returned when this
   * is unknown
   */
  language?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns an array of strings representing the languages known to the user,
   * by order of preference
   */
  languages?: ReadonlyArray<string>;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns the user agent string for the current browser
   */
  userAgent?: string;
}
```

### WebPixelsWindow

A snapshot of a subset of properties of the \`window\` object in the top frame of the browser

* innerHeight

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the height of the content area of the browser window including, if rendered, the horizontal scrollbar

  ```ts
  number
  ```

* innerWidth

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the width of the content area of the browser window including, if rendered, the vertical scrollbar

  ```ts
  number
  ```

* location

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the location, or current URL, of the window object

  ```ts
  Location
  ```

* origin

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the global object's origin, serialized as a string

  ```ts
  string
  ```

* outerHeight

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the height of the outside of the browser window

  ```ts
  number
  ```

* outerWidth

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the width of the outside of the browser window

  ```ts
  number
  ```

* pageXOffset

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), an alias for window\.scrollX

  ```ts
  number
  ```

* pageYOffset

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), an alias for window\.scrollY

  ```ts
  number
  ```

* screen

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Screen), the interface representing a screen, usually the one on which the current window is being rendered

  ```ts
  Screen
  ```

* screenX

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the horizontal distance from the left border of the user's browser viewport to the left side of the screen

  ```ts
  number
  ```

* screenY

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the vertical distance from the top border of the user's browser viewport to the top side of the screen

  ```ts
  number
  ```

* scrollX

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the number of pixels that the document has already been scrolled horizontally

  ```ts
  number
  ```

* scrollY

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the number of pixels that the document has already been scrolled vertically

  ```ts
  number
  ```

```ts
export interface WebPixelsWindow {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window),
   * gets the height of the content area of the browser window including, if
   * rendered, the horizontal scrollbar
   */
  innerHeight?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), gets
   * the width of the content area of the browser window including, if rendered,
   * the vertical scrollbar
   */
  innerWidth?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * location, or current URL, of the window object
   */
  location?: Location;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * global object's origin, serialized as a string
   */
  origin?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), gets
   * the height of the outside of the browser window
   */
  outerHeight?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), gets
   * the width of the outside of the browser window
   */
  outerWidth?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), an
   * alias for window.scrollX
   */
  pageXOffset?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), an
   * alias for window.scrollY
   */
  pageYOffset?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen), the
   * interface representing a screen, usually the one on which the current
   * window is being rendered
   */
  screen?: Screen;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * horizontal distance from the left border of the user's browser viewport to
   * the left side of the screen
   */
  screenX?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * vertical distance from the top border of the user's browser viewport to the
   * top side of the screen
   */
  screenY?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * number of pixels that the document has already been scrolled horizontally
   */
  scrollX?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * number of pixels that the document has already been scrolled vertically
   */
  scrollY?: number;
}
```

### Screen

The interface representing a screen, usually the one on which the current window is being rendered

* height

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Screen/height), the height of the screen

  ```ts
  number
  ```

* width

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Screen/width), the width of the screen

  ```ts
  number
  ```

```ts
export interface Screen {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen/height),
   * the height of the screen
   */
  height?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen/width),
   * the width of the screen
   */
  width?: number;
}
```

### PixelEventsPaymentInfoSubmittedData

* checkout

  ```ts
  Checkout
  ```

```ts
export interface PixelEventsPaymentInfoSubmittedData {
  checkout?: Checkout;
}
```

### Checkout

A container for all the information required to add items to checkout and pay.

* attributes

  A list of attributes accumulated throughout the checkout process.

  ```ts
  Attribute[]
  ```

* billingAddress

  The billing address to where the order will be charged.

  ```ts
  MailingAddress | null
  ```

* buyerAcceptsEmailMarketing

  Indicates whether the customer has consented to be sent marketing material via email. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  boolean
  ```

* buyerAcceptsSmsMarketing

  Indicates whether the customer has consented to be sent marketing material via SMS. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  boolean
  ```

* currencyCode

  The three-letter code that represents the currency, for example, USD. Supported codes include standard ISO 4217 codes, legacy codes, and non- standard codes.

  ```ts
  string | null
  ```

* delivery

  Represents the selected delivery options for a checkout. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  Delivery | null
  ```

* discountApplications

  A list of discount applications.

  ```ts
  DiscountApplication[]
  ```

* discountsAmount

  The total amount of the discounts applied to the price of the checkout. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  MoneyV2 | null
  ```

* email

  The email attached to this checkout.

  ```ts
  string | null
  ```

* lineItems

  A list of line item objects, each one containing information about an item in the checkout.

  ```ts
  CheckoutLineItem[]
  ```

* localization

  Information about the active localized experience. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  Localization
  ```

* order

  The resulting order from a paid checkout.

  ```ts
  Order | null
  ```

* phone

  A unique phone number for the customer. Formatted using E.164 standard. For example, \*+16135551111\*.

  ```ts
  string | null
  ```

* shippingAddress

  The shipping address to where the line items will be shipped.

  ```ts
  MailingAddress | null
  ```

* shippingLine

  Once a shipping rate is selected by the customer it is transitioned to a \`shipping\_line\` object.

  ```ts
  ShippingRate | null
  ```

* smsMarketingPhone

  The phone number provided by the buyer after opting in to SMS marketing. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  string | null
  ```

* subtotalPrice

  The price at checkout before duties, shipping, and taxes.

  ```ts
  MoneyV2 | null
  ```

* token

  A unique identifier for a particular checkout.

  ```ts
  string | null
  ```

* totalPrice

  The sum of all the prices of all the items in the checkout, including duties, taxes, and discounts.

  ```ts
  MoneyV2 | null
  ```

* totalTax

  The sum of all the taxes applied to the line items and shipping lines in the checkout.

  ```ts
  MoneyV2
  ```

* transactions

  A list of transactions associated with a checkout or order. Certain transactions, such as credit card transactions, may only be present in the checkout\_completed event.

  ```ts
  Transaction[]
  ```

```ts
export interface Checkout {
  /**
   * A list of attributes accumulated throughout the checkout process.
   */
  attributes?: Attribute[];

  /**
   * The billing address to where the order will be charged.
   */
  billingAddress?: MailingAddress | null;

  /**
   * Indicates whether the customer has consented to be sent marketing material
   * via email. This property is only available if the shop has [upgraded
   * to Checkout Extensibility](https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  buyerAcceptsEmailMarketing?: boolean;

  /**
   * Indicates whether the customer has consented to be sent marketing material
   * via SMS. This property is only available if the shop has [upgraded to
   * Checkout Extensibility](https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  buyerAcceptsSmsMarketing?: boolean;

  /**
   * The three-letter code that represents the currency, for example, USD.
   * Supported codes include standard ISO 4217 codes, legacy codes, and non-
   * standard codes.
   */
  currencyCode?: string | null;

  /**
   * Represents the selected delivery options for a checkout. This
   * property is only available if the shop has [upgraded to Checkout
   * Extensibility](https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  delivery?: Delivery | null;

  /**
   * A list of discount applications.
   */
  discountApplications?: DiscountApplication[];

  /**
   * The total amount of the discounts applied to the price of the checkout.
   * This property is only available if the shop has [upgraded to Checkout
   * Extensibility](https://help.shopify.com/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  discountsAmount?: MoneyV2 | null;

  /**
   * The email attached to this checkout.
   */
  email?: string | null;

  /**
   * A list of line item objects, each one containing information about an item
   * in the checkout.
   */
  lineItems?: CheckoutLineItem[];

  /**
   * Information about the active localized experience. This
   * property is only available if the shop has [upgraded to Checkout
   * Extensibility](https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  localization?: Localization;

  /**
   * The resulting order from a paid checkout.
   */
  order?: Order | null;

  /**
   * A unique phone number for the customer. Formatted using E.164 standard. For
   * example, *+16135551111*.
   */
  phone?: string | null;

  /**
   * The shipping address to where the line items will be shipped.
   */
  shippingAddress?: MailingAddress | null;

  /**
   * Once a shipping rate is selected by the customer it is transitioned to a
   * `shipping_line` object.
   */
  shippingLine?: ShippingRate | null;

  /**
   * The phone number provided by the buyer after opting in to SMS
   * marketing. This property is only available if the shop has [upgraded
   * to Checkout Extensibility](https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  smsMarketingPhone?: string | null;

  /**
   * The price at checkout before duties, shipping, and taxes.
   */
  subtotalPrice?: MoneyV2 | null;

  /**
   * A unique identifier for a particular checkout.
   */
  token?: string | null;

  /**
   * The sum of all the prices of all the items in the checkout, including
   * duties, taxes, and discounts.
   */
  totalPrice?: MoneyV2 | null;

  /**
   * The sum of all the taxes applied to the line items and shipping lines in
   * the checkout.
   */
  totalTax?: MoneyV2;

  /**
   * A list of transactions associated with a checkout or order. Certain
   * transactions, such as credit card transactions, may only be present in the
   * checkout_completed event.
   */
  transactions?: Transaction[];
}
```

### Attribute

Custom attributes associated with the cart or checkout.

* key

  The key for the attribute.

  ```ts
  string
  ```

* value

  The value for the attribute.

  ```ts
  string
  ```

```ts
export interface Attribute {
  /**
   * The key for the attribute.
   */
  key?: string;

  /**
   * The value for the attribute.
   */
  value?: string;
}
```

### MailingAddress

A mailing address for customers and shipping.

* address1

  The first line of the address. This is usually the street address or a P.O. Box number.

  ```ts
  string | null
  ```

* address2

  The second line of the address. This is usually an apartment, suite, or unit number.

  ```ts
  string | null
  ```

* city

  The name of the city, district, village, or town.

  ```ts
  string | null
  ```

* country

  The name of the country.

  ```ts
  string | null
  ```

* countryCode

  The two-letter code that represents the country, for example, US. The country codes generally follows ISO 3166-1 alpha-2 guidelines.

  ```ts
  string | null
  ```

* firstName

  The customer’s first name.

  ```ts
  string | null
  ```

* lastName

  The customer’s last name.

  ```ts
  string | null
  ```

* phone

  The phone number for this mailing address as entered by the customer.

  ```ts
  string | null
  ```

* province

  The region of the address, such as the province, state, or district.

  ```ts
  string | null
  ```

* provinceCode

  The two-letter code for the region. For example, ON.

  ```ts
  string | null
  ```

* zip

  The ZIP or postal code of the address.

  ```ts
  string | null
  ```

```ts
export interface MailingAddress {
  /**
   * The first line of the address. This is usually the street address or a P.O.
   * Box number.
   */
  address1?: string | null;

  /**
   * The second line of the address. This is usually an apartment, suite, or
   * unit number.
   */
  address2?: string | null;

  /**
   * The name of the city, district, village, or town.
   */
  city?: string | null;

  /**
   * The name of the country.
   */
  country?: string | null;

  /**
   * The two-letter code that represents the country, for example, US.
   * The country codes generally follows ISO 3166-1 alpha-2 guidelines.
   */
  countryCode?: string | null;

  /**
   * The customer’s first name.
   */
  firstName?: string | null;

  /**
   * The customer’s last name.
   */
  lastName?: string | null;

  /**
   * The phone number for this mailing address as entered by the customer.
   */
  phone?: string | null;

  /**
   * The region of the address, such as the province, state, or district.
   */
  province?: string | null;

  /**
   * The two-letter code for the region.
   * For example, ON.
   */
  provinceCode?: string | null;

  /**
   * The ZIP or postal code of the address.
   */
  zip?: string | null;
}
```

### Delivery

The delivery information for the event.

* selectedDeliveryOptions

  The selected delivery options for the event.

  ```ts
  DeliveryOption[]
  ```

```ts
export interface Delivery {
  /**
   * The selected delivery options for the event.
   */
  selectedDeliveryOptions?: DeliveryOption[];
}
```

### DeliveryOption

Represents a delivery option that the customer can choose from.

* cost

  The cost of the delivery option.

  ```ts
  MoneyV2 | null
  ```

* costAfterDiscounts

  The cost of the delivery option after discounts have been applied.

  ```ts
  MoneyV2 | null
  ```

* description

  The description of the delivery option.

  ```ts
  string | null
  ```

* handle

  The unique identifier of the delivery option.

  ```ts
  string
  ```

* title

  The title of the delivery option.

  ```ts
  string | null
  ```

* type

  The type of delivery option. - \`pickup\` - \`pickupPoint\` - \`shipping\` - \`local\`

  ```ts
  string
  ```

```ts
export interface DeliveryOption {
  /**
   * The cost of the delivery option.
   */
  cost?: MoneyV2 | null;

  /**
   * The cost of the delivery option after discounts have been applied.
   */
  costAfterDiscounts?: MoneyV2 | null;

  /**
   * The description of the delivery option.
   */
  description?: string | null;

  /**
   * The unique identifier of the delivery option.
   */
  handle?: string;

  /**
   * The title of the delivery option.
   */
  title?: string | null;

  /**
   * The type of delivery option.
   *
   * - `pickup`
   * - `pickupPoint`
   * - `shipping`
   * - `local`
   */
  type?: string;
}
```

### MoneyV2

A monetary value with currency.

* amount

  The decimal money amount.

  ```ts
  number
  ```

* currencyCode

  The three-letter code that represents the currency, for example, USD. Supported codes include standard ISO 4217 codes, legacy codes, and non- standard codes.

  ```ts
  string
  ```

```ts
export interface MoneyV2 {
  /**
   * The decimal money amount.
   */
  amount?: number;

  /**
   * The three-letter code that represents the currency, for example, USD.
   * Supported codes include standard ISO 4217 codes, legacy codes, and non-
   * standard codes.
   */
  currencyCode?: string;
}
```

### DiscountApplication

The information about the intent of the discount.

* allocationMethod

  The method by which the discount's value is applied to its entitled items. - \`ACROSS\`: The value is spread across all entitled lines. - \`EACH\`: The value is applied onto every entitled line.

  ```ts
  string
  ```

* targetSelection

  How the discount amount is distributed on the discounted lines. - \`ALL\`: The discount is allocated onto all the lines. - \`ENTITLED\`: The discount is allocated onto only the lines that it's entitled for. - \`EXPLICIT\`: The discount is allocated onto explicitly chosen lines.

  ```ts
  string
  ```

* targetType

  The type of line (i.e. line item or shipping line) on an order that the discount is applicable towards. - \`LINE\_ITEM\`: The discount applies onto line items. - \`SHIPPING\_LINE\`: The discount applies onto shipping lines.

  ```ts
  string
  ```

* title

  The customer-facing name of the discount. If the type of discount is a \`DISCOUNT\_CODE\`, this \`title\` attribute represents the code of the discount.

  ```ts
  string
  ```

* type

  The type of the discount. - \`AUTOMATIC\`: A discount automatically at checkout or in the cart without the need for a code. - \`DISCOUNT\_CODE\`: A discount applied onto checkouts through the use of a code. - \`MANUAL\`: A discount that is applied to an order by a merchant or store owner manually, rather than being automatically applied by the system or through a script. - \`SCRIPT\`: A discount applied to a customer's order using a script

  ```ts
  string
  ```

* value

  The value of the discount. Fixed discounts return a \`Money\` Object, while Percentage discounts return a \`PricingPercentageValue\` object.

  ```ts
  MoneyV2 | PricingPercentageValue
  ```

```ts
export interface DiscountApplication {
  /**
   * The method by which the discount's value is applied to its entitled items.
   *
   * - `ACROSS`: The value is spread across all entitled lines.
   * - `EACH`: The value is applied onto every entitled line.
   */
  allocationMethod?: string;

  /**
   * How the discount amount is distributed on the discounted lines.
   *
   * - `ALL`: The discount is allocated onto all the lines.
   * - `ENTITLED`: The discount is allocated onto only the lines that it's
   * entitled for.
   * - `EXPLICIT`: The discount is allocated onto explicitly chosen lines.
   */
  targetSelection?: string;

  /**
   * The type of line (i.e. line item or shipping line) on an order that the
   * discount is applicable towards.
   *
   * - `LINE_ITEM`: The discount applies onto line items.
   * - `SHIPPING_LINE`: The discount applies onto shipping lines.
   */
  targetType?: string;

  /**
   * The customer-facing name of the discount. If the type of discount is
   * a `DISCOUNT_CODE`, this `title` attribute represents the code of the
   * discount.
   */
  title?: string;

  /**
   * The type of the discount.
   *
   * - `AUTOMATIC`: A discount automatically at checkout or in the cart without
   * the need for a code.
   * - `DISCOUNT_CODE`: A discount applied onto checkouts through the use of
   * a code.
   * - `MANUAL`: A discount that is applied to an order by a merchant or store
   * owner manually, rather than being automatically applied by the system or
   * through a script.
   * - `SCRIPT`: A discount applied to a customer's order using a script
   */
  type?: string;

  /**
   * The value of the discount. Fixed discounts return a `Money` Object, while
   * Percentage discounts return a `PricingPercentageValue` object.
   */
  value?: MoneyV2 | PricingPercentageValue;
}
```

### PricingPercentageValue

A value given to a customer when a discount is applied to an order. The application of a discount with this value gives the customer the specified percentage off a specified item.

* percentage

  The percentage value of the object.

  ```ts
  number
  ```

```ts
export interface PricingPercentageValue {
  /**
   * The percentage value of the object.
   */
  percentage?: number;
}
```

### CheckoutLineItem

A single line item in the checkout, grouped by variant and attributes.

* discountAllocations

  The discounts that have been applied to the checkout line item by a discount application.

  ```ts
  DiscountAllocation[]
  ```

* finalLinePrice

  The combined price of all of the items in the line item after line-level discounts have been applied. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  MoneyV2
  ```

* id

  A globally unique identifier.

  ```ts
  string | null
  ```

* properties

  The properties of the line item. A shop may add, or enable customers to add custom information to a line item. Line item properties consist of a key and value pair. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  Property[]
  ```

* quantity

  The quantity of the line item.

  ```ts
  number
  ```

* sellingPlanAllocation

  The selling plan associated with the line item and the effect that each selling plan has on variants when they're purchased. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  SellingPlanAllocation | null
  ```

* title

  The title of the line item. Defaults to the product's title.

  ```ts
  string | null
  ```

* variant

  Product variant of the line item.

  ```ts
  ProductVariant | null
  ```

```ts
export interface CheckoutLineItem {
  /**
   * The discounts that have been applied to the checkout line item by a
   * discount application.
   */
  discountAllocations?: DiscountAllocation[];

  /**
   * The combined price of all of the items in the line item
   * after line-level discounts have been applied. This property
   * is only available if the shop has [upgraded to Checkout
   * Extensibility](https://help.shopify.com/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  finalLinePrice?: MoneyV2;

  /**
   * A globally unique identifier.
   */
  id?: string | null;

  /**
   * The properties of the line item. A shop may add, or enable customers to add
   * custom information to a line item. Line item properties consist of a key
   * and value pair. This property is only available if the shop has [upgraded
   * to Checkout Extensibility](https://help.shopify.com/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  properties?: Property[];

  /**
   * The quantity of the line item.
   */
  quantity?: number;

  /**
   * The selling plan associated with the line item and the effect that
   * each selling plan has on variants when they're purchased. This
   * property is only available if the shop has [upgraded to Checkout
   * Extensibility](https://help.shopify.com/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  sellingPlanAllocation?: SellingPlanAllocation | null;

  /**
   * The title of the line item. Defaults to the product's title.
   */
  title?: string | null;

  /**
   * Product variant of the line item.
   */
  variant?: ProductVariant | null;
}
```

### DiscountAllocation

The discount that has been applied to the checkout line item.

* amount

  The monetary value with currency allocated to the discount.

  ```ts
  MoneyV2
  ```

* discountApplication

  The information about the intent of the discount.

  ```ts
  DiscountApplication
  ```

```ts
export interface DiscountAllocation {
  /**
   * The monetary value with currency allocated to the discount.
   */
  amount?: MoneyV2;

  /**
   * The information about the intent of the discount.
   */
  discountApplication?: DiscountApplication;
}
```

### Property

The line item additional custom properties.

* key

  The key for the property.

  ```ts
  string
  ```

* value

  The value for the property.

  ```ts
  string
  ```

```ts
export interface Property {
  /**
   * The key for the property.
   */
  key?: string;

  /**
   * The value for the property.
   */
  value?: string;
}
```

### SellingPlanAllocation

Represents an association between a variant and a selling plan.

* sellingPlan

  A representation of how products and variants can be sold and purchased. For example, an individual selling plan could be '6 weeks of prepaid granola, delivered weekly'.

  ```ts
  SellingPlan
  ```

```ts
export interface SellingPlanAllocation {
  /**
   * A representation of how products and variants can be sold and purchased.
   * For example, an individual selling plan could be '6 weeks of prepaid
   * granola, delivered weekly'.
   */
  sellingPlan?: SellingPlan;
}
```

### SellingPlan

Represents how products and variants can be sold and purchased.

* id

  A globally unique identifier.

  ```ts
  string
  ```

* name

  The name of the selling plan. For example, '6 weeks of prepaid granola, delivered weekly'.

  ```ts
  string
  ```

```ts
export interface SellingPlan {
  /**
   * A globally unique identifier.
   */
  id?: string;

  /**
   * The name of the selling plan. For example, '6 weeks of prepaid granola,
   * delivered weekly'.
   */
  name?: string;
}
```

### ProductVariant

A product variant represents a different version of a product, such as differing sizes or differing colors.

* id

  A globally unique identifier.

  ```ts
  string | null
  ```

* image

  Image associated with the product variant. This field falls back to the product image if no image is available.

  ```ts
  Image | null
  ```

* price

  The product variant’s price.

  ```ts
  MoneyV2
  ```

* product

  The product object that the product variant belongs to.

  ```ts
  Product
  ```

* sku

  The SKU (stock keeping unit) associated with the variant.

  ```ts
  string | null
  ```

* title

  The product variant’s title.

  ```ts
  string | null
  ```

* untranslatedTitle

  The product variant’s untranslated title.

  ```ts
  string | null
  ```

```ts
export interface ProductVariant {
  /**
   * A globally unique identifier.
   */
  id?: string | null;

  /**
   * Image associated with the product variant. This field falls back to the
   * product image if no image is available.
   */
  image?: Image | null;

  /**
   * The product variant’s price.
   */
  price?: MoneyV2;

  /**
   * The product object that the product variant belongs to.
   */
  product?: Product;

  /**
   * The SKU (stock keeping unit) associated with the variant.
   */
  sku?: string | null;

  /**
   * The product variant’s title.
   */
  title?: string | null;

  /**
   * The product variant’s untranslated title.
   */
  untranslatedTitle?: string | null;
}
```

### Image

An image resource.

* src

  The location of the image as a URL.

  ```ts
  string | null
  ```

```ts
export interface Image {
  /**
   * The location of the image as a URL.
   */
  src?: string | null;
}
```

### Product

A product is an individual item for sale in a Shopify store.

* id

  The ID of the product.

  ```ts
  string | null
  ```

* title

  The product’s title.

  ```ts
  string
  ```

* type

  The \[product type]\(https://help.shopify.com/en/manual/products/details/product-type) specified by the merchant.

  ```ts
  string | null
  ```

* untranslatedTitle

  The product’s untranslated title.

  ```ts
  string | null
  ```

* url

  The relative URL of the product.

  ```ts
  string | null
  ```

* vendor

  The product’s vendor name.

  ```ts
  string
  ```

```ts
export interface Product {
  /**
   * The ID of the product.
   */
  id?: string | null;

  /**
   * The product’s title.
   */
  title?: string;

  /**
   * The [product
   * type](https://help.shopify.com/en/manual/products/details/product-type)
   * specified by the merchant.
   */
  type?: string | null;

  /**
   * The product’s untranslated title.
   */
  untranslatedTitle?: string | null;

  /**
   * The relative URL of the product.
   */
  url?: string | null;

  /**
   * The product’s vendor name.
   */
  vendor?: string;
}
```

### Localization

Information about the active localized experience.

* country

  The country of the active localized experience.

  ```ts
  Country
  ```

* language

  The language of the active localized experience.

  ```ts
  Language
  ```

* market

  The market including the country of the active localized experience.

  ```ts
  Market
  ```

```ts
export interface Localization {
  /**
   * The country of the active localized experience.
   */
  country?: Country;

  /**
   * The language of the active localized experience.
   */
  language?: Language;

  /**
   * The market including the country of the active localized experience.
   */
  market?: Market;
}
```

### Country

A country.

* isoCode

  The ISO-3166-1 code for this country, for example, "US".

  ```ts
  string | null
  ```

```ts
export interface Country {
  /**
   * The ISO-3166-1 code for this country, for example, "US".
   */
  isoCode?: string | null;
}
```

### Language

A language.

* isoCode

  The BCP-47 language tag. It may contain a dash followed by an ISO 3166-1 alpha-2 region code, for example, "en-US".

  ```ts
  string
  ```

```ts
export interface Language {
  /**
   * The BCP-47 language tag. It may contain a dash followed by an ISO 3166-1
   * alpha-2 region code, for example, "en-US".
   */
  isoCode?: string;
}
```

### Market

A group of one or more regions of the world that a merchant is targeting for sales. To learn more about markets, refer to \[this]\(https://shopify.dev/docs/apps/markets) conceptual overview.

* handle

  A human-readable, shop-scoped identifier.

  ```ts
  string | null
  ```

* id

  A globally unique identifier.

  ```ts
  string | null
  ```

```ts
export interface Market {
  /**
   * A human-readable, shop-scoped identifier.
   */
  handle?: string | null;

  /**
   * A globally unique identifier.
   */
  id?: string | null;
}
```

### Order

An order is a customer’s completed request to purchase one or more products from a shop. An order is created when a customer completes the checkout process.

* customer

  The customer that placed the order.

  ```ts
  OrderCustomer | null
  ```

* id

  The ID of the order. ID will be null for all events except checkout\_completed.

  ```ts
  string | null
  ```

```ts
export interface Order {
  /**
   * The customer that placed the order.
   */
  customer?: OrderCustomer | null;

  /**
   * The ID of the order. ID will be null for all events except
   * checkout_completed.
   */
  id?: string | null;
}
```

### OrderCustomer

The customer that placed the order.

* id

  The ID of the customer.

  ```ts
  string | null
  ```

* isFirstOrder

  Indicates if the order is the customer’s first order. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  boolean | null
  ```

```ts
export interface OrderCustomer {
  /**
   * The ID of the customer.
   */
  id?: string | null;

  /**
   * Indicates if the order is the customer’s first order. This
   * property is only available if the shop has [upgraded to Checkout
   * Extensibility](https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  isFirstOrder?: boolean | null;
}
```

### ShippingRate

A shipping rate to be applied to a checkout.

* price

  Price of this shipping rate.

  ```ts
  MoneyV2
  ```

```ts
export interface ShippingRate {
  /**
   * Price of this shipping rate.
   */
  price?: MoneyV2;
}
```

### Transaction

A transaction associated with a checkout or order.

* amount

  The monetary value with currency allocated to the transaction method.

  ```ts
  MoneyV2
  ```

* gateway

  The name of the payment provider used for the transaction.

  ```ts
  string
  ```

* paymentMethod

  The payment method used for the transaction. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

  ```ts
  TransactionPaymentMethod
  ```

```ts
export interface Transaction {
  /**
   * The monetary value with currency allocated to the transaction method.
   */
  amount?: MoneyV2;

  /**
   * The name of the payment provider used for the transaction.
   */
  gateway?: string;

  /**
   * The payment method used for the transaction. This property
   * is only available if the shop has [upgraded to Checkout
   * Extensibility](https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).
   */
  paymentMethod?: TransactionPaymentMethod;
}
```

### TransactionPaymentMethod

The payment method used for the transaction. This property is only available if the shop has \[upgraded to Checkout Extensibility]\(https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade).

* name

  The name of the payment method used for the transaction. This may further specify the payment method used.

  ```ts
  string
  ```

* type

  The type of payment method used for the transaction. - \`creditCard\`: A vaulted or manually entered credit card. - \`redeemable\`: A redeemable payment method, such as a gift card or store credit. - \`deferred\`: A \[deferred payment]\(https://help.shopify.com/en/manual/orders/deferred-payments), such as invoicing the buyer and collecting payment later. - \`local\`: A \[local payment method]\(https://help.shopify.com/en/manual/payments/shopify-payments/local-payment-methods) specific to the current region or market. - \`manualPayment\`: A manual payment method, such as an in-person retail transaction. - \`paymentOnDelivery\`: A payment that will be collected on delivery. - \`wallet\`: An integrated wallet, such as PayPal, Google Pay, Apple Pay, etc. - \`offsite\`: A payment processed outside of Shopify's checkout, excluding integrated wallets. - \`customOnSite\`: A custom payment method that is processed through a checkout extension with a payments app. - \`other\`: Another type of payment not defined here.

  ```ts
  string
  ```

```ts
export interface TransactionPaymentMethod {
  /**
   * The name of the payment method used for the transaction. This may further
   * specify the payment method used.
   */
  name?: string;

  /**
   * The type of payment method used for the transaction.
   *
   * - `creditCard`: A vaulted or manually entered credit card.
   * - `redeemable`: A redeemable payment method, such as a gift card or store
   * credit.
   * - `deferred`: A [deferred
   * payment](https://help.shopify.com/en/manual/orders/deferred-payments), such
   * as invoicing the buyer and collecting payment later.
   * - `local`: A [local payment
   * method](https://help.shopify.com/en/manual/payments/shopify-payments/local-payment-methods) specific to the current region or market.
   * - `manualPayment`: A manual payment method, such as an in-person retail
   * transaction.
   * - `paymentOnDelivery`: A payment that will be collected on delivery.
   * - `wallet`: An integrated wallet, such as PayPal, Google Pay, Apple Pay,
   * etc.
   * - `offsite`: A payment processed outside of Shopify's checkout, excluding
   * integrated wallets.
   * - `customOnSite`: A custom payment method that is processed through a
   * checkout extension with a payments app.
   * - `other`: Another type of payment not defined here.
   */
  type?: string;
}
```

### EventType

* AdvancedDom

  ```ts
  advanced-dom
  ```

* Custom

  ```ts
  custom
  ```

* Dom

  ```ts
  dom
  ```

* Meta

  ```ts
  meta
  ```

* Standard

  ```ts
  standard
  ```

```ts
export enum EventType {
  AdvancedDom = 'advanced-dom',
  Custom = 'custom',
  Dom = 'dom',
  Meta = 'meta',
  Standard = 'standard',
}
```

Examples

### Examples

* #### Accessing Standard Events

  ##### App Pixel

  ```javascript
  import {register} from '@shopify/web-pixels-extension';

  register(({analytics}) => {
    analytics.subscribe('payment_info_submitted', (event) => {
      // Example for accessing event data
      const checkout = event.data.checkout;

      const checkoutTotalPrice = checkout.totalPrice?.amount;

      const firstDiscountType = checkout.discountApplications[0]?.type;

      const discountCode =
        firstDiscountType === 'DISCOUNT_CODE'
          ? checkout.discountApplications[0]?.title
          : null;

      const payload = {
        event_name: event.name,
        event_data: {
          totalPrice: checkoutTotalPrice,
          firstDiscountCode: discountCode,
        },
      };

      // Example for sending event to third party servers
      fetch('https://example.com/pixel', {
        method: 'POST',
        body: JSON.stringify(payload),
        keepalive: true,
      });
    });
  });
  ```

  ##### Custom Pixel

  ```javascript
  analytics.subscribe('payment_info_submitted', (event) => {
    // Example for accessing event data
    const checkout = event.data.checkout;

    const checkoutTotalPrice = checkout.totalPrice?.amount;

    const firstDiscountType = checkout.discountApplications[0]?.type;

    const discountCode =
      firstDiscountType === 'DISCOUNT_CODE'
        ? checkout.discountApplications[0]?.title
        : null;

    const payload = {
      event_name: event.name,
      event_data: {
        totalPrice: checkoutTotalPrice,
        firstDiscountCode: discountCode,
      },
    };

    // Example for sending event to third party servers
    fetch('https://example.com/pixel', {
      method: 'POST',
      body: JSON.stringify(payload),
      keepalive: true,
    });
  });
  ```

</page>

<page>
---
title: product_added_to_cart
description: >-
  The `product_added_to_cart` event logs an instance where a customer adds a
  product to their cart. This event is available on the online store page.
api_name: web-pixels
source_url:
  html: >-
    https://shopify.dev/docs/api/web-pixels-api/standard-events/product_added_to_cart
  md: >-
    https://shopify.dev/docs/api/web-pixels-api/standard-events/product_added_to_cart.md
---

# product\_​added\_​to\_​cart

The `product_added_to_cart` event logs an instance where a customer adds a product to their cart. This event is available on the online store page.

## Properties

* clientId

  string

  The client-side ID of the customer, provided by Shopify

* context

  Context

* data

  PixelEventsProductAddedToCartData

* id

  string

  The ID of the customer event

* name

  string

  The name of the customer event

* seq

  number

  The sequence index number of the event.

* timestamp

  string

  The timestamp of when the customer event occurred, in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format

* type

  EventType.Standard

### Context

A snapshot of various read-only properties of the browser at the time of event

* document

  Snapshot of a subset of properties of the \`document\` object in the top frame of the browser

  ```ts
  WebPixelsDocument
  ```

* navigator

  Snapshot of a subset of properties of the \`navigator\` object in the top frame of the browser

  ```ts
  WebPixelsNavigator
  ```

* window

  Snapshot of a subset of properties of the \`window\` object in the top frame of the browser

  ```ts
  WebPixelsWindow
  ```

```ts
export interface Context {
  /**
   * Snapshot of a subset of properties of the `document` object in the top
   * frame of the browser
   */
  document?: WebPixelsDocument;

  /**
   * Snapshot of a subset of properties of the `navigator` object in the top
   * frame of the browser
   */
  navigator?: WebPixelsNavigator;

  /**
   * Snapshot of a subset of properties of the `window` object in the top frame
   * of the browser
   */
  window?: WebPixelsWindow;
}
```

### WebPixelsDocument

A snapshot of a subset of properties of the \`document\` object in the top frame of the browser

* characterSet

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the character set being used by the document

  ```ts
  string
  ```

* location

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the URI of the current document

  ```ts
  Location
  ```

* referrer

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the URI of the page that linked to this page

  ```ts
  string
  ```

* title

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the title of the current document

  ```ts
  string
  ```

```ts
export interface WebPixelsDocument {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the character set being used by the document
   */
  characterSet?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the URI of the current document
   */
  location?: Location;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the URI of the page that linked to this page
   */
  referrer?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the title of the current document
   */
  title?: string;
}
```

### Location

A snapshot of a subset of properties of the \`location\` object in the top frame of the browser

* hash

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing a \`'#'\` followed by the fragment identifier of the URL

  ```ts
  string
  ```

* host

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the host, that is the hostname, a \`':'\`, and the port of the URL

  ```ts
  string
  ```

* hostname

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the domain of the URL

  ```ts
  string
  ```

* href

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the entire URL

  ```ts
  string
  ```

* origin

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the canonical form of the origin of the specific location

  ```ts
  string
  ```

* pathname

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing an initial \`'/'\` followed by the path of the URL, not including the query string or fragment

  ```ts
  string
  ```

* port

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the port number of the URL

  ```ts
  string
  ```

* protocol

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the protocol scheme of the URL, including the final \`':'\`

  ```ts
  string
  ```

* search

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing a \`'?'\` followed by the parameters or "querystring" of the URL

  ```ts
  string
  ```

```ts
export interface Location {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing a `'#'` followed by the fragment identifier of the URL
   */
  hash?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the host, that is the hostname, a `':'`, and the port of
   * the URL
   */
  host?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the domain of the URL
   */
  hostname?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the entire URL
   */
  href?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the canonical form of the origin of the specific location
   */
  origin?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing an initial `'/'` followed by the path of the URL, not
   * including the query string or fragment
   */
  pathname?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the port number of the URL
   */
  port?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the protocol scheme of the URL, including the final `':'`
   */
  protocol?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing a `'?'` followed by the parameters or "querystring" of
   * the URL
   */
  search?: string;
}
```

### WebPixelsNavigator

A snapshot of a subset of properties of the \`navigator\` object in the top frame of the browser

* cookieEnabled

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns \`false\` if setting a cookie will be ignored and true otherwise

  ```ts
  boolean
  ```

* language

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns a string representing the preferred language of the user, usually the language of the browser UI. The \`null\` value is returned when this is unknown

  ```ts
  string
  ```

* languages

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns an array of strings representing the languages known to the user, by order of preference

  ```ts
  ReadonlyArray<string>
  ```

* userAgent

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns the user agent string for the current browser

  ```ts
  string
  ```

```ts
export interface WebPixelsNavigator {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns `false` if setting a cookie will be ignored and true otherwise
   */
  cookieEnabled?: boolean;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns a string representing the preferred language of the user, usually
   * the language of the browser UI. The `null` value is returned when this
   * is unknown
   */
  language?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns an array of strings representing the languages known to the user,
   * by order of preference
   */
  languages?: ReadonlyArray<string>;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns the user agent string for the current browser
   */
  userAgent?: string;
}
```

### WebPixelsWindow

A snapshot of a subset of properties of the \`window\` object in the top frame of the browser

* innerHeight

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the height of the content area of the browser window including, if rendered, the horizontal scrollbar

  ```ts
  number
  ```

* innerWidth

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the width of the content area of the browser window including, if rendered, the vertical scrollbar

  ```ts
  number
  ```

* location

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the location, or current URL, of the window object

  ```ts
  Location
  ```

* origin

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the global object's origin, serialized as a string

  ```ts
  string
  ```

* outerHeight

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the height of the outside of the browser window

  ```ts
  number
  ```

* outerWidth

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the width of the outside of the browser window

  ```ts
  number
  ```

* pageXOffset

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), an alias for window\.scrollX

  ```ts
  number
  ```

* pageYOffset

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), an alias for window\.scrollY

  ```ts
  number
  ```

* screen

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Screen), the interface representing a screen, usually the one on which the current window is being rendered

  ```ts
  Screen
  ```

* screenX

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the horizontal distance from the left border of the user's browser viewport to the left side of the screen

  ```ts
  number
  ```

* screenY

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the vertical distance from the top border of the user's browser viewport to the top side of the screen

  ```ts
  number
  ```

* scrollX

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the number of pixels that the document has already been scrolled horizontally

  ```ts
  number
  ```

* scrollY

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the number of pixels that the document has already been scrolled vertically

  ```ts
  number
  ```

```ts
export interface WebPixelsWindow {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window),
   * gets the height of the content area of the browser window including, if
   * rendered, the horizontal scrollbar
   */
  innerHeight?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), gets
   * the width of the content area of the browser window including, if rendered,
   * the vertical scrollbar
   */
  innerWidth?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * location, or current URL, of the window object
   */
  location?: Location;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * global object's origin, serialized as a string
   */
  origin?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), gets
   * the height of the outside of the browser window
   */
  outerHeight?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), gets
   * the width of the outside of the browser window
   */
  outerWidth?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), an
   * alias for window.scrollX
   */
  pageXOffset?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), an
   * alias for window.scrollY
   */
  pageYOffset?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen), the
   * interface representing a screen, usually the one on which the current
   * window is being rendered
   */
  screen?: Screen;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * horizontal distance from the left border of the user's browser viewport to
   * the left side of the screen
   */
  screenX?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * vertical distance from the top border of the user's browser viewport to the
   * top side of the screen
   */
  screenY?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * number of pixels that the document has already been scrolled horizontally
   */
  scrollX?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * number of pixels that the document has already been scrolled vertically
   */
  scrollY?: number;
}
```

### Screen

The interface representing a screen, usually the one on which the current window is being rendered

* height

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Screen/height), the height of the screen

  ```ts
  number
  ```

* width

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Screen/width), the width of the screen

  ```ts
  number
  ```

```ts
export interface Screen {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen/height),
   * the height of the screen
   */
  height?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen/width),
   * the width of the screen
   */
  width?: number;
}
```

### PixelEventsProductAddedToCartData

* cartLine

  ```ts
  CartLine | null
  ```

```ts
export interface PixelEventsProductAddedToCartData {
  cartLine?: CartLine | null;
}
```

### CartLine

Information about the merchandise in the cart.

* cost

  The cost of the merchandise that the customer will pay for at checkout. The costs are subject to change and changes will be reflected at checkout.

  ```ts
  CartLineCost
  ```

* merchandise

  The merchandise that the buyer intends to purchase.

  ```ts
  ProductVariant
  ```

* quantity

  The quantity of the merchandise that the customer intends to purchase.

  ```ts
  number
  ```

```ts
export interface CartLine {
  /**
   * The cost of the merchandise that the customer will pay for at checkout. The
   * costs are subject to change and changes will be reflected at checkout.
   */
  cost?: CartLineCost;

  /**
   * The merchandise that the buyer intends to purchase.
   */
  merchandise?: ProductVariant;

  /**
   * The quantity of the merchandise that the customer intends to purchase.
   */
  quantity?: number;
}
```

### CartLineCost

The cost of the merchandise line that the customer will pay at checkout.

* totalAmount

  The total cost of the merchandise line.

  ```ts
  MoneyV2
  ```

```ts
export interface CartLineCost {
  /**
   * The total cost of the merchandise line.
   */
  totalAmount?: MoneyV2;
}
```

### MoneyV2

A monetary value with currency.

* amount

  The decimal money amount.

  ```ts
  number
  ```

* currencyCode

  The three-letter code that represents the currency, for example, USD. Supported codes include standard ISO 4217 codes, legacy codes, and non- standard codes.

  ```ts
  string
  ```

```ts
export interface MoneyV2 {
  /**
   * The decimal money amount.
   */
  amount?: number;

  /**
   * The three-letter code that represents the currency, for example, USD.
   * Supported codes include standard ISO 4217 codes, legacy codes, and non-
   * standard codes.
   */
  currencyCode?: string;
}
```

### ProductVariant

A product variant represents a different version of a product, such as differing sizes or differing colors.

* id

  A globally unique identifier.

  ```ts
  string | null
  ```

* image

  Image associated with the product variant. This field falls back to the product image if no image is available.

  ```ts
  Image | null
  ```

* price

  The product variant’s price.

  ```ts
  MoneyV2
  ```

* product

  The product object that the product variant belongs to.

  ```ts
  Product
  ```

* sku

  The SKU (stock keeping unit) associated with the variant.

  ```ts
  string | null
  ```

* title

  The product variant’s title.

  ```ts
  string | null
  ```

* untranslatedTitle

  The product variant’s untranslated title.

  ```ts
  string | null
  ```

```ts
export interface ProductVariant {
  /**
   * A globally unique identifier.
   */
  id?: string | null;

  /**
   * Image associated with the product variant. This field falls back to the
   * product image if no image is available.
   */
  image?: Image | null;

  /**
   * The product variant’s price.
   */
  price?: MoneyV2;

  /**
   * The product object that the product variant belongs to.
   */
  product?: Product;

  /**
   * The SKU (stock keeping unit) associated with the variant.
   */
  sku?: string | null;

  /**
   * The product variant’s title.
   */
  title?: string | null;

  /**
   * The product variant’s untranslated title.
   */
  untranslatedTitle?: string | null;
}
```

### Image

An image resource.

* src

  The location of the image as a URL.

  ```ts
  string | null
  ```

```ts
export interface Image {
  /**
   * The location of the image as a URL.
   */
  src?: string | null;
}
```

### Product

A product is an individual item for sale in a Shopify store.

* id

  The ID of the product.

  ```ts
  string | null
  ```

* title

  The product’s title.

  ```ts
  string
  ```

* type

  The \[product type]\(https://help.shopify.com/en/manual/products/details/product-type) specified by the merchant.

  ```ts
  string | null
  ```

* untranslatedTitle

  The product’s untranslated title.

  ```ts
  string | null
  ```

* url

  The relative URL of the product.

  ```ts
  string | null
  ```

* vendor

  The product’s vendor name.

  ```ts
  string
  ```

```ts
export interface Product {
  /**
   * The ID of the product.
   */
  id?: string | null;

  /**
   * The product’s title.
   */
  title?: string;

  /**
   * The [product
   * type](https://help.shopify.com/en/manual/products/details/product-type)
   * specified by the merchant.
   */
  type?: string | null;

  /**
   * The product’s untranslated title.
   */
  untranslatedTitle?: string | null;

  /**
   * The relative URL of the product.
   */
  url?: string | null;

  /**
   * The product’s vendor name.
   */
  vendor?: string;
}
```

### EventType

* AdvancedDom

  ```ts
  advanced-dom
  ```

* Custom

  ```ts
  custom
  ```

* Dom

  ```ts
  dom
  ```

* Meta

  ```ts
  meta
  ```

* Standard

  ```ts
  standard
  ```

```ts
export enum EventType {
  AdvancedDom = 'advanced-dom',
  Custom = 'custom',
  Dom = 'dom',
  Meta = 'meta',
  Standard = 'standard',
}
```

Examples

### Examples

* #### Accessing Standard Events

  ##### App Pixel

  ```javascript
  import {register} from '@shopify/web-pixels-extension';

  register(({analytics}) => {
    analytics.subscribe('product_added_to_cart', (event) => {
      // Example for accessing event data
      const cartLine = event.data.cartLine;

      const cartLineCost = cartLine.cost.totalAmount.amount;

      const cartLineCostCurrency = cartLine.cost.totalAmount.currencyCode;

      const merchandiseVariantTitle = cartLine.merchandise.title;

      const payload = {
        event_name: event.name,
        event_data: {
          cartLineCost: cartLineCost,
          cartLineCostCurrency: cartLineCostCurrency,
          merchandiseVariantTitle: merchandiseVariantTitle,
        },
      };

      // Example for sending event to third party servers
      fetch('https://example.com/pixel', {
        method: 'POST',
        body: JSON.stringify(payload),
        keepalive: true,
      });
    });
  });
  ```

  ##### Custom Pixel

  ```javascript
  analytics.subscribe('product_added_to_cart', (event) => {
    // Example for accessing event data
    const cartLine = event.data.cartLine;

    const cartLineCost = cartLine.cost.totalAmount.amount;

    const cartLineCostCurrency = cartLine.cost.totalAmount.currencyCode;

    const merchandiseVariantTitle = cartLine.merchandise.title;

    const payload = {
      event_name: event.name,
      event_data: {
        cartLineCost: cartLineCost,
        cartLineCostCurrency: cartLineCostCurrency,
        merchandiseVariantTitle: merchandiseVariantTitle,
      },
    };

    // Example for sending event to third party servers
    fetch('https://example.com/pixel', {
      method: 'POST',
      body: JSON.stringify(payload),
      keepalive: true,
    });
  });
  ```

</page>

<page>
---
title: product_removed_from_cart
description: >-
  The `product_removed_from_cart` event logs an instance where a customer
  removes a product from their cart. This event is available on the online store
  page.
api_name: web-pixels
source_url:
  html: >-
    https://shopify.dev/docs/api/web-pixels-api/standard-events/product_removed_from_cart
  md: >-
    https://shopify.dev/docs/api/web-pixels-api/standard-events/product_removed_from_cart.md
---

# product\_​removed\_​from\_​cart

The `product_removed_from_cart` event logs an instance where a customer removes a product from their cart. This event is available on the online store page.

## Properties

* clientId

  string

  The client-side ID of the customer, provided by Shopify

* context

  Context

* data

  PixelEventsProductRemovedFromCartData

* id

  string

  The ID of the customer event

* name

  string

  The name of the customer event

* seq

  number

  The sequence index number of the event.

* timestamp

  string

  The timestamp of when the customer event occurred, in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format

* type

  EventType.Standard

### Context

A snapshot of various read-only properties of the browser at the time of event

* document

  Snapshot of a subset of properties of the \`document\` object in the top frame of the browser

  ```ts
  WebPixelsDocument
  ```

* navigator

  Snapshot of a subset of properties of the \`navigator\` object in the top frame of the browser

  ```ts
  WebPixelsNavigator
  ```

* window

  Snapshot of a subset of properties of the \`window\` object in the top frame of the browser

  ```ts
  WebPixelsWindow
  ```

```ts
export interface Context {
  /**
   * Snapshot of a subset of properties of the `document` object in the top
   * frame of the browser
   */
  document?: WebPixelsDocument;

  /**
   * Snapshot of a subset of properties of the `navigator` object in the top
   * frame of the browser
   */
  navigator?: WebPixelsNavigator;

  /**
   * Snapshot of a subset of properties of the `window` object in the top frame
   * of the browser
   */
  window?: WebPixelsWindow;
}
```

### WebPixelsDocument

A snapshot of a subset of properties of the \`document\` object in the top frame of the browser

* characterSet

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the character set being used by the document

  ```ts
  string
  ```

* location

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the URI of the current document

  ```ts
  Location
  ```

* referrer

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the URI of the page that linked to this page

  ```ts
  string
  ```

* title

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the title of the current document

  ```ts
  string
  ```

```ts
export interface WebPixelsDocument {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the character set being used by the document
   */
  characterSet?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the URI of the current document
   */
  location?: Location;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the URI of the page that linked to this page
   */
  referrer?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the title of the current document
   */
  title?: string;
}
```

### Location

A snapshot of a subset of properties of the \`location\` object in the top frame of the browser

* hash

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing a \`'#'\` followed by the fragment identifier of the URL

  ```ts
  string
  ```

* host

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the host, that is the hostname, a \`':'\`, and the port of the URL

  ```ts
  string
  ```

* hostname

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the domain of the URL

  ```ts
  string
  ```

* href

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the entire URL

  ```ts
  string
  ```

* origin

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the canonical form of the origin of the specific location

  ```ts
  string
  ```

* pathname

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing an initial \`'/'\` followed by the path of the URL, not including the query string or fragment

  ```ts
  string
  ```

* port

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the port number of the URL

  ```ts
  string
  ```

* protocol

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the protocol scheme of the URL, including the final \`':'\`

  ```ts
  string
  ```

* search

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing a \`'?'\` followed by the parameters or "querystring" of the URL

  ```ts
  string
  ```

```ts
export interface Location {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing a `'#'` followed by the fragment identifier of the URL
   */
  hash?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the host, that is the hostname, a `':'`, and the port of
   * the URL
   */
  host?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the domain of the URL
   */
  hostname?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the entire URL
   */
  href?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the canonical form of the origin of the specific location
   */
  origin?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing an initial `'/'` followed by the path of the URL, not
   * including the query string or fragment
   */
  pathname?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the port number of the URL
   */
  port?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the protocol scheme of the URL, including the final `':'`
   */
  protocol?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing a `'?'` followed by the parameters or "querystring" of
   * the URL
   */
  search?: string;
}
```

### WebPixelsNavigator

A snapshot of a subset of properties of the \`navigator\` object in the top frame of the browser

* cookieEnabled

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns \`false\` if setting a cookie will be ignored and true otherwise

  ```ts
  boolean
  ```

* language

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns a string representing the preferred language of the user, usually the language of the browser UI. The \`null\` value is returned when this is unknown

  ```ts
  string
  ```

* languages

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns an array of strings representing the languages known to the user, by order of preference

  ```ts
  ReadonlyArray<string>
  ```

* userAgent

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns the user agent string for the current browser

  ```ts
  string
  ```

```ts
export interface WebPixelsNavigator {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns `false` if setting a cookie will be ignored and true otherwise
   */
  cookieEnabled?: boolean;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns a string representing the preferred language of the user, usually
   * the language of the browser UI. The `null` value is returned when this
   * is unknown
   */
  language?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns an array of strings representing the languages known to the user,
   * by order of preference
   */
  languages?: ReadonlyArray<string>;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns the user agent string for the current browser
   */
  userAgent?: string;
}
```

### WebPixelsWindow

A snapshot of a subset of properties of the \`window\` object in the top frame of the browser

* innerHeight

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the height of the content area of the browser window including, if rendered, the horizontal scrollbar

  ```ts
  number
  ```

* innerWidth

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the width of the content area of the browser window including, if rendered, the vertical scrollbar

  ```ts
  number
  ```

* location

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the location, or current URL, of the window object

  ```ts
  Location
  ```

* origin

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the global object's origin, serialized as a string

  ```ts
  string
  ```

* outerHeight

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the height of the outside of the browser window

  ```ts
  number
  ```

* outerWidth

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the width of the outside of the browser window

  ```ts
  number
  ```

* pageXOffset

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), an alias for window\.scrollX

  ```ts
  number
  ```

* pageYOffset

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), an alias for window\.scrollY

  ```ts
  number
  ```

* screen

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Screen), the interface representing a screen, usually the one on which the current window is being rendered

  ```ts
  Screen
  ```

* screenX

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the horizontal distance from the left border of the user's browser viewport to the left side of the screen

  ```ts
  number
  ```

* screenY

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the vertical distance from the top border of the user's browser viewport to the top side of the screen

  ```ts
  number
  ```

* scrollX

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the number of pixels that the document has already been scrolled horizontally

  ```ts
  number
  ```

* scrollY

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the number of pixels that the document has already been scrolled vertically

  ```ts
  number
  ```

```ts
export interface WebPixelsWindow {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window),
   * gets the height of the content area of the browser window including, if
   * rendered, the horizontal scrollbar
   */
  innerHeight?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), gets
   * the width of the content area of the browser window including, if rendered,
   * the vertical scrollbar
   */
  innerWidth?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * location, or current URL, of the window object
   */
  location?: Location;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * global object's origin, serialized as a string
   */
  origin?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), gets
   * the height of the outside of the browser window
   */
  outerHeight?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), gets
   * the width of the outside of the browser window
   */
  outerWidth?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), an
   * alias for window.scrollX
   */
  pageXOffset?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), an
   * alias for window.scrollY
   */
  pageYOffset?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen), the
   * interface representing a screen, usually the one on which the current
   * window is being rendered
   */
  screen?: Screen;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * horizontal distance from the left border of the user's browser viewport to
   * the left side of the screen
   */
  screenX?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * vertical distance from the top border of the user's browser viewport to the
   * top side of the screen
   */
  screenY?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * number of pixels that the document has already been scrolled horizontally
   */
  scrollX?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * number of pixels that the document has already been scrolled vertically
   */
  scrollY?: number;
}
```

### Screen

The interface representing a screen, usually the one on which the current window is being rendered

* height

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Screen/height), the height of the screen

  ```ts
  number
  ```

* width

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Screen/width), the width of the screen

  ```ts
  number
  ```

```ts
export interface Screen {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen/height),
   * the height of the screen
   */
  height?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen/width),
   * the width of the screen
   */
  width?: number;
}
```

### PixelEventsProductRemovedFromCartData

* cartLine

  ```ts
  CartLine | null
  ```

```ts
export interface PixelEventsProductRemovedFromCartData {
  cartLine?: CartLine | null;
}
```

### CartLine

Information about the merchandise in the cart.

* cost

  The cost of the merchandise that the customer will pay for at checkout. The costs are subject to change and changes will be reflected at checkout.

  ```ts
  CartLineCost
  ```

* merchandise

  The merchandise that the buyer intends to purchase.

  ```ts
  ProductVariant
  ```

* quantity

  The quantity of the merchandise that the customer intends to purchase.

  ```ts
  number
  ```

```ts
export interface CartLine {
  /**
   * The cost of the merchandise that the customer will pay for at checkout. The
   * costs are subject to change and changes will be reflected at checkout.
   */
  cost?: CartLineCost;

  /**
   * The merchandise that the buyer intends to purchase.
   */
  merchandise?: ProductVariant;

  /**
   * The quantity of the merchandise that the customer intends to purchase.
   */
  quantity?: number;
}
```

### CartLineCost

The cost of the merchandise line that the customer will pay at checkout.

* totalAmount

  The total cost of the merchandise line.

  ```ts
  MoneyV2
  ```

```ts
export interface CartLineCost {
  /**
   * The total cost of the merchandise line.
   */
  totalAmount?: MoneyV2;
}
```

### MoneyV2

A monetary value with currency.

* amount

  The decimal money amount.

  ```ts
  number
  ```

* currencyCode

  The three-letter code that represents the currency, for example, USD. Supported codes include standard ISO 4217 codes, legacy codes, and non- standard codes.

  ```ts
  string
  ```

```ts
export interface MoneyV2 {
  /**
   * The decimal money amount.
   */
  amount?: number;

  /**
   * The three-letter code that represents the currency, for example, USD.
   * Supported codes include standard ISO 4217 codes, legacy codes, and non-
   * standard codes.
   */
  currencyCode?: string;
}
```

### ProductVariant

A product variant represents a different version of a product, such as differing sizes or differing colors.

* id

  A globally unique identifier.

  ```ts
  string | null
  ```

* image

  Image associated with the product variant. This field falls back to the product image if no image is available.

  ```ts
  Image | null
  ```

* price

  The product variant’s price.

  ```ts
  MoneyV2
  ```

* product

  The product object that the product variant belongs to.

  ```ts
  Product
  ```

* sku

  The SKU (stock keeping unit) associated with the variant.

  ```ts
  string | null
  ```

* title

  The product variant’s title.

  ```ts
  string | null
  ```

* untranslatedTitle

  The product variant’s untranslated title.

  ```ts
  string | null
  ```

```ts
export interface ProductVariant {
  /**
   * A globally unique identifier.
   */
  id?: string | null;

  /**
   * Image associated with the product variant. This field falls back to the
   * product image if no image is available.
   */
  image?: Image | null;

  /**
   * The product variant’s price.
   */
  price?: MoneyV2;

  /**
   * The product object that the product variant belongs to.
   */
  product?: Product;

  /**
   * The SKU (stock keeping unit) associated with the variant.
   */
  sku?: string | null;

  /**
   * The product variant’s title.
   */
  title?: string | null;

  /**
   * The product variant’s untranslated title.
   */
  untranslatedTitle?: string | null;
}
```

### Image

An image resource.

* src

  The location of the image as a URL.

  ```ts
  string | null
  ```

```ts
export interface Image {
  /**
   * The location of the image as a URL.
   */
  src?: string | null;
}
```

### Product

A product is an individual item for sale in a Shopify store.

* id

  The ID of the product.

  ```ts
  string | null
  ```

* title

  The product’s title.

  ```ts
  string
  ```

* type

  The \[product type]\(https://help.shopify.com/en/manual/products/details/product-type) specified by the merchant.

  ```ts
  string | null
  ```

* untranslatedTitle

  The product’s untranslated title.

  ```ts
  string | null
  ```

* url

  The relative URL of the product.

  ```ts
  string | null
  ```

* vendor

  The product’s vendor name.

  ```ts
  string
  ```

```ts
export interface Product {
  /**
   * The ID of the product.
   */
  id?: string | null;

  /**
   * The product’s title.
   */
  title?: string;

  /**
   * The [product
   * type](https://help.shopify.com/en/manual/products/details/product-type)
   * specified by the merchant.
   */
  type?: string | null;

  /**
   * The product’s untranslated title.
   */
  untranslatedTitle?: string | null;

  /**
   * The relative URL of the product.
   */
  url?: string | null;

  /**
   * The product’s vendor name.
   */
  vendor?: string;
}
```

### EventType

* AdvancedDom

  ```ts
  advanced-dom
  ```

* Custom

  ```ts
  custom
  ```

* Dom

  ```ts
  dom
  ```

* Meta

  ```ts
  meta
  ```

* Standard

  ```ts
  standard
  ```

```ts
export enum EventType {
  AdvancedDom = 'advanced-dom',
  Custom = 'custom',
  Dom = 'dom',
  Meta = 'meta',
  Standard = 'standard',
}
```

Examples

### Examples

* #### Accessing Standard Events

  ##### App Pixel

  ```javascript
  import {register} from '@shopify/web-pixels-extension';

  register(({analytics}) => {
    analytics.subscribe('product_removed_from_cart', (event) => {
      // Example for accessing event data
      const cartLine = event.data.cartLine;

      const cartLineCost = cartLine.cost.totalAmount.amount;

      const cartLineCostCurrency = cartLine.cost.totalAmount.currencyCode;

      const merchandiseVariantTitle = cartLine.merchandise.title;

      const payload = {
        event_name: event.name,
        event_data: {
          cartLineCost: cartLineCost,
          cartLineCostCurrency: cartLineCostCurrency,
          merchandiseVariantTitle: merchandiseVariantTitle,
        },
      };

      // Example for sending event to third party servers
      fetch('https://example.com/pixel', {
        method: 'POST',
        body: JSON.stringify(payload),
        keepalive: true,
      });
    });
  });
  ```

  ##### Custom Pixel

  ```javascript
  analytics.subscribe('product_removed_from_cart', (event) => {
    // Example for accessing event data
    const cartLine = event.data.cartLine;

    const cartLineCost = cartLine.cost.totalAmount.amount;

    const cartLineCostCurrency = cartLine.cost.totalAmount.currencyCode;

    const merchandiseVariantTitle = cartLine.merchandise.title;

    const payload = {
      event_name: event.name,
      event_data: {
        cartLineCost: cartLineCost,
        cartLineCostCurrency: cartLineCostCurrency,
        merchandiseVariantTitle: merchandiseVariantTitle,
      },
    };

    // Example for sending event to third party servers
    fetch('https://example.com/pixel', {
      method: 'POST',
      body: JSON.stringify(payload),
      keepalive: true,
    });
  });
  ```

</page>

<page>
---
title: product_viewed
description: >-
  The `product_viewed` event logs an instance where a customer visited a product
  details page. This event is available on the product page.
api_name: web-pixels
source_url:
  html: 'https://shopify.dev/docs/api/web-pixels-api/standard-events/product_viewed'
  md: >-
    https://shopify.dev/docs/api/web-pixels-api/standard-events/product_viewed.md
---

# product\_​viewed

The `product_viewed` event logs an instance where a customer visited a product details page. This event is available on the product page.

## Properties

* clientId

  string

  The client-side ID of the customer, provided by Shopify

* context

  Context

* data

  PixelEventsProductViewedData

* id

  string

  The ID of the customer event

* name

  string

  The name of the customer event

* seq

  number

  The sequence index number of the event.

* timestamp

  string

  The timestamp of when the customer event occurred, in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format

* type

  EventType.Standard

### Context

A snapshot of various read-only properties of the browser at the time of event

* document

  Snapshot of a subset of properties of the \`document\` object in the top frame of the browser

  ```ts
  WebPixelsDocument
  ```

* navigator

  Snapshot of a subset of properties of the \`navigator\` object in the top frame of the browser

  ```ts
  WebPixelsNavigator
  ```

* window

  Snapshot of a subset of properties of the \`window\` object in the top frame of the browser

  ```ts
  WebPixelsWindow
  ```

```ts
export interface Context {
  /**
   * Snapshot of a subset of properties of the `document` object in the top
   * frame of the browser
   */
  document?: WebPixelsDocument;

  /**
   * Snapshot of a subset of properties of the `navigator` object in the top
   * frame of the browser
   */
  navigator?: WebPixelsNavigator;

  /**
   * Snapshot of a subset of properties of the `window` object in the top frame
   * of the browser
   */
  window?: WebPixelsWindow;
}
```

### WebPixelsDocument

A snapshot of a subset of properties of the \`document\` object in the top frame of the browser

* characterSet

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the character set being used by the document

  ```ts
  string
  ```

* location

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the URI of the current document

  ```ts
  Location
  ```

* referrer

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the URI of the page that linked to this page

  ```ts
  string
  ```

* title

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the title of the current document

  ```ts
  string
  ```

```ts
export interface WebPixelsDocument {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the character set being used by the document
   */
  characterSet?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the URI of the current document
   */
  location?: Location;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the URI of the page that linked to this page
   */
  referrer?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the title of the current document
   */
  title?: string;
}
```

### Location

A snapshot of a subset of properties of the \`location\` object in the top frame of the browser

* hash

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing a \`'#'\` followed by the fragment identifier of the URL

  ```ts
  string
  ```

* host

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the host, that is the hostname, a \`':'\`, and the port of the URL

  ```ts
  string
  ```

* hostname

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the domain of the URL

  ```ts
  string
  ```

* href

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the entire URL

  ```ts
  string
  ```

* origin

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the canonical form of the origin of the specific location

  ```ts
  string
  ```

* pathname

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing an initial \`'/'\` followed by the path of the URL, not including the query string or fragment

  ```ts
  string
  ```

* port

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the port number of the URL

  ```ts
  string
  ```

* protocol

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the protocol scheme of the URL, including the final \`':'\`

  ```ts
  string
  ```

* search

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing a \`'?'\` followed by the parameters or "querystring" of the URL

  ```ts
  string
  ```

```ts
export interface Location {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing a `'#'` followed by the fragment identifier of the URL
   */
  hash?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the host, that is the hostname, a `':'`, and the port of
   * the URL
   */
  host?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the domain of the URL
   */
  hostname?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the entire URL
   */
  href?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the canonical form of the origin of the specific location
   */
  origin?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing an initial `'/'` followed by the path of the URL, not
   * including the query string or fragment
   */
  pathname?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the port number of the URL
   */
  port?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the protocol scheme of the URL, including the final `':'`
   */
  protocol?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing a `'?'` followed by the parameters or "querystring" of
   * the URL
   */
  search?: string;
}
```

### WebPixelsNavigator

A snapshot of a subset of properties of the \`navigator\` object in the top frame of the browser

* cookieEnabled

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns \`false\` if setting a cookie will be ignored and true otherwise

  ```ts
  boolean
  ```

* language

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns a string representing the preferred language of the user, usually the language of the browser UI. The \`null\` value is returned when this is unknown

  ```ts
  string
  ```

* languages

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns an array of strings representing the languages known to the user, by order of preference

  ```ts
  ReadonlyArray<string>
  ```

* userAgent

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns the user agent string for the current browser

  ```ts
  string
  ```

```ts
export interface WebPixelsNavigator {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns `false` if setting a cookie will be ignored and true otherwise
   */
  cookieEnabled?: boolean;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns a string representing the preferred language of the user, usually
   * the language of the browser UI. The `null` value is returned when this
   * is unknown
   */
  language?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns an array of strings representing the languages known to the user,
   * by order of preference
   */
  languages?: ReadonlyArray<string>;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns the user agent string for the current browser
   */
  userAgent?: string;
}
```

### WebPixelsWindow

A snapshot of a subset of properties of the \`window\` object in the top frame of the browser

* innerHeight

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the height of the content area of the browser window including, if rendered, the horizontal scrollbar

  ```ts
  number
  ```

* innerWidth

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the width of the content area of the browser window including, if rendered, the vertical scrollbar

  ```ts
  number
  ```

* location

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the location, or current URL, of the window object

  ```ts
  Location
  ```

* origin

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the global object's origin, serialized as a string

  ```ts
  string
  ```

* outerHeight

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the height of the outside of the browser window

  ```ts
  number
  ```

* outerWidth

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the width of the outside of the browser window

  ```ts
  number
  ```

* pageXOffset

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), an alias for window\.scrollX

  ```ts
  number
  ```

* pageYOffset

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), an alias for window\.scrollY

  ```ts
  number
  ```

* screen

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Screen), the interface representing a screen, usually the one on which the current window is being rendered

  ```ts
  Screen
  ```

* screenX

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the horizontal distance from the left border of the user's browser viewport to the left side of the screen

  ```ts
  number
  ```

* screenY

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the vertical distance from the top border of the user's browser viewport to the top side of the screen

  ```ts
  number
  ```

* scrollX

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the number of pixels that the document has already been scrolled horizontally

  ```ts
  number
  ```

* scrollY

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the number of pixels that the document has already been scrolled vertically

  ```ts
  number
  ```

```ts
export interface WebPixelsWindow {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window),
   * gets the height of the content area of the browser window including, if
   * rendered, the horizontal scrollbar
   */
  innerHeight?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), gets
   * the width of the content area of the browser window including, if rendered,
   * the vertical scrollbar
   */
  innerWidth?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * location, or current URL, of the window object
   */
  location?: Location;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * global object's origin, serialized as a string
   */
  origin?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), gets
   * the height of the outside of the browser window
   */
  outerHeight?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), gets
   * the width of the outside of the browser window
   */
  outerWidth?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), an
   * alias for window.scrollX
   */
  pageXOffset?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), an
   * alias for window.scrollY
   */
  pageYOffset?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen), the
   * interface representing a screen, usually the one on which the current
   * window is being rendered
   */
  screen?: Screen;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * horizontal distance from the left border of the user's browser viewport to
   * the left side of the screen
   */
  screenX?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * vertical distance from the top border of the user's browser viewport to the
   * top side of the screen
   */
  screenY?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * number of pixels that the document has already been scrolled horizontally
   */
  scrollX?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * number of pixels that the document has already been scrolled vertically
   */
  scrollY?: number;
}
```

### Screen

The interface representing a screen, usually the one on which the current window is being rendered

* height

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Screen/height), the height of the screen

  ```ts
  number
  ```

* width

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Screen/width), the width of the screen

  ```ts
  number
  ```

```ts
export interface Screen {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen/height),
   * the height of the screen
   */
  height?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen/width),
   * the width of the screen
   */
  width?: number;
}
```

### PixelEventsProductViewedData

* productVariant

  ```ts
  ProductVariant
  ```

```ts
export interface PixelEventsProductViewedData {
  productVariant?: ProductVariant;
}
```

### ProductVariant

A product variant represents a different version of a product, such as differing sizes or differing colors.

* id

  A globally unique identifier.

  ```ts
  string | null
  ```

* image

  Image associated with the product variant. This field falls back to the product image if no image is available.

  ```ts
  Image | null
  ```

* price

  The product variant’s price.

  ```ts
  MoneyV2
  ```

* product

  The product object that the product variant belongs to.

  ```ts
  Product
  ```

* sku

  The SKU (stock keeping unit) associated with the variant.

  ```ts
  string | null
  ```

* title

  The product variant’s title.

  ```ts
  string | null
  ```

* untranslatedTitle

  The product variant’s untranslated title.

  ```ts
  string | null
  ```

```ts
export interface ProductVariant {
  /**
   * A globally unique identifier.
   */
  id?: string | null;

  /**
   * Image associated with the product variant. This field falls back to the
   * product image if no image is available.
   */
  image?: Image | null;

  /**
   * The product variant’s price.
   */
  price?: MoneyV2;

  /**
   * The product object that the product variant belongs to.
   */
  product?: Product;

  /**
   * The SKU (stock keeping unit) associated with the variant.
   */
  sku?: string | null;

  /**
   * The product variant’s title.
   */
  title?: string | null;

  /**
   * The product variant’s untranslated title.
   */
  untranslatedTitle?: string | null;
}
```

### Image

An image resource.

* src

  The location of the image as a URL.

  ```ts
  string | null
  ```

```ts
export interface Image {
  /**
   * The location of the image as a URL.
   */
  src?: string | null;
}
```

### MoneyV2

A monetary value with currency.

* amount

  The decimal money amount.

  ```ts
  number
  ```

* currencyCode

  The three-letter code that represents the currency, for example, USD. Supported codes include standard ISO 4217 codes, legacy codes, and non- standard codes.

  ```ts
  string
  ```

```ts
export interface MoneyV2 {
  /**
   * The decimal money amount.
   */
  amount?: number;

  /**
   * The three-letter code that represents the currency, for example, USD.
   * Supported codes include standard ISO 4217 codes, legacy codes, and non-
   * standard codes.
   */
  currencyCode?: string;
}
```

### Product

A product is an individual item for sale in a Shopify store.

* id

  The ID of the product.

  ```ts
  string | null
  ```

* title

  The product’s title.

  ```ts
  string
  ```

* type

  The \[product type]\(https://help.shopify.com/en/manual/products/details/product-type) specified by the merchant.

  ```ts
  string | null
  ```

* untranslatedTitle

  The product’s untranslated title.

  ```ts
  string | null
  ```

* url

  The relative URL of the product.

  ```ts
  string | null
  ```

* vendor

  The product’s vendor name.

  ```ts
  string
  ```

```ts
export interface Product {
  /**
   * The ID of the product.
   */
  id?: string | null;

  /**
   * The product’s title.
   */
  title?: string;

  /**
   * The [product
   * type](https://help.shopify.com/en/manual/products/details/product-type)
   * specified by the merchant.
   */
  type?: string | null;

  /**
   * The product’s untranslated title.
   */
  untranslatedTitle?: string | null;

  /**
   * The relative URL of the product.
   */
  url?: string | null;

  /**
   * The product’s vendor name.
   */
  vendor?: string;
}
```

### EventType

* AdvancedDom

  ```ts
  advanced-dom
  ```

* Custom

  ```ts
  custom
  ```

* Dom

  ```ts
  dom
  ```

* Meta

  ```ts
  meta
  ```

* Standard

  ```ts
  standard
  ```

```ts
export enum EventType {
  AdvancedDom = 'advanced-dom',
  Custom = 'custom',
  Dom = 'dom',
  Meta = 'meta',
  Standard = 'standard',
}
```

Examples

### Examples

* #### Accessing Standard Events

  ##### App Pixel

  ```javascript
  import {register} from '@shopify/web-pixels-extension';

  register(({analytics}) => {
    analytics.subscribe('product_viewed', (event) => {
      // Example for accessing event data
      const productPrice = event.data.productVariant.price.amount;

      const productTitle = event.data.productVariant.title;

      const payload = {
        event_name: event.name,
        event_data: {
          productPrice: productPrice,
          productTitle: productTitle,
        },
      };

      // Example for sending event to third party servers
      fetch('https://example.com/pixel', {
        method: 'POST',
        body: JSON.stringify(payload),
        keepalive: true,
      });
    });
  });
  ```

  ##### Custom Pixel

  ```javascript
  analytics.subscribe('product_viewed', (event) => {
    // Example for accessing event data
    const productPrice = event.data.productVariant.price.amount;

    const productTitle = event.data.productVariant.title;

    const payload = {
      event_name: event.name,
      event_data: {
        productPrice: productPrice,
        productTitle: productTitle,
      },
    };

    // Example for sending event to third party servers
    fetch('https://example.com/pixel', {
      method: 'POST',
      body: JSON.stringify(payload),
      keepalive: true,
    });
  });
  ```

</page>

<page>
---
title: search_submitted
description: >-
  The `search_submitted` event logs an instance where a customer performed a
  search on the storefront. The products returned from the search query are in
  this event object (the first product variant for each product is listed in the
  array). This event is available on the online store page.
api_name: web-pixels
source_url:
  html: 'https://shopify.dev/docs/api/web-pixels-api/standard-events/search_submitted'
  md: >-
    https://shopify.dev/docs/api/web-pixels-api/standard-events/search_submitted.md
---

# search\_​submitted

The `search_submitted` event logs an instance where a customer performed a search on the storefront. The products returned from the search query are in this event object (the first product variant for each product is listed in the array). This event is available on the online store page.

## Properties

* clientId

  string

  The client-side ID of the customer, provided by Shopify

* context

  Context

* data

  PixelEventsSearchSubmittedData

* id

  string

  The ID of the customer event

* name

  string

  The name of the customer event

* seq

  number

  The sequence index number of the event.

* timestamp

  string

  The timestamp of when the customer event occurred, in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format

* type

  EventType.Standard

### Context

A snapshot of various read-only properties of the browser at the time of event

* document

  Snapshot of a subset of properties of the \`document\` object in the top frame of the browser

  ```ts
  WebPixelsDocument
  ```

* navigator

  Snapshot of a subset of properties of the \`navigator\` object in the top frame of the browser

  ```ts
  WebPixelsNavigator
  ```

* window

  Snapshot of a subset of properties of the \`window\` object in the top frame of the browser

  ```ts
  WebPixelsWindow
  ```

```ts
export interface Context {
  /**
   * Snapshot of a subset of properties of the `document` object in the top
   * frame of the browser
   */
  document?: WebPixelsDocument;

  /**
   * Snapshot of a subset of properties of the `navigator` object in the top
   * frame of the browser
   */
  navigator?: WebPixelsNavigator;

  /**
   * Snapshot of a subset of properties of the `window` object in the top frame
   * of the browser
   */
  window?: WebPixelsWindow;
}
```

### WebPixelsDocument

A snapshot of a subset of properties of the \`document\` object in the top frame of the browser

* characterSet

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the character set being used by the document

  ```ts
  string
  ```

* location

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the URI of the current document

  ```ts
  Location
  ```

* referrer

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the URI of the page that linked to this page

  ```ts
  string
  ```

* title

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the title of the current document

  ```ts
  string
  ```

```ts
export interface WebPixelsDocument {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the character set being used by the document
   */
  characterSet?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the URI of the current document
   */
  location?: Location;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the URI of the page that linked to this page
   */
  referrer?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the title of the current document
   */
  title?: string;
}
```

### Location

A snapshot of a subset of properties of the \`location\` object in the top frame of the browser

* hash

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing a \`'#'\` followed by the fragment identifier of the URL

  ```ts
  string
  ```

* host

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the host, that is the hostname, a \`':'\`, and the port of the URL

  ```ts
  string
  ```

* hostname

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the domain of the URL

  ```ts
  string
  ```

* href

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the entire URL

  ```ts
  string
  ```

* origin

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the canonical form of the origin of the specific location

  ```ts
  string
  ```

* pathname

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing an initial \`'/'\` followed by the path of the URL, not including the query string or fragment

  ```ts
  string
  ```

* port

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the port number of the URL

  ```ts
  string
  ```

* protocol

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the protocol scheme of the URL, including the final \`':'\`

  ```ts
  string
  ```

* search

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing a \`'?'\` followed by the parameters or "querystring" of the URL

  ```ts
  string
  ```

```ts
export interface Location {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing a `'#'` followed by the fragment identifier of the URL
   */
  hash?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the host, that is the hostname, a `':'`, and the port of
   * the URL
   */
  host?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the domain of the URL
   */
  hostname?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the entire URL
   */
  href?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the canonical form of the origin of the specific location
   */
  origin?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing an initial `'/'` followed by the path of the URL, not
   * including the query string or fragment
   */
  pathname?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the port number of the URL
   */
  port?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the protocol scheme of the URL, including the final `':'`
   */
  protocol?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing a `'?'` followed by the parameters or "querystring" of
   * the URL
   */
  search?: string;
}
```

### WebPixelsNavigator

A snapshot of a subset of properties of the \`navigator\` object in the top frame of the browser

* cookieEnabled

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns \`false\` if setting a cookie will be ignored and true otherwise

  ```ts
  boolean
  ```

* language

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns a string representing the preferred language of the user, usually the language of the browser UI. The \`null\` value is returned when this is unknown

  ```ts
  string
  ```

* languages

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns an array of strings representing the languages known to the user, by order of preference

  ```ts
  ReadonlyArray<string>
  ```

* userAgent

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns the user agent string for the current browser

  ```ts
  string
  ```

```ts
export interface WebPixelsNavigator {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns `false` if setting a cookie will be ignored and true otherwise
   */
  cookieEnabled?: boolean;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns a string representing the preferred language of the user, usually
   * the language of the browser UI. The `null` value is returned when this
   * is unknown
   */
  language?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns an array of strings representing the languages known to the user,
   * by order of preference
   */
  languages?: ReadonlyArray<string>;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns the user agent string for the current browser
   */
  userAgent?: string;
}
```

### WebPixelsWindow

A snapshot of a subset of properties of the \`window\` object in the top frame of the browser

* innerHeight

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the height of the content area of the browser window including, if rendered, the horizontal scrollbar

  ```ts
  number
  ```

* innerWidth

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the width of the content area of the browser window including, if rendered, the vertical scrollbar

  ```ts
  number
  ```

* location

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the location, or current URL, of the window object

  ```ts
  Location
  ```

* origin

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the global object's origin, serialized as a string

  ```ts
  string
  ```

* outerHeight

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the height of the outside of the browser window

  ```ts
  number
  ```

* outerWidth

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the width of the outside of the browser window

  ```ts
  number
  ```

* pageXOffset

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), an alias for window\.scrollX

  ```ts
  number
  ```

* pageYOffset

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), an alias for window\.scrollY

  ```ts
  number
  ```

* screen

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Screen), the interface representing a screen, usually the one on which the current window is being rendered

  ```ts
  Screen
  ```

* screenX

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the horizontal distance from the left border of the user's browser viewport to the left side of the screen

  ```ts
  number
  ```

* screenY

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the vertical distance from the top border of the user's browser viewport to the top side of the screen

  ```ts
  number
  ```

* scrollX

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the number of pixels that the document has already been scrolled horizontally

  ```ts
  number
  ```

* scrollY

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the number of pixels that the document has already been scrolled vertically

  ```ts
  number
  ```

```ts
export interface WebPixelsWindow {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window),
   * gets the height of the content area of the browser window including, if
   * rendered, the horizontal scrollbar
   */
  innerHeight?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), gets
   * the width of the content area of the browser window including, if rendered,
   * the vertical scrollbar
   */
  innerWidth?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * location, or current URL, of the window object
   */
  location?: Location;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * global object's origin, serialized as a string
   */
  origin?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), gets
   * the height of the outside of the browser window
   */
  outerHeight?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), gets
   * the width of the outside of the browser window
   */
  outerWidth?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), an
   * alias for window.scrollX
   */
  pageXOffset?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), an
   * alias for window.scrollY
   */
  pageYOffset?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen), the
   * interface representing a screen, usually the one on which the current
   * window is being rendered
   */
  screen?: Screen;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * horizontal distance from the left border of the user's browser viewport to
   * the left side of the screen
   */
  screenX?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * vertical distance from the top border of the user's browser viewport to the
   * top side of the screen
   */
  screenY?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * number of pixels that the document has already been scrolled horizontally
   */
  scrollX?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * number of pixels that the document has already been scrolled vertically
   */
  scrollY?: number;
}
```

### Screen

The interface representing a screen, usually the one on which the current window is being rendered

* height

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Screen/height), the height of the screen

  ```ts
  number
  ```

* width

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Screen/width), the width of the screen

  ```ts
  number
  ```

```ts
export interface Screen {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen/height),
   * the height of the screen
   */
  height?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen/width),
   * the width of the screen
   */
  width?: number;
}
```

### PixelEventsSearchSubmittedData

* searchResult

  ```ts
  SearchResult
  ```

```ts
export interface PixelEventsSearchSubmittedData {
  searchResult?: SearchResult;
}
```

### SearchResult

An object that contains the metadata of when a search has been performed.

* productVariants

  ```ts
  ProductVariant[]
  ```

* query

  The search query that was executed

  ```ts
  string
  ```

```ts
export interface SearchResult {
  productVariants?: ProductVariant[];

  /**
   * The search query that was executed
   */
  query?: string;
}
```

### ProductVariant

A product variant represents a different version of a product, such as differing sizes or differing colors.

* id

  A globally unique identifier.

  ```ts
  string | null
  ```

* image

  Image associated with the product variant. This field falls back to the product image if no image is available.

  ```ts
  Image | null
  ```

* price

  The product variant’s price.

  ```ts
  MoneyV2
  ```

* product

  The product object that the product variant belongs to.

  ```ts
  Product
  ```

* sku

  The SKU (stock keeping unit) associated with the variant.

  ```ts
  string | null
  ```

* title

  The product variant’s title.

  ```ts
  string | null
  ```

* untranslatedTitle

  The product variant’s untranslated title.

  ```ts
  string | null
  ```

```ts
export interface ProductVariant {
  /**
   * A globally unique identifier.
   */
  id?: string | null;

  /**
   * Image associated with the product variant. This field falls back to the
   * product image if no image is available.
   */
  image?: Image | null;

  /**
   * The product variant’s price.
   */
  price?: MoneyV2;

  /**
   * The product object that the product variant belongs to.
   */
  product?: Product;

  /**
   * The SKU (stock keeping unit) associated with the variant.
   */
  sku?: string | null;

  /**
   * The product variant’s title.
   */
  title?: string | null;

  /**
   * The product variant’s untranslated title.
   */
  untranslatedTitle?: string | null;
}
```

### Image

An image resource.

* src

  The location of the image as a URL.

  ```ts
  string | null
  ```

```ts
export interface Image {
  /**
   * The location of the image as a URL.
   */
  src?: string | null;
}
```

### MoneyV2

A monetary value with currency.

* amount

  The decimal money amount.

  ```ts
  number
  ```

* currencyCode

  The three-letter code that represents the currency, for example, USD. Supported codes include standard ISO 4217 codes, legacy codes, and non- standard codes.

  ```ts
  string
  ```

```ts
export interface MoneyV2 {
  /**
   * The decimal money amount.
   */
  amount?: number;

  /**
   * The three-letter code that represents the currency, for example, USD.
   * Supported codes include standard ISO 4217 codes, legacy codes, and non-
   * standard codes.
   */
  currencyCode?: string;
}
```

### Product

A product is an individual item for sale in a Shopify store.

* id

  The ID of the product.

  ```ts
  string | null
  ```

* title

  The product’s title.

  ```ts
  string
  ```

* type

  The \[product type]\(https://help.shopify.com/en/manual/products/details/product-type) specified by the merchant.

  ```ts
  string | null
  ```

* untranslatedTitle

  The product’s untranslated title.

  ```ts
  string | null
  ```

* url

  The relative URL of the product.

  ```ts
  string | null
  ```

* vendor

  The product’s vendor name.

  ```ts
  string
  ```

```ts
export interface Product {
  /**
   * The ID of the product.
   */
  id?: string | null;

  /**
   * The product’s title.
   */
  title?: string;

  /**
   * The [product
   * type](https://help.shopify.com/en/manual/products/details/product-type)
   * specified by the merchant.
   */
  type?: string | null;

  /**
   * The product’s untranslated title.
   */
  untranslatedTitle?: string | null;

  /**
   * The relative URL of the product.
   */
  url?: string | null;

  /**
   * The product’s vendor name.
   */
  vendor?: string;
}
```

### EventType

* AdvancedDom

  ```ts
  advanced-dom
  ```

* Custom

  ```ts
  custom
  ```

* Dom

  ```ts
  dom
  ```

* Meta

  ```ts
  meta
  ```

* Standard

  ```ts
  standard
  ```

```ts
export enum EventType {
  AdvancedDom = 'advanced-dom',
  Custom = 'custom',
  Dom = 'dom',
  Meta = 'meta',
  Standard = 'standard',
}
```

Examples

### Examples

* #### Accessing Standard Events

  ##### App Pixel

  ```javascript
  import {register} from '@shopify/web-pixels-extension';

  register(({analytics}) => {
    analytics.subscribe('search_submitted', (event) => {
      // Example for accessing event data
      const searchResult = event.data.searchResult;

      const searchQuery = searchResult.query;

      const firstProductReturnedFromSearch =
        searchResult.productVariants[0]?.product.title;

      const payload = {
        event_name: event.name,
        event_data: {
          searchQuery: searchQuery,
          firstProductTitle: firstProductReturnedFromSearch,
        },
      };

      // Example for sending event to third party servers
      fetch('https://example.com/pixel', {
        method: 'POST',
        body: JSON.stringify(payload),
        keepalive: true,
      });
    });
  });
  ```

  ##### Custom Pixel

  ```javascript
  analytics.subscribe('search_submitted', (event) => {
    // Example for accessing event data
    const searchResult = event.data.searchResult;

    const searchQuery = searchResult.query;

    const firstProductReturnedFromSearch =
      searchResult.productVariants[0]?.product.title;

    const payload = {
      event_name: event.name,
      event_data: {
        searchQuery: searchQuery,
        firstProductTitle: firstProductReturnedFromSearch,
      },
    };

    // Example for sending event to third party servers
    fetch('https://example.com/pixel', {
      method: 'POST',
      body: JSON.stringify(payload),
      keepalive: true,
    });
  });
  ```

</page>

<page>
---
title: ui_extension_errored
description: >-
  The `ui_extension_errored` event logs occurrences when an extension fails to
  render due to an uncaught exception in the extension code.


  > Note: This event is only available on checkout.
api_name: web-pixels
source_url:
  html: >-
    https://shopify.dev/docs/api/web-pixels-api/standard-events/ui_extension_errored
  md: >-
    https://shopify.dev/docs/api/web-pixels-api/standard-events/ui_extension_errored.md
---

# ui\_​extension\_​errored

The `ui_extension_errored` event logs occurrences when an extension fails to render due to an uncaught exception in the extension code.

Note

This event is only available on checkout.

## Properties

* clientId

  string

  The client-side ID of the customer, provided by Shopify

* context

  Context

* data

  PixelEventsUiExtensionErroredData

* id

  string

  The ID of the customer event

* name

  string

  The name of the customer event

* seq

  number

  The sequence index number of the event.

* timestamp

  string

  The timestamp of when the customer event occurred, in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format

* type

  EventType.Standard

### Context

A snapshot of various read-only properties of the browser at the time of event

* document

  Snapshot of a subset of properties of the \`document\` object in the top frame of the browser

  ```ts
  WebPixelsDocument
  ```

* navigator

  Snapshot of a subset of properties of the \`navigator\` object in the top frame of the browser

  ```ts
  WebPixelsNavigator
  ```

* window

  Snapshot of a subset of properties of the \`window\` object in the top frame of the browser

  ```ts
  WebPixelsWindow
  ```

```ts
export interface Context {
  /**
   * Snapshot of a subset of properties of the `document` object in the top
   * frame of the browser
   */
  document?: WebPixelsDocument;

  /**
   * Snapshot of a subset of properties of the `navigator` object in the top
   * frame of the browser
   */
  navigator?: WebPixelsNavigator;

  /**
   * Snapshot of a subset of properties of the `window` object in the top frame
   * of the browser
   */
  window?: WebPixelsWindow;
}
```

### WebPixelsDocument

A snapshot of a subset of properties of the \`document\` object in the top frame of the browser

* characterSet

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the character set being used by the document

  ```ts
  string
  ```

* location

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the URI of the current document

  ```ts
  Location
  ```

* referrer

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the URI of the page that linked to this page

  ```ts
  string
  ```

* title

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Document), returns the title of the current document

  ```ts
  string
  ```

```ts
export interface WebPixelsDocument {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the character set being used by the document
   */
  characterSet?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the URI of the current document
   */
  location?: Location;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the URI of the page that linked to this page
   */
  referrer?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document),
   * returns the title of the current document
   */
  title?: string;
}
```

### Location

A snapshot of a subset of properties of the \`location\` object in the top frame of the browser

* hash

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing a \`'#'\` followed by the fragment identifier of the URL

  ```ts
  string
  ```

* host

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the host, that is the hostname, a \`':'\`, and the port of the URL

  ```ts
  string
  ```

* hostname

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the domain of the URL

  ```ts
  string
  ```

* href

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the entire URL

  ```ts
  string
  ```

* origin

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the canonical form of the origin of the specific location

  ```ts
  string
  ```

* pathname

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing an initial \`'/'\` followed by the path of the URL, not including the query string or fragment

  ```ts
  string
  ```

* port

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the port number of the URL

  ```ts
  string
  ```

* protocol

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing the protocol scheme of the URL, including the final \`':'\`

  ```ts
  string
  ```

* search

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Location), a string containing a \`'?'\` followed by the parameters or "querystring" of the URL

  ```ts
  string
  ```

```ts
export interface Location {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing a `'#'` followed by the fragment identifier of the URL
   */
  hash?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the host, that is the hostname, a `':'`, and the port of
   * the URL
   */
  host?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the domain of the URL
   */
  hostname?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the entire URL
   */
  href?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the canonical form of the origin of the specific location
   */
  origin?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing an initial `'/'` followed by the path of the URL, not
   * including the query string or fragment
   */
  pathname?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the port number of the URL
   */
  port?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing the protocol scheme of the URL, including the final `':'`
   */
  protocol?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Location), a
   * string containing a `'?'` followed by the parameters or "querystring" of
   * the URL
   */
  search?: string;
}
```

### WebPixelsNavigator

A snapshot of a subset of properties of the \`navigator\` object in the top frame of the browser

* cookieEnabled

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns \`false\` if setting a cookie will be ignored and true otherwise

  ```ts
  boolean
  ```

* language

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns a string representing the preferred language of the user, usually the language of the browser UI. The \`null\` value is returned when this is unknown

  ```ts
  string
  ```

* languages

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns an array of strings representing the languages known to the user, by order of preference

  ```ts
  ReadonlyArray<string>
  ```

* userAgent

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Navigator), returns the user agent string for the current browser

  ```ts
  string
  ```

```ts
export interface WebPixelsNavigator {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns `false` if setting a cookie will be ignored and true otherwise
   */
  cookieEnabled?: boolean;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns a string representing the preferred language of the user, usually
   * the language of the browser UI. The `null` value is returned when this
   * is unknown
   */
  language?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns an array of strings representing the languages known to the user,
   * by order of preference
   */
  languages?: ReadonlyArray<string>;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Navigator),
   * returns the user agent string for the current browser
   */
  userAgent?: string;
}
```

### WebPixelsWindow

A snapshot of a subset of properties of the \`window\` object in the top frame of the browser

* innerHeight

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the height of the content area of the browser window including, if rendered, the horizontal scrollbar

  ```ts
  number
  ```

* innerWidth

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the width of the content area of the browser window including, if rendered, the vertical scrollbar

  ```ts
  number
  ```

* location

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the location, or current URL, of the window object

  ```ts
  Location
  ```

* origin

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the global object's origin, serialized as a string

  ```ts
  string
  ```

* outerHeight

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the height of the outside of the browser window

  ```ts
  number
  ```

* outerWidth

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), gets the width of the outside of the browser window

  ```ts
  number
  ```

* pageXOffset

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), an alias for window\.scrollX

  ```ts
  number
  ```

* pageYOffset

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), an alias for window\.scrollY

  ```ts
  number
  ```

* screen

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Screen), the interface representing a screen, usually the one on which the current window is being rendered

  ```ts
  Screen
  ```

* screenX

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the horizontal distance from the left border of the user's browser viewport to the left side of the screen

  ```ts
  number
  ```

* screenY

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the vertical distance from the top border of the user's browser viewport to the top side of the screen

  ```ts
  number
  ```

* scrollX

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the number of pixels that the document has already been scrolled horizontally

  ```ts
  number
  ```

* scrollY

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Window), the number of pixels that the document has already been scrolled vertically

  ```ts
  number
  ```

```ts
export interface WebPixelsWindow {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window),
   * gets the height of the content area of the browser window including, if
   * rendered, the horizontal scrollbar
   */
  innerHeight?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), gets
   * the width of the content area of the browser window including, if rendered,
   * the vertical scrollbar
   */
  innerWidth?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * location, or current URL, of the window object
   */
  location?: Location;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * global object's origin, serialized as a string
   */
  origin?: string;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), gets
   * the height of the outside of the browser window
   */
  outerHeight?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), gets
   * the width of the outside of the browser window
   */
  outerWidth?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), an
   * alias for window.scrollX
   */
  pageXOffset?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), an
   * alias for window.scrollY
   */
  pageYOffset?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen), the
   * interface representing a screen, usually the one on which the current
   * window is being rendered
   */
  screen?: Screen;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * horizontal distance from the left border of the user's browser viewport to
   * the left side of the screen
   */
  screenX?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * vertical distance from the top border of the user's browser viewport to the
   * top side of the screen
   */
  screenY?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * number of pixels that the document has already been scrolled horizontally
   */
  scrollX?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window), the
   * number of pixels that the document has already been scrolled vertically
   */
  scrollY?: number;
}
```

### Screen

The interface representing a screen, usually the one on which the current window is being rendered

* height

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Screen/height), the height of the screen

  ```ts
  number
  ```

* width

  Per \[MDN]\(https://developer.mozilla.org/en-US/docs/Web/API/Screen/width), the width of the screen

  ```ts
  number
  ```

```ts
export interface Screen {
  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen/height),
   * the height of the screen
   */
  height?: number;

  /**
   * Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Screen/width),
   * the width of the screen
   */
  width?: number;
}
```

### PixelEventsUiExtensionErroredData

* error

  ```ts
  UiExtensionError
  ```

```ts
export interface PixelEventsUiExtensionErroredData {
  error?: UiExtensionError;
}
```

### UiExtensionError

An object that contains data about a UI Extension error that occurred.

* apiVersion

  The API version used by the extension.

  ```ts
  string
  ```

* appId

  The unique identifier of the app that the extension belongs to.

  ```ts
  string
  ```

* appName

  The name of the app that the extension belongs to.

  ```ts
  string
  ```

* appVersion

  The version of the app that encountered the error.

  ```ts
  string
  ```

* extensionName

  The name of the extension that encountered the error.

  ```ts
  string
  ```

* extensionTarget

  The \[target]\(https://shopify.dev/docs/api/checkout-ui-extensions/latest/targets) of the extension, for example "purchase.checkout.delivery-address.render-after".

  ```ts
  string
  ```

* message

  The message associated with the error that occurred.

  ```ts
  string
  ```

* placementReference

  The \[placement reference]\(https://shopify.dev/docs/apps/build/checkout/test-checkout-ui-extensions#dynamic-targets) of the extension, only populated for dynamic targets.

  ```ts
  string | null
  ```

* trace

  The stack trace associated with the error that occurred.

  ```ts
  string
  ```

* type

  The type of error that occurred.

  ```ts
  UiExtensionErrorType
  ```

```ts
export interface UiExtensionError {
  /**
   * The API version used by the extension.
   */
  apiVersion?: string;

  /**
   * The unique identifier of the app that the extension belongs to.
   */
  appId?: string;

  /**
   * The name of the app that the extension belongs to.
   */
  appName?: string;

  /**
   * The version of the app that encountered the error.
   */
  appVersion?: string;

  /**
   * The name of the extension that encountered the error.
   */
  extensionName?: string;

  /**
   * The [target](https://shopify.dev/docs/api/checkout-ui-extensions/latest/targets) of the extension, for example
   * "purchase.checkout.delivery-address.render-after".
   */
  extensionTarget?: string;

  /**
   * The message associated with the error that occurred.
   */
  message?: string;

  /**
   * The [placement reference](https://shopify.dev/docs/apps/build/checkout/test-checkout-ui-extensions#dynamic-targets) of the extension, only populated
   * for dynamic targets.
   */
  placementReference?: string | null;

  /**
   * The stack trace associated with the error that occurred.
   */
  trace?: string;

  /**
   * The type of error that occurred.
   */
  type?: UiExtensionErrorType;
}
```

### UiExtensionErrorType

* ExtensionUsageError

  ```ts
  EXTENSION_USAGE_ERROR
  ```

```ts
export enum UiExtensionErrorType {
  /**
   * An error caused by incorrect usage of extension APIs or UI components.
   */
  ExtensionUsageError = 'EXTENSION_USAGE_ERROR',
}
```

### EventType

* AdvancedDom

  ```ts
  advanced-dom
  ```

* Custom

  ```ts
  custom
  ```

* Dom

  ```ts
  dom
  ```

* Meta

  ```ts
  meta
  ```

* Standard

  ```ts
  standard
  ```

```ts
export enum EventType {
  AdvancedDom = 'advanced-dom',
  Custom = 'custom',
  Dom = 'dom',
  Meta = 'meta',
  Standard = 'standard',
}
```

Examples

### Examples

* #### Accessing Standard Events

  ##### App Pixel

  ```javascript
  import {register} from '@shopify/web-pixels-extension';

  register(({analytics}) => {
    analytics.subscribe('ui_extension_errored', (event) => {
      // Example for accessing event data
      const {apiVersion, appId, appName, appVersion, trace} = event.data.alert;

      const payload = {
        event_name: event.name,
        event_data: {
          apiVersion,
          appId,
          appName,
          appVersion,
          trace,
        },
      };

      // Example for sending event data to third party servers
      fetch('https://example.com/pixel', {
        method: 'POST',
        body: JSON.stringify(payload),
        keepalive: true,
      });
    });
  });
  ```

  ##### Custom Pixel

  ```javascript
  analytics.subscribe('ui_extension_errored', (event) => {
    // Example for accessing event data
    const {apiVersion, appId, appName, appVersion, trace} = event.data.alert;

    const payload = {
      event_name: event.name,
      event_data: {
        apiVersion,
        appId,
        appName,
        appVersion,
        trace,
      },
    };

    // Example for sending event to third party servers
    fetch('https://example.com/pixel', {
      method: 'POST',
      body: JSON.stringify(payload),
      keepalive: true,
    });
  });
  ```

</page>