---
name: okhp3-discord-post
description: >
  Draft a new Discord message, forum post, or thread opener for a named server
  destination. Use when the user asks to post an announcement, update, question,
  or discussion opener in Discord. It checks server, channel, and ping context,
  uses Discord-friendly Markdown when useful, and returns a draft only. Do not
  use for replies, direct messages, or sending content.
license: MIT
metadata:
  author: Jamie Hill (OverKill Hill P³)
  version: "1.0.0"
  category: social-posting
  origin: okhp3/skillz
  homepage: https://overkillhill.com
  author-github: https://github.com/OKHP3
  in_scope: "Drafting a new Discord message, forum post, or thread opener for a supplied destination."
  out_of_scope: "Sending messages, joining servers, permission changes, direct messages, or replying to existing content."
---

# okhp3-discord-post

**OverKill Hill P³** · [overkillhill.com](https://overkillhill.com) · [github.com/OKHP3](https://github.com/OKHP3)

Discord is a destination-led community conversation, not a generic broadcast.

## Scope

This package drafts one new Discord channel message, forum post, or thread
opener for a supplied destination. It does not send messages, join servers,
change permissions, or write a reply to existing content.

## Process

1. Confirm the acting identity, server, channel or forum, intended audience,
   and message form: new channel message, forum post, or thread opener. Read
   supplied channel guidelines before drafting. If destination or guidance is
   unknown, return `NEEDS INPUT`.
2. Match the message to the stated purpose. Announcements should lead with the
   action or change; questions should supply enough context to answer; forum
   posts should have a specific title and the requested tags when supplied.
3. Use Discord Markdown only where it improves scanability: short headings,
   lists, code blocks, block quotes, or masked links. Do not paste elaborate
   formatting into a fast-moving chat without a reason.
4. Do not include `@everyone`, `@here`, or a role mention unless the user
   explicitly authorizes that exact ping for the named destination. Do not
   infer permissions to send, attach files, embed links, or create threads.
5. Remove private, employer-identifying, or unsupported content. Return the
   draft with its intended destination and any formatting or ping note. Do not
   send it.

## Platform boundary

Discord channel and thread permissions are destination-specific. Forum posts,
threads, and channel messages serve different conversation shapes. This skill
chooses text for the supplied form; it never changes a server's structure or
permissions to make the text fit.

## Output contract

Return `Destination`, `Message form`, `Draft`, and `Formatting or ping note`.
If the user has supplied no server or channel context, ask for it rather than
writing a generic announcement that might violate local norms.

## Validation

Before return, verify the server destination and message form are known,
formatting is appropriate to the channel, no exact ping lacks explicit
authorization, and the package has returned a draft only.

## Current platform references

- [Discord: Markdown Text 101](https://support.discord.com/hc/en-us/articles/210298617-Markdown-Text-101-Chat-Formatting-Bold-Italic-Underline?page=1) (retrieved 2026-08-11) documents supported Markdown text formatting.
- [Discord: Channel Permissions Settings 101](https://support.discord.com/hc/en-us/articles/10543994968087-Channel-Permissions-Settings-101) (retrieved 2026-08-11) documents message, thread, link, attachment, and mention permissions.
- [Discord: Forum Channels FAQ](https://support.discord.com/hc/en-us/articles/6208479917079-Forum-Channels-FAQ) (retrieved 2026-08-11) distinguishes forum posts, tags, and community-server context.

## About

Built by [Jamie Hill](https://overkillhill.com) · [OverKill Hill P³](https://overkillhill.com)
Published at [github.com/OKHP3](https://github.com/OKHP3)
Part of the [OKHP3/skillz](https://github.com/OKHP3/skillz) Agent Skill library.
MIT License -- free to use, fork, and adapt. A nod to the source is appreciated.
