# Confit 

> Yeoman generator for creating the development process, tools and a sample project for current-generation web applications.

<!--[![NPM](https://nodei.co/npm/generator-confit.png?downloads=true)](https://npmjs.org/package/generator-confit)-->

[![NPM Version](https://img.shields.io/npm/v/generator-confit.svg?style=flat-square)](http://npm.im/generator-confit)
[![Build Status](https://travis-ci.org/odecee/generator-confit.svg)](https://travis-ci.org/odecee/generator-confit)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Dependencies status](https://david-dm.org/odecee/generator-confit/status.svg?theme=shields.io)](https://david-dm.org/odecee/generator-confit#info=dependencies)
[![Dev Dependencies status](https://david-dm.org/odecee/generator-confit/dev-status.svg?theme=shields.io)](https://david-dm.org/odecee/generator-confit#info=devDependencies)
[![Checklist](https://img.shields.io/badge/follows-npm%20checklist-brightgreen.svg)](CHECKLIST.md)

![terminal](terminal.gif)


## Install

    npm install -g yo
    npm install -g generator-confit

## What is Confit?

Confit is a Yeoman generator that generates web-development tools for the main development processes in web projects:

- develop
- build
- verify
- test
- release (coming soon)

The tooling is generated by answering a series of simple questions about your project, turning a process that used to take weeks to
tune correctly, into a 5 minute step. See the animated-gif above for an example.
 
***Out of the box, Confit can generate a sample project for the settings you've chosen and so you can see that everything works!***

### In more detail...

> Confit isolates you from the constant-churn of Javascript frameworks so that you can get started with a build-system
  which "just works". And in a few months time when you want to use newer tools, migration will be easier (than if you hadn't used Confit).


- Confit is a **web development-tool generator** that is designed to evolve as web technologies change.
- Confit captures a project's build processes in a **build-tool-independent configuration file** (`confit.json`), so you can *migrate your configuration from older tools onto newer tools more-easily*.
- Confit is **focused** on generating tools for single-page web applications (SPAs).
- Confit is **not** the solution for *every* kind of web application that exists. It is **not** going to support obscure features or exceptional cases. It is a web development-tool generator for what **the contributors** consider to be the *best setup for **most** people*


## Usage

    yo confit [--skip-install] [--skip-run]
    
- `--skip-install` skips the installation of NPM and Bower dependencies
- `--skip-run` skips the run command, which normally starts the build tool in develop mode (`npm run dev`)
    
## Sponsors

These are the companies that are sponsoring the development of Confit:

<a href="https://www.nab.com.au"><img src="http://developer.nab.com.au/images/5a2a9621.nab-logo-horizontal.png" height="100"></a>
[![Odecee](http://odecee.com.au/wp-content/themes/odecee/library/images/logo.svg)](http://www.odecee.com.au)


## Contributing

Want to make life easier for web developers? Fix a bug? Become a [contributer](CONTRIBUTING.md)!
