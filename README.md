## What is this?

This is a Windows only electron wrapper for the overcast.fm website. It adds 3 things to the site:

1. It adds a dark mode that looks like the dark mode on the iOS app
2. It add native Xbox controller support for navigation and controlling menus
3. It binds the media buttons (play/pause, previous and next) to the overcast player

I made this app because I love the overcast app on iOS and I wanted something that was specialized for gaming, since I listen to podcasts all the time when I'm gaming. I'm not affiliated with the developer of the Overcast podcast app though, so don't think that this is an official app from him.

Here is what the regular site looks like in Chrome:

![overcastinchrome](C:\Users\spand\Documents\Game Media Project\overcastinchrome.PNG)

This is what it looks like in my electron wrapper app:

![overcastforgaming](C:\Users\spand\Documents\Game Media Project\overcastforgaming.PNG)

You can see that there is no visible frame, and there is also a highlighted area where the Gamepad is currently selected. Clicking on the menu icon in the upper left corner reveals a guide for all the Xbox controller mappings.

## How to use

Just download the latest build from here and run OG.exe inside that folder.

## FAQ 

**Why didn't you build this for Mac as well?**

I didn't see a reason to make this for MacOS, seeing as the gamepad support for games is so terrible on that platform. Plus, there's already a great menu app for overcast that's built with electron on Mac as well, so it was hard to justify the time I would be spending on that.

**Why doesn't the podcast player turn on when I press the "A" button to select a podcast?**

You have use your actual mouse to click at least once inside the app's window, otherwise, Overcast has an error where it just says that user interaction is required to get the player to start. I think that this is some type of protection to keep web bots from abusing the site in some way. After clicking at least that one time in the app, all the gamepad controls have worked fine in my testing. One other possible way that you could solve that problem is to use AutoHotKey to script a click inside the app, once it's opened. Clicking once on the window isn't that hard though, so that's what I do.

**Can I use this with a DS4/PS4 controller instead?**

Yes, but you'll have to use something like DS4 Windows to get it to work. I programmed the gamepad logic to ignore any controllers that are not Xbox controllers. That way, there isn't a conflict when you're playing a game using DS4 Windows and using this app. The gamepad API actually detect 2 controllers when that happens, so I had to make it ignore the raw PS4 controller input and only accept the emulated Xbox controller input as to avoid any unwanted behavior from the controller inputs running at the same time in the app.

**Why does it stop working correctly when I have more than one Xbox controller plugged in?**

That's because this app just listens to the last controller that was connected and starts a listening loop for that controller. When 2 controller's are connected, there's going to be 2 loops going on, but only 1 of the controllers will work in the app. I might fix this bug later.



