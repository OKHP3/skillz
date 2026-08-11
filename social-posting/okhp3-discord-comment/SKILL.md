---
name: okhp3-discord-comment
description: >
  Draft a Discord reply to a supplied message, thread, or forum conversation.
  Use when the user wants to answer, clarify, or contribute to an existing
  Discord discussion. It preserves channel and thread context, avoids
  unauthorized pings, and returns a draft only. Do not use for a new message,
  a new thread, direct messages, or sending content.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.0.0"
  category: social-posting
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Drafting a context-aware Discord reply to an existing message, thread, or forum post."
  out_of_scope: "Sending, creating a new thread, direct messages, moderation actions, or permission changes."
---

# okhp3-discord-comment

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

In Discord, a useful comment is a reply that respects the channel's local flow.

## Scope

This package drafts one reply to an existing Discord message, thread, or forum
post. It does not send content, create a new thread, open a direct message, or
change moderation or permission settings.

## Process

1. Read the target message, relevant thread or forum context, and supplied
   channel guidelines. Confirm the server, channel, and whether the reply stays
   in the current conversation. Do not infer context from a single cropped
   message.
2. State the contribution: direct answer, clarification, evidence, short
   acknowledgement, or respectful disagreement. Keep it proportionate to the
   channel's pace and the question actually asked.
3. Use restrained Discord Markdown where it improves the answer. Quote or link
   only the portion needed to orient readers. Do not duplicate a long message
   merely to signal participation.
4. Do not add `@everyone`, `@here`, role pings, or unrelated user mentions
   unless the user explicitly authorizes the exact ping for that destination.
   Do not create a new thread when the request is a reply.
5. Remove private, employer-identifying, and unsupported material. Return the
   reply with a context note and do not send it.

## Platform boundary

Thread participation and messaging are controlled by channel permissions.
Threads organize a discrete topic inside a channel; forum posts are persistent
discussion containers. This package drafts for the supplied conversation but
does not choose or create a new container on the user's behalf.

## Output contract

Return `Conversation checked`, `Draft`, and `Mention or formatting note`. If
the parent message, channel, or guideline is absent, request it. For harassment,
private disclosure, or an unauthorized mass ping, stop with the specific
boundary and offer a safe alternative when possible.

## Validation

Before return, verify the parent context and destination are known, the reply
fits the supplied channel guidance, no exact ping lacks explicit authorization,
and no sending or thread-creation action is included.

## Current platform references

- [Discord: Threads FAQ](https://support.discord.com/hc/en-us/articles/4403205878423-Threads-FAQ) (retrieved 2026-08-11) documents thread purpose and participation permissions.
- [Discord: Channel Permissions Settings 101](https://support.discord.com/hc/en-us/articles/10543994968087-Channel-Permissions-Settings-101) (retrieved 2026-08-11) documents Send Messages, Send Messages in Threads, and mention permissions.
- [Discord: Markdown Text 101](https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline?page=1) (retrieved 2026-08-11) documents supported formatting.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
