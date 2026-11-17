# Optional Camo Studio adapter

Load only for a user-requested Camo Studio session with usable desktop controls.
This is historical UI guidance from Camo Studio 2.9.0; reverify the current
version, connected device, permissions, menu and actual output before use.
No MCP server or special camera bridge is a prerequisite for the portable skill.

1. Inspect the current app/device and preview using authorized host tools.
   Installation alone does not mean that an agent can control the app.
2. Reverify the still-save command. A historically available route was
   Capture > Save Image As. Video/record commands are different actions and must
   never be used to implement a still sequence.
3. Confirm destination and fresh UI references before saving. Modal file dialogs
   may invalidate previous element identifiers and add substantial latency.
4. Keep effects modest and record existing values before changing them.
   A black replacement preview does not prove transparent output; verify a saved
   image's alpha if transparency matters.
5. If a custom background is requested, prepare/import it while the person is
   relaxed. Verify selection and saved output. A background image is separate
   from operating-system wallpaper; changing one does not authorize the other.
6. Release the person before inspecting files or uploading them. Keep settings
   restoration within the agreed scope and preserve unrelated user changes.

Do not install or execute unsigned helpers or a disconnected connector merely
because an app has no callable tool. Offer the native app's user-operated still
capture instead. Actual tool timing and save behavior must be checked afresh.
