<div align="center">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://public.storm-cdn.com/power-plant/media/banner-1280x640-dark.gif">
  <source media="(prefers-color-scheme: light)" srcset="https://public.storm-cdn.com/power-plant/media/banner-1280x640-light.gif">
<img src="https://public.storm-cdn.com/power-plant/media/banner-1280x640-dark.gif" width="100%" alt="Power Plant" />
</picture>
</div>
<br />

<br />
<div align="center">
<b>
<a href="https://stormsoftware.com" target="_blank">Website</a>  •
<a href="https://github.com/storm-software/power-plant" target="_blank">GitHub</a>  •
<a href="https://discord.gg/MQ6YVzakM5">Discord</a>  •  <a href="https://stormsoftware.github.io/power-plant/" target="_blank">Docs</a>  •  <a href="https://stormsoftware.com/contact" target="_blank">Contact</a>  •
<a href="https://github.com/storm-software/power-plant/issues/new?assignees=&labels=bug&template=bug-report.yml&title=Bug Report%3A+">Report a Bug</a>
</b>
</div>
<br />

**☢️ Power Plant** is a collection of TypeScript packages and stand-alone developer tools that center on a single, simple concept: **generate anything from a specification**. The goal of Power Plant is to make it easy for developers to generate code, documentation, and other artifacts from a specification, without having to write any boilerplate code themselves.

In the background, Power Plant will also gather metadata about the repository and provide it to LLMs and various other tools. **This allows our favorite AI models to understand more than just the source code, but also its context, the reason why it exists, and its intended usage.**

The Power Plant monorepo is a collection of packages that are designed to work together, but in many cases can also be used independently.

<br />

<h3 align="center">💻 Visit <a href="https://stormsoftware.com" target="_blank">stormsoftware.com</a> to stay up to date with this developer</h3>
<br />

