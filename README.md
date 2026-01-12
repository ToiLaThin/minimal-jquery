## Purpose
This is a *minimal jQuery* library, which used to learn jQuery and how to **bundle & distribute** as an *npm package*

## How to use
Just include this package link as a script tag, this should be delivered via *jsDeliver CDN*

## Steps to publish
- scripts npm to build & bundle with mode
- add .npmignore to prevent node_modules being push to npm
- change package name in package.json including username, also mind the version
- use ```npm pushblish --access public``` to publish


## New features in version 2.0.0
- widget factory to standardize ways to create widget and setup life cycle
- widget inheritance and extense
- friendly interface via widget bridge
- set arbitrary data associated with element via Data