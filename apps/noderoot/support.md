---
title: Node-ROOT Support
permalink: /noderoot/support/
app: noderoot
---

Need help with **Node-ROOT**? You're in the right place.

Node-ROOT is a Node-RED inspired visual workflow editor and engine for [Root](https://www.root.io/) communities. It lets you automate tasks (e.g. greeting members, checking messages for keywords, sending alerts, or granting roles) through custom drag-and-drop graphs.

## Getting Help

To report a bug, request a node type, or ask questions, email:
[ctacke@gmail.com](mailto:ctacke@gmail.com).

Please include:
- A brief description of the issue or feature request
- If reporting a bug, the node configurations and connections you set up
- The execution status logs shown in the debug panel (if applicable)

## Common Questions

**How do I start building a workflow?**
Open the Node-ROOT editor in your community sidebar or channel view. Drag nodes from the left-hand palette onto the canvas, wire their ports together, select nodes to configure their properties in the inspector panel on the right, and hit **Deploy**.

**What are the different states of a workflow?**
- **Draft**: Edits are saved but not live. Workflows in progress stay in draft.
- **Deployed**: The workflow's snapshot is active and executing background operations when platform triggers occur.
- **Disabled**: The workflow's execution is paused; it will not process incoming events.
- **Error**: A live background execution failed. Click the flow to inspect execution logs and fix configurations.

**How do I pass variables between nodes?**
Use double curly-brace template expressions (e.g., `{{message.content}}` or `{{message.author.name}}`). Any node that executes after a trigger has access to the trigger's context variables.

**Why does my action fail with "Permission denied"?**
Workflows run under the security scope of the Node-ROOT app's manifest. If you use a "Send Message" action but the app manifest does not request message scopes (or has not been authorized in the destination channel), the action will fail. Check the warnings highlighted in red in your execution debug history.

## Legal

- [Privacy Policy]({{ '/noderoot/privacy/' | relative_url }})
- [Terms of Service]({{ '/noderoot/terms/' | relative_url }})

[← Back to Root Apps]({{ '/' | relative_url }})