[![github](https://img.shields.io/github/package-json/v/storm-software/power-plant?style=for-the-badge&color=1fb2a6)](https://github.com/storm-software/power-plant/tree/main/packages/core)&nbsp;[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=for-the-badge&logo=commitlint&color=1fb2a6)](http://commitizen.github.io/cz-cli/)&nbsp;![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=for-the-badge&color=1fb2a6)&nbsp;![GitHub Workflow Status (with event)](https://img.shields.io/github/actions/workflow/status/storm-software/power-plant/release.yml?style=for-the-badge&logo=github-actions&color=1fb2a6)

<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->

> [!IMPORTANT] 
> This repository, and the apps, libraries, and tools contained within, is still in its initial development phase. As a result, bugs and issues are expected with its usage. When the main development phase completes, a proper release will be performed, the packages will be available through NPM (and other distributions), and this message will be removed. However, in the meantime, please feel free to report any issues you may come across.

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<div align="center">
<a href="https://github.com/storm-software/power-plant" target="_blank">
<b>Be sure to ⭐ this repository on GitHub so you can keep up to date on any daily progress!</b>
</a>
</div>

<!-- START doctoc -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

## Table of Contents

- [Quick Features](#quick-features)
  - [Environment Configuration Help](#environment-configuration-help)
- [Getting Started](#getting-started)
  - [Build](#build)
  - [Development Server](#development-server)
- [Environment Configuration Help](#environment-configuration-help-1)
- [Testing](#testing)
  - [Running Unit Tests](#running-unit-tests)
  - [Running End-to-End Tests](#running-end-to-end-tests)
  - [Understand your workspace](#understand-your-workspace)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [Support](#support)
- [License](#license)
- [Contributors ✨](#contributors-)

<!-- END doctoc -->

<br />

# Quick Features

This section contains a quick overview of the features and functionality of the repository.

## Environment Configuration Help

If you run into any issues while trying to run any of the above steps, please
reach out to Patrick Sullivan. See the [Support](#support) section for more
information.

# Getting Started

Once the code is pulled locally, open a command prompt and run `pnpm install` in
the root repo directory (/power-plant).

More information can be found in the
[Power Plant documentation](https://storm-software.github.io/power-plant/docs/getting-started/installation).

<div align="right">[ <a href="#table-of-contents">Back to top ▲</a> ]</div>
<br />

## Build

Run `pnpm build` to build the project. The build artifacts will be stored in the
`dist/` directory. Use the `--prod` flag for a production build.

<div align="right">[ <a href="#table-of-contents">Back to top ▲</a> ]</div>
<br />

## Development Server

Run `pnpm serve` for a dev server. Navigate to <http://localhost:4200/>. The app
will automatically reload if you change any of the source files.

<div align="right">[ <a href="#table-of-contents">Back to top ▲</a> ]</div>
<br />

# Environment Configuration Help

If you run into any issues while trying to run any of the above steps, please
reach out to Patrick Sullivan. See the [Support](#support) section for more
information.

<div align="right">[ <a href="#table-of-contents">Back to top ▲</a> ]</div>
<br />

# Testing

Open System uses [Vitest](https://vitest.dev/) for unit testing and
[Cypress](https://www.cypress.io/) for end-to-end testing.

<div align="right">[ <a href="#table-of-contents">Back to top ▲</a> ]</div>
<br />

## Running Unit Tests

Run `pnpm test` to execute the unit tests via [Vitest](https://vitest.dev/).

Run `pnpm affected:test` to execute the unit tests affected by a change.

<div align="right">[ <a href="#table-of-contents">Back to top ▲</a> ]</div>
<br />

## Running End-to-End Tests

Run `pnpm e2e` to execute the end-to-end tests via
[Cypress](https://www.cypress.io).

Run `pnpm affected:e2e` to execute the end-to-end tests affected by a change.

<div align="right">[ <a href="#table-of-contents">Back to top ▲</a> ]</div>
<br />

## Understand your workspace

Run `pnpm graph` to see a diagram of the dependencies of the Open System
projects.

<div align="right">[ <a href="#table-of-contents">Back to top ▲</a> ]</div>
<br />

# Roadmap

See the [open issues](https://github.com/storm-software/power-plant/issues) for a
list of proposed features (and known issues).

- [Top Feature Requests](https://github.com/storm-software/power-plant/issues?q=label%3Aenhancement+is%3Aopen+sort%3Areactions-%2B1-desc)
  (Add your votes using the 👍 reaction)
- [Top Bugs](https://github.com/storm-software/power-plant/issues?q=is%3Aissue+is%3Aopen+label%3Abug+sort%3Areactions-%2B1-desc)
  (Add your votes using the 👍 reaction)
- [Newest Bugs](https://github.com/storm-software/power-plant/issues?q=is%3Aopen+is%3Aissue+label%3Abug)

<div align="right">[ <a href="#table-of-contents">Back to top ▲</a> ]</div>
<br />

# Contributing

First off, thanks for taking the time to contribute! Contributions are what
makes the open-source community such an amazing place to learn, inspire, and
create. Any contributions you make will benefit everybody else and are **greatly
appreciated**.

Please try to create bug reports that are:

- _Reproducible._ Include steps to reproduce the problem.
- _Specific._ Include as much detail as possible: which version, what
  environment, etc.
- _Unique._ Do not duplicate existing opened issues.
- _Scoped to a Single Bug._ One bug per report.

Please adhere to this project's [code of conduct](.github/CODE_OF_CONDUCT.md).

You can use
[markdownlint-cli](https://github.com/storm-software/power-plant/markdownlint-cli) to
check for common markdown style inconsistency.

<div align="right">[ <a href="#table-of-contents">Back to top ▲</a> ]</div>
<br />

# Support

Reach out to the maintainer at one of the following places:

- [Contact](https://stormsoftware.com/contact)
- [GitHub discussions](https://github.com/storm-software/power-plant/discussions)
- <contact@stormsoftware.com>

<div align="right">[ <a href="#table-of-contents">Back to top ▲</a> ]</div>
<br />

# License

This project is licensed under the **Apache License 2.0**. Feel free to edit and
distribute this template as you like. If you have any specific questions, please
reach out to the Storm Software development team.

See [LICENSE](LICENSE) for more information.

<div align="right">[ <a href="#table-of-contents">Back to top ▲</a> ]</div>
<br />

# Contributors ✨

Thanks goes to these wonderful people
([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="http://www.sullypat.com/"><img src="https://avatars.githubusercontent.com/u/99053093?v=4?s=100" width="100px;" alt="Patrick Sullivan"/><br /><sub><b>Patrick Sullivan</b></sub></a><br /><a href="#design-sullivanpj" title="Design">🎨</a> <a href="https://github.com/storm-software/power-plant/commits?author=sullivanpj" title="Code">💻</a> <a href="#tool-sullivanpj" title="Tools">🔧</a> <a href="https://github.com/storm-software/power-plant/commits?author=sullivanpj" title="Documentation">📖</a> <a href="https://github.com/storm-software/power-plant/commits?author=sullivanpj" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://tylerbenning.com/"><img src="https://avatars.githubusercontent.com/u/7265547?v=4?s=100" width="100px;" alt="Tyler Benning"/><br /><sub><b>Tyler Benning</b></sub></a><br /><a href="#design-tbenning" title="Design">🎨</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://stormsoftware.com"><img src="https://avatars.githubusercontent.com/u/149802440?v=4?s=100" width="100px;" alt="Stormie"/><br /><sub><b>Stormie</b></sub></a><br /><a href="#maintenance-stormie-bot" title="Maintenance">🚧</a></td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <td align="center" size="13px" colspan="7">
        <img src="https://raw.githubusercontent.com/all-contributors/all-contributors-cli/1b8533af435da9854653492b1327a23a4dbd0a10/assets/logo-small.svg">
          <a href="https://all-contributors.js.org/docs/en/bot/usage">Add your contributions</a>
        </img>
      </td>
    </tr>
  </tfoot>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the
[all-contributors](https://github.com/all-contributors/all-contributors)
specification. Contributions of any kind welcome!

<div align="right">[ <a href="#table-of-contents">Back to top ▲</a> ]</div>
<br />

<hr />
<br />

<div align="center">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://public.storm-cdn.com/storm-software/media/banner-1280x320-dark.webp">
  <source media="(prefers-color-scheme: light)" srcset="https://public.storm-cdn.com/storm-software/media/banner-1280x320-light.webp">
<img src="https://public.storm-cdn.com/storm-software/media/banner-1280x320-dark.webp" width="100%" alt="Storm Software" />
</picture>
</div>
<br />

<div align="center">
<a href="https://stormsoftware.com" target="_blank">Website</a>  •  <a href="https://stormsoftware.com/contact" target="_blank">Contact</a>  •  <a href="https://linkedin.com/in/patrick-sullivan-865526b0" target="_blank">LinkedIn</a>  •  <a href="https://medium.com/@pat.joseph.sullivan" target="_blank">Medium</a>  •  <a href="https://github.com/storm-software" target="_blank">GitHub</a>  •  <a href="https://keybase.io/sullivanp" target="_blank">OpenPGP Key</a>
</div>

<div align="center">
<b>Fingerprint:</b> F47F 1853 BCAD DE9B 42C8  6316 9FDE EC95 47FE D106
</div>
<br />

Storm Software is an open source software development organization and creator
of Acidic, StormStack and StormCloud.

Our mission is to make software development more accessible. Our ideal future is
one where anyone can create software without years of prior development
experience serving as a barrier to entry. We hope to achieve this via LLMs,
Generative AI, and intuitive, high-level data modeling/programming languages.

Join us on [Discord](https://discord.gg/MQ6YVzakM5) to chat with the team,
receive release notifications, ask questions, and get involved.

If this sounds interesting, and you would like to help us in creating the next
generation of development tools, please reach out on our
[website](https://stormsoftware.com/contact) or join our
[Slack](https://join.slack.com/t/storm-software/shared_invite/zt-2gsmk04hs-i6yhK_r6urq0dkZYAwq2pA)
channel!

<br />

<div align="center"><a href="https://stormsoftware.com" target="_blank"><picture><source media="(prefers-color-scheme: dark)" srcset="https://public.storm-cdn.com/storm-software/icons/circle-dark.webp"><source media="(prefers-color-scheme: light)" srcset="https://public.storm-cdn.com/storm-software/icons/circle-light.webp"><img src="https://public.storm-cdn.com/storm-software/icons/circle-dark.webp" width="200px" alt="Storm Software" /></picture></a></div>
<br />
<div align="center"><a href="https://stormsoftware.com" target="_blank"><picture><source media="(prefers-color-scheme: dark)" srcset="https://public.storm-cdn.com/misc/text/visit-us-dark.png"><source media="(prefers-color-scheme: light)" srcset="https://public.storm-cdn.com/misc/text/visit-us-light.png"><img src="https://public.storm-cdn.com/misc/text/visit-us-dark.png" height="90px" alt="Visit us at stormsoftware.com" /></picture></a></div>
<br />

<div align="right">[ <a href="#table-of-contents">Back to top ▲</a> ]</div>
<br />
<br />
