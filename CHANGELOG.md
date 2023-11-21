<!--
## version - yyyy/mm/dd
 -->

## 2.3.0-beta.2 2023/11/21

-   Refactor code
-   Reduced the use of global variables
-   Added [type definitions](https://github.com/XaviaTeam/XaviaBot/blob/main/types/global.d.ts) and [jsconfig](https://github.com/XaviaTeam/XaviaBot/blob/main/jsconfig.json) for VSCode IntelliSense
-   Moved all utils functions to `global.utils` object
-   Bug fixes, logics corrections and overall improvements

## 2.3.0-beta.1 2023/10/26

-   OOP Support for Database
-   Brand new feature: **effects** (beta)
-   Duplicate listener fixed
-   Refactor code
-   More JSDoc for functions/methods
-   Better error handling

## 2.1.4 - 2023/07/02

-   Adapted to new FCA version!
-   Fixed some bugs

## 2.1.2 - 2023/02/12

-   New cron-job (auto-send) feature!
-   Added support for custom help display name for each language
-   Fixed security issues
-   Major bug fixes and overall improvements

## v2.1.0 - 2022/12/15

-   Added a bunch of new commands
-   New global functions: **getAvatarURL**
-   Added **maintain** mode which makes the bot only listen to moderators
-   Added **isHidden** and **isAbsolute** to command config
-   New **ABSOLUTES** config, the upper level of moderators
-   Even more support for Arabic Language, big thanks to Malk
-   Fixed error bot not running 24/7 on replit
-   Added cleanup function back
-   Overall improvements and bug fixes

## v2.0.7 - 2022/12/06

-   Minor bug fixes (_nsfw-mode_, _permissions_, _glitch_)
-   Added a lot of Commands
-   More support for Arabic Language, big thanks to Malk
-   New features:
    -   **join/leave messages/gif**
    -   set **join/leave message/gif** for _each group_
    -   set **bot language** for _each group_

## v2.0.6 - 2022/11/29

-   Fixed NSFW system
-   Added NSFW commands
-   Added support for Arabic (ar_SY) language

## v2.0.5 - 2022/11/04

-   Small fixes
-   Folder removal support for update.js

## v2.0.4 - 2022/11/03

-   Restructured code
-   New plugins format
-   Support mongodb
-   Remove support for multiple commands in one file
-   Better support for replit/glitch

## v1.4.6 - 2022/08/17

-   Remove auto create monitor
-   Improve setup

## v1.4.5 - 2022/08/16

-   Node >= 16 is required
-   ImgBB key is now optional + using Base64 to store image by default.
-   CLI -> xConsole
-   Added setup.js
-   More Commands!
-   More logging!
-   Removed process-stats, using os/process instead.
-   Improve dashboard
-   Better Updater
-   Fix case handlers
-   delay (Promise) -> sleep (synchronous)
-   Ready for SQL/mongoDB support
-   Overall improvements

## v1.4.4 - 2022/07/28

-   Better Glitch Support

## v1.4.3 - 2022/07/26

-   Optimize Code
-   Added update script

## v1.4.2 - 2022/07/24

-   Various fixes
-   Optimize Database
-   Added Economy System

## v1.4.0 - 2022/07/22

-   New Plugin Format
-   Removed message.js, reaction.js and reply.js on plugins
-   Added CLI, maybe...
-   Added [DOCS.md](https://github.com/XaviaTeam/XaviaBot/blob/main/DOCS.md) for plugins, database, etc.
-   Added some functions to global
-   Config is now JSON
-   Remade loader.js
-   Update Lang files
-   Optimize Packages
-   Optimize Source Code
-   Ready for Official Release

## v1.3.0 - 2022/05/19

-   Better Cache Handling, **automatically** clear cache when booting up
-   Better Role: `ADMINS` => `MODERATORS`, `botadmin` => `moderator`, `groupadmin` => `admin`, etc.
-   Check For Updates
-   **MULTILANG SUPPORT** with **getLang** method
-   Remade Event Handler: **Split into multiple files**
-   New Database feature: **Backup/Restore**
-   Remade Dashboard
-   Optimize Source Code

## v1.2.4 - 2022/05/08

-   Added CHANGELOG.md
-   Fix Restart Loop Memory Leak
-   Fix Maintenance Mode
-   Better Glitch Support
-   Better Appstate Handling, maybe...
-   Optimize Source Code

## v1.2.2 - 2022/05/01

-   Optimize Database
-   Fix Plugins Load
-   Optimize Dependencies Load

## v1.2.0 - 2022/05/01

-   Added Global Variables
-   Added Secret Environments
-   Added login function
-   Publish to Github (Private)!

## v1.1.0 - 2022/04/29

-   Fix Client
-   Fix Appstate Path
-   Changed from modules to plugins
-   Config JSON to JS/JSON
-   Optimize Source Code

## v1.0.0 - 2022/04/26

-   Beta Release
